"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { scaleLinear, scalePoint } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { QUANT_COLORS, QUANT_ORDER, type QuantLevel } from "@/lib/constants";
import { formatPercent } from "@/lib/utils";

interface RetentionCurveProps {
  data: { quant: string; retention: number }[];
}

export function RetentionCurve({ data }: RetentionCurveProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [dashOffset, setDashOffset] = useState(1);
  const [dotScale, setDotScale] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const orderedData = QUANT_ORDER
    .map((q) => data.find((d) => d.quant === q))
    .filter((d): d is { quant: string; retention: number } => d !== undefined);

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

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || hasAnimated.current) return;

    const fallback = setTimeout(() => {
      if (!hasAnimated.current) {
        setDashOffset(0);
        setDotScale(1);
        hasAnimated.current = true;
      }
    }, 2000);

    async function initGSAP() {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: svg, start: "top 90%", once: true },
        onComplete: () => { hasAnimated.current = true; clearTimeout(fallback); },
      });

      const lineProxy = { offset: 1 };
      tl.to(lineProxy, {
        offset: 0,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => setDashOffset(lineProxy.offset),
      });

      const dotProxy = { scale: 0 };
      tl.to(dotProxy, {
        scale: 1,
        duration: 0.5,
        ease: "back.out(2)",
        onUpdate: () => setDotScale(dotProxy.scale),
      }, "-=0.5");
    }

    initGSAP();

    return () => clearTimeout(fallback);
  }, []);

  const margin = { top: 30, right: 30, bottom: 50, left: 55 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  const xScale = scalePoint()
    .domain(orderedData.map((d) => d.quant))
    .range([0, innerWidth]);

  const minRetention = Math.min(...orderedData.map((d) => d.retention));
  const yScale = scaleLinear()
    .domain([Math.max(0, minRetention - 10), 100])
    .range([innerHeight, 0]);

  const lineGenerator = d3Line<{ quant: string; retention: number }>()
    .x((d) => xScale(d.quant) ?? 0)
    .y((d) => yScale(d.retention));

  const pathD = lineGenerator(orderedData) ?? "";

  const handleDotEnter = useCallback(
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
          {/* Y-axis grid */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick}>
              <line
                x1={0} x2={innerWidth}
                y1={yScale(tick)} y2={yScale(tick)}
                stroke="var(--border)" strokeOpacity={0.2} strokeDasharray="4,4"
              />
              <text x={-10} y={yScale(tick) + 4} textAnchor="end" fill="var(--text-muted)" fontSize={11} fontFamily="var(--font-geist-mono)">
                {tick}%
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {orderedData.map((d) => (
            <text
              key={d.quant}
              x={xScale(d.quant) ?? 0}
              y={innerHeight + 24}
              textAnchor="middle"
              fill="var(--text-secondary)"
              fontSize={11}
            >
              {d.quant}
            </text>
          ))}

          {/* Line path — draws itself via stroke-dashoffset */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--text-secondary)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={dashOffset}
          />

          {/* Data dots */}
          {orderedData.map((d, i) => {
            const cx = xScale(d.quant) ?? 0;
            const cy = yScale(d.retention);
            const color = QUANT_COLORS[d.quant as QuantLevel] ?? "#888";

            return (
              <circle
                key={d.quant}
                cx={cx}
                cy={cy}
                r={6 * dotScale}
                fill={color}
                stroke="var(--bg-primary)"
                strokeWidth={2}
                className="cursor-pointer"
                onMouseEnter={(e) => handleDotEnter(i, e)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}

          {/* Y-axis label */}
          <text
            x={-innerHeight / 2}
            y={-40}
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize={12}
            transform="rotate(-90)"
          >
            QB-Retention (%)
          </text>
        </g>
      </svg>

      {hoveredIndex !== null && (
        <div
          className="chart-tooltip"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="font-semibold">{orderedData[hoveredIndex].quant}</span>
          <span className="ml-2 font-mono">
            {formatPercent(orderedData[hoveredIndex].retention)}
          </span>
        </div>
      )}
    </div>
  );
}
