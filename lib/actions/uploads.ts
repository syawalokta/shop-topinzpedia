"use server";

import { getAdminSession } from "../authz";
import { saveUploadedImage, type UploadResult } from "../storage";

const FOLDER_MAP = {
  logo: "brands",
  banner: "banners",
  qris: "qris",
} as const;

export type UploadKind = keyof typeof FOLDER_MAP;

/**
 * Upload gambar dari panel admin (logo produk, banner, QR QRIS).
 * Storage layer lokal — mudah dipindah ke Cloudinary/Vercel Blob.
 */
export async function uploadAdminImageAction(
  formData: FormData
): Promise<UploadResult> {
  if (!(await getAdminSession())) {
    return { ok: false, error: "Akses ditolak." };
  }

  const kind = String(formData.get("kind") ?? "logo") as UploadKind;
  const folder = FOLDER_MAP[kind] ?? "brands";
  const file = formData.get("file");

  return saveUploadedImage(file instanceof File ? file : null, folder, {
    allowSvg: kind === "logo",
  });
}
