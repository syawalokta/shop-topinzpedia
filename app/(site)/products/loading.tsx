import {
  ProductFiltersSkeleton,
  ProductGridSkeleton,
} from "@/components/products/product-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <div className="container-page pb-20 pt-24 md:pt-28">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="mt-3 h-9 w-64 md:h-10 md:w-80" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />

      <div className="mt-8">
        <ProductFiltersSkeleton />
      </div>

      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
