import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { getTransactionByInvoice } from "@/lib/services/transactions";
import { formatDate, formatIDR } from "@/lib/utils";
import { DownloadTxtButton } from "@/components/dashboard/download-txt-button";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = { title: "Detail Transaksi" };

interface TransactionDetailPageProps {
  params: Promise<{ invoice: string }>;
}

export default async function TransactionDetailPage({
  params,
}: TransactionDetailPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/transactions");
  if (!isDbConfigured()) notFound();

  const { invoice } = await params;
  const transaction = await getTransactionByInvoice(invoice, {
    userId: user.id,
    isAdmin: user.role === "admin",
  });
  if (!transaction) notFound();

  const isPaid = transaction.paymentStatus === "paid";

  return (
    <>
      <Link
        href="/dashboard/transactions"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Kembali ke riwayat transaksi
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            {transaction.invoice}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(transaction.createdAt)}
          </p>
        </div>
        <StatusBadge status={transaction.paymentStatus} />
      </div>

      {/* Ringkasan pesanan */}
      <div className="mt-6 rounded-lg border bg-card p-5 shadow-soft md:p-6">
        <h2 className="font-heading text-base font-semibold">Detail Pesanan</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Produk</dt>
            <dd className="font-medium">
              {transaction.productSlug ? (
                <Link
                  href={`/products/${transaction.productSlug}`}
                  className="text-primary hover:underline"
                >
                  {transaction.productName}
                </Link>
              ) : (
                transaction.productName
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Variant</dt>
            <dd className="font-medium">{transaction.variantName}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Metode Pembayaran</dt>
            <dd className="font-medium capitalize">
              {transaction.paymentMethod}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3">
            <dt className="text-muted-foreground">Total</dt>
            <dd className="font-heading text-lg font-bold text-primary">
              {formatIDR(transaction.total)}
            </dd>
          </div>
        </dl>
      </div>

      {/* Akun yang dikirim */}
      {isPaid && transaction.deliveredContent ? (
        <div className="mt-6 rounded-lg border bg-card p-5 shadow-soft md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
              <KeyRound className="size-4 text-primary" aria-hidden />
              Detail Akun Kamu
            </h2>
            <DownloadTxtButton
              invoice={transaction.invoice}
              createdAt={transaction.createdAt}
              productName={transaction.productName}
              variantName={transaction.variantName}
              content={transaction.deliveredContent}
            />
          </div>

          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border bg-muted/50 p-4 font-mono text-sm leading-relaxed">
            {transaction.deliveredContent}
          </pre>

          <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-primary"
              aria-hidden
            />
            Simpan data ini baik-baik dan jangan bagikan ke siapa pun. Ada
            kendala akun? Hubungi admin dengan menyertakan nomor invoice.
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed bg-muted/30 p-5 text-sm text-muted-foreground">
          {transaction.paymentStatus === "failed"
            ? "Transaksi gagal — saldo kamu sudah dikembalikan secara otomatis."
            : "Akun akan tampil di sini setelah pembayaran berhasil."}
        </div>
      )}
    </>
  );
}
