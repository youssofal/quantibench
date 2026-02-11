interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

const BAR_HEIGHTS = [45, 72, 60, 85, 38, 90, 55, 68];

export function ChartSkeleton({ height = 300, className = "" }: ChartSkeletonProps) {
  return (
    <div
      className={`w-full rounded-lg bg-bg-card/30 border border-border/20 animate-pulse ${className}`}
      style={{ height }}
    >
      <div className="flex items-end justify-center gap-3 h-full p-8">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="bg-bg-elevated/40 rounded-t"
            style={{
              width: "8%",
              height: `${h}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
