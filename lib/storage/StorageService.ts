/**
 * Abstraction layer penyimpanan gambar.
 *
 * Alur wajib:  UI -> Server Action -> Service/Repository -> StorageService
 * Komponen TIDAK pernah meng-upload langsung.
 *
 * Implementasi aktif dipilih di ./index.ts:
 *  - CloudinaryStorage (bila env CLOUDINARY_* terpasang) — production
 *  - LocalStorage (fallback pengembangan, public/uploads)
 */

export type UploadKind =
  | "logo"
  | "banner"
  | "category"
  | "avatar"
  | "proof"
  | "qris"
  | "landing";

/** Struktur folder Cloudinary sesuai spesifikasi. */
export const STORAGE_FOLDERS: Record<UploadKind, string> = {
  logo: "topinzpedia/products/logo",
  banner: "topinzpedia/products/banner",
  category: "topinzpedia/categories",
  avatar: "topinzpedia/users/avatar",
  proof: "topinzpedia/payments/proof",
  qris: "topinzpedia/payments/qris",
  landing: "topinzpedia/landing/banner",
};

export interface UploadedImage {
  url: string;
  publicId: string;
}

export type StorageResult =
  | ({ ok: true } & UploadedImage)
  | { ok: false; error: string };

export interface StorageService {
  /** Upload file ke folder sesuai kind; kembalikan secure URL + publicId. */
  upload(file: File, kind: UploadKind): Promise<StorageResult>;
  /** Hapus file dari storage (abaikan error agar tidak memblokir flow). */
  delete(publicId: string): Promise<void>;
  /** Upload file baru lalu hapus file lama — anti file orphan. */
  replace(
    oldPublicId: string,
    file: File,
    kind: UploadKind
  ): Promise<StorageResult>;
  /** URL delivery untuk sebuah publicId. */
  getUrl(publicId: string): string;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

const BASE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const SVG_TYPE: Record<string, string> = { "image/svg+xml": "svg" };

/** SVG hanya untuk logo (sesuai spesifikasi). */
export function allowedTypesFor(kind: UploadKind): Record<string, string> {
  return kind === "logo" ? { ...BASE_TYPES, ...SVG_TYPE } : BASE_TYPES;
}

/** Validasi tipe + ukuran. Return pesan error, atau null bila valid. */
export function validateImageFile(
  file: File | null,
  kind: UploadKind
): string | null {
  if (!file || file.size === 0) return "File tidak ditemukan.";
  if (file.size > MAX_UPLOAD_BYTES) return "Ukuran file maksimal 5MB.";
  if (!allowedTypesFor(kind)[file.type]) {
    return kind === "logo"
      ? "Format harus JPG, JPEG, PNG, WebP, atau SVG."
      : "Format harus JPG, JPEG, PNG, atau WebP.";
  }
  return null;
}
