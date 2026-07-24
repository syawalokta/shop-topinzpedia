"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAdminSession } from "../authz";
import { isDbConfigured } from "../db";
import { PRIVACY_SLUG, TERMS_SLUG } from "../legal-content";
import { updatePage } from "../services/pages";
import type { ActionResult } from "../../types";

const pageSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter").max(80),
  content: z
    .string()
    .min(50, "Konten terlalu pendek")
    .max(50_000, "Konten terlalu panjang"),
});

const SLUG_TO_PATH: Record<string, string> = {
  [TERMS_SLUG]: "/syarat-ketentuan",
  [PRIVACY_SLUG]: "/kebijakan-privasi",
};

export async function updatePageAction(
  slug: string,
  input: { title: string; content: string }
): Promise<ActionResult> {
  if (!(await getAdminSession())) return { ok: false, error: "Akses ditolak." };
  if (!isDbConfigured()) {
    return { ok: false, error: "Database belum dikonfigurasi." };
  }

  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
    };
  }

  try {
    const result = await updatePage(slug, parsed.data);
    if (!result.ok) return { ok: false, error: result.error };

    revalidatePath("/admin/pages");
    const path = SLUG_TO_PATH[slug];
    if (path) revalidatePath(path);
    return { ok: true };
  } catch (error) {
    console.error("[actions/pages] update gagal:", error);
    return { ok: false, error: "Gagal menyimpan halaman." };
  }
}
