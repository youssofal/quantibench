import { readFileSync } from "fs";
import { join } from "path";
import { ResultsSchema, type ModelResult } from "./schema";

let cachedResults: ModelResult[] | null = null;

/**
 * Load and validate benchmark results from data/results.json.
 * Returns an empty array if the file is missing or invalid.
 * Uses server-side caching within the same process.
 */
export function loadResults(): ModelResult[] {
  if (cachedResults) return cachedResults;

  try {
    const filePath = join(process.cwd(), "data", "results.json");
    const raw = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    const validated = ResultsSchema.parse(parsed);
    cachedResults = validated;
    return validated;
  } catch {
    console.warn(
      "Failed to load data/results.json. Run `npm run generate-data` to create it."
    );
    return [];
  }
}

/**
 * Load a single model by slug. Returns null if not found.
 */
export function loadModelBySlug(slug: string): ModelResult | null {
  const results = loadResults();
  return results.find((m) => m.slug === slug) ?? null;
}

/**
 * Compute average retention per quant level across all models.
 * Returns an array of { quant, retention } ordered by quant order.
 */
export function computeOverallRetention(
  results: ModelResult[]
): { quant: string; retention: number }[] {
  if (results.length === 0) return [];

  const quantLevels = results[0].quants.map((q) => q.quant);

  return quantLevels.map((quant) => {
    const retentions = results
      .map((m) => m.quants.find((q) => q.quant === quant)?.retention)
      .filter((r): r is number => r !== undefined);

    const avg =
      retentions.length > 0
        ? retentions.reduce((a, b) => a + b, 0) / retentions.length
        : 0;

    return {
      quant,
      retention: Math.round(avg * 10) / 10,
    };
  });
}

/**
 * Compute average retention per quant level for a specific benchmark.
 */
export function computeBenchmarkRetention(
  results: ModelResult[],
  benchmark: "ifeval" | "bbh" | "gpqa" | "musr" | "hle"
): { quant: string; retention: number }[] {
  if (results.length === 0) return [];

  const quantLevels = results[0].quants.map((q) => q.quant);

  return quantLevels.map((quant) => {
    const retentions = results
      .map(
        (m) =>
          m.quants.find((q) => q.quant === quant)?.retentionPerBenchmark[
            benchmark
          ]
      )
      .filter((r): r is number => r !== undefined);

    const avg =
      retentions.length > 0
        ? retentions.reduce((a, b) => a + b, 0) / retentions.length
        : 0;

    return {
      quant,
      retention: Math.round(avg * 10) / 10,
    };
  });
}
