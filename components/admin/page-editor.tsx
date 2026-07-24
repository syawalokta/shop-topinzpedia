"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { updatePageAction } from "@/lib/actions/pages";
import type { PageDTO } from "@/lib/services/pages";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Editor sederhana halaman legal (S&K, Kebijakan Privasi). */
export function PageEditor({ pages }: { pages: PageDTO[] }) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(pages[0]?.slug ?? "");
  const [drafts, setDrafts] = useState<
    Record<string, { title: string; content: string }>
  >(() =>
    Object.fromEntries(
      pages.map((p) => [p.slug, { title: p.title, content: p.content }])
    )
  );
  const [pending, setPending] = useState(false);

  const draft = drafts[activeSlug];
  if (!draft) return null;

  function patch(field: "title" | "content", value: string) {
    setDrafts((prev) => ({
      ...prev,
      [activeSlug]: { ...prev[activeSlug], [field]: value },
    }));
  }

  async function handleSave() {
    setPending(true);
    try {
      const result = await updatePageAction(activeSlug, draft);
      if (result.ok) {
        toast.success("Halaman berhasil disimpan.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Gagal menyimpan.");
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
      {/* Pilih halaman */}
      <div className="flex flex-wrap gap-2">
        {pages.map((page) => (
          <button
            key={page.slug}
            type="button"
            onClick={() => setActiveSlug(page.slug)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              page.slug === activeSlug
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {page.title}
          </button>
        ))}
        <a
          href={`/${activeSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Lihat halaman
          <ExternalLink className="size-3.5" aria-hidden />
        </a>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="page-title">Judul</Label>
          <Input
            id="page-title"
            value={draft.title}
            onChange={(e) => patch("title", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="page-content">Konten</Label>
          <Textarea
            id="page-content"
            rows={22}
            value={draft.content}
            onChange={(e) => patch("content", e.target.value)}
            className="font-mono text-xs leading-relaxed"
          />
          <p className="text-xs text-muted-foreground">
            Format: <code className="font-mono">## Judul Bagian</code> untuk
            sub-judul, <code className="font-mono">- item</code> untuk daftar,
            paragraf dipisah baris kosong.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={pending}
          className="rounded-full px-6"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save className="size-4" />
              Simpan Halaman
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
