import Link from "next/link";

import { CATEGORY_ICONS, FALLBACK_CATEGORY_ICON } from "@/lib/constants";
import type { CategoryDTO } from "@/types";
import { SectionHeading } from "@/components/shared/section-heading";
import { Stagger, StaggerItem } from "@/components/shared/motion";

interface CategoriesProps {
  categories: CategoryDTO[];
}

export function Categories({ categories }: CategoriesProps) {
  return (
    <section className="py-16 md:py-24" aria-labelledby="categories-heading">
      <div className="container-page">
        <SectionHeading
          eyebrow="Kategori"
          title="Jelajahi Sesuai Kebutuhanmu"
          description="Dari asisten AI, hiburan streaming, sampai tools editing profesional — semua tersedia dalam satu tempat."
        />

        <Stagger className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-12 md:gap-4 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon =
              CATEGORY_ICONS[category.slug] ?? FALLBACK_CATEGORY_ICON;

            return (
              <StaggerItem key={category.slug} className="h-full">
                <Link
                  href={`/products?category=${category.slug}`}
                  className="group flex h-full flex-col items-center gap-3 rounded-lg border bg-card px-4 py-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card"
                >
                  <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-heading text-sm font-semibold transition-colors group-hover:text-primary">
                      {category.name}
                    </span>
                    {category.productCount !== undefined ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {category.productCount} produk
                      </span>
                    ) : null}
                  </span>
                </Link>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
