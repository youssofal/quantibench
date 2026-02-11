"use client";

import { scaleLinear, scalePoint } from "d3-scale";
import { line as d3Line } from "d3-shape";
import { QUANT_ORDER } from "@/lib/constants";

interface SparklineProps {
  data: { quant: string; retention: number }[];
  width?: number;
  height?: number;
}

export function Sparkline({ data, width = 120, height = 40 }: SparklineProps) {
  const padding = 4;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const orderedData = QUANT_ORDER
    .map((q) => data.find((d) => d.quant === q))
    .filter((d): d is { quant: string; retention: number } => d !== undefined);

  const xScale = scalePoint()
    .domain(orderedData.map((d) => d.quant))
    .range([0, innerWidth]);

  const yScale = scaleLinear()
    .domain([
      Math.min(...orderedData.map((d) => d.retention)) - 5,
      100,
    ])
    .range([innerHeight, 0]);

  const lineGenerator = d3Line<{ quant: string; retention: number }>()
    .x((d) => xScale(d.quant) ?? 0)
    .y((d) => yScale(d.retention));

  const pathD = lineGenerator(orderedData) ?? "";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <g transform={`translate(${padding},${padding})`}>
        <path
          d={pathD}
          fill="none"
          stroke="var(--text-secondary)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Start dot */}
        {orderedData.length > 0 && (
          <circle
            cx={xScale(orderedData[0].quant) ?? 0}
            cy={yScale(orderedData[0].retention)}
            r={2}
            fill="var(--q-fp16)"
          />
        )}
        {/* End dot */}
        {orderedData.length > 1 && (
          <circle
            cx={xScale(orderedData[orderedData.length - 1].quant) ?? 0}
            cy={yScale(orderedData[orderedData.length - 1].retention)}
            r={2}
            fill="var(--q-iq1)"
          />
        )}
      </g>
    </svg>
  );
}
