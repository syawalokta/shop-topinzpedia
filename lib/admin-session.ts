import { cookies } from "next/headers";

import { ADMIN_COOKIE, isValidAdminToken } from "./auth";

/**
 * Cek sesi admin dari dalam Server Action / Server Component.
 * (Middleware sudah menjaga rute, ini lapisan kedua untuk actions.)
 */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return isValidAdminToken(store.get(ADMIN_COOKIE)?.value);
}
