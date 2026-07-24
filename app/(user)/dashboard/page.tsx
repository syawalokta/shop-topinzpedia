import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  HandCoins,
  ReceiptText,
  ShoppingBag,
  Wallet,
} from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { listUserTransactions } from "@/lib/services/transactions";
import { getOrCreateWallet, listWalletTransactions } from "@/lib/services/wallet";
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
import { StatusBadge } from "@/components/shared/status-badge";

export default async function DashboardOverviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard");

  if (!isDbConfigured()) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Mode demo — database belum dikonfigurasi.
      </p>
    );
  }

  const [wallet, transactions, walletTx] = await Promise.all([
    getOrCreateWallet(user.id),
    listUserTransactions(user.id, 1, 5),
    listWalletTransactions(user.id, 1, 5),
  ]);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Halo, {user.name.split(" ")[0] || user.username}! 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Kelola saldo, topup, dan lihat riwayat pembelianmu di sini.
      </p>

      {/* Kartu saldo */}
      <div className="mt-7 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary via-blue-600 to-secondary p-6 text-white shadow-card">
          <div
            aria-hidden
            className="absolute -right-10 -top-14 size-44 rounded-full bg-white/10 blur-2xl"
          />
          <p className="flex items-center gap-2 text-sm text-blue-100">
            <Wallet className="size-4" aria-hidden />
            Saldo Wallet
          </p>
          <p className="mt-2 font-heading text-3xl font-bold tracking-tight">
            {formatIDR(wallet.balance)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              className="rounded-full bg-white text-primary hover:bg-blue-50"
            >
              <Link href="/dashboard/topup">
                <HandCoins className="size-4" />
                Topup Saldo
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/products">
                <ShoppingBag className="size-4" />
                Belanja
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 rounded-lg border bg-card p-5 shadow-soft">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ReceiptText className="size-4" aria-hidden />
              Status Akun
            </p>
            <div className="mt-2">
              <StatusBadge status={user.role} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {user.role === "buyer"
                ? "Terima kasih sudah berbelanja di TopinzPedia!"
                : user.role === "admin"
                  ? "Kamu memiliki akses penuh panel admin."
                  : "Lakukan pembelian pertamamu untuk naik ke role Buyer."}
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/wallet">
              Lihat Wallet
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Transaksi terbaru */}
      <section className="mt-8 rounded-lg border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b p-5">
          <h2 className="font-heading text-base font-semibold">
            Pembelian Terbaru
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/transactions">Lihat semua</Link>
          </Button>
        </div>
        {transactions.items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Belum ada pembelian.{" "}
            <Link href="/products" className="font-medium text-primary">
              Mulai belanja →
            </Link>
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.items.map((trx) => (
                <TableRow key={trx.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/transactions/${trx.invoice}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {trx.invoice}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium">{trx.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {trx.variantName}
                    </p>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={trx.paymentStatus} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatIDR(trx.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Mutasi saldo terbaru */}
      <section className="mt-6 rounded-lg border bg-card shadow-soft">
        <div className="border-b p-5">
          <h2 className="font-heading text-base font-semibold">
            Mutasi Saldo Terbaru
          </h2>
        </div>
        {walletTx.items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Belum ada mutasi saldo.
          </p>
        ) : (
          <ul className="divide-y">
            {walletTx.items.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {tx.description || (tx.type === "credit" ? "Saldo masuk" : "Saldo keluar")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <span
                  className={
                    tx.type === "credit"
                      ? "shrink-0 font-heading text-sm font-bold text-emerald-600 dark:text-emerald-400"
                      : "shrink-0 font-heading text-sm font-bold text-destructive"
                  }
                >
                  {tx.type === "credit" ? "+" : "−"}
                  {formatIDR(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
