import type { QuantResult } from "@/lib/schema";
import { formatPercent, formatFileSize, formatVram, formatSpeed } from "@/lib/utils";
import { QUANT_COLORS, type QuantLevel } from "@/lib/constants";

interface DataTableProps {
  quants: QuantResult[];
}

export function DataTable({ quants }: DataTableProps) {
  const headers = [
    "Quant",
    "File Size",
    "VRAM",
    "QB-Retention",
    "IFEval",
    "BBH",
    "GPQA",
    "MuSR",
    "HLE",
    "Decode tok/s",
    "Prefill tok/s",
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40">
            {headers.map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quants.map((q, i) => {
            const color = QUANT_COLORS[q.quant as QuantLevel] ?? "#888";
            return (
              <tr
                key={q.quant}
                className={`border-b border-border/20 transition-colors hover:bg-bg-elevated/50 ${
                  i % 2 === 0 ? "bg-bg-primary" : "bg-bg-card/30"
                }`}
              >
                <td className="px-3 py-3 font-semibold whitespace-nowrap" style={{ color }}>
                  {q.quant}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {formatFileSize(q.fileSizeGb)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {formatVram(q.vramGb)}
                </td>
                <td className="px-3 py-3 font-mono font-semibold text-text-primary whitespace-nowrap">
                  {formatPercent(q.retention)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {q.scores.ifeval.toFixed(1)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {q.scores.bbh.toFixed(1)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {q.scores.gpqa.toFixed(1)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {q.scores.musr.toFixed(1)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {q.scores.hle.toFixed(1)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {formatSpeed(q.decodeToksPerSec)}
                </td>
                <td className="px-3 py-3 font-mono text-text-secondary whitespace-nowrap">
                  {formatSpeed(q.prefillToksPerSec)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
