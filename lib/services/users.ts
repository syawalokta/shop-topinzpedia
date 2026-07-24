import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import { connectDB } from "../db";
import { escapeRegex } from "../utils";
import { buildPaged, pageSkip, type Paged } from "../pagination";
import { User, Wallet } from "../../models";

/** Service user & registrasi. */

export interface UserRowDTO {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "buyer" | "user";
  provider: string;
  balance: number;
  createdAt: string;
}

export async function registerUser(input: {
  name: string;
  username: string;
  email: string;
  password: string;
}): Promise<{ ok: boolean; error?: string; userId?: string }> {
  await connectDB();

  const email = input.email.toLowerCase().trim();
  const username = input.username.toLowerCase().trim();

  const [emailTaken, usernameTaken] = await Promise.all([
    User.exists({ email }),
    User.exists({ username }),
  ]);
  if (emailTaken) return { ok: false, error: "Email sudah terdaftar." };
  if (usernameTaken) return { ok: false, error: "Username sudah dipakai." };

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    name: input.name.trim(),
    username,
    email,
    passwordHash,
    provider: "credentials",
    role: "user",
  });

  // Setiap user otomatis punya wallet
  await Wallet.updateOne(
    { userId: user._id },
    { $setOnInsert: { balance: 0 } },
    { upsert: true }
  );

  return { ok: true, userId: String(user._id) };
}

export async function adminListUsers(params: {
  q?: string;
  role?: string;
  page?: number;
  perPage?: number;
}): Promise<Paged<UserRowDTO>> {
  await connectDB();
  const { q, role, page = 1, perPage = 10 } = params;

  const filter: Record<string, unknown> = {};
  if (role && ["admin", "buyer", "user"].includes(role)) filter.role = role;
  if (q) {
    const regex = { $regex: escapeRegex(q), $options: "i" };
    filter.$or = [{ name: regex }, { username: regex }, { email: regex }];
  }

  const [docs, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(pageSkip(page, perPage))
      .limit(perPage)
      .lean(),
    User.countDocuments(filter),
  ]);

  const wallets = await Wallet.find({
    userId: { $in: docs.map((d) => d._id) },
  })
    .select("userId balance")
    .lean();
  const balanceMap = new Map(
    wallets.map((w) => [String(w.userId), w.balance])
  );

  const items: UserRowDTO[] = docs.map((doc) => ({
    id: String(doc._id),
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role as UserRowDTO["role"],
    provider: doc.provider,
    balance: balanceMap.get(String(doc._id)) ?? 0,
    createdAt: (doc.createdAt ?? new Date()).toISOString(),
  }));

  return buildPaged(items, total, page, perPage);
}

export interface ProfileDTO {
  name: string;
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
  avatarPublicId: string;
  socials: { whatsapp: string; telegram: string };
  hasPassword: boolean;
}

/** Profil lengkap user untuk halaman settings. */
export async function getProfile(userId: string): Promise<ProfileDTO | null> {
  await connectDB();
  const doc = await User.findById(userId).lean();
  if (!doc) return null;
  return {
    name: doc.name,
    username: doc.username,
    email: doc.email,
    role: doc.role,
    avatarUrl: doc.avatarUrl ?? "",
    avatarPublicId: doc.avatarPublicId ?? "",
    socials: {
      whatsapp: doc.socials?.whatsapp ?? "",
      telegram: doc.socials?.telegram ?? "",
    },
    hasPassword: Boolean(doc.passwordHash),
  };
}

export async function setUserRole(
  userId: string,
  role: "admin" | "buyer" | "user",
  actingAdminId: string
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();
  if (!Types.ObjectId.isValid(userId)) {
    return { ok: false, error: "ID user tidak valid." };
  }
  if (userId === actingAdminId) {
    return { ok: false, error: "Kamu tidak bisa mengubah role akunmu sendiri." };
  }

  const updated = await User.findByIdAndUpdate(userId, { role });
  if (!updated) return { ok: false, error: "User tidak ditemukan." };
  return { ok: true };
}
