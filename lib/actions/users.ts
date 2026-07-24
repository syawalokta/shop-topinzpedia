"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "../authz";
import { isDbConfigured } from "../db";
import { setUserRole } from "../services/users";
import type { ActionResult } from "../../types";

/** Admin mengubah role user (admin/buyer/user). */
export async function setUserRoleAction(
  userId: string,
  role: string
): Promise<ActionResult> {
  const admin = await getAdminSession();
  if (!admin) return { ok: false, error: "Akses ditolak." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }
  if (!["admin", "buyer", "user"].includes(role)) {
    return { ok: false, error: "Role tidak valid." };
  }

  try {
    const result = await setUserRole(
      userId,
      role as "admin" | "buyer" | "user",
      admin.id
    );
    if (!result.ok) return { ok: false, error: result.error };
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (error) {
    console.error("[actions/users] set role gagal:", error);
    return { ok: false, error: "Gagal mengubah role." };
  }
}
