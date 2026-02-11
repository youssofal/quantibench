import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

interface BenchmarkScores {
  ifeval: number;
  bbh: number;
  gpqa: number;
  musr: number;
  hle: number;
}

interface QuantResult {
  quant: string;
  fileSizeGb: number;
  vramGb: number;
  decodeToksPerSec: number;
  prefillToksPerSec: number;
  scores: BenchmarkScores;
  retention: number;
  retentionPerBenchmark: BenchmarkScores;
}

interface ModelResult {
  slug: string;
  name: string;
  params: string;
  huggingface: string;
  quants: QuantResult[];
}

// Seeded pseudo-random for reproducibility
let seed = 42;
function random(): number {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function randomVariance(base: number, range: number): number {
  return base + (random() - 0.5) * 2 * range;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function round(val: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

// Model definitions with FP16 baselines from TASK.md
const models = [
  {
    slug: "llama-3.1-8b",
    name: "Llama 3.1 8B Instruct",
    params: "8B",
    huggingface: "https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct",
    fp16Scores: { ifeval: 72, bbh: 67, gpqa: 31, musr: 40, hle: 5 },
    fp16FileSizeGb: 16.1,
    fp16VramGb: 17.2,
    fp16DecodeToks: 28,
    fp16PrefillToks: 1200,
  },
  {
    slug: "qwen-2.5-7b",
    name: "Qwen 2.5 7B Instruct",
    params: "7B",
    huggingface: "https://huggingface.co/Qwen/Qwen2.5-7B-Instruct",
    fp16Scores: { ifeval: 75, bbh: 65, gpqa: 33, musr: 38, hle: 7 },
    fp16FileSizeGb: 14.2,
    fp16VramGb: 15.3,
    fp16DecodeToks: 32,
    fp16PrefillToks: 1350,
  },
  {
    slug: "mistral-7b-v0.3",
    name: "Mistral 7B v0.3 Instruct",
    params: "7B",
    huggingface:
      "https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3",
    fp16Scores: { ifeval: 60, bbh: 58, gpqa: 28, musr: 35, hle: 3 },
    fp16FileSizeGb: 14.5,
    fp16VramGb: 15.6,
    fp16DecodeToks: 30,
    fp16PrefillToks: 1280,
  },
  {
    slug: "gemma-2-9b",
    name: "Gemma 2 9B Instruct",
    params: "9B",
    huggingface: "https://huggingface.co/google/gemma-2-9b-it",
    fp16Scores: { ifeval: 71, bbh: 72, gpqa: 35, musr: 43, hle: 6 },
    fp16FileSizeGb: 18.5,
    fp16VramGb: 19.8,
    fp16DecodeToks: 25,
    fp16PrefillToks: 1100,
  },
  {
    slug: "phi-4",
    name: "Phi-4",
    params: "14B",
    huggingface: "https://huggingface.co/microsoft/phi-4",
    fp16Scores: { ifeval: 78, bbh: 78, gpqa: 42, musr: 48, hle: 10 },
    fp16FileSizeGb: 28.0,
    fp16VramGb: 29.5,
    fp16DecodeToks: 18,
    fp16PrefillToks: 850,
  },
];

// Retention ranges per quant level (midpoint and half-range for variance)
const quantRetention: Record<string, { mid: number; range: number }> = {
  FP16: { mid: 100, range: 0 },
  Q8_0: { mid: 98.75, range: 0.75 },
  Q6_K: { mid: 97, range: 1 },
  Q5_K_M: { mid: 95.5, range: 1.5 },
  Q4_K_M: { mid: 93, range: 2 },
  Q3_K_M: { mid: 87.5, range: 2.5 },
  IQ2_XXS: { mid: 77.5, range: 4.5 },
  IQ1_S: { mid: 64, range: 6 },
};

// Size multipliers relative to FP16
const sizeMultipliers: Record<string, number> = {
  FP16: 1.0,
  Q8_0: 0.53,
  Q6_K: 0.41,
  Q5_K_M: 0.36,
  Q4_K_M: 0.3,
  Q3_K_M: 0.24,
  IQ2_XXS: 0.17,
  IQ1_S: 0.13,
};

// Speed multipliers relative to FP16 (smaller quants are faster)
const speedMultipliers: Record<string, number> = {
  FP16: 1.0,
  Q8_0: 1.4,
  Q6_K: 1.65,
  Q5_K_M: 1.85,
  Q4_K_M: 2.1,
  Q3_K_M: 2.4,
  IQ2_XXS: 2.8,
  IQ1_S: 3.2,
};

const quantOrder = [
  "FP16",
  "Q8_0",
  "Q6_K",
  "Q5_K_M",
  "Q4_K_M",
  "Q3_K_M",
  "IQ2_XXS",
  "IQ1_S",
];

function generateModelData(model: (typeof models)[number]): ModelResult {
  const quants: QuantResult[] = quantOrder.map((quant) => {
    const retentionConfig = quantRetention[quant];
    const benchmarkKeys = [
      "ifeval",
      "bbh",
      "gpqa",
      "musr",
      "hle",
    ] as const;

    // Generate per-benchmark retention with variance
    const retentionPerBenchmark: BenchmarkScores = {} as BenchmarkScores;
    const scores: BenchmarkScores = {} as BenchmarkScores;

    for (const key of benchmarkKeys) {
      const fp16Score = model.fp16Scores[key];
      const retention =
        quant === "FP16"
          ? 100
          : clamp(
              randomVariance(retentionConfig.mid, retentionConfig.range),
              retentionConfig.mid - retentionConfig.range - 1,
              Math.min(100, retentionConfig.mid + retentionConfig.range + 1)
            );
      retentionPerBenchmark[key] = round(retention, 1);
      scores[key] = round((fp16Score * retention) / 100, 1);
    }

    // Overall retention = average of per-benchmark retentions
    const overallRetention = round(
      benchmarkKeys.reduce(
        (sum, key) => sum + retentionPerBenchmark[key],
        0
      ) / benchmarkKeys.length,
      1
    );

    // File size and VRAM
    const fileSizeGb = round(
      model.fp16FileSizeGb *
        sizeMultipliers[quant] *
        (1 + (random() - 0.5) * 0.04),
      2
    );
    const vramGb = round(
      model.fp16VramGb *
        sizeMultipliers[quant] *
        (1 + (random() - 0.5) * 0.04) *
        1.08,
      2
    );

    // Speed
    const decodeToksPerSec = round(
      model.fp16DecodeToks *
        speedMultipliers[quant] *
        (1 + (random() - 0.5) * 0.1),
      1
    );
    const prefillToksPerSec = round(
      model.fp16PrefillToks *
        speedMultipliers[quant] *
        (1 + (random() - 0.5) * 0.1),
      1
    );

    return {
      quant,
      fileSizeGb,
      vramGb,
      decodeToksPerSec,
      prefillToksPerSec,
      scores,
      retention: overallRetention,
      retentionPerBenchmark,
    };
  });

  return {
    slug: model.slug,
    name: model.name,
    params: model.params,
    huggingface: model.huggingface,
    quants,
  };
}

// Generate all data
const results: ModelResult[] = models.map(generateModelData);

// Write to data/results.json
const outputPath = join(process.cwd(), "data", "results.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`Generated data for ${results.length} models at ${outputPath}`);
console.log(
  "Models:",
  results.map((m) => m.name).join(", ")
);
console.log(
  "Quant levels per model:",
  results[0].quants.map((q) => q.quant).join(", ")
);
