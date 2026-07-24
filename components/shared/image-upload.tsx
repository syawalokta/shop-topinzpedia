"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteImageAction, uploadImageAction } from "@/lib/actions/uploads";
import type { UploadKind } from "@/lib/storage/StorageService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageUploadProps {
  kind: UploadKind;
  value: string;
  publicId?: string;
  onChange: (url: string, publicId: string) => void;
  className?: string;
}

function isValidImageRef(value: string): boolean {
  return value.startsWith("/") || /^https?:\/\/\S+$/i.test(value);
}

/**
 * Uploader gambar reusable (semua upload lewat StorageService/Cloudinary):
 * upload file ATAU pakai URL, preview, replace (upload ulang otomatis
 * menghapus file lama saat disimpan), dan delete dengan konfirmasi.
 */
export function ImageUpload({
  kind,
  value,
  publicId = "",
  onChange,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [useUrl, setUseUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("kind", kind);
      const result = await uploadImageAction(formData);
      if (result.ok) {
        onChange(result.url, result.publicId);
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
    onChange(trimmed, ""); // URL eksternal — tanpa publicId storage
    setUrlDraft("");
    toast.success("URL gambar dipakai.");
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      if (publicId) {
        const result = await deleteImageAction(publicId, kind);
        if (!result.ok) {
          toast.error(result.error ?? "Gagal menghapus gambar.");
          return;
        }
      }
      onChange("", "");
      setDeleteOpen(false);
      toast.success("Gambar dihapus.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={cn("min-w-0 space-y-2.5", className)}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/50">
          {value ? (
            // Sumber dinamis (Cloudinary/lokal/eksternal) — pakai img biasa
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
            <div className="flex min-w-0 items-center gap-2">
              <Input
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value)}
                placeholder="https://contoh.com/gambar.png"
                className="h-9 min-w-0 flex-1 text-xs"
                aria-label="URL gambar"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={applyUrl}
              >
                <Link2 className="size-3.5" />
                Pakai
              </Button>
            </div>
          ) : (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Hapus gambar ini?</DialogTitle>
                      <DialogDescription>
                        Gambar akan dihapus dari penyimpanan (Cloudinary).
                        Tindakan ini tidak bisa dibatalkan.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" disabled={deleting}>
                          Batal
                        </Button>
                      </DialogClose>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Ya, Hapus
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
          )}
          {value ? (
            <p className="mt-1 max-w-full truncate break-all text-xs text-muted-foreground">
              {value}
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">
              {useUrl
                ? "Tempel tautan gambar lalu klik Pakai"
                : "JPG, PNG, WebP — maks. 5MB"}
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
