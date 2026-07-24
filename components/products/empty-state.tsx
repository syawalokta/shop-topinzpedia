import Link from "next/link";
import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Produk tidak ditemukan",
  description = "Coba ubah kata kunci pencarian atau reset filter untuk melihat semua produk.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
        <SearchX className="size-6" aria-hidden />
      </span>
      <h3 className="mt-4 font-heading text-lg font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Button asChild variant="outline" size="sm" className="mt-6 rounded-full">
        <Link href="/products">Reset Filter</Link>
      </Button>
    </div>
  );
}
