import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-lg border bg-card p-3.5 shadow-soft md:p-5">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="size-11 rounded-xl md:size-12" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-5 w-3/4" />
      <Skeleton className="mt-2 h-3.5 w-1/2" />
      <div className="mt-auto pt-4">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="mt-1.5 h-6 w-24" />
      </div>
      <Skeleton className="mt-3 h-8 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Memuat produk"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductFiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <Skeleton className="h-10 flex-1 rounded-full" />
      <div className="flex gap-3">
        <Skeleton className="h-10 w-full rounded-md md:w-44" />
        <Skeleton className="h-10 w-full rounded-md md:w-44" />
      </div>
    </div>
  );
}
