import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layers, Pencil, Plus } from "lucide-react";

import { deleteProduct } from "@/lib/actions/products";
import { isDbConfigured } from "@/lib/db";
import { adminListCategories, adminListProducts } from "@/lib/data/admin";
import { parsePage } from "@/lib/pagination";
import { formatCompact, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataToolbar } from "@/components/admin/data-toolbar";
import { DbNotice } from "@/components/admin/db-notice";
import { DeleteButton } from "@/components/admin/delete-button";
import { VariantDialog } from "@/components/admin/variant-dialog";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Kelola Produk",
};

interface AdminProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const dbReady = isDbConfigured();
  const params = await searchParams;

  const [result, categories, allProducts] = dbReady
    ? await Promise.all([
        adminListProducts({
          q: params.q,
          category: params.category,
          status: params.status,
          page: parsePage(params.page),
        }),
        adminListCategories(),
        adminListProducts({ perPage: 200 }),
      ])
    : [null, [], null];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Kelola Produk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dbReady
              ? `${result?.total ?? 0} produk — aktif maupun nonaktif.`
              : "Hubungkan database untuk mengelola produk."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {allProducts ? (
            <VariantDialog
              products={allProducts.items.map((p) => ({
                id: p.id,
                name: p.name,
              }))}
              trigger={
                <Button size="sm" variant="outline" className="rounded-full">
                  <Layers className="size-4" />
                  Tambah Varian
                </Button>
              }
            />
          ) : null}
          <Button asChild size="sm" className="rounded-full">
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Tambah Produk
            </Link>
          </Button>
        </div>
      </div>

      {dbReady ? (
        <div className="mt-6">
          <DataToolbar
            searchPlaceholder="Cari nama produk…"
            filters={[
              {
                param: "category",
                placeholder: "Semua Kategori",
                options: categories.map((c) => ({
                  value: c.slug,
                  label: c.name,
                })),
              },
              {
                param: "status",
                placeholder: "Semua Status",
                options: [
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ],
              },
            ]}
          />
        </div>
      ) : null}

      <div className="mt-5">
        {!dbReady ? (
          <DbNotice />
        ) : !result || result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Tidak ada produk
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ubah filter pencarian atau tambahkan produk baru.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-right">Mulai Dari</TableHead>
                  <TableHead className="text-center">Varian</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Terjual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-muted/50">
                          <Image
                            src={product.logo}
                            alt=""
                            width={26}
                            height={26}
                            unoptimized
                            className="size-6.5 rounded-md"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-52 truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="max-w-52 truncate text-xs text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {product.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {product.minPrice !== null
                        ? formatIDR(product.minPrice)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {product.variantCount}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.rating}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCompact(product.sold)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Kelola varian ${product.name}`}
                        >
                          <Link href={`/admin/products/${product.id}/variants`}>
                            <Layers className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DeleteButton
                          action={deleteProduct.bind(null, product.id)}
                          title={`Hapus ${product.name}?`}
                          description="Produk beserta seluruh variannya akan dihapus permanen dari katalog. Tindakan ini tidak bisa dibatalkan."
                          successMessage="Produk berhasil dihapus."
                          ariaLabel={`Hapus ${product.name}`}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {result ? (
        <PaginationNav
          page={result.page}
          pages={result.pages}
          total={result.total}
          label="produk"
        />
      ) : null}
    </>
  );
}
