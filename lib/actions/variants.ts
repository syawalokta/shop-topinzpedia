"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { connectDB, isDbConfigured } from "../db";
import { getAdminSession } from "../authz";
import { variantSchema, type VariantInput } from "../validations";
import { Product, Variant } from "../../models";
import type { ActionResult } from "../../types";

async function guard(): Promise<string | null> {
  if (!(await getAdminSession())) {
    return "Akses ditolak. Silakan login sebagai admin.";
  }
  if (!isDbConfigured()) {
    return "Database belum dikonfigurasi. Set MONGODB_URI untuk mengelola data.";
  }
  return null;
}

async function revalidateVariantPages(productId: Types.ObjectId | string) {
  const product = await Product.findById(productId).select("slug").lean();
  revalidatePath("/");
  revalidatePath("/products");
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  revalidatePath(`/admin/products/${String(productId)}/variants`);
  revalidatePath("/admin/products");
}

export async function createVariant(
  productId: string,
  input: VariantInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data varian tidak valid",
    };
  }

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(productId)) {
      return { ok: false, error: "ID produk tidak valid." };
    }
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return { ok: false, error: "Produk tidak ditemukan." };

    await Variant.create({
      ...parsed.data,
      productId: new Types.ObjectId(productId),
    });

    await revalidateVariantPages(productId);
    return { ok: true };
  } catch (error) {
    console.error("[actions/variants] create gagal:", error);
    return { ok: false, error: "Gagal menyimpan varian." };
  }
}

export async function updateVariant(
  id: string,
  input: VariantInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data varian tidak valid",
    };
  }

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID varian tidak valid." };
    }

    const updated = await Variant.findByIdAndUpdate(id, parsed.data);
    if (!updated) return { ok: false, error: "Varian tidak ditemukan." };

    await revalidateVariantPages(updated.productId);
    return { ok: true };
  } catch (error) {
    console.error("[actions/variants] update gagal:", error);
    return { ok: false, error: "Gagal memperbarui varian." };
  }
}

export async function deleteVariant(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID varian tidak valid." };
    }

    const deleted = await Variant.findByIdAndDelete(id);
    if (!deleted) return { ok: false, error: "Varian tidak ditemukan." };

    await revalidateVariantPages(deleted.productId);
    return { ok: true };
  } catch (error) {
    console.error("[actions/variants] delete gagal:", error);
    return { ok: false, error: "Gagal menghapus varian." };
  }
}
