import { NextResponse } from "next/server";

import { getCategoriesWithCount } from "@/lib/data/categories";

/** GET /api/categories — daftar kategori beserta jumlah produk aktif. */
export async function GET() {
  try {
    const categories = await getCategoriesWithCount();
    return NextResponse.json({ data: categories, count: categories.length });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat kategori" },
      { status: 500 }
    );
  }
}
