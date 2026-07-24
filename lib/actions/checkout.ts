"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "../authz";
import { isDbConfigured } from "../db";
import { purchaseWithWallet, type CheckoutResult } from "../services/checkout";

/** Beli varian dengan saldo wallet — dipanggil dari halaman produk. */
export async function purchaseAction(
  variantId: string
): Promise<CheckoutResult> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      code: "AUTH",
      error: "Silakan login terlebih dahulu untuk membeli.",
    };
  }

  if (!isDbConfigured()) {
    return {
      ok: false,
      code: "OTHER",
      error: "Mode demo (tanpa database) tidak mendukung pembelian.",
    };
  }

  try {
    const result = await purchaseWithWallet(user.id, variantId);

    if (result.ok) {
      // Stok berubah -> segarkan katalog & halaman produk
      revalidatePath("/products", "layout");
      revalidatePath("/");
    }
    return result;
  } catch (error) {
    console.error("[actions/checkout] gagal:", error);
    return {
      ok: false,
      code: "OTHER",
      error: "Terjadi kesalahan saat memproses pembelian.",
    };
  }
}
