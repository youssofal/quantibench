import { loadResults, computeOverallRetention, computeBenchmarkRetention } from "@/lib/data";
import { BENCHMARKS, SITE } from "@/lib/constants";
import { SectionReveal } from "@/components/ui/section-reveal";
import { OverallRetentionBar } from "@/components/charts/overall-retention-bar";
import { BenchmarkGrid } from "@/components/charts/benchmark-grid";
import { SpeedQualityScatter } from "@/components/charts/speed-quality-scatter";

export default function HomePage() {
  const results = loadResults();
  const overallRetention = computeOverallRetention(results);

  const benchmarkData = BENCHMARKS.map((b) => ({
    key: b.key,
    name: b.name,
    description: b.description,
    data: computeBenchmarkRetention(results, b.key),
  }));

  const scatterData = results.flatMap((model) =>
    model.quants.map((q) => ({
      modelName: model.name,
      quant: q.quant,
      retention: q.retention,
      decodeToksPerSec: q.decodeToksPerSec,
      vramGb: q.vramGb,
    }))
  );

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

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero Section */}
      <SectionReveal>
        <section className="py-24 md:py-32 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl" />
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-metallic mb-6 relative">
            QuantiBench
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-6 max-w-2xl mx-auto relative">
            {SITE.tagline}
          </p>
          <p className="text-base text-text-muted max-w-3xl mx-auto leading-relaxed relative">
            {SITE.description}
          </p>
        </section>
      </SectionReveal>

      {/* Overall Quant Retention */}
      <SectionReveal>
        <section className="py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Average Quality Retention by Quantization Level
          </h2>
          <p className="text-text-muted mb-8">
            How much quality do you keep at each quantization level? Averaged across all models and benchmarks.
          </p>
          <div className="glass-card p-8">
            <OverallRetentionBar data={overallRetention} />
          </div>
        </section>
      </SectionReveal>

      {/* Divider */}
      <div className="section-divider" />

      {/* Benchmark Breakdown Grid */}
      <SectionReveal>
        <section className="py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Retention by Benchmark
          </h2>
          <p className="text-text-muted mb-8">
            Quality retention varies by task type. Some benchmarks are more sensitive to quantization than others.
          </p>
          <BenchmarkGrid benchmarks={benchmarkData} />
        </section>
      </SectionReveal>

      {/* Divider */}
      <div className="section-divider" />

      {/* Speed vs Quality Scatter */}
      <SectionReveal>
        <section className="py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
            Speed vs Quality
          </h2>
          <p className="text-text-muted mb-8">
            The tradeoff visualized. Each dot is one model at one quantization level. Dot size reflects VRAM usage.
          </p>
          <div className="glass-card p-8">
            <SpeedQualityScatter data={scatterData} />
          </div>
        </section>
      </SectionReveal>
    </div>
  );
}
