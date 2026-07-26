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
  image: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v),
      "Gambar harus kosong, path lokal, atau URL http(s)"
    )
    .default(""),
  imagePublicId: z.string().max(300).default(""),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").max(80),
  slug: slugSchema,
  category: z.string().min(1, "Pilih kategori"),
  logo: z
    .string()
    .min(1, "Upload logo atau isi URL/path gambar")
    .max(500)
    .refine(
      (v) => v.startsWith("/") || /^https?:\/\/\S+$/i.test(v),
      "Logo harus path lokal (/...) atau URL http(s)"
    ),
  banner: z
    .string()
    .max(500)
    .refine(
      (v) => v === "" || v.startsWith("/") || /^https?:\/\/\S+$/i.test(v),
      "Banner harus kosong, path lokal (/...), atau URL http(s)"
    )
    .default(""),
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
  logoPublicId: z.string().max(300).default(""),
  bannerPublicId: z.string().max(300).default(""),
  rating: z.coerce.number().min(0, "Rating 0–5").max(5, "Rating 0–5"),
  // Catatan: `sold` sengaja TIDAK ada di sini — jumlah terjual
  // bertambah otomatis saat transaksi berhasil, bukan input manual.
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
  qrisImage: z.string().max(500),
  qrisPublicId: z.string().max(300).default(""),
  googleAuthEnabled: z.boolean(),
  registrationEnabled: z.boolean(),
  emailVerificationEnabled: z.boolean(),
  landingBannerUrl: z.string().max(500).default(""),
  landingBannerPublicId: z.string().max(300).default(""),
  captchaProvider: z.enum(["math", "turnstile"]),
  turnstileSiteKey: z.string().max(200).default(""),
  /** Kosong = jangan ubah secret yang tersimpan */
  turnstileSecretKey: z.string().max(200).default(""),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const testEmailSchema = z.object({
  to: z.email("Format email tidak valid"),
});

/* ---------------- Profil user ---------------- */

export const socialsSchema = z.object({
  whatsapp: z
    .string()
    .max(20, "Maksimal 20 digit")
    .regex(/^[0-9+]*$/, "Hanya angka (format internasional, mis. 62812xxxx)")
    .default(""),
  telegram: z
    .string()
    .max(32, "Maksimal 32 karakter")
    .regex(/^[a-zA-Z0-9_@]*$/, "Username Telegram tidak valid")
    .default(""),
});
export type SocialsInput = z.infer<typeof socialsSchema>;

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Isi password lama"),
  newPassword: z.string().min(8, "Password baru minimal 8 karakter").max(72),
});

export const adminUserUpdateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").max(60),
  username: z
    .string()
    .regex(
      /^[a-z0-9_]{3,20}$/,
      "Username 3–20 karakter: huruf kecil, angka, underscore"
    ),
  email: z.email("Format email tidak valid"),
  /** Kosongkan untuk tidak mengubah password */
  password: z
    .string()
    .refine((v) => v === "" || (v.length >= 8 && v.length <= 72), {
      message: "Password baru minimal 8 karakter (atau kosongkan)",
    })
    .default(""),
  balance: z.coerce
    .number()
    .int("Saldo harus bilangan bulat")
    .min(0, "Saldo tidak boleh negatif")
    .max(1_000_000_000),
});
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
