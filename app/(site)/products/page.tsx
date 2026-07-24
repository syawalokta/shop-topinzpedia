import type { Metadata } from "next";
import { Suspense } from "react";

import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import type { CatalogQuery, SortKey } from "@/types";
import { EmptyState } from "@/components/products/empty-state";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/products/product-skeletons";
import { FadeUp } from "@/components/shared/motion";

export const metadata: Metadata = {
  title: "Katalog Produk",
  description:
    "Jelajahi seluruh katalog akun premium TopinzPedia — AI, streaming, editing, gaming, VPN, dan cloud. Harga mulai Rp10.000 dengan garansi penuh.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const query: CatalogQuery = {
    q: params.q,
    category: params.category,
    sort: (params.sort as SortKey | undefined) ?? "popular",
  };

  const categories = await getCategories();

  return (
    <div className="container-page pb-20 pt-24 md:pt-28">
      <FadeUp>
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          Katalog
        </span>
        <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          Semua Produk Premium
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Temukan akun premium favoritmu — bandingkan varian, cek rating, dan
          order dalam hitungan menit.
        </p>
      </FadeUp>

      <div className="mt-8">
        <ProductFilters categories={categories} />
      </div>

      <div className="mt-8">
        <Suspense
          key={`${query.q ?? ""}|${query.category ?? ""}|${query.sort}`}
          fallback={<ProductGridSkeleton />}
        >
          <ProductList query={query} />
        </Suspense>
      </div>
    </div>
  );
}

async function ProductList({ query }: { query: CatalogQuery }) {
  const products = await getProducts(query);

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        Menampilkan{" "}
        <strong className="font-semibold text-foreground">
          {products.length}
        </strong>{" "}
        produk
      </p>
      <ProductGrid products={products} />
    </>
  );
}
