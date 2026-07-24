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
  duration: z.string().min(1, "Isi durasi, mis. 1 Bulan").max(40),
  warranty: z.string().min(1, "Isi garansi, mis. Garansi 30 Hari").max(60),
  description: z.string().max(300).default(""),
  active: z.boolean(),
});
export type VariantInput = z.infer<typeof variantSchema>;

/* ---------------- Auth & user ---------------- */

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(60),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,20}$/,
      "Username 3–20 karakter: huruf kecil, angka, underscore"
    ),
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/* ---------------- Wallet & topup ---------------- */

export const topupSchema = z.object({
  amount: z.coerce
    .number()
    .int("Nominal harus bilangan bulat")
    .min(10000, "Minimal topup Rp10.000")
    .max(10_000_000, "Maksimal topup Rp10.000.000"),
  method: z.enum(["manual_transfer", "qris"]),
  note: z.string().max(200, "Catatan maksimal 200 karakter"),
});
export type TopupInput = z.infer<typeof topupSchema>;

/* ---------------- Stock ---------------- */

export const stockSchema = z.object({
  content: z
    .string()
    .min(3, "Isi akun minimal 3 karakter")
    .max(2000, "Maksimal 2000 karakter"),
  status: z.enum(["available", "reserved"]),
});
export type StockInput = z.infer<typeof stockSchema>;

/* ---------------- Settings ---------------- */

export const settingsSchema = z.object({
  walletEnabled: z.boolean(),
  manualTransferEnabled: z.boolean(),
  bankName: z.string().max(40),
  accountNumber: z.string().max(40),
  accountName: z.string().max(60),
  qrisEnabled: z.boolean(),
  qrisImage: z.string().max(300),
  googleAuthEnabled: z.boolean(),
  registrationEnabled: z.boolean(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
