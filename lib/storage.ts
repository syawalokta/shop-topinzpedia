import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

/**
 * Storage layer untuk file upload.
 * Driver saat ini: filesystem lokal (public/uploads/...).
 * Untuk pindah ke Cloudinary / Vercel Blob / S3 nanti, cukup ganti
 * implementasi fungsi ini — seluruh pemanggil menerima URL string.
 */

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024; // 2MB

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

const ADMIN_EXTRA_TYPES: Record<string, string> = {
  "image/svg+xml": "svg",
};

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function saveUploadedImage(
  file: File | null,
  folder: "brands" | "banners" | "proofs" | "qris",
  options: { allowSvg?: boolean } = {}
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: "File tidak ditemukan." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Ukuran file maksimal 2MB." };
  }

  const types = options.allowSvg
    ? { ...ALLOWED_TYPES, ...ADMIN_EXTRA_TYPES }
    : ALLOWED_TYPES;
  const ext = types[file.type];
  if (!ext) {
    return {
      ok: false,
      error: options.allowSvg
        ? "Format harus PNG, JPG, WebP, atau SVG."
        : "Format harus PNG, JPG, atau WebP.",
    };
  }

  try {
    const safeFolder = folder.replace(/[^a-z-]/g, "");
    const dir = path.join(process.cwd(), "public", "uploads", safeFolder);
    await mkdir(dir, { recursive: true });

    const filename = `${randomUUID()}.${ext}`;
    await writeFile(
      path.join(dir, filename),
      Buffer.from(await file.arrayBuffer())
    );

    return { ok: true, url: `/uploads/${safeFolder}/${filename}` };
  } catch (error) {
    console.error("[storage] gagal menyimpan file:", error);
    return { ok: false, error: "Gagal menyimpan file." };
  }
}
