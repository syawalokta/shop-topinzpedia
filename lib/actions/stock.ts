"use server";

import { revalidatePath } from "next/cache";

import { getAdminSession } from "../authz";
import { isDbConfigured } from "../db";
import {
  bulkImportStock,
  createStock,
  deleteStock,
  updateStock,
  type BulkImportResult,
} from "../services/stock";
import { stockSchema } from "../validations";
import type { ActionResult } from "../../types";

async function guard(): Promise<string | null> {
  if (!(await getAdminSession())) return "Akses ditolak.";
  if (!isDbConfigured()) return "Database belum dikonfigurasi.";
  return null;
}

function revalidateStockPages() {
  revalidatePath("/admin/stock");
  revalidatePath("/products", "layout");
}

export async function createStockAction(
  variantId: string,
  content: string
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = stockSchema.safeParse({ content, status: "available" });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data stok tidak valid.",
    };
  }

  try {
    const result = await createStock(variantId, parsed.data.content);
    if (!result.ok) return { ok: false, error: result.error };
    revalidateStockPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/stock] create gagal:", error);
    return { ok: false, error: "Gagal menambah stok." };
  }
}

export async function updateStockAction(
  stockId: string,
  input: { content: string; status: "available" | "reserved" }
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = stockSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data stok tidak valid.",
    };
  }

  try {
    const result = await updateStock(stockId, parsed.data);
    if (!result.ok) return { ok: false, error: result.error };
    revalidateStockPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/stock] update gagal:", error);
    return { ok: false, error: "Gagal memperbarui stok." };
  }
}

export async function deleteStockAction(
  stockId: string
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  try {
    const result = await deleteStock(stockId);
    if (!result.ok) return { ok: false, error: result.error };
    revalidateStockPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/stock] delete gagal:", error);
    return { ok: false, error: "Gagal menghapus stok." };
  }
}

export async function bulkImportStockAction(
  variantId: string,
  raw: string
): Promise<BulkImportResult> {
  const denied = await guard();
  if (denied) {
    return { ok: false, error: denied, success: 0, failed: 0, total: 0 };
  }

  if (!raw.trim()) {
    return {
      ok: false,
      error: "Isi data akun terlebih dahulu.",
      success: 0,
      failed: 0,
      total: 0,
    };
  }

  try {
    const result = await bulkImportStock(variantId, raw);
    if (result.ok) revalidateStockPages();
    return result;
  } catch (error) {
    console.error("[actions/stock] bulk import gagal:", error);
    return {
      ok: false,
      error: "Gagal mengimpor stok.",
      success: 0,
      failed: 0,
      total: 0,
    };
  }
}
