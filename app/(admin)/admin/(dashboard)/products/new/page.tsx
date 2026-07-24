import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { adminListCategories } from "@/lib/data/admin";
import { DbNotice } from "@/components/admin/db-notice";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Tambah Produk",
};

export default async function NewProductPage() {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const categories = await adminListCategories();

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke daftar produk
      </Link>

      <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Tambah Produk
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Produk baru langsung tampil di katalog setelah disimpan (status aktif).
        Jangan lupa menambahkan varian harga setelahnya.
      </p>

      <div className="mt-7">
        <ProductForm categories={categories} />
      </div>
    </>
  );
}
