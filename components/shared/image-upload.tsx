"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  uploadAdminImageAction,
  type UploadKind,
} from "@/lib/actions/uploads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ImageUploadProps {
  kind: UploadKind;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

function isValidImageRef(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\/\S+$/i.test(value);
}

/**
 * Input gambar dua mode:
 * - Upload file (storage layer lokal — maks. 2MB)
 * - Pakai URL (centang "Pakai URL" lalu tempel tautan gambar)
 */
export function ImageUpload({
  kind,
  value,
  onChange,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [useUrl, setUseUrl] = useState(
    Boolean(value && /^https?:\/\//i.test(value))
  );
  const [urlDraft, setUrlDraft] = useState(
    /^https?:\/\//i.test(value) ? value : ""
  );

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

  function applyUrl() {
    const trimmed = urlDraft.trim();
    if (!isValidImageRef(trimmed)) {
      toast.error("URL harus diawali http:// atau https://");
      return;
    }
    onChange(trimmed);
    toast.success("URL gambar dipakai.");
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/50">
          {value ? (
            // Path dinamis (upload lokal / URL eksternal) — pakai img biasa
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
          {useUrl ? (
            <div className="flex items-center gap-2">
              <Input
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                placeholder="https://contoh.com/gambar.png"
                className="h-9 text-xs"
                aria-label="URL gambar"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyUrl}
              >
                <Link2 className="size-3.5" />
                Pakai
              </Button>
            </div>
          ) : (
            <>
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
            </>
          )}
          {value ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {value}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {useUrl
                ? "Tempel tautan gambar lalu klik Pakai"
                : "PNG, JPG, WebP — maks. 2MB"}
            </p>
          )}
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={useUrl}
          onChange={(event) => setUseUrl(event.target.checked)}
          className="size-3.5 accent-[var(--primary)]"
        />
        Pakai URL (tanpa upload)
      </label>
    </div>
  );
}
