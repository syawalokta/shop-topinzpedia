/**
 * Autentikasi admin sederhana berbasis ADMIN_KEY (env).
 *
 * Cookie menyimpan hash SHA-256 dari ADMIN_KEY — bukan kuncinya langsung.
 * Modul ini sengaja bebas dependensi (tanpa mongoose/next-headers) agar
 * aman dipakai di Edge Middleware maupun Server Actions.
 *
 * Catatan: ini pengaman ringan pengganti sementara sebelum fase
 * Authentication penuh (Auth.js) — cukup untuk melindungi panel admin.
 */

export const ADMIN_COOKIE = "tp_admin";

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_KEY);
}

export async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function expectedAdminToken(): Promise<string | null> {
  const key = process.env.ADMIN_KEY;
  if (!key) return null;
  return sha256Hex(key);
}

/** Validasi nilai cookie admin terhadap hash ADMIN_KEY saat ini. */
export async function isValidAdminToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  const expected = await expectedAdminToken();
  return expected !== null && token === expected;
}
