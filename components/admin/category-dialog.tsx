"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createCategory, updateCategory } from "@/lib/actions/categories";
import type { AdminCategoryRow } from "@/lib/data/admin";
import { slugSchema, type CategoryInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(40),
  slug: slugSchema,
  icon: z.string().min(1, "Isi nama ikon Lucide, mis. bot").max(40),
});

type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  category?: AdminCategoryRow;
  trigger: React.ReactNode;
}

export function CategoryDialog({ category, trigger }: CategoryDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      icon: category?.icon ?? "sparkles",
    },
  });

  // Segarkan nilai form setiap kali dialog dibuka
  useEffect(() => {
    if (!open) return;
    reset({
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      icon: category?.icon ?? "sparkles",
    });
  }, [open, category, reset]);

  const nameValue = watch("name");
  useEffect(() => {
    if (isEdit || !open) return;
    if (getFieldState("slug").isDirty) return;
    setValue("slug", slugify(nameValue ?? ""), { shouldDirty: false });
  }, [nameValue, isEdit, open, getFieldState, setValue]);

  async function onSubmit(values: CategoryFormValues) {
    const payload: CategoryInput = {
      name: values.name,
      slug: values.slug,
      icon: values.icon,
    };

    const result = category
      ? await updateCategory(category.id, payload)
      : await createCategory(payload);

    if (result.ok) {
      toast.success(
        category
          ? "Kategori berhasil diperbarui."
          : "Kategori berhasil ditambahkan."
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
          <DialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Perbarui informasi kategori "${category?.name}".`
              : "Kategori baru langsung tampil di katalog dan landing page."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="cat-name">Nama</Label>
            <Input
              id="cat-name"
              placeholder="mis. Music"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {fieldError(errors.name?.message)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              placeholder="music"
              aria-invalid={Boolean(errors.slug)}
              {...register("slug")}
            />
            <p className="text-xs text-muted-foreground">
              Urutan tampil diatur otomatis (kategori baru di posisi terakhir).
            </p>
            {fieldError(errors.slug?.message)}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-icon">Ikon (nama Lucide)</Label>
            <Input
              id="cat-icon"
              placeholder="bot / clapperboard / scissors / cloud"
              aria-invalid={Boolean(errors.icon)}
              {...register("icon")}
            />
            <p className="text-xs text-muted-foreground">
              Ikon tampil otomatis untuk slug yang dikenal (ai, streaming,
              editing, gaming, vpn, cloud) — selain itu memakai ikon default.
            </p>
            {fieldError(errors.icon?.message)}
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
                "Tambah Kategori"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
