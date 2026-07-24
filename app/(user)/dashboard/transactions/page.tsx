import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { listUserTransactions } from "@/lib/services/transactions";
import { parsePage } from "@/lib/pagination";
import { formatDate, formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = { title: "Riwayat Transaksi" };

interface TransactionsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/transactions");

  if (!isDbConfigured()) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Mode demo — database belum dikonfigurasi.
      </p>
    );
  }

  const params = await searchParams;
  const page = parsePage(params.page);
  const history = await listUserTransactions(user.id, page, 10);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Riwayat Transaksi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Semua pembelian produkmu beserta detail akunnya.
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/products">
            <ShoppingBag className="size-4" />
            Belanja Lagi
          </Link>
        </Button>
      </div>

      <div className="mt-7">
        {history.items.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-card px-6 py-16 text-center">
            <h2 className="font-heading text-lg font-semibold">
              Belum ada transaksi
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Yuk mulai belanja produk premium favoritmu!
            </p>
            <Button asChild size="sm" className="mt-5 rounded-full">
              <Link href="/products">Lihat Katalog</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.items.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-medium">{trx.invoice}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(trx.createdAt)}
                    </TableCell>
                    <TableCell>
                      <p className="max-w-48 truncate text-sm font-medium">
                        {trx.productName}
                      </p>
                      <p className="max-w-48 truncate text-xs text-muted-foreground">
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
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/transactions/${trx.invoice}`}>
                          Lihat
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PaginationNav
        page={history.page}
        pages={history.pages}
        total={history.total}
        label="transaksi"
      />
    </>
  );
}
