import { DatabaseZap } from "lucide-react";

/**
 * Ditampilkan bila MONGODB_URI belum diset.
 * Panel admin membutuhkan database — fallback statis hanya untuk situs publik.
 */
export function DbNotice() {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed bg-card px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <DatabaseZap className="size-6" aria-hidden />
      </span>
      <h2 className="mt-4 font-heading text-lg font-semibold">
        Database Belum Terhubung
      </h2>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">
        Panel admin membutuhkan MongoDB untuk mengelola data. Isi{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
          MONGODB_URI
        </code>{" "}
        di file <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.local</code>,
        jalankan <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">npm run seed</code>,
        lalu restart server.
      </p>
    </div>
  );
}
