"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

import { getSessionUser } from "../authz";
import { connectDB, isDbConfigured } from "../db";
import { getStorage } from "../storage";
import { changePasswordSchema, socialsSchema } from "../validations";
import { User } from "../../models";
import type { ActionResult } from "../../types";

/** Server Actions profil user (dashboard > settings). */

async function guard(): Promise<{ userId: string } | { error: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Silakan login terlebih dahulu." };
  if (!isDbConfigured()) return { error: "Database belum dikonfigurasi." };
  return { userId: user.id };
}

/** Simpan kontak opsional (WhatsApp & Telegram). */
export async function updateSocialsAction(input: {
  whatsapp: string;
  telegram: string;
}): Promise<ActionResult> {
  const session = await guard();
  if ("error" in session) return { ok: false, error: session.error };

  const parsed = socialsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  try {
    await connectDB();
    await User.updateOne(
      { _id: session.userId },
      { socials: parsed.data }
    );
    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    console.error("[actions/profile] socials gagal:", error);
    return { ok: false, error: "Gagal menyimpan kontak." };
  }
}

/** Ganti/ hapus avatar — file lama otomatis dihapus dari storage. */
export async function updateAvatarAction(input: {
  url: string;
  publicId: string;
}): Promise<ActionResult> {
  const session = await guard();
  if ("error" in session) return { ok: false, error: session.error };

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("avatarPublicId");
    if (!user) return { ok: false, error: "User tidak ditemukan." };

    if (user.avatarPublicId && user.avatarPublicId !== input.publicId) {
      await getStorage().delete(user.avatarPublicId);
    }

    await User.updateOne(
      { _id: session.userId },
      {
        avatarUrl: input.url.slice(0, 500),
        avatarPublicId: input.publicId.slice(0, 300),
      }
    );
    revalidatePath("/dashboard/settings");
    return { ok: true };
  } catch (error) {
    console.error("[actions/profile] avatar gagal:", error);
    return { ok: false, error: "Gagal menyimpan avatar." };
  }
}

/** Ubah password dengan verifikasi password lama. */
export async function changePasswordAction(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResult> {
  const session = await guard();
  if ("error" in session) return { ok: false, error: session.error };

  if (input.newPassword !== input.confirmPassword) {
    return { ok: false, error: "Konfirmasi password baru tidak sama." };
  }

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("passwordHash");
    if (!user) return { ok: false, error: "User tidak ditemukan." };
    if (!user.passwordHash) {
      return {
        ok: false,
        error:
          "Akun ini login via Google dan belum punya password. Gunakan fitur lupa password untuk membuatnya.",
      };
    }

    const valid = await bcrypt.compare(
      parsed.data.oldPassword,
      user.passwordHash
    );
    if (!valid) return { ok: false, error: "Password lama salah." };

    await User.updateOne(
      { _id: session.userId },
      {
        passwordHash: await bcrypt.hash(parsed.data.newPassword, 10),
        loginAttempts: 0,
        lockUntil: null,
      }
    );
    return { ok: true };
  } catch (error) {
    console.error("[actions/profile] ubah password gagal:", error);
    return { ok: false, error: "Gagal mengubah password." };
  }
}
