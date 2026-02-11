/** Quantization levels in order from highest fidelity to most aggressive */
export const QUANT_ORDER = [
  "FP16",
  "Q8_0",
  "Q6_K",
  "Q5_K_M",
  "Q4_K_M",
  "Q3_K_M",
  "IQ2_XXS",
  "IQ1_S",
] as const;

export type QuantLevel = (typeof QUANT_ORDER)[number];

/** Signature color for each quantization level */
export const QUANT_COLORS: Record<QuantLevel, string> = {
  FP16: "#C8C8C8",
  Q8_0: "#60A5FA",
  Q6_K: "#2DD4BF",
  Q5_K_M: "#A3E635",
  Q4_K_M: "#FBBF24",
  Q3_K_M: "#FB923C",
  IQ2_XXS: "#F87171",
  IQ1_S: "#EF4444",
};

/** Darker shade for metallic gradient effect on chart bars */
export const QUANT_COLORS_DARK: Record<QuantLevel, string> = {
  FP16: "#8A8A8A",
  Q8_0: "#3B82F6",
  Q6_K: "#14B8A6",
  Q5_K_M: "#84CC16",
  Q4_K_M: "#D97706",
  Q3_K_M: "#EA580C",
  IQ2_XXS: "#DC2626",
  IQ1_S: "#B91C1C",
};

/** Display labels for quant levels */
export const QUANT_LABELS: Record<QuantLevel, string> = {
  FP16: "FP16",
  Q8_0: "Q8_0",
  Q6_K: "Q6_K",
  Q5_K_M: "Q5_K_M",
  Q4_K_M: "Q4_K_M",
  Q3_K_M: "Q3_K_M",
  IQ2_XXS: "IQ2_XXS",
  IQ1_S: "IQ1_S",
};

/** Benchmark metadata */
export const BENCHMARKS = [
  {
    key: "ifeval" as const,
    name: "IFEval",
    description: "Instruction following",
    questions: 500,
  },
  {
    key: "bbh" as const,
    name: "BBH",
    description: "Complex reasoning",
    questions: 6500,
  },
  {
    key: "gpqa" as const,
    name: "GPQA Diamond",
    description: "Graduate-level science",
    questions: 198,
  },
  {
    key: "musr" as const,
    name: "MuSR",
    description: "Multistep reasoning",
    questions: 750,
  },
  {
    key: "hle" as const,
    name: "HLE",
    description: "Expert-level ceiling",
    questions: 2500,
  },
] as const;

export type BenchmarkKey = (typeof BENCHMARKS)[number]["key"];

/** Site metadata */
export const SITE = {
  name: "QuantiBench",
  tagline: "Does quantization harm LLM performance? We measured it.",
  description:
    "We benchmarked 5 popular open-source LLMs at 8 quantization levels across 5 rigorous evaluation suites, measuring exactly how much quality you keep — and what you trade for speed and size.",
  url: "https://quantibench.ai",
} as const;
