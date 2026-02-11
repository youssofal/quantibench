import { z } from "zod/v4";

export const BenchmarkScoresSchema = z.object({
  ifeval: z.number().min(0).max(100),
  bbh: z.number().min(0).max(100),
  gpqa: z.number().min(0).max(100),
  musr: z.number().min(0).max(100),
  hle: z.number().min(0).max(100),
});

export const QuantResultSchema = z.object({
  quant: z.string(),
  fileSizeGb: z.number().nonnegative(),
  vramGb: z.number().nonnegative(),
  decodeToksPerSec: z.number().nonnegative(),
  prefillToksPerSec: z.number().nonnegative(),
  scores: BenchmarkScoresSchema,
  retention: z.number().min(0).max(100),
  retentionPerBenchmark: BenchmarkScoresSchema,
});

export const ModelResultSchema = z.object({
  slug: z.string(),
  name: z.string(),
  params: z.string(),
  huggingface: z.string(),
  quants: z.array(QuantResultSchema),
});

export const ResultsSchema = z.array(ModelResultSchema);

export type BenchmarkScores = z.infer<typeof BenchmarkScoresSchema>;
export type QuantResult = z.infer<typeof QuantResultSchema>;
export type ModelResult = z.infer<typeof ModelResultSchema>;
