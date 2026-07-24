"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck, Zap } from "lucide-react";

import { SITE } from "@/lib/constants";
import { buildWhatsAppLink, cn, formatIDR } from "@/lib/utils";
import type { ProductDetail } from "@/types";
import { Button } from "@/components/ui/button";

interface VariantSelectorProps {
  product: ProductDetail;
}

/** Panel pemilihan varian + tombol "Beli Sekarang" via WhatsApp. */
export function VariantSelector({ product }: VariantSelectorProps) {
  const variants = product.variants.filter((variant) => variant.active);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => (variants.find((v) => v.stock > 0) ?? variants[0])?.id
  );

  const selected = variants.find((variant) => variant.id === selectedId);
  const canBuy = Boolean(selected && selected.stock > 0);

  const waMessage = selected
    ? `Halo admin ${SITE.name}! 👋\n\nSaya mau order:\n• Produk: ${product.name}\n• Varian: ${selected.name} (${selected.duration})\n• Harga: ${formatIDR(selected.price)}\n\nMohon diproses ya, terima kasih!`
    : `Halo admin ${SITE.name}! Saya ingin bertanya tentang ${product.name}.`;

  return (
    <div className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">Pilih Varian</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Harga menyesuaikan varian yang kamu pilih.
      </p>

      {variants.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
          Varian belum tersedia. Silakan hubungi admin untuk info stok.
        </p>
      ) : (
        <div
          role="radiogroup"
          aria-label={`Pilihan varian ${product.name}`}
          className="mt-4 space-y-2.5"
        >
          {variants.map((variant) => {
            const isSelected = variant.id === selectedId;
            const outOfStock = variant.stock <= 0;

            return (
              <button
                key={variant.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={outOfStock}
                onClick={() => setSelectedId(variant.id)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                    : "hover:border-primary/40 hover:bg-muted/50",
                  outOfStock && "cursor-not-allowed opacity-55"
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-semibold">
                      {variant.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {variant.duration} · {variant.warranty}
                    </span>
                  </span>
                  <span className="shrink-0 font-heading text-sm font-bold text-primary md:text-base">
                    {formatIDR(variant.price)}
                  </span>
                </span>
                <span
                  className={cn(
                    "mt-1.5 block text-[11px] font-medium",
                    outOfStock
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  )}
                >
                  {outOfStock ? "Stok habis" : `Stok tersedia: ${variant.stock}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Ringkasan */}
      <div className="mt-5 rounded-xl bg-muted/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-heading text-xl font-bold text-primary">
            {selected ? formatIDR(selected.price) : "—"}
          </span>
        </div>
        {selected?.description ? (
          <p className="mt-2 border-t pt-2 text-xs leading-relaxed text-muted-foreground">
            {selected.description}
          </p>
        ) : null}
      </div>

      {canBuy ? (
        <Button asChild size="lg" className="mt-4 w-full rounded-full">
          <a
            href={buildWhatsAppLink(SITE.whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4.5" />
            Beli Sekarang
          </a>
        </Button>
      ) : (
        <Button size="lg" className="mt-4 w-full rounded-full" disabled>
          Stok Habis
        </Button>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="size-3.5 text-primary" aria-hidden />
          Proses instan
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          {selected?.warranty ?? "Bergaransi"}
        </span>
      </div>
    </div>
  );
}
