import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HandCoins, Wallet } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { getOrCreateWallet, listWalletTransactions } from "@/lib/services/wallet";
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

export const metadata: Metadata = { title: "Wallet" };

interface WalletPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function WalletPage({ searchParams }: WalletPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/wallet");

  if (!isDbConfigured()) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Mode demo — database belum dikonfigurasi.
      </p>
    );
  }

  const params = await searchParams;
  const page = parsePage(params.page);

  const [wallet, history] = await Promise.all([
    getOrCreateWallet(user.id),
    listWalletTransactions(user.id, page, 10),
  ]);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saldo dan seluruh riwayat mutasi walletmu.
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full">
          <Link href="/dashboard/topup">
            <HandCoins className="size-4" />
            Topup Saldo
          </Link>
        </Button>
      </div>

      <div className="mt-7 flex items-center gap-4 rounded-lg border bg-card p-5 shadow-soft">
        <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Wallet className="size-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm text-muted-foreground">Saldo saat ini</p>
          <p className="font-heading text-2xl font-bold tracking-tight">
            {formatIDR(wallet.balance)}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-lg border bg-card shadow-soft">
        <div className="border-b p-5">
          <h2 className="font-heading text-base font-semibold">
            Riwayat Mutasi Saldo
          </h2>
        </div>
        {history.items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Belum ada mutasi saldo.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.items.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-72 truncate text-sm font-medium">
                      {tx.description || "—"}
                    </p>
                    {tx.reference ? (
                      <p className="text-xs text-muted-foreground">
                        Ref: {tx.reference}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tx.type} />
                  </TableCell>
                  <TableCell
                    className={
                      tx.type === "credit"
                        ? "text-right font-semibold text-emerald-600 dark:text-emerald-400"
                        : "text-right font-semibold text-destructive"
                    }
                  >
                    {tx.type === "credit" ? "+" : "−"}
                    {formatIDR(tx.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <PaginationNav
        page={history.page}
        pages={history.pages}
        total={history.total}
        label="mutasi"
      />
    </>
  );
}
