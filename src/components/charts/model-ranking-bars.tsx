"use client";

import { useEffect, useRef, useState } from "react";
import { scaleLinear, scaleBand } from "d3-scale";
import { QUANT_COLORS, QUANT_COLORS_DARK, QUANT_ORDER, type QuantLevel } from "@/lib/constants";

interface ModelRankingData {
  modelName: string;
  quants: { quant: string; retention: number }[];
}

interface ModelRankingBarsProps {
  data: ModelRankingData[];
  title: string;
  description?: string;
}

export function ModelRankingBars({ data, title, description }: ModelRankingBarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height: Math.min(420, Math.max(300, width * 0.45)) });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

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
        scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        onUpdate: () => setAnimationProgress(proxy.progress),
        onComplete: () => { hasAnimated.current = true; },
      });
    }
    initGSAP();
  }, []);

  const margin = { top: 20, right: 20, bottom: 60, left: 20 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  // Sort models by FP16 aggregate (first quant's retention, which is 100)
  const sortedData = [...data].sort((a, b) => {
    const aAvg = a.quants.reduce((s, q) => s + q.retention, 0) / a.quants.length;
    const bAvg = b.quants.reduce((s, q) => s + q.retention, 0) / b.quants.length;
    return bAvg - aAvg;
  });

  const modelNames = sortedData.map((d) => d.modelName);
  const quantLevels = sortedData[0]?.quants.map((q) => q.quant) ?? [];

  const x0 = scaleBand().domain(modelNames).range([0, innerWidth]).padding(0.2);
  const x1 = scaleBand().domain(quantLevels).range([0, x0.bandwidth()]).padding(0.05);
  const yScale = scaleLinear().domain([0, 100]).range([innerHeight, 0]);

  return (
    <div ref={containerRef} className="w-full">
      <h3 className="text-lg font-semibold text-text-primary mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-4">{description}</p>}
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full h-auto"
      >
        <defs>
          {QUANT_ORDER.map((q) => (
            <linearGradient key={q} id={`rank-gradient-${q}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={QUANT_COLORS[q]} stopOpacity={1} />
              <stop offset="100%" stopColor={QUANT_COLORS_DARK[q]} stopOpacity={0.85} />
            </linearGradient>
          ))}
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {[20, 40, 60, 80, 100].map((tick) => (
            <line key={tick} x1={0} x2={innerWidth} y1={yScale(tick)} y2={yScale(tick)} stroke="var(--border)" strokeOpacity={0.15} strokeDasharray="4,4" />
          ))}

          {sortedData.map((model) => {
            const modelX = x0(model.modelName) ?? 0;
            return (
              <g key={model.modelName}>
                {model.quants.map((q, qi) => {
                  const barX = modelX + (x1(q.quant) ?? 0);
                  const barWidth = x1.bandwidth();
                  const fullHeight = innerHeight - yScale(q.retention);
                  const stagger = qi * 0.04;
                  const localProgress = Math.max(0, Math.min(1, (animationProgress - stagger) / Math.max(0.01, 1 - stagger)));
                  const barHeight = fullHeight * localProgress;

                  return (
                    <rect
                      key={q.quant}
                      x={barX}
                      y={innerHeight - barHeight}
                      width={barWidth}
                      height={barHeight}
                      fill={`url(#rank-gradient-${q.quant})`}
                      rx={2}
                    />
                  );
                })}
                {/* Model name label */}
                <text
                  x={modelX + x0.bandwidth() / 2}
                  y={innerHeight + 16}
                  textAnchor="middle"
                  fill="var(--text-secondary)"
                  fontSize={10}
                >
                  {model.modelName.length > 15
                    ? model.modelName.slice(0, 14) + "..."
                    : model.modelName}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

// Single-quant ranking bars for the 2x2 grid
interface QuantRankingBarsProps {
  data: { modelName: string; retention: number }[];
  quant: string;
  title: string;
}

export function QuantRankingBars({ data, quant, title }: QuantRankingBarsProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const width = 360;
  const height = 200;
  const margin = { top: 16, right: 12, bottom: 40, left: 12 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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
        duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        onUpdate: () => setAnimationProgress(proxy.progress),
        onComplete: () => { hasAnimated.current = true; },
      });
    }
    initGSAP();
  }, []);

  const sorted = [...data].sort((a, b) => b.retention - a.retention);
  const color = QUANT_COLORS[quant as QuantLevel] ?? "#888";
  const colorDark = QUANT_COLORS_DARK[quant as QuantLevel] ?? "#555";

  const xScale = scaleBand()
    .domain(sorted.map((d) => d.modelName))
    .range([0, innerWidth])
    .padding(0.3);

  const yScale = scaleLinear().domain([0, 100]).range([innerHeight, 0]);

  return (
    <div className="glass-card p-4 hover-glow">
      <h4 className="text-sm font-semibold text-text-primary mb-1" style={{ color }}>
        {title}
      </h4>
      <svg ref={svgRef} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id={`quant-rank-${quant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={colorDark} stopOpacity={0.85} />
          </linearGradient>
        </defs>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {sorted.map((d, i) => {
            const barX = xScale(d.modelName) ?? 0;
            const barWidth = xScale.bandwidth();
            const fullHeight = innerHeight - yScale(d.retention);
            const stagger = i * 0.08;
            const localProgress = Math.max(0, Math.min(1, (animationProgress - stagger) / Math.max(0.01, 1 - stagger)));
            const barHeight = fullHeight * localProgress;

            return (
              <g key={d.modelName}>
                <rect
                  x={barX}
                  y={innerHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#quant-rank-${quant})`}
                  rx={3}
                />
                {localProgress > 0.5 && (
                  <text
                    x={barX + barWidth / 2}
                    y={innerHeight - barHeight - 4}
                    textAnchor="middle"
                    fill="var(--text-secondary)"
                    fontSize={9}
                    fontFamily="var(--font-geist-mono)"
                    opacity={localProgress}
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
                  {d.modelName.split(" ")[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
