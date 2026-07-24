import { NextResponse, type NextRequest } from "next/server";

/**
 * Logout satu-klik (GET /logout) — menghapus seluruh cookie sesi Auth.js
 * lalu kembali ke beranda. Sengaja tanpa dependensi apa pun agar tetap
 * berfungsi bahkan saat sesi rusak / konfigurasi auth bermasalah
 * (escape hatch dari kondisi "stuck login").
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
  const response = NextResponse.redirect(new URL("/", request.url));
  for (const name of AUTH_COOKIES) {
    response.cookies.delete(name);
  }
  return response;
}
