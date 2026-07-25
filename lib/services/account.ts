import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";

import { connectDB } from "../db";
import { SITE } from "../constants";
import { getEmailService, isEmailConfigured } from "../email";
import { Token, User } from "../../models";

/** Service verifikasi email & reset password (token sekali pakai). */

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000; // 24 jam
const RESET_TTL_MS = 30 * 60 * 1000; // 30 menit

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

async function issueToken(
  userId: Types.ObjectId,
  type: "verify-email" | "reset-password",
  ttlMs: number
): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  // Satu token aktif per user per tipe
  await Token.deleteMany({ userId, type });
  await Token.create({
    userId,
    type,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return raw;
}

/** Kirim (ulang) email verifikasi via Resend. */
export async function sendVerification(userId: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  await connectDB();

  const user = await User.findById(userId);
  if (!user || user.emailVerified) return false;

  const raw = await issueToken(user._id, "verify-email", VERIFY_TTL_MS);
  const url = `${SITE.url}/verify-email?token=${raw}`;
  return getEmailService().sendVerificationEmail(user.email, user.name, url);
}

/** Verifikasi token email. Return true bila berhasil. */
export async function verifyEmailToken(raw: string): Promise<boolean> {
  if (!raw || raw.length > 200) return false;
  await connectDB();

  const token = await Token.findOneAndDelete({
    tokenHash: hashToken(raw),
    type: "verify-email",
    expiresAt: { $gt: new Date() },
  });
  if (!token) return false;

  await User.updateOne(
    { _id: token.userId },
    { emailVerified: new Date(), loginAttempts: 0, lockUntil: null }
  );
  return true;
}

/**
 * Minta reset password. Selalu "sukses" ke pemanggil (anti user-enumeration);
 * email hanya terkirim bila user ada & SMTP aktif.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!isEmailConfigured()) return;
  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user || !user.passwordHash) return; // akun Google tanpa password dilewati

  const raw = await issueToken(user._id, "reset-password", RESET_TTL_MS);
  const url = `${SITE.url}/reset-password?token=${raw}`;
  await getEmailService().sendResetPassword(user.email, user.name, url);
}

/** Validasi token reset tanpa mengonsumsinya (untuk render halaman). */
export async function isResetTokenValid(raw: string): Promise<boolean> {
  if (!raw || raw.length > 200) return false;
  await connectDB();
  const exists = await Token.exists({
    tokenHash: hashToken(raw),
    type: "reset-password",
    expiresAt: { $gt: new Date() },
  });
  return Boolean(exists);
}

/** Konsumsi token reset & ganti password. */
export async function resetPasswordWithToken(
  raw: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  await connectDB();

  const token = await Token.findOneAndDelete({
    tokenHash: hashToken(raw),
    type: "reset-password",
    expiresAt: { $gt: new Date() },
  });
  if (!token) {
    return {
      ok: false,
      error: "Tautan reset tidak valid atau sudah kedaluwarsa. Minta ulang.",
    };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await User.updateOne(
    { _id: token.userId },
    {
      passwordHash,
      loginAttempts: 0,
      lockUntil: null,
      // Berhasil klik link email = kepemilikan email terbukti
      emailVerified: new Date(),
    }
  );
  return { ok: true };
}
