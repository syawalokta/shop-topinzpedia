import { cn } from "@/lib/utils";

interface MiniBarChartProps {
  data: { label: string; value: number; hint?: string }[];
  className?: string;
}

/**
 * Grafik batang ringan berbasis SVG murni — tanpa library chart.
 * Cocok untuk tren transaksi harian di dashboard admin.
 */
export function MiniBarChart({ data, className }: MiniBarChartProps) {
  if (data.length === 0) return null;

  const max = Math.max(1, ...data.map((d) => d.value));
  const barWidth = 18;
  const gap = 8;
  const height = 120;
  const width = data.length * (barWidth + gap) - gap;

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        role="img"
        aria-label="Grafik transaksi harian"
        className="min-w-[420px]"
      >
        {data.map((item, index) => {
          const barHeight = Math.max(
            2,
            Math.round((item.value / max) * (height - 8))
          );
          const x = index * (barWidth + gap);
          const y = height - barHeight;
          return (
            <g key={item.label}>
              <title>{item.hint ?? `${item.label}: ${item.value}`}</title>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                className={
                  item.value > 0 ? "fill-primary" : "fill-muted-foreground/20"
                }
              />
            </g>
          );
        })}
      </svg>
      <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
