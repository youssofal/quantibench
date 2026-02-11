"use client";

import type { QuantResult } from "@/lib/schema";

interface ExportButtonsProps {
  modelName: string;
  quants: QuantResult[];
}

export function ExportButtons({ modelName, quants }: ExportButtonsProps) {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(quants, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelName.toLowerCase().replace(/\s+/g, "-")}-benchmarks.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const headers = [
      "Quant",
      "File Size (GB)",
      "VRAM (GB)",
      "QB-Retention (%)",
      "IFEval",
      "BBH",
      "GPQA",
      "MuSR",
      "HLE",
      "Decode tok/s",
      "Prefill tok/s",
    ];

    const rows = quants.map((q) =>
      [
        q.quant,
        q.fileSizeGb,
        q.vramGb,
        q.retention,
        q.scores.ifeval,
        q.scores.bbh,
        q.scores.gpqa,
        q.scores.musr,
        q.scores.hle,
        q.decodeToksPerSec,
        q.prefillToksPerSec,
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${modelName.toLowerCase().replace(/\s+/g, "-")}-benchmarks.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={downloadJSON}
        className="glass-card px-5 py-2.5 text-sm font-medium text-text-primary hover-glow press-scale flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-70">
          <path d="M8 10L4 6h3V2h2v4h3L8 10z" fill="currentColor" />
          <path d="M2 12v2h12v-2H2z" fill="currentColor" />
        </svg>
        Download JSON
      </button>
      <button
        onClick={downloadCSV}
        className="glass-card px-5 py-2.5 text-sm font-medium text-text-primary hover-glow press-scale flex items-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="opacity-70">
          <path d="M8 10L4 6h3V2h2v4h3L8 10z" fill="currentColor" />
          <path d="M2 12v2h12v-2H2z" fill="currentColor" />
        </svg>
        Download CSV
      </button>
    </div>
  );
}
