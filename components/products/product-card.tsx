import Image from "next/image";
import Link from "next/link";

import type { ProductDTO } from "@/types";
import { cn, formatCompact, formatIDR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RatingStars } from "@/components/shared/rating-stars";

interface ProductCardProps {
  product: ProductDTO;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block h-full rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      aria-label={`Lihat detail ${product.name}`}
    >
      <article className="flex h-full flex-col rounded-lg border bg-card p-3.5 shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary/60 group-hover:shadow-card md:p-5">
        <div className="flex items-start justify-between gap-2">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-muted/60 md:size-12">
            <Image
              src={product.logo}
              alt=""
              width={34}
              height={34}
              unoptimized
              className="size-8 rounded-lg md:size-8.5"
            />
          </span>
          <Badge
            variant="outline"
            className="max-w-full truncate text-[10px] text-muted-foreground md:text-xs"
          >
            {product.category.name}
          </Badge>
        </div>

        <h3 className="mt-3 line-clamp-1 font-heading text-sm font-semibold leading-snug transition-colors group-hover:text-primary md:text-base">
          {product.name}
        </h3>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted-foreground">
          <RatingStars rating={product.rating} starClassName="size-3" />
          <span className="font-medium text-foreground">{product.rating}</span>
          <span aria-hidden>·</span>
          <span>{formatCompact(product.sold)} terjual</span>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-[10px] text-muted-foreground md:text-xs">
            Mulai dari
          </p>
          <p className="font-heading text-base font-bold text-primary md:text-lg">
            {formatIDR(product.startingPrice)}
          </p>
        </div>

        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-3 w-full rounded-full transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground"
          )}
        >
          Lihat Detail
        </span>
      </article>
    </Link>
  );
}
