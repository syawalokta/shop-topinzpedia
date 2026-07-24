import { CloudinaryStorage, isCloudinaryConfigured } from "./CloudinaryStorage";
import { LocalStorage } from "./LocalStorage";
import type { StorageService } from "./StorageService";

export * from "./StorageService";
export { isCloudinaryConfigured };

let instance: StorageService | null = null;

/**
 * Storage aktif:
 *  - Cloudinary bila CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET terpasang
 *  - LocalStorage sebagai fallback pengembangan
 */
export function getStorage(): StorageService {
  if (!instance) {
    if (isCloudinaryConfigured()) {
      instance = new CloudinaryStorage();
    } else {
      console.warn(
        "[storage] CLOUDINARY_* belum diset — memakai penyimpanan lokal (public/uploads). Set env Cloudinary untuk production."
      );
      instance = new LocalStorage();
    }
  }
  return instance;
}
