"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_COOKIE, isAdminConfigured, sha256Hex } from "../auth";

export interface LoginState {
  error?: string;
}

/** Login admin: cocokkan kunci dengan ADMIN_KEY lalu set cookie sesi. */
export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const key = String(formData.get("key") ?? "");

  if (!isAdminConfigured()) {
    return {
      error:
        "ADMIN_KEY belum diset di environment. Tambahkan ADMIN_KEY di .env.local lalu restart server.",
    };
  }

  if (!key || key !== process.env.ADMIN_KEY) {
    return { error: "Kunci admin salah. Silakan coba lagi." };
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await sha256Hex(key), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });

  redirect("/admin");
}

/** Hapus sesi admin lalu kembali ke halaman login. */
export async function logoutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
