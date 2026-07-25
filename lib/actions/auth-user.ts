"use server";

import { z } from "zod";

import { signOut } from "@/auth";
import { generateCaptcha, verifyCaptcha, type CaptchaChallenge } from "../captcha";
import { connectDB, isDbConfigured } from "../db";
import {
  requestPasswordReset,
  resetPasswordWithToken,
  sendVerification,
} from "../services/account";
import { isEmailConfigured as isMailConfigured } from "../email";
import { getSiteSettings } from "../services/settings";
import { registerUser } from "../services/users";
import { registerSchema } from "../validations";
import { User } from "../../models";

export interface RegisterResult {
  ok: boolean;
  error?: string;
  /** true bila user harus verifikasi email dulu sebelum login */
  needVerify?: boolean;
  /** Captcha baru — dikirim ulang setiap kali gagal */
  captcha?: CaptchaChallenge;
}

export interface RegisterPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  captchaToken: string;
  captchaAnswer: string;
}

export async function registerAction(
  payload: RegisterPayload
): Promise<RegisterResult> {
  const freshCaptcha = () => generateCaptcha();

  if (!isDbConfigured()) {
    return {
      ok: false,
      error: "Registrasi membutuhkan database. Set MONGODB_URI terlebih dahulu.",
      captcha: freshCaptcha(),
    };
  }

  const settings = await getSiteSettings();
  if (!settings.registrationEnabled) {
    return {
      ok: false,
      error: "Registrasi sedang ditutup. Silakan hubungi admin.",
      captcha: freshCaptcha(),
    };
  }

  if (!payload.acceptTerms) {
    return {
      ok: false,
      error: "Kamu harus menyetujui Syarat & Ketentuan.",
      captcha: freshCaptcha(),
    };
  }

  if (payload.password !== payload.confirmPassword) {
    return {
      ok: false,
      error: "Konfirmasi password tidak sama.",
      captcha: freshCaptcha(),
    };
  }

  if (!verifyCaptcha(payload.captchaToken, payload.captchaAnswer)) {
    return {
      ok: false,
      error: "Jawaban captcha salah atau kedaluwarsa. Coba lagi.",
      captcha: freshCaptcha(),
    };
  }

  const parsed = registerSchema.safeParse({
    name: payload.name,
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
      captcha: freshCaptcha(),
    };
  }

  try {
    const result = await registerUser(parsed.data);
    if (!result.ok || !result.userId) {
      return { ok: false, error: result.error, captcha: freshCaptcha() };
    }

    // Verifikasi email hanya bila fitur DIAKTIFKAN admin (default OFF)
    // dan Resend terpasang. Selain itu akun langsung terverifikasi dan
    // user bisa langsung login.
    if (settings.emailVerificationEnabled && isMailConfigured()) {
      await sendVerification(result.userId);
      return { ok: true, needVerify: true };
    }

    await connectDB();
    await User.updateOne(
      { _id: result.userId },
      { emailVerified: new Date() }
    );
    return { ok: true, needVerify: false };
  } catch (error) {
    console.error("[actions/auth-user] register gagal:", error);
    return {
      ok: false,
      error: "Terjadi kesalahan saat mendaftar.",
      captcha: freshCaptcha(),
    };
  }
}

/** Kirim ulang email verifikasi (respons selalu generik — anti enumeration). */
export async function resendVerificationAction(
  identifier: string
): Promise<{ ok: boolean; message: string }> {
  const generic = {
    ok: true,
    message:
      "Bila akun terdaftar dan belum terverifikasi, email verifikasi baru sudah dikirim. Cek inbox/spam.",
  };

  if (!isDbConfigured() || !isMailConfigured()) {
    return {
      ok: false,
      message:
        "Pengiriman email belum dikonfigurasi di server (Resend). Hubungi admin.",
    };
  }

  try {
    await connectDB();
    const value = identifier.toLowerCase().trim();
    const user = await User.findOne({
      $or: [{ email: value }, { username: value }],
    }).select("_id emailVerified");
    if (user && !user.emailVerified) {
      await sendVerification(String(user._id));
    }
    return generic;
  } catch (error) {
    console.error("[actions/auth-user] resend gagal:", error);
    return generic;
  }
}

/** Minta tautan reset password via email. */
export async function forgotPasswordAction(payload: {
  email: string;
  captchaToken: string;
  captchaAnswer: string;
}): Promise<{ ok: boolean; message: string; captcha?: CaptchaChallenge }> {
  if (!verifyCaptcha(payload.captchaToken, payload.captchaAnswer)) {
    return {
      ok: false,
      message: "Jawaban captcha salah atau kedaluwarsa.",
      captcha: generateCaptcha(),
    };
  }

  const parsed = z.email().safeParse(payload.email.trim());
  if (!parsed.success) {
    return {
      ok: false,
      message: "Format email tidak valid.",
      captcha: generateCaptcha(),
    };
  }

  if (!isDbConfigured() || !isMailConfigured()) {
    return {
      ok: false,
      message:
        "Fitur reset password membutuhkan konfigurasi email (Resend) di server. Hubungi admin.",
      captcha: generateCaptcha(),
    };
  }

  try {
    await requestPasswordReset(parsed.data);
  } catch (error) {
    console.error("[actions/auth-user] forgot gagal:", error);
  }

  // Respons generik — tidak membocorkan apakah email terdaftar
  return {
    ok: true,
    message:
      "Bila email terdaftar, tautan reset password sudah dikirim (berlaku 30 menit). Cek inbox/spam.",
  };
}

/** Setel password baru memakai token dari email. */
export async function resetPasswordAction(payload: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  if (payload.password !== payload.confirmPassword) {
    return { ok: false, error: "Konfirmasi password tidak sama." };
  }
  const parsed = z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(72)
    .safeParse(payload.password);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Password tidak valid.",
    };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }

  try {
    return await resetPasswordWithToken(payload.token, parsed.data);
  } catch (error) {
    console.error("[actions/auth-user] reset gagal:", error);
    return { ok: false, error: "Terjadi kesalahan saat mereset password." };
  }
}

/** Ambil captcha baru (dipakai tombol refresh pada form register). */
export async function refreshCaptchaAction(): Promise<CaptchaChallenge> {
  return generateCaptcha();
}

/** Logout — dipakai sidebar admin & dashboard user. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
