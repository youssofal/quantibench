export function SiteFooter() {
  return (
    <footer className="mt-24 relative">
      {/* Top border gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      <div className="bg-bg-section-alt/50">
        <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-text-secondary">
              QuantiBench
            </p>
            <p className="text-xs text-text-muted mt-1">
              Open-source LLM quantization benchmarks
            </p>
          </div>
          <p className="text-xs text-text-muted">
            Data is open-source. Built for the local LLM community.
          </p>
        </div>
      </div>
    </footer>
  );
}
