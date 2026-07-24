"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";

import { SORT_OPTIONS } from "@/lib/constants";
import type { CategoryDTO } from "@/types";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  categories: CategoryDTO[];
}

/**
 * Search + filter kategori + sort.
 * Semua state disimpan di URL (searchParams) agar bisa dibagikan
 * dan tetap bekerja dengan Server Components.
 */
export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const currentCategory = searchParams.get("category") ?? "all";
  const currentSort = searchParams.get("sort") ?? "popular";
  const hasActiveFilter =
    Boolean(searchParams.get("q")) ||
    currentCategory !== "all" ||
    currentSort !== "popular";

  function applyParams(partial: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(partial)) {
      if (value && value.length > 0) params.set(key, value);
      else params.delete(key);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const applySearch = useDebouncedCallback((value: string) => {
    applyParams({ q: value || undefined });
  });

  function resetFilters() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Pencarian */}
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            applySearch(event.target.value);
          }}
          placeholder="Cari produk… (mis. ChatGPT, Netflix)"
          aria-label="Cari produk"
          className="h-10 rounded-full bg-card pl-10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Filter kategori */}
        <Select
          value={currentCategory}
          onValueChange={(value) =>
            applyParams({ category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger
            className="h-10 w-full bg-card sm:w-44"
            aria-label="Filter kategori"
          >
            <SelectValue placeholder="Semua Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Urutkan */}
        <Select
          value={currentSort}
          onValueChange={(value) =>
            applyParams({ sort: value === "popular" ? undefined : value })
          }
        >
          <SelectTrigger
            className="h-10 w-full bg-card sm:w-44"
            aria-label="Urutkan produk"
          >
            <SelectValue placeholder="Urutkan" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilter ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="shrink-0 text-muted-foreground"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
}
