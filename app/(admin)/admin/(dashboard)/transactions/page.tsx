import type { Metadata } from "next";

import { isDbConfigured } from "@/lib/db";
import { adminListTransactions } from "@/lib/services/transactions";
import { parsePage } from "@/lib/pagination";
import { formatDate, formatIDR } from "@/lib/utils";
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
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Transaksi",
};

interface AdminTransactionsPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminTransactionsPage({
  searchParams,
}: AdminTransactionsPageProps) {
  const dbReady = isDbConfigured();
  const params = await searchParams;

  const result = dbReady
    ? await adminListTransactions({
        q: params.q,
        status: params.status,
        page: parsePage(params.page),
      })
    : null;

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Transaksi
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Seluruh transaksi pembelian di toko.
        </p>
      </div>

      {dbReady ? (
        <div className="mt-6">
          <DataToolbar
            searchPlaceholder="Cari invoice atau nama produk…"
            filters={[
              {
                param: "status",
                placeholder: "Semua Status",
                options: [
                  { value: "paid", label: "Berhasil" },
                  { value: "pending", label: "Pending" },
                  { value: "failed", label: "Gagal" },
                  { value: "refunded", label: "Refund" },
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
              Tidak ada transaksi
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Transaksi pembelian akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-medium">{trx.invoice}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(trx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-36 truncate text-sm">
                        {trx.user?.name ?? "—"}
                      </p>
                      <p className="max-w-36 truncate text-xs text-muted-foreground">
                        {trx.user?.email ?? ""}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="max-w-44 truncate text-sm font-medium">
                        {trx.productName}
                      </p>
                      <p className="max-w-44 truncate text-xs text-muted-foreground">
                        {trx.variantName}
                      </p>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {trx.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={trx.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatIDR(trx.total)}
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
          label="transaksi"
        />
      ) : null}
    </>
  );
}
