import Image from "next/image";

import { BRANDS } from "@/lib/constants";
import { FadeUp } from "@/components/shared/motion";

/** Deretan logo brand dengan animasi marquee halus. */
export function Brands() {
  return (
    <section aria-label="Brand produk yang tersedia" className="py-10 md:py-14">
      <div className="container-page">
        <FadeUp>
          <p className="text-center text-sm font-medium text-muted-foreground">
            Produk premium dari brand favoritmu
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="relative mt-7 overflow-hidden">
          {/* Gradasi tepi */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent"
          />

          <ul className="flex w-max animate-marquee gap-3.5 hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:animate-none">
            {[...BRANDS, ...BRANDS].map((brand, index) => (
              <li
                key={`${brand.name}-${index}`}
                aria-hidden={index >= BRANDS.length}
                className="flex shrink-0 items-center gap-2.5 rounded-full border bg-card py-2.5 pl-3 pr-5 shadow-soft"
              >
                <Image
                  src={brand.logo}
                  alt=""
                  width={26}
                  height={26}
                  unoptimized
                  className="size-6.5 rounded-md"
                />
                <span className="text-sm font-medium">{brand.name}</span>
              </li>
            ))}
          </ul>
        </FadeUp>
      </div>
    </section>
  );
}
