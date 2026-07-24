"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createStockAction, updateStockAction } from "@/lib/actions/stock";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockDialogProps {
  /** Mode edit: isi data stok */
  stock?: { id: string; content: string; status: "available" | "reserved" };
  /** Mode tambah: id varian target */
  variantId?: string;
  variantLabel?: string;
  trigger: React.ReactNode;
}

/** Dialog tambah/edit satu akun stok. */
export function StockDialog({
  stock,
  variantId,
  variantLabel,
  trigger,
}: StockDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(stock?.content ?? "");
  const [status, setStatus] = useState<"available" | "reserved">(
    stock?.status ?? "available"
  );
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(stock);

  useEffect(() => {
    if (open) {
      setContent(stock?.content ?? "");
      setStatus(stock?.status ?? "available");
    }
  }, [open, stock]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = stock
        ? await updateStockAction(stock.id, { content, status })
        : await createStockAction(variantId ?? "", content);

      if (result.ok) {
        toast.success(
          isEdit ? "Stok berhasil diperbarui." : "Stok berhasil ditambahkan."
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error ?? "Terjadi kesalahan.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Stok" : "Tambah Stok"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui isi akun atau statusnya."
              : `Satu entri = satu akun siap kirim${variantLabel ? ` untuk ${variantLabel}` : ""}.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stock-content">Isi Akun</Label>
            <Textarea
              id="stock-content"
              rows={5}
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={"Email: akun@gmail.com\nPassword: rahasia123\nPIN: 1234 (opsional)"}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Format bebas — isi persis seperti yang ingin diterima pembeli.
            </p>
          </div>

          {isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="stock-status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as "available" | "reserved")
                }
              >
                <SelectTrigger id="stock-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">
                    Available (bisa dibeli)
                  </SelectItem>
                  <SelectItem value="reserved">
                    Reserved (ditahan sementara)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={pending}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending || content.trim().length < 3}>
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Stok"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
