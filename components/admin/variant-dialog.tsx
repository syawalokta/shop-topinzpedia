"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createVariant, updateVariant } from "@/lib/actions/variants";
import type { AdminVariantRow } from "@/lib/data/admin";
import type { VariantInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
  name: z.string().min(2, "Nama varian minimal 2 karakter").max(60),
  price: z.string().refine((value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  }, "Harga harus bilangan bulat ≥ 0"),
  stock: z.string().refine((value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  }, "Stok harus bilangan bulat ≥ 0"),
  duration: z.string().min(1, "Isi durasi, mis. 1 Bulan").max(40),
  warranty: z.string().min(1, "Isi garansi, mis. Garansi 30 Hari").max(60),
  description: z.string().max(300, "Maksimal 300 karakter"),
  active: z.enum(["true", "false"]),
});

type VariantFormValues = z.infer<typeof formSchema>;

interface VariantDialogProps {
  productId: string;
  variant?: AdminVariantRow;
  trigger: React.ReactNode;
}

export function VariantDialog({
  productId,
  variant,
  trigger,
}: VariantDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(variant);

  const toDefaults = (): VariantFormValues => ({
    name: variant?.name ?? "",
    price: String(variant?.price ?? ""),
    stock: String(variant?.stock ?? 0),
    duration: variant?.duration ?? "1 Bulan",
    warranty: variant?.warranty ?? "Garansi 30 Hari",
    description: variant?.description ?? "",
    active: variant ? String(variant.active) as "true" | "false" : "true",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VariantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: toDefaults(),
  });

  // Segarkan nilai form setiap kali dialog dibuka
  useEffect(() => {
    if (open) reset(toDefaults());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function onSubmit(values: VariantFormValues) {
    const payload: VariantInput = {
      name: values.name,
      price: Number(values.price),
      stock: Number(values.stock),
      duration: values.duration,
      warranty: values.warranty,
      description: values.description,
      active: values.active === "true",
    };

    const result = variant
      ? await updateVariant(variant.id, payload)
      : await createVariant(productId, payload);

    if (result.ok) {
      toast.success(
        variant ? "Varian berhasil diperbarui." : "Varian berhasil ditambahkan."
      );
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "Terjadi kesalahan.");
    }
  }

  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" className="text-xs font-medium text-destructive">
        {message}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Varian" : "Tambah Varian"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Perbarui detail varian "${variant?.name}".`
              : "Varian menentukan pilihan harga pada halaman produk."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="var-name">Nama Varian</Label>
              <Input
                id="var-name"
                placeholder="mis. Private"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {fieldError(errors.name?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-price">Harga (Rp)</Label>
              <Input
                id="var-price"
                type="number"
                min={0}
                placeholder="25000"
                aria-invalid={Boolean(errors.price)}
                {...register("price")}
              />
              {fieldError(errors.price?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-duration">Durasi</Label>
              <Input
                id="var-duration"
                placeholder="1 Bulan"
                aria-invalid={Boolean(errors.duration)}
                {...register("duration")}
              />
              {fieldError(errors.duration?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-warranty">Garansi</Label>
              <Input
                id="var-warranty"
                placeholder="Garansi 30 Hari"
                aria-invalid={Boolean(errors.warranty)}
                {...register("warranty")}
              />
              {fieldError(errors.warranty?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-stock">Stok</Label>
              <Input
                id="var-stock"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.stock)}
                {...register("stock")}
              />
              {fieldError(errors.stock?.message)}
            </div>
            <div className="space-y-2">
              <Label htmlFor="var-active">Status</Label>
              <Select
                value={watch("active")}
                onValueChange={(value) =>
                  setValue("active", value as "true" | "false", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="var-active">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Aktif (bisa dibeli)</SelectItem>
                  <SelectItem value="false">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="var-description">Catatan (opsional)</Label>
            <Textarea
              id="var-description"
              rows={2}
              placeholder="mis. Akun pribadi 100% milikmu, bebas atur sendiri."
              aria-invalid={Boolean(errors.description)}
              {...register("description")}
            />
            {fieldError(errors.description?.message)}
          </div>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Menyimpan…
                </>
              ) : isEdit ? (
                "Simpan Perubahan"
              ) : (
                "Tambah Varian"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
