"use client";

import { CountUp } from "@/components/ui/count-up";

interface HeroStatsProps {
  stats: { value: number; label: string; suffix: string }[];
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-8 md:gap-12 relative">
      {stats.map((stat) => (
        <div key={stat.label} className="text-center">
          <div className="text-3xl md:text-4xl font-bold text-text-primary">
            <CountUp end={stat.value} decimals={0} suffix={stat.suffix} duration={1200} />
          </div>
          <div className="text-sm text-text-muted mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
