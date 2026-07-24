import { Loader2 } from "lucide-react";

/** Fallback saat halaman auth sedang dimuat — mencegah layar kosong. */
export default function AuthLoading() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
      <p className="text-sm text-muted-foreground">Memuat…</p>
    </div>
  );
}
