import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Landmark, QrCode } from "lucide-react";

import { getSessionUser } from "@/lib/authz";
import { isDbConfigured } from "@/lib/db";
import { getPaymentSettings } from "@/lib/services/settings";
import { listUserTopups } from "@/lib/services/topup";
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
import { TopupForm } from "@/components/dashboard/topup-form";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = { title: "Topup Saldo" };

interface TopupPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function TopupPage({ searchParams }: TopupPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/dashboard/topup");

  if (!isDbConfigured()) {
    return (
      <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
        Mode demo — database belum dikonfigurasi.
      </p>
    );
  }

  const params = await searchParams;
  const page = parsePage(params.page);

  const [settings, history] = await Promise.all([
    getPaymentSettings(),
    listUserTopups(user.id, page, 10),
  ]);

  return (
    <>
      <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Topup Saldo
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Transfer sesuai nominal, unggah bukti, dan saldo masuk setelah
        disetujui admin.
      </p>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        {/* Info pembayaran */}
        <div className="space-y-4">
          {settings.manualTransfer.enabled ? (
            <div className="rounded-lg border bg-card p-5 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
                <Landmark className="size-4 text-primary" aria-hidden />
                Transfer Bank Manual
              </h2>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Bank</dt>
                  <dd className="font-semibold">
                    {settings.manualTransfer.bankName || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">No. Rekening</dt>
                  <dd className="font-mono font-semibold">
                    {settings.manualTransfer.accountNumber || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Atas Nama</dt>
                  <dd className="font-semibold">
                    {settings.manualTransfer.accountName || "—"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          {settings.qris.enabled ? (
            <div className="rounded-lg border bg-card p-5 shadow-soft">
              <h2 className="flex items-center gap-2 font-heading text-base font-semibold">
                <QrCode className="size-4 text-primary" aria-hidden />
                QRIS
              </h2>
              {settings.qris.qrImage ? (
                <Image
                  src={settings.qris.qrImage}
                  alt="QR code pembayaran QRIS"
                  width={220}
                  height={220}
                  unoptimized
                  className="mt-4 size-52 rounded-xl border object-contain"
                />
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  QR belum diunggah admin.
                </p>
              )}
            </div>
          ) : null}

          <div className="rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground">
            💡 Setelah transfer, isi form dengan nominal yang sama persis dan
            unggah bukti transfer. Admin akan memverifikasi maksimal 1×24 jam
            (biasanya jauh lebih cepat).
          </div>
        </div>

        {/* Form */}
        <div className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
          <h2 className="mb-4 font-heading text-base font-semibold">
            Form Pengajuan
          </h2>
          <TopupForm settings={settings} />
        </div>
      </div>

      {/* Riwayat topup */}
      <section className="mt-8 rounded-lg border bg-card shadow-soft">
        <div className="border-b p-5">
          <h2 className="font-heading text-base font-semibold">
            Riwayat Topup
          </h2>
        </div>
        {history.items.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">
            Belum ada pengajuan topup.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Catatan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.items.map((topup) => (
                <TableRow key={topup.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(topup.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {topup.method === "manual_transfer"
                      ? "Transfer Bank"
                      : "QRIS"}
                  </TableCell>
                  <TableCell>
                    <p className="max-w-52 truncate text-sm">
                      {topup.note || "—"}
                    </p>
                    {topup.adminNote ? (
                      <p className="max-w-52 truncate text-xs text-muted-foreground">
                        Admin: {topup.adminNote}
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={topup.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatIDR(topup.amount)}
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
        label="topup"
      />
    </>
  );
}
