"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createProduct, updateProduct } from "@/lib/actions/products";
import type { AdminCategoryRow, AdminProductDetail } from "@/lib/data/admin";
import { slugSchema, type ProductInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Skema form (semua string) — konversi angka dilakukan saat submit. */
const formSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(80),
  slug: slugSchema,
  category: z.string().min(1, "Pilih kategori"),
  status: z.enum(["active", "inactive"]),
  logo: z.string().min(1, "Isi path logo, mis. /brands/chatgpt.svg"),
  banner: z.string(),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Format warna hex 6 digit, mis. #2563eb"),
  rating: z.string().refine((value) => {
    const num = Number(value);
    return Number.isFinite(num) && num >= 0 && num <= 5;
  }, "Rating antara 0 sampai 5"),
  sold: z.string().refine((value) => {
    const num = Number(value);
    return Number.isInteger(num) && num >= 0;
  }, "Harus bilangan bulat ≥ 0"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  featuresText: z.string().min(3, "Tulis minimal satu fitur"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  categories: AdminCategoryRow[];
  product?: AdminProductDetail;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      category: product?.category ?? "",
      status: product?.status ?? "active",
      logo: product?.logo ?? "/brands/",
      banner: product?.banner ?? "",
      accent: product?.accent ?? "#2563eb",
      rating: String(product?.rating ?? 5),
      sold: String(product?.sold ?? 0),
      description: product?.description ?? "",
      featuresText: product?.features.join("\n") ?? "",
    },
  });

  const nameValue = watch("name");
  const accentValue = watch("accent");

  // Mode tambah: slug otomatis mengikuti nama selama belum diedit manual
  useEffect(() => {
    if (isEdit) return;
    if (getFieldState("slug").isDirty) return;
    setValue("slug", slugify(nameValue ?? ""), { shouldDirty: false });
  }, [nameValue, isEdit, getFieldState, setValue]);

  async function onSubmit(values: ProductFormValues) {
    const payload: ProductInput = {
      name: values.name,
      slug: values.slug,
      category: values.category,
      status: values.status,
      logo: values.logo,
      banner: values.banner,
      accent: values.accent,
      rating: Number(values.rating),
      sold: Number(values.sold),
      description: values.description,
      features: values.featuresText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    };

    const result = product
      ? await updateProduct(product.id, payload)
      : await createProduct(payload);

    if (result.ok) {
      toast.success(
        product ? "Produk berhasil diperbarui." : "Produk berhasil ditambahkan."
      );
      router.push("/admin/products");
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-lg border bg-card p-5 shadow-soft md:p-7"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            placeholder="mis. ChatGPT Plus"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {fieldError(errors.name?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            placeholder="chatgpt-plus"
            aria-invalid={Boolean(errors.slug)}
            {...register("slug")}
          />
          {fieldError(errors.slug?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <Select
            value={watch("category")}
            onValueChange={(value) =>
              setValue("category", value, { shouldValidate: true })
            }
          >
            <SelectTrigger id="category" aria-invalid={Boolean(errors.category)}>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldError(errors.category?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={watch("status")}
            onValueChange={(value) =>
              setValue("status", value as "active" | "inactive", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Aktif (tampil di katalog)</SelectItem>
              <SelectItem value="inactive">Nonaktif (disembunyikan)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Logo Produk</Label>
          <ImageUpload
            kind="logo"
            value={watch("logo")}
            onChange={(url) =>
              setValue("logo", url, { shouldValidate: true, shouldDirty: true })
            }
          />
          <Input
            id="logo"
            placeholder="atau isi path manual, mis. /brands/chatgpt.svg"
            aria-invalid={Boolean(errors.logo)}
            className="text-xs"
            {...register("logo")}
          />
          {fieldError(errors.logo?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent">Warna Aksen</Label>
          <div className="flex items-center gap-2.5">
            <input
              type="color"
              aria-label="Pilih warna aksen"
              value={/^#[0-9a-fA-F]{6}$/.test(accentValue) ? accentValue : "#2563eb"}
              onChange={(event) =>
                setValue("accent", event.target.value, { shouldValidate: true })
              }
              className="size-9 shrink-0 cursor-pointer rounded-lg border bg-transparent p-1"
            />
            <Input
              id="accent"
              placeholder="#2563eb"
              aria-invalid={Boolean(errors.accent)}
              {...register("accent")}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Dipakai untuk pewarnaan banner halaman detail.
          </p>
          {fieldError(errors.accent?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0–5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min={0}
            max={5}
            aria-invalid={Boolean(errors.rating)}
            {...register("rating")}
          />
          {fieldError(errors.rating?.message)}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sold">Jumlah Terjual</Label>
          <Input
            id="sold"
            type="number"
            min={0}
            aria-invalid={Boolean(errors.sold)}
            {...register("sold")}
          />
          {fieldError(errors.sold?.message)}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Banner (opsional)</Label>
          <ImageUpload
            kind="banner"
            value={watch("banner")}
            onChange={(url) =>
              setValue("banner", url, { shouldDirty: true })
            }
          />
          <Input
            id="banner"
            placeholder="Kosongkan untuk gradient otomatis dari warna aksen"
            className="text-xs"
            {...register("banner")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Jelaskan produk secara singkat dan meyakinkan…"
            aria-invalid={Boolean(errors.description)}
            {...register("description")}
          />
          {fieldError(errors.description?.message)}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="featuresText">Fitur Produk</Label>
          <Textarea
            id="featuresText"
            rows={5}
            placeholder={"Satu fitur per baris, contoh:\nAkses model GPT terbaru\nKuota lebih besar"}
            aria-invalid={Boolean(errors.featuresText)}
            {...register("featuresText")}
          />
          <p className="text-xs text-muted-foreground">
            Tulis satu poin fitur per baris (maks. 12).
          </p>
          {fieldError(errors.featuresText?.message)}
        </div>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-3 border-t pt-5">
        <Button type="submit" disabled={isSubmitting} className="rounded-full px-6">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save className="size-4" />
              {isEdit ? "Simpan Perubahan" : "Simpan Produk"}
            </>
          )}
        </Button>
        <Button asChild variant="ghost" disabled={isSubmitting}>
          <Link href="/admin/products">Batal</Link>
        </Button>
      </div>
    </form>
  );
}
