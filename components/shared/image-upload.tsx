"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  uploadAdminImageAction,
  type UploadKind,
} from "@/lib/actions/uploads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  kind: UploadKind;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

/**
 * Upload gambar via storage layer (lokal → mudah pindah Cloudinary/Blob).
 * Menampilkan preview + tombol pilih file; URL hasil dikirim ke onChange.
 */
export function ImageUpload({
  kind,
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("kind", kind);
      const result = await uploadAdminImageAction(formData);
      if (result.ok) {
        onChange(result.url);
        toast.success("Gambar berhasil diunggah.");
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Gagal mengunggah gambar.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/50">
        {value ? (
          // Path dinamis (uploads/brands) — pakai img biasa
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt="Preview"
            width={44}
            height={44}
            className="size-11 rounded-md object-contain"
          />
        ) : (
          <ImagePlus className="size-5 text-muted-foreground" aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="sr-only"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Mengunggah…
            </>
          ) : (
            <>
              <ImagePlus className="size-4" />
              {value ? "Ganti Gambar" : "Upload Gambar"}
            </>
          )}
        </Button>
        {value ? (
          <p className="mt-1 truncate text-xs text-muted-foreground">{value}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WebP — maks. 2MB
          </p>
        )}
      </div>
    </div>
  );
}
