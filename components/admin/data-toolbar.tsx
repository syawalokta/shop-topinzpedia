"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";

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

export interface ToolbarFilter {
  param: string;
  placeholder: string;
  options: { value: string; label: string }[];
}

interface DataToolbarProps {
  searchPlaceholder?: string;
  /** Nonaktifkan input pencarian bila list tidak butuh */
  enableSearch?: boolean;
  filters?: ToolbarFilter[];
}

/**
 * Toolbar generik list admin: search realtime (debounced) + filter Select.
 * Seluruh state disimpan di URL; setiap perubahan me-reset param `page`.
 */
export function DataToolbar({
  searchPlaceholder = "Cari…",
  enableSearch = true,
  filters = [],
}: DataToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  const hasActive =
    Boolean(searchParams.get("q")) ||
    filters.some((f) => searchParams.get(f.param));

  function apply(partial: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
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
    apply({ q: value || undefined });
  });

  function reset() {
    setSearch("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {enableSearch ? (
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              applySearch(event.target.value);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 bg-card pl-9"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <Select
            key={filter.param}
            value={searchParams.get(filter.param) ?? "all"}
            onValueChange={(value) =>
              apply({ [filter.param]: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger
              className="h-9 w-full bg-card sm:w-44"
              aria-label={filter.placeholder}
            >
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.placeholder}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {hasActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
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
