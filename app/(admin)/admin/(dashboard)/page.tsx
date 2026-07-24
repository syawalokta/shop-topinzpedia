import type { Metadata } from "next";
import Link from "next/link";
import { Boxes, Layers, Package, Plus, Tags, TrendingUp } from "lucide-react";

import { isDbConfigured } from "@/lib/db";
import { getDashboardStats } from "@/lib/data/admin";
import { formatCompact, formatDate } from "@/lib/utils";
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
import { StatCard } from "@/components/admin/stat-card";

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

  const stats = await getDashboardStats();

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader />
        <div className="flex gap-2">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/admin/products/new">
              <Plus className="size-4" />
              Tambah Produk
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/admin/categories">Kelola Kategori</Link>
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total Produk"
          value={String(stats.productCount)}
          hint="Termasuk produk nonaktif"
        />
        <StatCard
          icon={Tags}
          label="Kategori"
          value={String(stats.categoryCount)}
        />
        <StatCard
          icon={Layers}
          label="Varian"
          value={String(stats.variantCount)}
          hint="Seluruh pilihan harga"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Terjual"
          value={formatCompact(stats.totalSold)}
          hint="Akumulasi seluruh produk"
        />
      </div>

      <section className="mt-8 rounded-lg border bg-card shadow-soft">
        <div className="flex items-center justify-between gap-3 border-b p-5">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <Boxes className="size-4 text-primary" aria-hidden />
              Produk Terbaru
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              5 produk yang terakhir ditambahkan
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/products">Lihat semua</Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produk</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Terjual</TableHead>
              <TableHead className="text-right">Ditambahkan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-muted-foreground">
                    {product.categoryName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={product.status} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCompact(product.sold)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(product.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
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
        Ringkasan toko dan aktivitas katalog TopinzPedia.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "active" ? (
    <Badge className="border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      Aktif
    </Badge>
  ) : (
    <Badge className="border-transparent bg-muted text-muted-foreground">
      Nonaktif
    </Badge>
  );
}
