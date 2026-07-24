import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Upload } from "lucide-react";

import { deleteStockAction } from "@/lib/actions/stock";
import { isDbConfigured } from "@/lib/db";
import { adminListProducts } from "@/lib/data/admin";
import {
  adminListStock,
  listVariantOptions,
  stockStats,
} from "@/lib/services/stock";
import { parsePage } from "@/lib/pagination";
import { formatDate } from "@/lib/utils";
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
import { StockDialog } from "@/components/admin/stock-dialog";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Kelola Stock",
};

interface AdminStockPageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    product?: string;
    variant?: string;
    page?: string;
  }>;
}

export default async function AdminStockPage({
  searchParams,
}: AdminStockPageProps) {
  const dbReady = isDbConfigured();
  const params = await searchParams;

  if (!dbReady) {
    return (
      <>
        <Header total={0} available={0} sold={0} />
        <div className="mt-8">
          <DbNotice />
        </div>
      </>
    );
  }

  const [result, stats, products, variants] = await Promise.all([
    adminListStock({
      q: params.q,
      status: params.status,
      productId: params.product,
      variantId: params.variant,
      page: parsePage(params.page),
    }),
    stockStats(),
    adminListProducts({ perPage: 100 }),
    listVariantOptions(),
  ]);

  const selectedProduct = params.product;
  const variantOptions = (
    selectedProduct
      ? variants.filter((v) => v.productId === selectedProduct)
      : variants
  ).map((v) => ({ value: v.id, label: `${v.productName} — ${v.label}` }));

  return (
    <>
      <Header
        total={result.total}
        available={stats.available}
        sold={stats.sold}
      />

      <div className="mt-6">
        <DataToolbar
          searchPlaceholder="Cari isi akun (email, dsb.)…"
          filters={[
            {
              param: "status",
              placeholder: "Semua Status",
              options: [
                { value: "available", label: "Available" },
                { value: "reserved", label: "Reserved" },
                { value: "sold", label: "Sold" },
              ],
            },
            {
              param: "product",
              placeholder: "Semua Produk",
              options: products.items.map((p) => ({
                value: p.id,
                label: p.name,
              })),
            },
            {
              param: "variant",
              placeholder: "Semua Varian",
              options: variantOptions,
            },
          ]}
        />
      </div>

      <div className="mt-5">
        {result.items.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Tidak ada stok
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ubah filter, atau tambahkan stok lewat tombol Import Stock.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content Preview</TableHead>
                  <TableHead>Produk / Varian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((stock) => (
                  <TableRow key={stock.id}>
                    <TableCell>
                      <p className="max-w-56 truncate font-mono text-xs">
                        {stock.content.split("\n")[0]}
                      </p>
                      {stock.content.includes("\n") ? (
                        <p className="max-w-56 truncate font-mono text-xs text-muted-foreground">
                          {stock.content.split("\n")[1]}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-44 truncate text-sm font-medium">
                        {stock.product.name}
                      </p>
                      <p className="max-w-44 truncate text-xs text-muted-foreground">
                        {stock.variant.name} · {stock.variant.duration}
                      </p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={stock.status} />
                    </TableCell>
                    <TableCell>
                      {stock.buyer ? (
                        <>
                          <p className="max-w-36 truncate text-sm">
                            {stock.buyer.name}
                          </p>
                          <p className="max-w-36 truncate text-xs text-muted-foreground">
                            {stock.buyer.email}
                          </p>
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(stock.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        {stock.status !== "sold" ? (
                          <>
                            <StockDialog
                              stock={{
                                id: stock.id,
                                content: stock.content,
                                status:
                                  stock.status === "reserved"
                                    ? "reserved"
                                    : "available",
                              }}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label="Edit stok"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                              }
                            />
                            <DeleteButton
                              action={deleteStockAction.bind(null, stock.id)}
                              title="Hapus stok ini?"
                              description="Satu akun akan dihapus permanen dari stok. Tindakan ini tidak bisa dibatalkan."
                              successMessage="Stok berhasil dihapus."
                              ariaLabel="Hapus stok"
                            />
                          </>
                        ) : (
                          <span className="pr-2 text-xs text-muted-foreground">
                            Terkunci
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PaginationNav
        page={result.page}
        pages={result.pages}
        total={result.total}
        label="stok"
      />
    </>
  );
}

function Header({
  total,
  available,
  sold,
}: {
  total: number;
  available: number;
  sold: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Kelola Stock
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Satu entri = satu akun. {available} available · {sold} sold
          {total ? ` · ${total} sesuai filter` : ""}.
        </p>
      </div>
      <Button asChild size="sm" className="rounded-full">
        <Link href="/admin/stock/import">
          <Upload className="size-4" />
          Import Stock
        </Link>
      </Button>
    </div>
  );
}
