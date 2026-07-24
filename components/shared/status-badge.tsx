import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  // Transaksi
  paid: { label: "Berhasil", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  failed: { label: "Gagal", className: "bg-destructive/10 text-destructive" },
  refunded: { label: "Refund", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  // Topup
  approved: { label: "Disetujui", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  rejected: { label: "Ditolak", className: "bg-destructive/10 text-destructive" },
  // Stock
  available: { label: "Available", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  reserved: { label: "Reserved", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  sold: { label: "Sold", className: "bg-muted text-muted-foreground" },
  // Produk / varian
  active: { label: "Aktif", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  inactive: { label: "Nonaktif", className: "bg-muted text-muted-foreground" },
  // Wallet
  credit: { label: "Masuk", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  debit: { label: "Keluar", className: "bg-destructive/10 text-destructive" },
  // Role
  admin: { label: "Admin", className: "bg-primary/10 text-primary" },
  buyer: { label: "Buyer", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  user: { label: "User", className: "bg-muted text-muted-foreground" },
};

/** Badge status seragam untuk transaksi, topup, stok, role, dsb. */
export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <Badge className={cn("border-transparent", config.className, className)}>
      {config.label}
    </Badge>
  );
}
