import type { Metadata } from "next";

import { isDbConfigured } from "@/lib/db";
import { adminListTopups } from "@/lib/services/topup";
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
import { TopupActions } from "@/components/admin/topup-actions";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Kelola Topup",
};

interface AdminTopupsPageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminTopupsPage({
  searchParams,
}: AdminTopupsPageProps) {
  const dbReady = isDbConfigured();
  const params = await searchParams;

  const result = dbReady
    ? await adminListTopups({
        status: params.status,
        page: parsePage(params.page),
      })
    : null;

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Kelola Topup
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifikasi pengajuan topup manual — approve untuk menambah saldo
          user.
        </p>
      </div>

      {dbReady ? (
        <div className="mt-6">
          <DataToolbar
            enableSearch={false}
            filters={[
              {
                param: "status",
                placeholder: "Semua Status",
                options: [
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Disetujui" },
                  { value: "rejected", label: "Ditolak" },
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
              Tidak ada pengajuan topup
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Pengajuan baru dari user akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Bukti</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((topup) => (
                  <TableRow key={topup.id}>
                    <TableCell>
                      <p className="max-w-40 truncate text-sm font-medium">
                        {topup.user?.name ?? "—"}
                      </p>
                      <p className="max-w-40 truncate text-xs text-muted-foreground">
                        {topup.user?.email ?? ""}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(topup.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {topup.method === "manual_transfer"
                        ? "Transfer Bank"
                        : "QRIS"}
                      {topup.note ? (
                        <p className="max-w-40 truncate text-xs">
                          “{topup.note}”
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {topup.proofImage ? (
                        <a
                          href={topup.proofImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          Lihat bukti
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={topup.status} />
                      {topup.adminNote ? (
                        <p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">
                          {topup.adminNote}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right font-heading font-bold">
                      {formatIDR(topup.amount)}
                    </TableCell>
                    <TableCell>
                      {topup.status === "pending" ? (
                        <TopupActions
                          topupId={topup.id}
                          amount={topup.amount}
                          userName={topup.user?.name ?? "user"}
                        />
                      ) : (
                        <p className="text-right text-xs text-muted-foreground">
                          {topup.processedAt
                            ? formatDate(topup.processedAt)
                            : "—"}
                        </p>
                      )}
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
          label="topup"
        />
      ) : null}
    </>
  );
}
