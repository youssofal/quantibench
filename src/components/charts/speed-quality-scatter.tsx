"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { scaleLinear } from "d3-scale";
import { QUANT_COLORS, QUANT_ORDER, type QuantLevel } from "@/lib/constants";
import { formatPercent, formatSpeed, formatVram } from "@/lib/utils";

interface ScatterPoint {
  modelName: string;
  quant: string;
  retention: number;
  decodeToksPerSec: number;
  vramGb: number;
}

interface SpeedQualityScatterProps {
  data: ScatterPoint[];
}

export function SpeedQualityScatter({ data }: SpeedQualityScatterProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(450, width * 0.55) });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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
        duration: 1.4,
        ease: "back.out(1.2)",
        scrollTrigger: { trigger: svg, start: "top 90%", once: true },
        onUpdate: () => setAnimationProgress(proxy.progress),
        onComplete: () => { hasAnimated.current = true; clearTimeout(fallback); },
      });
    }
    initGSAP();

    return () => clearTimeout(fallback);
  }, []);

  const margin = { top: 20, right: 30, bottom: 50, left: 60 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  const retentionExtent = [
    Math.min(...data.map((d) => d.retention)) - 2,
    100,
  ];
  const speedExtent = [
    0,
    Math.max(...data.map((d) => d.decodeToksPerSec)) * 1.1,
  ];
  const vramExtent = [
    Math.min(...data.map((d) => d.vramGb)),
    Math.max(...data.map((d) => d.vramGb)),
  ];

  const xScale = scaleLinear().domain(retentionExtent).range([0, innerWidth]);
  const yScale = scaleLinear().domain(speedExtent).range([innerHeight, 0]);
  const radiusScale = scaleLinear().domain(vramExtent).range([5, 18]);

  // Get unique quant levels present in data
  const uniqueQuants = QUANT_ORDER.filter((q) => data.some((d) => d.quant === q));

  const handleMouseEnter = useCallback(
    (i: number, e: React.MouseEvent<SVGCircleElement>) => {
      setHoveredIndex(i);
      const circle = e.target as SVGCircleElement;
      const rect = circle.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        setTooltipPos({
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top - containerRect.top - 8,
        });
      }
    },
    []
  );

  return (
    <div ref={containerRef} className="w-full relative">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
      >
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* X-axis grid */}
          {xScale.ticks(6).map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={0}
                y2={innerHeight}
                stroke="var(--border)"
                strokeOpacity={0.15}
                strokeDasharray="4,4"
              />
              <text
                x={xScale(tick)}
                y={innerHeight + 20}
                textAnchor="middle"
                fill="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-geist-mono)"
              >
                {tick}%
              </text>
            </g>
          ))}

          {/* Y-axis grid */}
          {yScale.ticks(5).map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={0}
                x2={innerWidth}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="var(--border)"
                strokeOpacity={0.15}
                strokeDasharray="4,4"
              />
              <text
                x={-10}
                y={yScale(tick) + 4}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize={11}
                fontFamily="var(--font-geist-mono)"
              >
                {tick.toFixed(0)}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={innerWidth / 2}
            y={innerHeight + 40}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={12}
          >
            QB-Retention (%)
          </text>
          <text
            x={-innerHeight / 2}
            y={-45}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={12}
            transform="rotate(-90)"
          >
            Decode tok/s
          </text>

          {/* Dots */}
          {data.map((d, i) => {
            const color = QUANT_COLORS[d.quant as QuantLevel] ?? "#888";
            const cx = xScale(d.retention);
            const cy = yScale(d.decodeToksPerSec);
            const r = radiusScale(d.vramGb);

            const staggerDelay = i * 0.02;
            const localProgress = Math.max(
              0,
              Math.min(1, (animationProgress - staggerDelay) / Math.max(0.01, 1 - staggerDelay))
            );

            return (
              <circle
                key={`${d.modelName}-${d.quant}`}
                cx={cx}
                cy={cy}
                r={r * localProgress}
                fill={color}
                fillOpacity={hoveredIndex !== null && hoveredIndex !== i ? 0.3 : 0.75}
                stroke={hoveredIndex === i ? color : "transparent"}
                strokeWidth={2}
                className="cursor-pointer transition-opacity duration-150"
                onMouseEnter={(e) => handleMouseEnter(i, e)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </g>
      </svg>

      {/* Color Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
        {uniqueQuants.map((q) => (
          <div key={q} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: QUANT_COLORS[q] }}
            />
            <span className="text-xs font-mono text-text-muted">{q}</span>
          </div>
        ))}
      </div>

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
          <div className="font-semibold">{data[hoveredIndex].modelName}</div>
          <div className="text-text-secondary text-xs mt-1">
            {data[hoveredIndex].quant} &middot; {formatPercent(data[hoveredIndex].retention)} &middot;{" "}
            {formatSpeed(data[hoveredIndex].decodeToksPerSec)} &middot;{" "}
            {formatVram(data[hoveredIndex].vramGb)} VRAM
          </div>
        </div>
      )}
    </div>
  );
}
