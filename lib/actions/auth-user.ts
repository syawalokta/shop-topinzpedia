"use server";

import { signOut } from "@/auth";
import { generateCaptcha, verifyCaptcha, type CaptchaChallenge } from "../captcha";
import { isDbConfigured } from "../db";
import { getSiteSettings } from "../services/settings";
import { registerUser } from "../services/users";
import { registerSchema } from "../validations";

export interface RegisterResult {
  ok: boolean;
  error?: string;
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
    if (!result.ok) {
      return { ok: false, error: result.error, captcha: freshCaptcha() };
    }
    return { ok: true };
  } catch (error) {
    console.error("[actions/auth-user] register gagal:", error);
    return {
      ok: false,
      error: "Terjadi kesalahan saat mendaftar.",
      captcha: freshCaptcha(),
    };
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
