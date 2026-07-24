import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/auth";

/**
 * Lindungi seluruh rute /admin/* — kecuali /admin/login.
 * Pengguna tanpa sesi valid diarahkan ke halaman login admin.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const isAuthed = await isValidAdminToken(token);

  if (pathname === "/admin/login") {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
