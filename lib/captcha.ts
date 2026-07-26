import { createHmac, randomInt } from "crypto";

import { getCaptchaConfig } from "./services/settings";

/**
 * Dua mode captcha:
 * 1. "math"      — captcha matematika ber-HMAC (default, tanpa layanan eksternal).
 *                  Jawaban tidak pernah dikirim ke klien, hanya HMAC-nya.
 * 2. "turnstile" — Cloudflare Turnstile (dikonfigurasi dari panel admin).
 *
 * Verifikasi terpusat di verifyCaptchaFromSettings() sehingga seluruh
 * form (login, register, lupa password) memakai jalur yang sama.
 */

const SECRET = process.env.AUTH_SECRET ?? "topinzpedia-dev-secret";
const TTL_MS = 10 * 60 * 1000; // 10 menit

export interface CaptchaChallenge {
  question: string;
  token: string;
}

/** Config captcha yang aman dikirim ke client (tanpa secret). */
export interface PublicCaptcha {
  provider: "math" | "turnstile";
  siteKey: string;
  math: CaptchaChallenge | null;
}

/* ----------------------------- Math captcha ----------------------------- */

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function generateCaptcha(): CaptchaChallenge {
  const a = randomInt(1, 10);
  const b = randomInt(1, 10);
  const answer = a + b;
  const exp = Date.now() + TTL_MS;
  const nonce = randomInt(1_000_000).toString(36);
  const token = Buffer.from(
    `${exp}.${nonce}.${sign(`${answer}.${exp}.${nonce}`)}`
  ).toString("base64url");

  return { question: `${a} + ${b}`, token };
}

export function verifyMathCaptcha(token: string, answer: string): boolean {
  try {
    const [expRaw, nonce, signature] = Buffer.from(token, "base64url")
      .toString()
      .split(".");
    const exp = Number(expRaw);
    if (!exp || !nonce || !signature) return false;
    if (Date.now() > exp) return false;

    const expected = sign(`${Number(answer)}.${exp}.${nonce}`);
    return expected === signature;
  } catch {
    return false;
  }
}

/* --------------------------- Turnstile captcha -------------------------- */

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIp?: string
): Promise<boolean> {
  if (!secret || !token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error("[captcha] verifyTurnstile gagal:", error);
    return false;
  }
}

/* ------------------------------- Unified ------------------------------- */

/** Config captcha publik untuk form (dipanggil server-side lalu di-pass ke client). */
export async function getPublicCaptcha(): Promise<PublicCaptcha> {
  const cfg = await getCaptchaConfig();
  if (cfg.provider === "turnstile" && cfg.siteKey && cfg.secretKey) {
    return { provider: "turnstile", siteKey: cfg.siteKey, math: null };
  }
  return { provider: "math", siteKey: "", math: generateCaptcha() };
}

/**
 * Verifikasi jawaban captcha sesuai provider aktif.
 * - turnstile: `token` = Turnstile response token (answer diabaikan)
 * - math:      `token` = HMAC token, `answer` = jawaban user
 */
export async function verifyCaptchaFromSettings(
  token: string,
  answer: string,
  remoteIp?: string
): Promise<boolean> {
  const cfg = await getCaptchaConfig();
  if (cfg.provider === "turnstile" && cfg.secretKey) {
    return verifyTurnstile(cfg.secretKey, token, remoteIp);
  }
  return verifyMathCaptcha(token, answer);
}

/**
 * Verifikasi captcha SINKRON (dipakai di jalur yang belum async, mis. legacy).
 * @deprecated gunakan verifyCaptchaFromSettings — hanya menangani math.
 */
export function verifyCaptcha(token: string, answer: string): boolean {
  return verifyMathCaptcha(token, answer);
}
