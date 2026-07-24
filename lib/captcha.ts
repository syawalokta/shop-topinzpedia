import { createHmac, randomInt } from "crypto";

/**
 * Captcha matematika sederhana yang stateless & aman:
 * jawaban tidak pernah dikirim ke klien — hanya HMAC-nya.
 * Arsitektur ini mudah ditukar dengan Cloudflare Turnstile /
 * reCAPTCHA: cukup ganti generate/verify + komponen CaptchaField.
 */

const SECRET = process.env.AUTH_SECRET ?? "topinzpedia-dev-secret";
const TTL_MS = 10 * 60 * 1000; // 10 menit

export interface CaptchaChallenge {
  question: string;
  token: string;
}

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

export function verifyCaptcha(token: string, answer: string): boolean {
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
