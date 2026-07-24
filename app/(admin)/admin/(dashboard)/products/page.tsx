import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Layers, Pencil, Plus } from "lucide-react";

import { deleteProduct } from "@/lib/actions/products";
import { isDbConfigured } from "@/lib/db";
import { adminListProducts } from "@/lib/data/admin";
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
import { DbNotice } from "@/components/admin/db-notice";
import { DeleteButton } from "@/components/admin/delete-button";

export const metadata: Metadata = {
  title: "Kelola Produk",
};

export default async function AdminProductsPage() {
  const dbReady = isDbConfigured();
  const products = dbReady ? await adminListProducts() : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Kelola Produk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {dbReady
              ? `${products.length} produk — aktif maupun nonaktif.`
              : "Hubungkan database untuk mengelola produk."}
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {!dbReady ? (
          <DbNotice />
        ) : products.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Belum ada produk
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Tambahkan produk pertamamu atau jalankan{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                npm run seed
              </code>{" "}
              untuk mengisi data contoh.
            </p>
            <Button asChild size="sm" className="mt-5 rounded-full">
              <Link href="/admin/products/new">
                <Plus className="size-4" />
                Tambah Produk
              </Link>
            </Button>
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
                {products.map((product) => (
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
                      {product.status === "active" ? (
                        <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          Aktif
                        </Badge>
                      ) : (
                        <Badge className="border-transparent bg-muted text-muted-foreground">
                          Nonaktif
                        </Badge>
                      )}
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
    </>
  );
}
