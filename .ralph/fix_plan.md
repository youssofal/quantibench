# QuantiBench V2 — Build Plan

## Phase 1: Project Scaffold
- [x] Run `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint` (say yes to defaults)
- [x] Install dependencies: `npm install motion gsap d3-scale d3-shape d3-selection d3-array d3-axis d3-format d3-interpolate zod`
- [x] Install dev deps: `npm install -D @types/d3-scale @types/d3-shape @types/d3-selection @types/d3-array @types/d3-axis @types/d3-format @types/d3-interpolate`
- [x] Verify `npm run build` passes
- [x] Git commit: "scaffold: Next.js project with dependencies"

## Phase 2: Design System
- [x] Set up globals.css with all design tokens (backgrounds, text, borders, quant colors as CSS custom properties)
- [x] Configure Tailwind for dark theme with zinc palette
- [x] Set up Geist Sans + Geist Mono fonts in root layout
- [x] Create `src/lib/constants.ts` with quant colors, quant order, benchmark metadata
- [x] Create glass morphism utility styles
- [x] Verify `npm run build` passes
- [x] Git commit: "design: tokens, fonts, and tailwind config"

## Phase 3: Data Layer
- [x] Create `src/lib/schema.ts` with Zod schemas matching SPEC.md §10 data schema
- [x] Create `scripts/generate-sample-data.ts` with realistic FP16 baselines from TASK.md
- [x] Add `"generate-data": "tsx scripts/generate-sample-data.ts"` to package.json
- [x] Run data generation, verify `data/results.json` is created and valid
- [x] Create `src/lib/data.ts` — server-side data loading with Zod validation + error fallback
- [x] Create `src/lib/utils.ts` — formatting helpers (percentages, file sizes, etc.)
- [x] Verify `npm run build` passes
- [x] Git commit: "data: sample generation, schema validation, loading utilities"

## Phase 4: Layout & Shared Components
- [x] Create `src/components/layout/site-header.tsx` — sticky glass morphism nav with logo + links
- [x] Create `src/components/layout/site-footer.tsx` — minimal footer
- [x] Create `src/components/ui/section-reveal.tsx` — Motion whileInView fade-up wrapper
- [x] Create `src/components/ui/count-up.tsx` — animated number counter (GSAP or rAF)
- [x] Update `src/app/layout.tsx` — root layout with header, footer, fonts, metadata
- [x] Set up page-level Motion AnimatePresence for route transitions
- [x] Add favicon and OG image placeholder in /public
- [x] Verify `npm run build` passes
- [x] Git commit: "layout: header, footer, shared animation components"

## Phase 5: Homepage
- [x] Build hero section — logo with metallic gradient, subtitle, description, generous whitespace
- [x] Build `src/components/charts/overall-retention-bar.tsx` — D3 SVG bar chart, full-width, 8 bars with metallic gradient fills, GSAP scroll-entry animation (staggered bar growth)
- [x] Build `src/components/charts/benchmark-grid.tsx` — grid of 5 glass-morphism cards, each with mini bar chart, staggered fade-in
- [x] Build `src/components/charts/speed-quality-scatter.tsx` — D3 scatter plot, dots colored by quant, sized by VRAM, hover tooltips, GSAP scroll-entry pop-in
- [x] Wire homepage page.tsx with server-side data loading passing props to client chart components
- [x] Add page metadata (title, description, OG tags)
- [x] Verify `npm run build` passes
- [x] Verify all 3 sections render and animate correctly
- [x] Git commit: "homepage: hero, retention bars, benchmark grid, scatter plot"

## Phase 6: Models Page
- [x] Build `src/components/charts/model-ranking-bars.tsx` — grouped bar chart for FP16 rankings
- [x] Build quant-specific ranking charts in 2×2 grid (Q8_0, Q4_K_M, IQ2_XXS, IQ1_S)
- [x] Build `src/components/charts/sparkline.tsx` — tiny D3 SVG line for model cards
- [x] Build `src/components/ui/model-card.tsx` — glass morphism card with name, params, sparkline, key stat, hover scale + 3D tilt effect
- [x] Wire models page.tsx with data loading + model cards grid
- [x] Add page metadata
- [x] Verify `npm run build` passes
- [x] Git commit: "models: rankings, quant grids, model cards with sparklines"

## Phase 7: Model Detail Page
- [x] Build `src/components/charts/retention-curve.tsx` — D3 line chart with self-drawing animation (GSAP stroke-dashoffset), dots colored by quant
- [x] Build `src/components/charts/speed-bar.tsx` — D3 bar chart for decode tok/s
- [x] Build `src/components/ui/data-table.tsx` — full metrics table with monospace numbers, alternating rows, hover highlight
- [x] Build `src/components/ui/export-buttons.tsx` — JSON/CSV download, styled glass morphism buttons
- [x] Wire model detail page.tsx with dynamic routing, data loading, breadcrumb
- [x] Add generateMetadata for dynamic page titles
- [x] Verify `npm run build` passes
- [x] Git commit: "model-detail: retention curve, speed chart, data table, exports"

## Phase 8: Animation Polish
- [x] Verify GSAP ScrollTrigger is registered once (client-side only)
- [x] Verify all bar charts animate on scroll entry with staggered timing
- [x] Verify retention curve line draws itself on scroll
- [x] Verify scatter dots pop in with bounce easing
- [x] Verify count-up numbers animate on all pages
- [x] Verify page transitions work (crossfade between routes)
- [x] Verify card tilt effect works on model cards
- [x] Verify nav hover states (underline slide-in)
- [x] Verify button click feedback (press-down scale)
- [x] Git commit: "polish: all animations verified and smooth"

## Phase 9: Responsiveness & SEO
- [x] Test at 1440px — verify full desktop layout
- [x] Test at 1024px — verify tablet layout (2-col grids)
- [x] Test at 768px — verify narrower tablet
- [x] Test at 375px — verify mobile (1-col, hamburger nav, horizontal scroll on charts)
- [x] Fix any responsive issues found
- [x] Verify OG tags on all pages
- [x] Verify favicon displays correctly
- [x] Verify loading skeletons appear before chart data
- [x] Verify error state works when results.json is missing
- [x] Final `npm run build` + `npm run lint` — both must pass
- [x] Git commit: "responsive: tested all breakpoints, SEO meta complete"

## Phase 10: Final Quality Check
- [x] No TypeScript `any` types
- [x] No console errors or warnings
- [x] No hydration errors
- [x] No layout shift on page load
- [x] D3 imports are tree-shaken (individual modules only)
- [x] Motion only used for page/element transitions
- [x] GSAP only used for chart SVG animations
- [x] All chart bars have metallic gradient fills (not flat colors)
- [x] Final git commit: "v1.0: QuantiBench ready for review"
