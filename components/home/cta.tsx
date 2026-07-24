import Link from "next/link";
import { MessageCircle, ShoppingBag } from "lucide-react";

import { SITE } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";

export function Cta() {
  const waLink = buildWhatsAppLink(
    SITE.whatsapp,
    "Halo admin TopinzPedia! Saya ingin bertanya sebelum order."
  );

  return (
    <section id="contact" className="pb-20 pt-4 md:pb-28" aria-label="Kontak">
      <div className="container-page">
        <FadeUp>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-blue-600 to-secondary px-6 py-14 text-center shadow-card md:px-16 md:py-20">
            {/* Dekorasi */}
            <div
              aria-hidden
              className="absolute -left-20 -top-24 size-64 rounded-full bg-white/10 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-28 -right-16 size-72 rounded-full bg-white/10 blur-2xl"
            />

            <h2 className="relative font-heading text-3xl font-bold tracking-tight text-white md:text-4xl">
              Siap Upgrade ke Premium?
            </h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm leading-relaxed text-blue-100 md:text-base">
              Ribuan pelanggan sudah menikmati produk digital favorit mereka
              dengan harga hemat. Sekarang giliran kamu — atau tanya admin
              dulu juga boleh!
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-white px-7 text-primary shadow-soft hover:bg-blue-50"
              >
                <Link href="/products">
                  <ShoppingBag className="size-4.5" />
                  Lihat Produk
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-white/40 bg-transparent px-7 text-white hover:bg-white/10 hover:text-white"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4.5" />
                  Chat Admin WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
