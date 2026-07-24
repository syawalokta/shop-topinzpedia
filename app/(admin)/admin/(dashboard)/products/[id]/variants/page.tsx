import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Plus } from "lucide-react";

import { deleteVariant } from "@/lib/actions/variants";
import { isDbConfigured } from "@/lib/db";
import { adminGetProduct, adminListVariants } from "@/lib/data/admin";
import { formatIDR } from "@/lib/utils";
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
import { VariantDialog } from "@/components/admin/variant-dialog";

export const metadata: Metadata = {
  title: "Kelola Varian",
};

interface VariantsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductVariantsPage({
  params,
}: VariantsPageProps) {
  if (!isDbConfigured()) {
    return <DbNotice />;
  }

  const { id } = await params;
  const product = await adminGetProduct(id);
  if (!product) notFound();

  const variants = await adminListVariants(id);

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
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted/50">
            <Image
              src={product.logo}
              alt=""
              width={34}
              height={34}
              unoptimized
              className="size-8 rounded-lg"
            />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
              Varian — {product.name}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {variants.length} varian · varian termurah tampil sebagai
              &ldquo;harga mulai dari&rdquo;.
            </p>
          </div>
        </div>
        <VariantDialog
          productId={product.id}
          trigger={
            <Button size="sm" className="rounded-full">
              <Plus className="size-4" />
              Tambah Varian
            </Button>
          }
        />
      </div>

      <div className="mt-8">
        {variants.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Belum ada varian
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Produk tanpa varian aktif tidak bisa dibeli — tambahkan minimal
              satu varian harga.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Varian</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Garansi</TableHead>
                  <TableHead className="text-right">Harga</TableHead>
                  <TableHead className="text-right">Stok</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{variant.name}</p>
                      {variant.description ? (
                        <p className="max-w-60 truncate text-xs text-muted-foreground">
                          {variant.description}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {variant.duration}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {variant.warranty}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatIDR(variant.price)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {variant.stock}
                    </TableCell>
                    <TableCell>
                      {variant.active ? (
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
                        <VariantDialog
                          productId={product.id}
                          variant={variant}
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Edit varian ${variant.name}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          }
                        />
                        <DeleteButton
                          action={deleteVariant.bind(null, variant.id)}
                          title={`Hapus varian ${variant.name}?`}
                          description={`Varian ${variant.name} (${variant.duration}) akan dihapus permanen.`}
                          successMessage="Varian berhasil dihapus."
                          ariaLabel={`Hapus varian ${variant.name}`}
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
