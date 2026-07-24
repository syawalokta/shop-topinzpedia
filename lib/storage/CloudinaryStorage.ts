import { Readable } from "node:stream";
import {
  v2 as cloudinary,
  type UploadApiResponse,
} from "cloudinary";

import {
  STORAGE_FOLDERS,
  validateImageFile,
  type StorageResult,
  type StorageService,
  type UploadKind,
} from "./StorageService";

/**
 * Implementasi StorageService berbasis Cloudinary.
 * - Upload via stream (tanpa buffer penuh / base64)
 * - secure_url + f_auto,q_auto (format & kualitas otomatis, CDN)
 * - unique filename otomatis oleh Cloudinary
 */

let configured = false;

function ensureConfigured() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

export class CloudinaryStorage implements StorageService {
  async upload(file: File, kind: UploadKind): Promise<StorageResult> {
    const invalid = validateImageFile(file, kind);
    if (invalid) return { ok: false, error: invalid };

    ensureConfigured();

    try {
      const result = await new Promise<UploadApiResponse>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: STORAGE_FOLDERS[kind],
              resource_type: "image",
              unique_filename: true,
              overwrite: false,
              use_filename: false,
            },
            (error, response) =>
              error || !response ? reject(error) : resolve(response)
          );
          Readable.fromWeb(
            file.stream() as unknown as import("stream/web").ReadableStream
          ).pipe(uploadStream);
        }
      );

      return {
        ok: true,
        url: this.getUrl(result.public_id),
        publicId: result.public_id,
      };
    } catch (error) {
      console.error("[storage/cloudinary] upload gagal:", error);
      return { ok: false, error: "Gagal mengunggah ke Cloudinary." };
    }
  }

  async delete(publicId: string): Promise<void> {
    if (!publicId || publicId.startsWith("local:")) return;
    ensureConfigured();
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
      console.error("[storage/cloudinary] delete gagal:", publicId, error);
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
    ensureConfigured();
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: "auto",
      quality: "auto",
    });
  }
}
