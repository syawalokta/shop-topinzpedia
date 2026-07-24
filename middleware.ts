import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Guard rute berbasis role (JWT Auth.js — edge-safe, tanpa mongoose):
 * - /admin/*     : wajib login dengan role "admin"
 * - /dashboard/* : wajib login (role apa pun)
 *
 * Penting: di produksi HTTPS cookie sesi bernama
 * "__Secure-authjs.session-token", sedangkan di lokal (http)
 * "authjs.session-token". getToken dicoba untuk KEDUANYA agar tidak
 * terjadi redirect loop login <-> dashboard di hosting mana pun.
 */

const SESSION_COOKIES = [
  "__Secure-authjs.session-token",
  "authjs.session-token",
];

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

async function readToken(request: NextRequest) {
  const secret = process.env.AUTH_SECRET;
  return (
    (await getToken({ req: request, secret, secureCookie: true })) ??
    (await getToken({ req: request, secret, secureCookie: false }))
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await readToken(request);

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);

  // Sesi ada tapi rusak/format lama (id bukan ObjectId) —
  // bersihkan cookie agar user tidak terjebak loop, lalu ke login.
  if (token && !OBJECT_ID_RE.test(String(token.sub ?? ""))) {
    const response = NextResponse.redirect(loginUrl);
    for (const name of SESSION_COOKIES) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        sameSite: "lax",
        secure: name.startsWith("__Secure-"),
      });
    }
    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (!token) return NextResponse.redirect(loginUrl);
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) return NextResponse.redirect(loginUrl);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
