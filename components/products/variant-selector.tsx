"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LogIn,
  MessageCircle,
  ShieldCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { purchaseAction } from "@/lib/actions/checkout";
import { SITE } from "@/lib/constants";
import { buildWhatsAppLink, cn, formatIDR } from "@/lib/utils";
import type { ProductDetail } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VariantSelectorProps {
  product: ProductDetail;
  isAuthed: boolean;
  /** Saldo wallet user (null bila belum login / mode demo) */
  balance: number | null;
  /** Pembayaran saldo aktif (PaymentSetting + database tersedia) */
  walletEnabled: boolean;
}

/** Panel pemilihan varian + pembelian dengan saldo (auto-delivery). */
export function VariantSelector({
  product,
  isAuthed,
  balance,
  walletEnabled,
}: VariantSelectorProps) {
  const router = useRouter();
  const variants = product.variants.filter((variant) => variant.active);

  const [selectedId, setSelectedId] = useState<string | undefined>(
    () => (variants.find((v) => v.stock > 0) ?? variants[0])?.id
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = variants.find((variant) => variant.id === selectedId);
  const canBuy = Boolean(selected && selected.stock > 0);
  const sufficient =
    balance !== null && selected ? balance >= selected.price : false;

  const waMessage = selected
    ? `Halo admin ${SITE.name}! 👋\n\nSaya mau tanya produk:\n• Produk: ${product.name}\n• Varian: ${selected.name} (${selected.duration})\n• Harga: ${formatIDR(selected.price)}\n\nTerima kasih!`
    : `Halo admin ${SITE.name}! Saya ingin bertanya tentang ${product.name}.`;

  function handlePurchase() {
    if (!selected) return;
    startTransition(async () => {
      const result = await purchaseAction(selected.id);

      if (result.ok) {
        toast.success("Pembelian berhasil! Akun kamu sudah terkirim. 🎉");
        setDialogOpen(false);
        router.push(`/dashboard/transactions/${result.invoice}`);
        return;
      }

      toast.error(result.error);
      if (result.code === "STOCK") {
        setDialogOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      <h2 className="font-heading text-base font-semibold">Pilih Varian</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Harga & stok menyesuaikan varian yang kamu pilih.
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
                onClick={() => setSelectedId(variant.id)}
                className={cn(
                  "w-full rounded-xl border p-3.5 text-left outline-none transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                    : "hover:border-primary/40 hover:bg-muted/50",
                  outOfStock && "opacity-60"
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
        {isAuthed && balance !== null ? (
          <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="size-3.5" aria-hidden />
              Saldo kamu
            </span>
            <span className="font-semibold">{formatIDR(balance)}</span>
          </div>
        ) : null}
        {selected?.description ? (
          <p className="mt-2 border-t pt-2 text-xs leading-relaxed text-muted-foreground">
            {selected.description}
          </p>
        ) : null}
      </div>

      {/* Tombol beli */}
      {walletEnabled && !isAuthed ? (
        <Button asChild size="lg" className="mt-4 w-full rounded-full">
          <Link href={`/login?callbackUrl=/products/${product.slug}`}>
            <LogIn className="size-4.5" />
            Login untuk Membeli
          </Link>
        </Button>
      ) : walletEnabled && canBuy ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="mt-4 w-full rounded-full">
              <Wallet className="size-4.5" />
              Beli Sekarang
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pembelian</DialogTitle>
              <DialogDescription>
                Pembayaran memakai saldo wallet — akun dikirim otomatis
                setelah pembayaran berhasil.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5 rounded-xl border bg-muted/40 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Produk</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Varian</span>
                <span className="font-medium">
                  {selected?.name} · {selected?.duration}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">Total</span>
                <span className="font-heading font-bold text-primary">
                  {selected ? formatIDR(selected.price) : "—"}
                </span>
              </div>
              <div className="flex justify-between gap-3 border-t pt-2.5">
                <span className="text-muted-foreground">Saldo kamu</span>
                <span
                  className={cn(
                    "font-semibold",
                    sufficient
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  {balance !== null ? formatIDR(balance) : "—"}
                </span>
              </div>
            </div>

            {!sufficient ? (
              <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                Saldo tidak mencukupi.{" "}
                <Link
                  href="/dashboard/topup"
                  className="font-semibold underline underline-offset-2"
                >
                  Topup saldo dulu
                </Link>{" "}
                untuk melanjutkan pembelian.
              </p>
            ) : null}

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" disabled={pending}>
                  Batal
                </Button>
              </DialogClose>
              <Button
                onClick={handlePurchase}
                disabled={pending || !sufficient}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Memproses…
                  </>
                ) : (
                  "Bayar dengan Saldo"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : walletEnabled && !canBuy ? (
        <Button size="lg" className="mt-4 w-full rounded-full" disabled>
          Stok Habis
        </Button>
      ) : (
        <Button asChild size="lg" className="mt-4 w-full rounded-full">
          <a
            href={buildWhatsAppLink(SITE.whatsapp, waMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4.5" />
            Order via WhatsApp
          </a>
        </Button>
      )}

      {/* Kontak sekunder */}
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mt-2 w-full rounded-full text-muted-foreground"
      >
        <a
          href={buildWhatsAppLink(SITE.whatsapp, waMessage)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="size-4" />
          Tanya Admin Dulu
        </a>
      </Button>

      <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Zap className="size-3.5 text-primary" aria-hidden />
          Auto delivery
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          {selected?.warranty ?? "Bergaransi"}
        </span>
      </div>
    </div>
  );
}
