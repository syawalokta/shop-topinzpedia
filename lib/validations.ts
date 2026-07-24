import { z } from "zod";

/**
 * Skema validasi terpusat — dipakai server actions (otoritatif)
 * dan bisa dipakai ulang di sisi klien.
 */

export const slugSchema = z
  .string()
  .min(2, "Slug minimal 2 karakter")
  .max(80, "Slug maksimal 80 karakter")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug hanya boleh huruf kecil, angka, dan tanda hubung"
  );

export const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(40),
  slug: slugSchema,
  icon: z
    .string()
    .min(1, "Isi nama ikon Lucide, mis. bot / clapperboard")
    .max(40),
  order: z.coerce.number().int("Urutan harus bilangan bulat").min(0),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(80),
  slug: slugSchema,
  category: z.string().min(1, "Pilih kategori"),
  logo: z.string().min(1, "Isi path logo, mis. /brands/chatgpt.svg").max(300),
  banner: z.string().max(300).default(""),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Format warna hex 6 digit, mis. #2563eb"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  features: z
    .array(z.string().min(1))
    .max(12, "Maksimal 12 poin fitur")
    .default([]),
  rating: z.coerce.number().min(0, "Rating 0–5").max(5, "Rating 0–5"),
  sold: z.coerce.number().int("Harus bilangan bulat").min(0),
  status: z.enum(["active", "inactive"]),
});
export type ProductInput = z.infer<typeof productSchema>;

export const variantSchema = z.object({
  name: z.string().min(2, "Nama varian minimal 2 karakter").max(60),
  price: z.coerce
    .number()
    .int("Harga dalam rupiah bulat")
    .min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int("Stok harus bilangan bulat").min(0),
  duration: z.string().min(1, "Isi durasi, mis. 1 Bulan").max(40),
  warranty: z.string().min(1, "Isi garansi, mis. Garansi 30 Hari").max(60),
  description: z.string().max(300).default(""),
  active: z.boolean(),
});
export type VariantInput = z.infer<typeof variantSchema>;
