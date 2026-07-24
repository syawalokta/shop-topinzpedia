import { getCategoriesWithCount } from "@/lib/data/categories";
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
  const categories = await getCategoriesWithCount();

  return (
    <>
      <Hero />
      <Brands />
      <Features />
      <Categories categories={categories} />
      <HowToBuy />
      <Faq />
      <Cta />
    </>
  );
}
