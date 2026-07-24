import { NextResponse, type NextRequest } from "next/server";

import { getProducts } from "@/lib/data/products";
import type { SortKey } from "@/types";

/**
 * GET /api/products?q=&category=&sort=
 * Endpoint publik daftar produk — siap dipakai untuk integrasi
 * eksternal maupun dashboard admin di fase berikutnya.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  try {
    const products = await getProducts({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      sort: (searchParams.get("sort") as SortKey | null) ?? undefined,
    });

    return NextResponse.json({ data: products, count: products.length });
  } catch {
    return NextResponse.json(
      { error: "Gagal memuat produk" },
      { status: 500 }
    );
  }
}
