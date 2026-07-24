"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { connectDB, isDbConfigured } from "../db";
import { getAdminSession } from "../authz";
import { categorySchema, type CategoryInput } from "../validations";
import { Category, Product } from "../../models";
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

function revalidateCategoryPages() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/admin/categories");
}

export async function createCategory(
  input: CategoryInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  try {
    await connectDB();

    const exists = await Category.exists({ slug: parsed.data.slug });
    if (exists) {
      return {
        ok: false,
        error: `Slug "${parsed.data.slug}" sudah dipakai kategori lain.`,
      };
    }

    await Category.create(parsed.data);
    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/categories] create gagal:", error);
    return { ok: false, error: "Gagal menyimpan kategori." };
  }
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Data kategori tidak valid",
    };
  }

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID kategori tidak valid." };
    }

    const duplicate = await Category.exists({
      slug: parsed.data.slug,
      _id: { $ne: id },
    });
    if (duplicate) {
      return {
        ok: false,
        error: `Slug "${parsed.data.slug}" sudah dipakai kategori lain.`,
      };
    }

    const updated = await Category.findByIdAndUpdate(id, parsed.data);
    if (!updated) return { ok: false, error: "Kategori tidak ditemukan." };

    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/categories] update gagal:", error);
    return { ok: false, error: "Gagal memperbarui kategori." };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return { ok: false, error: denied };

  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return { ok: false, error: "ID kategori tidak valid." };
    }

    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return {
        ok: false,
        error: `Tidak bisa dihapus — masih ada ${productCount} produk dalam kategori ini. Pindahkan produknya dulu.`,
      };
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return { ok: false, error: "Kategori tidak ditemukan." };

    revalidateCategoryPages();
    return { ok: true };
  } catch (error) {
    console.error("[actions/categories] delete gagal:", error);
    return { ok: false, error: "Gagal menghapus kategori." };
  }
}
