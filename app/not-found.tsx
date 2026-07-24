import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p
        aria-hidden
        className="font-heading text-7xl font-extrabold text-primary/15 md:text-8xl"
      >
        404
      </p>
      <span className="-mt-5 grid size-14 place-items-center rounded-full border bg-card text-primary shadow-soft">
        <Compass className="size-6" aria-hidden />
      </span>
      <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight md:text-3xl">
        Halaman Tidak Ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Halaman yang kamu cari mungkin sudah dipindahkan, dihapus, atau memang
        tidak pernah ada. Yuk kembali belanja!
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full px-6">
          <Link href="/products">Lihat Produk</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/">Kembali ke Beranda</Link>
        </Button>
      </div>
    </div>
  );
}
