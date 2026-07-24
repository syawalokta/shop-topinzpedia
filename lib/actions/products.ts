"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { connectDB, isDbConfigured } from "../db";
import { isAdminSession } from "../admin-session";
import { productSchema, type ProductInput } from "../validations";
import { Category, Product, Variant } from "../../models";
import type { ActionResult } from "../../types";

async function guard(): Promise<string | null> {
  if (!(await isAdminSession())) {
    return "Sesi admin tidak valid. Silakan login ulang.";
  }
  if (!isDbConfigured()) {
    return "Database belum dikonfigurasi. Set MONGODB_URI untuk mengelola data.";
  }
  return null;
}

function revalidateProductPages(...slugs: (string | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/products");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
}

async function validateCategoryId(id: string): Promise<string | null> {
  if (!Types.ObjectId.isValid(id)) return "Kategori tidak valid.";
  const exists = await Category.exists({ _id: id });
  return exists ? null : "Kategori tidak ditemukan.";
}

export async function createProduct(
  input: ProductInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data produk tidak valid",
    };
  }

  try {
    await connectDB();

    const slugTaken = await Product.exists({ slug: parsed.data.slug });
    if (slugTaken) {
      return {
        ok: false,
        error: `Slug "${parsed.data.slug}" sudah dipakai produk lain.`,
      };
    }

    const categoryError = await validateCategoryId(parsed.data.category);
    if (categoryError) return { ok: false, error: categoryError };

    await Product.create({
      ...parsed.data,
      category: new Types.ObjectId(parsed.data.category),
    });

    revalidateProductPages(parsed.data.slug);
    return { ok: true };
  } catch (error) {
    console.error("[actions/products] create gagal:", error);
    return { ok: false, error: "Gagal menyimpan produk." };
  }
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data produk tidak valid",
    };
  }

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID produk tidak valid." };
    }

    const duplicate = await Product.exists({
      slug: parsed.data.slug,
      _id: { $ne: id },
    });
    if (duplicate) {
      return {
        ok: false,
        error: `Slug "${parsed.data.slug}" sudah dipakai produk lain.`,
      };
    }

    const categoryError = await validateCategoryId(parsed.data.category);
    if (categoryError) return { ok: false, error: categoryError };

    const previous = await Product.findByIdAndUpdate(id, {
      ...parsed.data,
      category: new Types.ObjectId(parsed.data.category),
    });
    if (!previous) return { ok: false, error: "Produk tidak ditemukan." };

    // Revalidasi slug lama & baru (bila slug berubah)
    revalidateProductPages(previous.slug, parsed.data.slug);
    return { ok: true };
  } catch (error) {
    console.error("[actions/products] update gagal:", error);
    return { ok: false, error: "Gagal memperbarui produk." };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID produk tidak valid." };
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return { ok: false, error: "Produk tidak ditemukan." };

    // Ikut bersihkan seluruh varian milik produk ini
    await Variant.deleteMany({ productId: deleted._id });

    revalidateProductPages(deleted.slug);
    return { ok: true };
  } catch (error) {
    console.error("[actions/products] delete gagal:", error);
    return { ok: false, error: "Gagal menghapus produk." };
  }
}
