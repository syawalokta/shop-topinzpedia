"use server";

import { getAdminSession, getSessionUser } from "../authz";
import {
  STORAGE_FOLDERS,
  getStorage,
  type StorageResult,
  type UploadKind,
} from "../storage";
import type { ActionResult } from "../../types";

/**
 * Server Actions upload/delete gambar.
 * Semua operasi lewat StorageService (Cloudinary bila dikonfigurasi).
 *
 * Otorisasi per kind:
 *  - avatar          : semua user login (file miliknya sendiri)
 *  - proof           : semua user login (via createTopupAction)
 *  - selain itu      : khusus admin
 */

const USER_KINDS: UploadKind[] = ["avatar"];
const VALID_KINDS = Object.keys(STORAGE_FOLDERS) as UploadKind[];

async function authorize(kind: UploadKind): Promise<string | null> {
  if (USER_KINDS.includes(kind)) {
    return (await getSessionUser()) ? null : "Silakan login terlebih dahulu.";
  }
  return (await getAdminSession()) ? null : "Akses ditolak.";
}

export async function uploadImageAction(
  formData: FormData
): Promise<StorageResult> {
  const kind = String(formData.get("kind") ?? "") as UploadKind;
  if (!VALID_KINDS.includes(kind)) {
    return { ok: false, error: "Jenis upload tidak dikenal." };
  }

  const denied = await authorize(kind);
  if (denied) return { ok: false, error: denied };

  const file = formData.get("file");
  return getStorage().upload(file instanceof File ? file : (null as never), kind);
}

/**
 * Hapus file dari storage. publicId harus berada di folder sesuai kind
 * (mencegah penghapusan sembarang file lewat manipulasi parameter).
 */
export async function deleteImageAction(
  publicId: string,
  kind: UploadKind
): Promise<ActionResult> {
  if (!VALID_KINDS.includes(kind)) {
    return { ok: false, error: "Jenis upload tidak dikenal." };
  }

  const denied = await authorize(kind);
  if (denied) return { ok: false, error: denied };

  const folder = STORAGE_FOLDERS[kind];
  const localFolder = `local:/uploads/${folder.replace(/^topinzpedia\//, "")}`;
  if (
    !publicId ||
    !(publicId.startsWith(`${folder}/`) || publicId.startsWith(localFolder))
  ) {
    return { ok: false, error: "publicId tidak sesuai folder." };
  }

  await getStorage().delete(publicId);
  return { ok: true };
}
