import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  className?: string;
  starClassName?: string;
}

/** Deretan 5 bintang dengan pengisian proporsional sesuai nilai rating. */
export function RatingStars({
  rating,
  className,
  starClassName,
}: RatingStarsProps) {
  const percentage = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <span
      className={cn("relative inline-flex shrink-0", className)}
      role="img"
      aria-label={`Rating ${rating} dari 5`}
    >
      <span className="flex gap-0.5 text-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            aria-hidden
            className={cn("size-3.5 fill-current", starClassName)}
          />
        ))}
      </span>
      <span
        className="absolute inset-0 flex gap-0.5 overflow-hidden text-amber-400"
        style={{ width: `${percentage}%` }}
        aria-hidden
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn("size-3.5 shrink-0 fill-current", starClassName)}
          />
        ))}
      </span>
    </span>
  );
}
