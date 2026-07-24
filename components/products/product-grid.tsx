import type { ProductDTO } from "@/types";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/products/product-card";
import { Stagger, StaggerItem } from "@/components/shared/motion";

interface ProductGridProps {
  products: ProductDTO[];
  className?: string;
}

/** Grid responsif: 2 kolom (mobile & tablet) -> 4 kolom (desktop). */
export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <Stagger
      className={cn(
        "grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <StaggerItem key={product.id} className="h-full">
          <ProductCard product={product} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}
