import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  HandCoins,
  Package,
  PackageCheck,
  Plus,
  TrendingUp,
  Users as UsersIcon,
  Wallet,
} from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { getCatalogStats } from "@/lib/data/admin";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import {
  adminListTransactions,
  dailyTransactionSeries,
} from "@/lib/services/transactions";
import { adminListTopups, topupStats } from "@/lib/services/topup";
import { stockStats } from "@/lib/services/stock";
import { totalUserBalance } from "@/lib/services/wallet";
import { formatCompact, formatDate, formatIDR } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DbNotice } from "@/components/admin/db-notice";
import { StatCard } from "@/components/admin/stat-card";
import { MiniBarChart } from "@/components/shared/mini-bar-chart";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function AdminDashboardPage() {
  if (!isDbConfigured()) {
    return (
      <>
        <PageHeader />
        <div className="mt-8">
          <DbNotice />
        </div>
      </>
    );
  }

  await connectDB();
  const [
    catalog,
    balance,
    topup,
    stock,
    series,
    userCount,
    recentTrx,
    pendingTopups,
  ] = await Promise.all([
    getCatalogStats(),
    totalUserBalance(),
    topupStats(),
    stockStats(),
    dailyTransactionSeries(14),
    User.countDocuments(),
    adminListTransactions({ page: 1, perPage: 5 }),
    adminListTopups({ status: "pending", page: 1, perPage: 4 }),
  ]);

  const chartData = series.map((point) => ({
    label: point.date.slice(5),
    value: point.count,
    hint: `${point.date}: ${point.count} transaksi · ${formatIDR(point.amount)}`,
  }));
  const totalPaid14d = series.reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader />
        <Button asChild size="sm" className="rounded-full">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Tambah Produk
          </Link>
        </Button>
      </div>

      {/* Statistik utama */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Saldo User"
          value={formatIDR(balance)}
          hint="Total saldo seluruh wallet"
        />
        <StatCard
          icon={HandCoins}
          label="Total Topup"
          value={formatIDR(topup.totalApproved)}
          hint={`${topup.pendingCount} pengajuan pending`}
        />
        <StatCard
          icon={Boxes}
          label="Stock Available"
          value={String(stock.available)}
          hint={`${stock.sold} sudah terjual`}
        />
        <StatCard
          icon={UsersIcon}
          label="Total Users"
          value={String(userCount)}
          hint={`${catalog.productCount} produk · ${catalog.categoryCount} kategori`}
        />
      </div>

      {/* Grafik + produk terlaris */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
                <TrendingUp className="size-4 text-primary" aria-hidden />
                Transaksi 14 Hari Terakhir
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Total nilai: {formatIDR(totalPaid14d)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <MiniBarChart data={chartData} />
          </div>
        </section>

        <section className="rounded-lg border bg-card p-5 shadow-soft">
          <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
            <PackageCheck className="size-4 text-primary" aria-hidden />
            Produk Terlaris
          </h2>
          <ul className="mt-4 space-y-3">
            {catalog.topProducts.map((product, index) => (
              <li key={product.id} className="flex items-center gap-3">
                <span className="w-4 shrink-0 font-heading text-sm font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <Image
                  src={product.logo}
                  alt=""
                  width={28}
                  height={28}
                  unoptimized
                  className="size-7 rounded-md"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {product.name}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatCompact(product.sold)} terjual
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Aktivitas terbaru */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <Package className="size-4 text-primary" aria-hidden />
              Transaksi Terbaru
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/transactions">Semua</Link>
            </Button>
          </div>
          {recentTrx.items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Belum ada transaksi.
            </p>
          ) : (
            <ul className="divide-y">
              {recentTrx.items.map((trx) => (
                <li
                  key={trx.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {trx.productName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {trx.invoice} · {trx.user?.name ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={trx.paymentStatus} />
                    <span className="text-sm font-semibold">
                      {formatIDR(trx.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border bg-card shadow-soft">
          <div className="flex items-center justify-between gap-3 border-b p-5">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <HandCoins className="size-4 text-primary" aria-hidden />
              Topup Menunggu Persetujuan
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/topups">Semua</Link>
            </Button>
          </div>
          {pendingTopups.items.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">
              Tidak ada topup pending. 🎉
            </p>
          ) : (
            <ul className="divide-y">
              {pendingTopups.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {item.user?.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-heading text-sm font-bold text-primary">
                    {formatIDR(item.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function PageHeader() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Ringkasan toko, wallet, stok, dan aktivitas TopinzPedia.
      </p>
    </div>
  );
}
