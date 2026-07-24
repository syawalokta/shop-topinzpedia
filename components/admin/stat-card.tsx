import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}

export function StatCard({ icon: Icon, label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-soft md:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground md:text-sm">
          {label}
        </p>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary md:size-9">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-2 break-words font-heading text-lg font-bold tracking-tight md:text-2xl">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground md:text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
