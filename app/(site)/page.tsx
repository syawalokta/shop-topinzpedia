import { getCategoriesWithCount } from "@/lib/data/categories";
import { getSiteSettings } from "@/lib/services/settings";
import { Brands } from "@/components/home/brands";
import { Categories } from "@/components/home/categories";
import { Cta } from "@/components/home/cta";
import { Faq } from "@/components/home/faq";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { HowToBuy } from "@/components/home/how-to-buy";

/** Revalidasi tiap 10 menit — cukup untuk konten landing yang jarang berubah */
export const revalidate = 600;

export default async function HomePage() {
  const [categories, site] = await Promise.all([
    getCategoriesWithCount(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero />
      {site.landingBanner.url ? (
        <section aria-label="Promo" className="container-page pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={site.landingBanner.url}
            alt="Banner promo TopinzPedia"
            className="w-full rounded-2xl border object-cover shadow-soft"
          />
        </section>
      ) : null}
      <Brands />
      <Features />
      <Categories categories={categories} />
      <HowToBuy />
      <Faq />
      <Cta />
    </>
  );
}
