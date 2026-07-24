"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";

import { bulkImportStockAction } from "@/lib/actions/stock";
import type { BulkImportResult } from "@/lib/services/stock";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ImportVariantOption {
  id: string;
  productId: string;
  productName: string;
  label: string;
}

interface StockImportFormProps {
  products: { id: string; name: string }[];
  variants: ImportVariantOption[];
}

/** Form bulk import stok: pilih produk -> varian -> tempel daftar akun. */
export function StockImportForm({ products, variants }: StockImportFormProps) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [variantId, setVariantId] = useState("");
  const [raw, setRaw] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const productVariants = useMemo(
    () => variants.filter((variant) => variant.productId === productId),
    [variants, productId]
  );

  const lineCount = raw.split("\n").filter((line) => line.trim()).length;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!variantId) {
      toast.error("Pilih varian tujuan terlebih dahulu.");
      return;
    }
    setPending(true);
    setResult(null);
    try {
      const imported = await bulkImportStockAction(variantId, raw);
      setResult(imported);
      if (imported.ok) {
        toast.success(`${imported.success} stok berhasil diimpor.`);
        setRaw("");
        router.refresh();
      } else {
        toast.error(imported.error ?? "Import gagal.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="import-product">Produk</Label>
          <Select
            value={productId}
            onValueChange={(value) => {
              setProductId(value);
              setVariantId("");
            }}
          >
            <SelectTrigger id="import-product">
              <SelectValue placeholder="Pilih produk" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="import-variant">Varian Tujuan</Label>
          <Select value={variantId} onValueChange={setVariantId}>
            <SelectTrigger id="import-variant">
              <SelectValue placeholder="Pilih varian" />
            </SelectTrigger>
            <SelectContent>
              {productVariants.map((variant) => (
                <SelectItem key={variant.id} value={variant.id}>
                  {variant.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="import-raw">Data Akun (satu akun per baris)</Label>
        <Textarea
          id="import-raw"
          rows={10}
          required
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={"a@gmail.com:password123\nb@gmail.com:passwordb\nEmail: c@gmail.com | Password: c123 | PIN: 1111"}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Baris berformat <code className="font-mono">email:password</code>{" "}
          otomatis dirapikan. Format lain disimpan apa adanya.{" "}
          <span className="font-medium text-foreground">
            {lineCount} baris terdeteksi.
          </span>
        </p>
      </div>

      <Button type="submit" disabled={pending} className="rounded-full px-6">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Mengimpor…
          </>
        ) : (
          <>
            <Upload className="size-4" />
            Import Stok
          </>
        )}
      </Button>

      {result ? (
        <div className="grid gap-3 sm:grid-cols-3" role="status">
          <div className="flex items-center gap-2.5 rounded-xl border bg-emerald-500/5 p-3.5">
            <CheckCircle2 className="size-5 text-emerald-600" aria-hidden />
            <div>
              <p className="font-heading text-lg font-bold">{result.success}</p>
              <p className="text-xs text-muted-foreground">Berhasil</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border bg-destructive/5 p-3.5">
            <XCircle className="size-5 text-destructive" aria-hidden />
            <div>
              <p className="font-heading text-lg font-bold">{result.failed}</p>
              <p className="text-xs text-muted-foreground">Gagal</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border bg-muted/40 p-3.5">
            <Upload className="size-5 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-heading text-lg font-bold">{result.total}</p>
              <p className="text-xs text-muted-foreground">Total Baris</p>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
