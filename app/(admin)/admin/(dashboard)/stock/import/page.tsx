import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { adminListProducts } from "@/lib/data/admin";
import { listVariantOptions } from "@/lib/services/stock";
import { DbNotice } from "@/components/admin/db-notice";
import { StockImportForm } from "@/components/admin/stock-import-form";

export const metadata: Metadata = {
  title: "Import Stock",
};

export default async function StockImportPage() {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const [products, variants] = await Promise.all([
    adminListProducts({ perPage: 100 }),
    listVariantOptions(),
  ]);

  return (
    <>
      <Link
        href="/admin/stock"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke daftar stok
      </Link>

      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Bulk Import Stock
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Tambahkan banyak akun sekaligus — satu baris menjadi satu stok siap
        jual.
      </p>

      <div className="mt-7 rounded-lg border bg-card p-5 shadow-soft md:p-7">
        <StockImportForm
          products={products.items.map((p) => ({ id: p.id, name: p.name }))}
          variants={variants}
        />
      </div>
    </>
  );
}
