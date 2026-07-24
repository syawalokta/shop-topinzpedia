import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import {
  STORAGE_FOLDERS,
  allowedTypesFor,
  validateImageFile,
  type StorageResult,
  type StorageService,
  type UploadKind,
} from "./StorageService";

/**
 * Fallback pengembangan: simpan ke public/uploads/... .
 * publicId memakai prefix "local:" agar bisa dibedakan & dihapus.
 * Di production gunakan Cloudinary (set env CLOUDINARY_*).
 */
export class LocalStorage implements StorageService {
  async upload(file: File, kind: UploadKind): Promise<StorageResult> {
    const invalid = validateImageFile(file, kind);
    if (invalid) return { ok: false, error: invalid };

    try {
      const folder = STORAGE_FOLDERS[kind].replace(/^topinzpedia\//, "");
      const dir = path.join(process.cwd(), "public", "uploads", folder);
      await mkdir(dir, { recursive: true });

      const ext = allowedTypesFor(kind)[file.type];
      const filename = `${randomUUID()}.${ext}`;
      await writeFile(
        path.join(dir, filename),
        new Uint8Array(await file.arrayBuffer())
      );

      const url = `/uploads/${folder}/${filename}`;
      return { ok: true, url, publicId: `local:${url}` };
    } catch (error) {
      console.error("[storage/local] upload gagal:", error);
      return { ok: false, error: "Gagal menyimpan file." };
    }
  }

  async delete(publicId: string): Promise<void> {
    if (!publicId.startsWith("local:")) return;
    const rel = publicId.slice("local:".length);
    if (!rel.startsWith("/uploads/")) return;
    try {
      await unlink(path.join(process.cwd(), "public", rel));
    } catch {
      // file mungkin sudah tidak ada — abaikan
    }
  }

  async replace(
    oldPublicId: string,
    file: File,
    kind: UploadKind
  ): Promise<StorageResult> {
    const result = await this.upload(file, kind);
    if (result.ok && oldPublicId) {
      await this.delete(oldPublicId);
    }
    return result;
  }

  getUrl(publicId: string): string {
    return publicId.startsWith("local:")
      ? publicId.slice("local:".length)
      : publicId;
  }
}
