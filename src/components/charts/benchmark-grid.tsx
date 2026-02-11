"use client";

import { useEffect, useRef, useState } from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { QUANT_COLORS, QUANT_COLORS_DARK, QUANT_COLORS_LIGHT, type QuantLevel } from "@/lib/constants";
import { SectionReveal } from "@/components/ui/section-reveal";

interface BenchmarkCardData {
  key: string;
  name: string;
  description: string;
  data: { quant: string; retention: number }[];
}

interface BenchmarkGridProps {
  benchmarks: BenchmarkCardData[];
}

function MiniBarChart({ data, benchmarkKey }: { data: { quant: string; retention: number }[]; benchmarkKey: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const width = 320;
  const height = 160;
  const margin = { top: 20, right: 10, bottom: 30, left: 10 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || hasAnimated.current) return;

    const fallback = setTimeout(() => {
      if (!hasAnimated.current) {
        setAnimationProgress(1);
        hasAnimated.current = true;
      }
    }, 2000);

    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: svg, start: "top 90%", once: true },
        onUpdate: () => setAnimationProgress(proxy.progress),
        onComplete: () => { hasAnimated.current = true; clearTimeout(fallback); },
      });
    }
    initGSAP();

    return () => clearTimeout(fallback);
  }, []);

  const xScale = scaleBand()
    .domain(data.map((d) => d.quant))
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = scaleLinear().domain([0, 100]).range([innerHeight, 0]);

  return (
    <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        {data.map((d) => {
          const color = QUANT_COLORS[d.quant as QuantLevel] ?? "#888";
          const colorDark = QUANT_COLORS_DARK[d.quant as QuantLevel] ?? "#555";
          const colorLight = QUANT_COLORS_LIGHT[d.quant as QuantLevel] ?? color;
          return (
            <linearGradient key={d.quant} id={`mini-gradient-${benchmarkKey}-${d.quant}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorLight} stopOpacity={1} />
              <stop offset="40%" stopColor={color} stopOpacity={1} />
              <stop offset="100%" stopColor={colorDark} stopOpacity={0.9} />
            </linearGradient>
          );
        })}
      </defs>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {data.map((d, i) => {
          const barWidth = xScale.bandwidth();
          const barX = xScale(d.quant) ?? 0;
          const fullHeight = innerHeight - yScale(d.retention);
          const staggerDelay = i * 0.05;
          const localProgress = Math.max(0, Math.min(1, (animationProgress - staggerDelay) / Math.max(0.01, 1 - staggerDelay)));
          const barHeight = fullHeight * localProgress;
          const barY = innerHeight - barHeight;
          const isHovered = hoveredIndex === i;

          return (
            <g key={d.quant}>
              <rect
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={`url(#mini-gradient-${benchmarkKey}-${d.quant})`}
                rx={4}
                className="cursor-pointer transition-opacity duration-150"
                opacity={hoveredIndex !== null && !isHovered ? 0.5 : 1}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {isHovered && localProgress > 0.3 && (
                <text
                  x={barX + barWidth / 2}
                  y={barY - 4}
                  textAnchor="middle"
                  fill="var(--text-primary)"
                  fontSize={9}
                  fontFamily="var(--font-geist-mono)"
                  fontWeight={600}
                >
                  {d.retention.toFixed(1)}%
                </text>
              )}
              <text
                x={barX + barWidth / 2}
                y={innerHeight + 14}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={8}
              >
                {d.quant}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function BenchmarkGrid({ benchmarks }: BenchmarkGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {benchmarks.map((benchmark, i) => (
        <SectionReveal key={benchmark.key} delay={i * 0.08}>
          <div className="glass-card p-6 hover-glow cursor-pointer transition-transform duration-200 hover:scale-[1.02]">
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              {benchmark.name}
            </h3>
            <p className="text-sm text-text-muted mb-4">{benchmark.description}</p>
            <MiniBarChart data={benchmark.data} benchmarkKey={benchmark.key} />
          </div>
        </SectionReveal>
      ))}
    </div>
  );
}
