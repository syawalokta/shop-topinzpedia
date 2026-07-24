import Link from "next/link";
import { MessageCircle, Zap } from "lucide-react";

import {
  PAYMENT_METHODS,
  SITE,
  STATIC_CATEGORIES,
} from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/utils";

const helpLinks = [
  { label: "FAQ", href: "/#faq" },
  { label: "Cara Pembelian", href: "/#cara-beli" },
  {
    label: "Hubungi Admin",
    href: buildWhatsAppLink(SITE.whatsapp, "Halo admin TopinzPedia!"),
    external: true,
  },
  {
    label: "Klaim Garansi",
    href: buildWhatsAppLink(
      SITE.whatsapp,
      "Halo admin, saya ingin klaim garansi. Nomor invoice saya: "
    ),
    external: true,
  },
];

const legalLinks = [
  { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
  { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container-page py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                <Zap className="size-4" fill="currentColor" strokeWidth={0} />
              </span>
              <span className="font-heading text-lg font-bold tracking-tight">
                Topinz<span className="text-primary">Pedia</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Digital store terpercaya untuk akun premium ChatGPT, Netflix,
              Spotify, Canva, dan puluhan produk digital lainnya. Murah, aman,
              dan otomatis.
            </p>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pembayaran
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {PAYMENT_METHODS.map((method) => (
                  <li
                    key={method}
                    className="rounded-md border bg-background px-2 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Kategori */}
          <nav aria-label="Kategori produk">
            <h3 className="font-heading text-sm font-semibold">Kategori</h3>
            <ul className="mt-4 space-y-2.5">
              {STATIC_CATEGORIES.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bantuan */}
          <nav aria-label="Bantuan">
            <h3 className="font-heading text-sm font-semibold">Bantuan</h3>
            <ul className="mt-4 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal + kontak */}
          <div>
            <h3 className="font-heading text-sm font-semibold">Legal</h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={buildWhatsAppLink(SITE.whatsapp, "Halo admin TopinzPedia!")}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <MessageCircle className="size-4" />
              Chat Admin
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE.name}. Semua hak dilindungi.
          </p>
          <p className="text-xs text-muted-foreground">
            Dibuat dengan ❤️ di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
