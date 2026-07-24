import type { Metadata } from "next";

import { isDbConfigured } from "@/lib/db";
import { adminListUsers } from "@/lib/services/users";
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
import { UserEditDialog } from "@/components/admin/user-edit-dialog";
import { UserRoleDialog } from "@/components/admin/user-role-dialog";
import { PaginationNav } from "@/components/shared/pagination-nav";
import { StatusBadge } from "@/components/shared/status-badge";

export const metadata: Metadata = {
  title: "Kelola Users",
};

interface AdminUsersPageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  const dbReady = isDbConfigured();
  const params = await searchParams;

  const result = dbReady
    ? await adminListUsers({
        q: params.q,
        role: params.role,
        page: parsePage(params.page),
      })
    : null;

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
          Kelola Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Semua akun terdaftar — role buyer diberikan otomatis setelah
          pembelian pertama.
        </p>
      </div>

      {dbReady ? (
        <div className="mt-6">
          <DataToolbar
            searchPlaceholder="Cari nama, username, atau email…"
            filters={[
              {
                param: "role",
                placeholder: "Semua Role",
                options: [
                  { value: "admin", label: "Admin" },
                  { value: "buyer", label: "Buyer" },
                  { value: "user", label: "User" },
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
              Tidak ada user
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ubah filter pencarian.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card shadow-soft">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-xs font-bold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-40 truncate text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="max-w-40 truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      @{user.username}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={user.role} />
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {user.provider}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatIDR(user.balance)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-0.5">
                        <UserEditDialog user={user} />
                        <UserRoleDialog
                          user={{
                            id: user.id,
                            name: user.name,
                            role: user.role,
                          }}
                        />
                      </div>
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
          label="user"
        />
      ) : null}
    </>
  );
}
