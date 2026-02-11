import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loadResults, loadModelBySlug } from "@/lib/data";
import { SectionReveal } from "@/components/ui/section-reveal";
import { RetentionCurve } from "@/components/charts/retention-curve";
import { SpeedBar } from "@/components/charts/speed-bar";
import { DataTable } from "@/components/ui/data-table";
import { ExportButtons } from "@/components/ui/export-buttons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const results = loadResults();
  return results.map((model) => ({
    slug: model.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = loadModelBySlug(slug);
  if (!model) return { title: "Model Not Found" };

  return {
    title: model.name,
    description: `Quantization benchmark results for ${model.name} (${model.params}). See retention curves, speed data, and full metrics across 8 quant levels.`,
    openGraph: {
      title: `${model.name} | QuantiBench`,
      description: `Benchmarks for ${model.name} across 8 quantization levels.`,
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const model = loadModelBySlug(slug);

  if (!model) {
    notFound();
  }

  const retentionData = model.quants.map((q) => ({
    quant: q.quant,
    retention: q.retention,
  }));

  const speedData = model.quants.map((q) => ({
    quant: q.quant,
    decodeToksPerSec: q.decodeToksPerSec,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Breadcrumb + Header */}
      <SectionReveal>
        <section className="py-16 pt-24">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
            <Link href="/models" className="hover:text-text-secondary transition-colors">
              Models
            </Link>
            <span>/</span>
            <span className="text-text-secondary">{model.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              {model.name}
            </h1>
            <span className="text-sm font-mono text-text-muted bg-bg-elevated px-3 py-1 rounded w-fit">
              {model.params}
            </span>
          </div>

          <a
            href={model.huggingface}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1"
          >
            View on HuggingFace
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70">
              <path d="M3.5 2H10v6.5M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>
      </SectionReveal>

      {/* Retention Curve */}
      <SectionReveal>
        <section className="py-12">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Quality Retention Curve
          </h2>
          <p className="text-text-muted mb-6">
            How much quality is retained at each quantization level.
          </p>
          <RetentionCurve data={retentionData} />
        </section>
      </SectionReveal>

      {/* Speed Chart */}
      <SectionReveal>
        <section className="py-12">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Decode Speed
          </h2>
          <p className="text-text-muted mb-6">
            Tokens per second at each quantization level. Smaller quants are faster.
          </p>
          <SpeedBar data={speedData} />
        </section>
      </SectionReveal>

      {/* Data Table */}
      <SectionReveal>
        <section className="py-12">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Full Benchmark Data
          </h2>
          <p className="text-text-muted mb-6">
            Complete metrics for all quantization levels.
          </p>
          <div className="glass-card p-4 md:p-6">
            <DataTable quants={model.quants} />
          </div>
        </section>
      </SectionReveal>

      {/* Export */}
      <SectionReveal>
        <section className="py-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Export Data
          </h2>
          <ExportButtons modelName={model.name} quants={model.quants} />
        </section>
      </SectionReveal>
    </div>
  );
}
