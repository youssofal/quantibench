import type { Metadata } from "next";
import { loadResults } from "@/lib/data";
import { SectionReveal } from "@/components/ui/section-reveal";
import { ModelRankingBars, QuantRankingBars } from "@/components/charts/model-ranking-bars";
import { ModelCard } from "@/components/ui/model-card";

export const metadata: Metadata = {
  title: "Models",
  description:
    "Compare LLM performance across quantization levels. See which models retain the most quality at every quant.",
  openGraph: {
    title: "Models | QuantiBench",
    description:
      "Compare LLM performance across quantization levels.",
  },
};

export default function ModelsPage() {
  const results = loadResults();

  if (results.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            No benchmark data available
          </h1>
          <p className="text-text-muted">
            Run <code className="font-mono text-text-secondary">npm run generate-data</code> to create sample data.
          </p>
        </div>
      </div>
    );
  }

  // Overall model performance data (grouped bars)
  const rankingData = results.map((model) => ({
    modelName: model.name,
    quants: model.quants.map((q) => ({
      quant: q.quant,
      retention: q.retention,
    })),
  }));

  // Quant-specific rankings
  const quantSpecific = (quant: string) =>
    results
      .map((model) => {
        const q = model.quants.find((qr) => qr.quant === quant);
        return {
          modelName: model.name,
          retention: q?.retention ?? 0,
        };
      })
      .filter((d) => d.retention > 0);

  // Model cards data
  const modelCards = results.map((model) => {
    const q4 = model.quants.find((q) => q.quant === "Q4_K_M");
    return {
      slug: model.slug,
      name: model.name,
      params: model.params,
      sparklineData: model.quants.map((q) => ({
        quant: q.quant,
        retention: q.retention,
      })),
      q4Retention: q4?.retention ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* FP16 Rankings */}
      <SectionReveal>
        <section className="py-16 pt-24">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
            Model Performance
          </h1>
          <p className="text-text-muted mb-8">
            Models ranked by overall benchmark performance across all quantization levels.
          </p>
          <ModelRankingBars
            data={rankingData}
            title="Model Performance at FP16"
            description="All models with all quant levels shown as grouped bars"
          />
        </section>
      </SectionReveal>

      {/* Quant-Specific 2x2 Grid */}
      <SectionReveal>
        <section className="py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Quant-Specific Rankings
          </h2>
          <p className="text-text-muted mb-8">
            Which models hold up best at each quantization level? Rankings can differ significantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuantRankingBars
              data={quantSpecific("Q8_0")}
              quant="Q8_0"
              title="Q8_0 Retention"
            />
            <QuantRankingBars
              data={quantSpecific("Q4_K_M")}
              quant="Q4_K_M"
              title="Q4_K_M Retention"
            />
            <QuantRankingBars
              data={quantSpecific("IQ2_XXS")}
              quant="IQ2_XXS"
              title="IQ2_XXS Retention"
            />
            <QuantRankingBars
              data={quantSpecific("IQ1_S")}
              quant="IQ1_S"
              title="IQ1_S Retention"
            />
          </div>
        </section>
      </SectionReveal>

      {/* Model Cards Grid */}
      <SectionReveal>
        <section className="py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Explore Models
          </h2>
          <p className="text-text-muted mb-8">
            Click any model to see full benchmarks, retention curves, and speed data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelCards.map((card, i) => (
              <SectionReveal key={card.slug} delay={i * 0.06}>
                <ModelCard {...card} />
              </SectionReveal>
            ))}
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
