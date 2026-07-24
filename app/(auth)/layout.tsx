import Link from "next/link";
import { Zap } from "lucide-react";

import { SITE } from "@/lib/constants";

/**
 * Layout minimal untuk halaman autentikasi — tanpa navbar/footer
 * agar fokus pada form.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* Dekorasi latar */}
      <div
        aria-hidden
        className="absolute -top-32 right-1/4 -z-10 size-[420px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/4 -z-10 size-[380px] rounded-full bg-secondary/10 blur-3xl"
      />

      <Link
        href="/"
        className="mb-8 flex items-center gap-2"
        aria-label={`${SITE.name} — kembali ke beranda`}
      >
        <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground shadow-soft">
          <Zap className="size-4.5" fill="currentColor" strokeWidth={0} />
        </span>
        <span className="font-heading text-xl font-bold tracking-tight">
          Topinz<span className="text-primary">Pedia</span>
        </span>
      </Link>

      {children}

      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {SITE.name}
      </p>
    </div>
  );
}
