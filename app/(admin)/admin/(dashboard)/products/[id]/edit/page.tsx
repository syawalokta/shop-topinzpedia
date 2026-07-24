import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { adminGetProduct, adminListCategories } from "@/lib/data/admin";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/admin/db-notice";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = {
  title: "Edit Produk",
};

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const { id } = await params;
  const [product, categories] = await Promise.all([
    adminGetProduct(id),
    adminListCategories(),
  ]);

  if (!product) notFound();

  return (
    <>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke daftar produk
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Edit Produk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Perubahan langsung diterapkan ke katalog setelah disimpan.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-full">
          <Link href={`/admin/products/${product.id}/variants`}>
            <Layers className="size-4" />
            Kelola Varian
          </Link>
        </Button>
      </div>

      <div className="mt-7">
        <ProductForm categories={categories} product={product} />
      </div>
    </>
  );
}
