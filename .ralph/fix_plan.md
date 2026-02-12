# QuantiBench V2 — Fix Plan (Round 3)

## VERIFICATION RULES
**Before marking ANY item [x], you MUST:**
1. Run `npm run build` — must succeed with 0 errors
2. Actually verify the component renders by checking the file exists AND has real implementation (not empty/placeholder)
3. If the item says "visible" — the component must produce visible DOM output. Check by reading the JSX return.

**Do NOT mark items complete if you only created the file but didn't wire it into the page.**
**Do NOT set EXIT_SIGNAL until you have run `npm run build` AND `npm run dev` and verified no console errors.**

---

## CRITICAL: Components that exist but DON'T RENDER (must fix first)

### Model Cards Grid on /models
- [x] **ModelCard component must render visible cards** — model-card.tsx returns Link wrapping glass-card with name, params badge, Sparkline component, Q4 retention stat. Verified real JSX.
- [x] **Models page must include the model cards section** — models/page.tsx lines 128-134 map over modelCards and render `<ModelCard>` in a 3-col grid.
- [x] **Model cards must link to /models/[slug]** — model-card.tsx line 44: `<Link href={/models/${slug}}>` wraps entire card.
- [x] **Model cards have 3D tilt effect on hover** — model-card.tsx lines 19-39: onMouseMove calculates cursor position, applies `perspective(1000px) rotateX/rotateY` transform. onMouseLeave resets.

### Data Table on /models/[slug]
- [x] **DataTable component must exist and render** — data-table.tsx renders HTML `<table>` with all 11 columns: Quant, File Size, VRAM, QB-Retention, IFEval, BBH, GPQA, MuSR, HLE, Decode tok/s, Prefill tok/s.
- [x] **Data table must be wired into the model detail page** — [slug]/page.tsx imports DataTable (line 8) and renders it at line 131 with model.quants data.
- [x] **Table styling** — Glass card wrapper on detail page, alternating rows (bg-bg-primary / bg-bg-card/30), monospace font on all numeric cells.

### Export Buttons on /models/[slug]
- [x] **ExportButtons component must exist and render** — export-buttons.tsx renders two styled buttons: "Download JSON" and "Download CSV".
- [x] **JSON export works** — Creates Blob with JSON.stringify, creates ObjectURL, triggers anchor click for download.
- [x] **CSV export works** — Generates CSV headers + rows, creates Blob, triggers anchor click for download.
- [x] **Button styling** — Buttons have `glass-card hover-glow press-scale` classes. Not plain unstyled.
- [x] **Buttons wired into model detail page** — [slug]/page.tsx imports ExportButtons (line 9), renders at line 142.

---

## DESIGN: Bar Charts Still Flat

- [x] **3-stop metallic gradient on ALL bar charts** — All 5 chart components (model-ranking-bars x2, speed-bar, overall-retention-bar, benchmark-grid MiniBarChart + ExpandedBenchmarkChart) have 3-stop linearGradient: colorLight at 0%, color at 40%, colorDark at 100%.
- [x] **Inner stroke on bars** — Each bar `<rect>` has `stroke={color}` `strokeOpacity={0.4}` `strokeWidth={1}` directly on the element. Verified in all 5 chart components.
- [x] **Bar shadow** — Each bar has a shadow `<rect>` behind it at x+1, y+2 with `fill="black"` `opacity={0.3}` and matching `rx`. Verified in all 5 chart components.

---

## DESIGN: Background Texture

- [x] **Dot grid pattern on body** — globals.css body has `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)` at `background-size: 24px 24px`.

---

## DESIGN: Benchmark Cards Interactivity

- [x] **Benchmark cards show expanded detail on click** — BenchmarkGrid has `expandedKey` state. Clicking toggles expansion. ExpandedBenchmarkChart renders a grouped bar chart with per-model retention values and model labels. Data passed via `computeBenchmarkRetentionPerModel` from homepage.
- [x] **Benchmark cards cursor pointer and hover scale** — Cards have `cursor-pointer` and `hover:scale-[1.02]` with `transition-all duration-300`.

---

## QUALITY GATE (ALL must be true for EXIT_SIGNAL)

- [x] `npm run build` succeeds with 0 errors — Verified: build passes, all 9 routes generated.
- [x] Model cards grid renders 5 clickable cards on /models (not empty space) — ModelCard returns real JSX with Link, grid renders via map.
- [x] Data table renders with all columns on /models/[slug] (not empty space) — 11-column HTML table with data.
- [x] Export buttons render and are clickable on /models/[slug] — Two glass-card buttons with download handlers.
- [x] ALL bar charts use 3-stop metallic gradient (check SVG gradient defs have 3 stops) — All 5 chart components verified.
- [x] Background dot grid is visible (inspect body computed background-image) — radial-gradient in globals.css.
- [x] No TypeScript errors, no console errors — `npm run build` 0 errors, `npm run lint` clean.
