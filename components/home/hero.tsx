import Link from "next/link";
import { MessageCircle, ShieldCheck, ShoppingBag, Zap } from "lucide-react";

import { SITE } from "@/lib/constants";
import { buildWhatsAppLink } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/motion";
import { RatingStars } from "@/components/shared/rating-stars";
import { HeroMockup } from "@/components/home/hero-mockup";

export function Hero() {
  const waLink = buildWhatsAppLink(
    SITE.whatsapp,
    "Halo admin TopinzPedia! Saya ingin bertanya tentang produk."
  );

  return (
    <section className="relative overflow-hidden">
      {/* Dekorasi latar */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:56px_56px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_20%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-32 right-0 -z-10 size-[480px] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-40 top-40 -z-10 size-[380px] rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="container-page grid items-center gap-14 pb-16 pt-28 md:pt-36 lg:grid-cols-2 lg:gap-10 lg:pb-24">
        {/* Kolom teks */}
        <div>
          <FadeUp>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Dipercaya 10.000+ pelanggan di Indonesia
            </span>
          </FadeUp>

          <FadeUp delay={0.08}>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Akun Premium Digital{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:to-blue-400">
                Murah, Aman
              </span>{" "}
              & Otomatis
            </h1>
          </FadeUp>

          <FadeUp delay={0.16}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Beli ChatGPT Plus, Netflix, Spotify, Canva Pro, dan puluhan
              produk digital lainnya. Bayar mudah, produk dikirim otomatis
              dalam hitungan menit, bergaransi penuh selama masa aktif.
            </p>
          </FadeUp>

          <FadeUp delay={0.24}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/products">
                  <ShoppingBag className="size-4.5" />
                  Lihat Produk
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full bg-card px-7"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4.5" />
                  Hubungi Admin
                </a>
              </Button>
            </div>
          </FadeUp>

          <FadeUp delay={0.32}>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <RatingStars rating={4.9} />
                <span>
                  <strong className="font-semibold text-foreground">
                    4.9/5
                  </strong>{" "}
                  dari 2.300+ ulasan
                </span>
              </span>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                Garansi penuh
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="size-4 text-primary" />
                Pengiriman instan
              </span>
            </div>
          </FadeUp>
        </div>

        {/* Kolom mockup */}
        <HeroMockup />
      </div>
    </section>
  );
}
