"use client";

import { useEffect, useRef, useState } from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { QUANT_COLORS, QUANT_COLORS_DARK, type QuantLevel } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";

interface OverallRetentionBarProps {
  data: { quant: string; retention: number }[];
}

export function OverallRetentionBar({ data }: OverallRetentionBarProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Responsive sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(400, width * 0.5) });
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // GSAP scroll-triggered animation
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || hasAnimated.current) return;

    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const proxy = { progress: 0 };

      gsap.to(proxy, {
        progress: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: svg,
          start: "top 80%",
          once: true,
        },
        onUpdate: () => {
          setAnimationProgress(proxy.progress);
        },
        onComplete: () => {
          hasAnimated.current = true;
        },
      });
    }

    initGSAP();
  }, []);

  const margin = { top: 40, right: 20, bottom: 50, left: 20 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = scaleBand()
    .domain(data.map((d) => d.quant))
    .range([0, innerWidth])
    .padding(0.25);

  const yScale = scaleLinear()
    .domain([0, 100])
    .range([innerHeight, 0]);

  return (
    <div ref={containerRef} className="w-full relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
      >
        <defs>
          {data.map((d) => {
            const color = QUANT_COLORS[d.quant as QuantLevel] ?? "#888";
            const colorDark = QUANT_COLORS_DARK[d.quant as QuantLevel] ?? "#555";
            return (
              <linearGradient
                key={d.quant}
                id={`bar-gradient-${d.quant}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={colorDark} stopOpacity={0.85} />
              </linearGradient>
            );
          })}
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="var(--border)"
              strokeOpacity={0.2}
              strokeDasharray="4,4"
            />
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const barWidth = xScale.bandwidth();
            const barX = xScale(d.quant) ?? 0;
            const fullHeight = innerHeight - yScale(d.retention);

            // Stagger: each bar starts a bit later
            const staggerDelay = i * 0.06;
            const localProgress = Math.max(
              0,
              Math.min(1, (animationProgress - staggerDelay) / (1 - staggerDelay * data.length / (data.length - 1)))
            );
            const staggeredHeight = fullHeight * localProgress;
            const staggeredY = innerHeight - staggeredHeight;

            return (
              <g key={d.quant}>
                <rect
                  x={barX}
                  y={staggeredY}
                  width={barWidth}
                  height={staggeredHeight}
                  fill={`url(#bar-gradient-${d.quant})`}
                  rx={4}
                  className="cursor-pointer transition-opacity duration-150"
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.5 : 1}
                  onMouseEnter={(e) => {
                    setHoveredIndex(i);
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (containerRect) {
                      setTooltipPos({
                        x: rect.left + rect.width / 2 - containerRect.left,
                        y: rect.top - containerRect.top - 8,
                      });
                    }
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* Percentage label above bar */}
                {localProgress > 0.5 && (
                  <text
                    x={barX + barWidth / 2}
                    y={staggeredY - 8}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize={12}
                    fontFamily="var(--font-geist-mono)"
                    opacity={localProgress}
                  >
                    {formatPercent(d.retention)}
                  </text>
                )}
                {/* Quant label below */}
                <text
                  x={barX + barWidth / 2}
                  y={innerHeight + 20}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize={11}
                  fontFamily="var(--font-geist-sans)"
                >
                  {d.quant}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="font-semibold">{data[hoveredIndex].quant}</span>
          <span className="ml-2 font-mono">
            {formatPercent(data[hoveredIndex].retention)}
          </span>
        </div>
      )}
    </div>
  );
}
