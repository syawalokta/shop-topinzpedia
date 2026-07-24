"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import { getAdminSession } from "../authz";
import { connectDB, isDbConfigured } from "../db";
import { getOrCreateWallet } from "../services/wallet";
import { setUserRole } from "../services/users";
import { adminUserUpdateSchema, type AdminUserUpdateInput } from "../validations";
import { User, Wallet, WalletTransaction } from "../../models";
import type { ActionResult } from "../../types";

/** Admin mengubah role user (admin/buyer/user). */
export async function setUserRoleAction(
  userId: string,
  role: string
): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, error: "Akses ditolak." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }
  if (!["admin", "buyer", "user"].includes(role)) {
    return { ok: false, error: "Role tidak valid." };
  }

  try {
    const result = await setUserRole(
      userId,
      role as "admin" | "buyer" | "user",
      admin.id
    );
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    console.error("[actions/users] set role gagal:", error);
    return { ok: false, error: "Gagal mengubah role." };
  }
}

/**
 * Admin mengedit profil user: nama, username, email, password (opsional),
 * dan saldo. Perubahan saldo tercatat di ledger WalletTransaction.
 */
export async function adminUpdateUserAction(
  userId: string,
  input: AdminUserUpdateInput
): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, error: "Akses ditolak." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }
  if (!Types.ObjectId.isValid(userId)) {
    return { ok: false, error: "ID user tidak valid." };
  }

  const parsed = adminUserUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  try {
    await connectDB();

    const email = parsed.data.email.toLowerCase().trim();
    const username = parsed.data.username.toLowerCase().trim();

    const [emailTaken, usernameTaken] = await Promise.all([
      User.exists({ email, _id: { $ne: userId } }),
      User.exists({ username, _id: { $ne: userId } }),
    ]);
    if (emailTaken) return { ok: false, error: "Email sudah dipakai user lain." };
    if (usernameTaken) {
      return { ok: false, error: "Username sudah dipakai user lain." };
    }

    const update: Record<string, unknown> = {
      name: parsed.data.name.trim(),
      username,
      email,
    };
    if (parsed.data.password) {
      update.passwordHash = await bcrypt.hash(parsed.data.password, 10);
      update.loginAttempts = 0;
      update.lockUntil = null;
    }

    const updated = await User.findByIdAndUpdate(userId, update);
    if (!updated) return { ok: false, error: "User tidak ditemukan." };

    // Penyesuaian saldo (tercatat di ledger sebagai penyesuaian admin)
    const wallet = await getOrCreateWallet(userId);
    const diff = parsed.data.balance - wallet.balance;
    if (diff !== 0) {
      await Wallet.updateOne(
        { userId: new Types.ObjectId(userId) },
        { balance: parsed.data.balance }
      );
      await WalletTransaction.create({
        userId,
        type: diff > 0 ? "credit" : "debit",
        amount: Math.abs(diff),
        description: "Penyesuaian saldo oleh admin",
        reference: `admin:${admin.id}`,
      });
    }

    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    console.error("[actions/users] update user gagal:", error);
    return { ok: false, error: "Gagal memperbarui user." };
  }
}
