import { ProductGridSkeleton } from "@/components/products/product-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <div className="container-page pb-20 pt-24 md:pt-28">
      <Skeleton className="h-4 w-56" />

      {/* Banner */}
      <div className="mt-6 rounded-2xl border bg-card p-6 shadow-soft md:p-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Skeleton className="size-20 rounded-2xl md:size-24" />
          <div className="flex-1">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="mt-3 h-8 w-64 md:h-10 md:w-96" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_400px] lg:gap-10">
        <div>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />

          <Skeleton className="mt-8 h-6 w-44" />
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 rounded-xl" />
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-soft md:p-6">
          <Skeleton className="h-5 w-28" />
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-5 h-16 rounded-xl" />
          <Skeleton className="mt-4 h-11 w-full rounded-full" />
        </div>
      </div>

      <Skeleton className="mt-16 h-7 w-48" />
      <div className="mt-6">
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
