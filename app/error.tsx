"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Terjadi Kesalahan
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Maaf, ada yang tidak beres saat memuat halaman ini. Silakan coba lagi —
        bila masalah berlanjut, hubungi admin kami.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="rounded-full px-6">
          <RotateCcw className="size-4" />
          Coba Lagi
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
