import { NextResponse, type NextRequest } from "next/server";

import { verifyEmailToken } from "@/lib/services/account";

/** GET /verify-email?token=... — verifikasi akun dari tautan email. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";

  try {
    const ok = await verifyEmailToken(token);
    return NextResponse.redirect(
      new URL(ok ? "/login?verified=1" : "/login?verifyError=1", request.url)
    );
  } catch (error) {
    console.error("[verify-email] gagal:", error);
    return NextResponse.redirect(
      new URL("/login?verifyError=1", request.url)
    );
  }
}

export const dynamic = "force-dynamic";
