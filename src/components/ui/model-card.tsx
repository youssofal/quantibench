"use client";

import Link from "next/link";
import { useRef, useCallback } from "react";
import { Sparkline } from "@/components/charts/sparkline";
import { formatPercent } from "@/lib/utils";

interface ModelCardProps {
  slug: string;
  name: string;
  params: string;
  sparklineData: { quant: string; retention: number }[];
  q4Retention: number;
}

export function ModelCard({ slug, name, params, sparklineData, q4Retention }: ModelCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);

  return (
    <Link
      ref={cardRef}
      href={`/models/${slug}`}
      className="glass-card p-6 block hover-glow cursor-pointer transition-shadow duration-200"
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.2s ease-out, border-color 0.2s ease-out" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">{name}</h3>
        <span className="text-xs font-mono text-text-muted bg-bg-elevated px-2 py-1 rounded">
          {params}
        </span>
      </div>

      <div className="mb-4">
        <Sparkline data={sparklineData} />
      </div>

      <div className="text-sm text-text-secondary">
        Q4 Retention:{" "}
        <span className="font-mono font-semibold text-q-q4">
          {formatPercent(q4Retention)}
        </span>
      </div>
    </Link>
  );
}
