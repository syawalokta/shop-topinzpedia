import { NextResponse, type NextRequest } from "next/server";

/**
 * Logout satu-klik (GET /logout) — menghapus seluruh cookie sesi Auth.js
 * lalu kembali ke beranda. Bekerja bahkan saat sesi rusak.
 *
 * Penting: cookie berprefiks __Secure-/__Host- HANYA bisa dihapus bila
 * atribut Secure ikut disetel — tanpa itu browser mengabaikan penghapusan
 * (penyebab bug "klik logout tapi diam saja" di produksi HTTPS).
 */

const AUTH_COOKIES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
  "__Host-authjs.csrf-token",
  "authjs.csrf-token",
  "__Secure-authjs.callback-url",
  "authjs.callback-url",
];

export function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url), {
    // Hindari cache CDN/browser pada respons logout
    headers: { "Cache-Control": "no-store" },
  });

  for (const name of AUTH_COOKIES) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      sameSite: "lax",
      secure: name.startsWith("__Secure-") || name.startsWith("__Host-"),
    });
  }
  return response;
}

export const dynamic = "force-dynamic";
