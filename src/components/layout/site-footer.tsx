export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 mt-24">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-text-muted">
          QuantiBench — Open-source LLM quantization benchmarks
        </p>
        <p className="text-sm text-text-muted">
          Data is open-source. Built for the local LLM community.
        </p>
      </div>
    </footer>
  );
}
