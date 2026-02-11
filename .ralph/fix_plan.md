# QuantiBench V2 — Build Plan

## Phase 1: Project Scaffold
- [ ] Run `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint` (say yes to defaults)
- [ ] Install dependencies: `npm install motion gsap d3-scale d3-shape d3-selection d3-array d3-axis d3-format d3-interpolate zod`
- [ ] Install dev deps: `npm install -D @types/d3-scale @types/d3-shape @types/d3-selection @types/d3-array @types/d3-axis @types/d3-format @types/d3-interpolate`
- [ ] Verify `npm run build` passes
- [ ] Git commit: "scaffold: Next.js project with dependencies"

## Phase 2: Design System
- [ ] Set up globals.css with all design tokens (backgrounds, text, borders, quant colors as CSS custom properties)
- [ ] Configure Tailwind for dark theme with zinc palette
- [ ] Set up Geist Sans + Geist Mono fonts in root layout
- [ ] Create `src/lib/constants.ts` with quant colors, quant order, benchmark metadata
- [ ] Create glass morphism utility styles
- [ ] Verify `npm run build` passes
- [ ] Git commit: "design: tokens, fonts, and tailwind config"

## Phase 3: Data Layer
- [ ] Create `src/lib/schema.ts` with Zod schemas matching SPEC.md §10 data schema
- [ ] Create `scripts/generate-sample-data.ts` with realistic FP16 baselines from TASK.md
- [ ] Add `"generate-data": "tsx scripts/generate-sample-data.ts"` to package.json
- [ ] Run data generation, verify `data/results.json` is created and valid
- [ ] Create `src/lib/data.ts` — server-side data loading with Zod validation + error fallback
- [ ] Create `src/lib/utils.ts` — formatting helpers (percentages, file sizes, etc.)
- [ ] Verify `npm run build` passes
- [ ] Git commit: "data: sample generation, schema validation, loading utilities"

## Phase 4: Layout & Shared Components
- [ ] Create `src/components/layout/site-header.tsx` — sticky glass morphism nav with logo + links
- [ ] Create `src/components/layout/site-footer.tsx` — minimal footer
- [ ] Create `src/components/ui/section-reveal.tsx` — Motion whileInView fade-up wrapper
- [ ] Create `src/components/ui/count-up.tsx` — animated number counter (GSAP or rAF)
- [ ] Update `src/app/layout.tsx` — root layout with header, footer, fonts, metadata
- [ ] Set up page-level Motion AnimatePresence for route transitions
- [ ] Add favicon and OG image placeholder in /public
- [ ] Verify `npm run build` passes
- [ ] Git commit: "layout: header, footer, shared animation components"

## Phase 5: Homepage
- [ ] Build hero section — logo with metallic gradient, subtitle, description, generous whitespace
- [ ] Build `src/components/charts/overall-retention-bar.tsx` — D3 SVG bar chart, full-width, 8 bars with metallic gradient fills, GSAP scroll-entry animation (staggered bar growth)
- [ ] Build `src/components/charts/benchmark-grid.tsx` — grid of 5 glass-morphism cards, each with mini bar chart, staggered fade-in
- [ ] Build `src/components/charts/speed-quality-scatter.tsx` — D3 scatter plot, dots colored by quant, sized by VRAM, hover tooltips, GSAP scroll-entry pop-in
- [ ] Wire homepage page.tsx with server-side data loading passing props to client chart components
- [ ] Add page metadata (title, description, OG tags)
- [ ] Verify `npm run build` passes
- [ ] Verify all 3 sections render and animate correctly
- [ ] Git commit: "homepage: hero, retention bars, benchmark grid, scatter plot"

## Phase 6: Models Page
- [ ] Build `src/components/charts/model-ranking-bars.tsx` — grouped bar chart for FP16 rankings
- [ ] Build quant-specific ranking charts in 2×2 grid (Q8_0, Q4_K_M, IQ2_XXS, IQ1_S)
- [ ] Build `src/components/charts/sparkline.tsx` — tiny D3 SVG line for model cards
- [ ] Build `src/components/ui/model-card.tsx` — glass morphism card with name, params, sparkline, key stat, hover scale + 3D tilt effect
- [ ] Wire models page.tsx with data loading + model cards grid
- [ ] Add page metadata
- [ ] Verify `npm run build` passes
- [ ] Git commit: "models: rankings, quant grids, model cards with sparklines"

## Phase 7: Model Detail Page
- [ ] Build `src/components/charts/retention-curve.tsx` — D3 line chart with self-drawing animation (GSAP stroke-dashoffset), dots colored by quant
- [ ] Build `src/components/charts/speed-bar.tsx` — D3 bar chart for decode tok/s
- [ ] Build `src/components/ui/data-table.tsx` — full metrics table with monospace numbers, alternating rows, hover highlight
- [ ] Build `src/components/ui/export-buttons.tsx` — JSON/CSV download, styled glass morphism buttons
- [ ] Wire model detail page.tsx with dynamic routing, data loading, breadcrumb
- [ ] Add generateMetadata for dynamic page titles
- [ ] Verify `npm run build` passes
- [ ] Git commit: "model-detail: retention curve, speed chart, data table, exports"

## Phase 8: Animation Polish
- [ ] Verify GSAP ScrollTrigger is registered once (client-side only)
- [ ] Verify all bar charts animate on scroll entry with staggered timing
- [ ] Verify retention curve line draws itself on scroll
- [ ] Verify scatter dots pop in with bounce easing
- [ ] Verify count-up numbers animate on all pages
- [ ] Verify page transitions work (crossfade between routes)
- [ ] Verify card tilt effect works on model cards
- [ ] Verify nav hover states (underline slide-in)
- [ ] Verify button click feedback (press-down scale)
- [ ] Git commit: "polish: all animations verified and smooth"

## Phase 9: Responsiveness & SEO
- [ ] Test at 1440px — verify full desktop layout
- [ ] Test at 1024px — verify tablet layout (2-col grids)
- [ ] Test at 768px — verify narrower tablet
- [ ] Test at 375px — verify mobile (1-col, hamburger nav, horizontal scroll on charts)
- [ ] Fix any responsive issues found
- [ ] Verify OG tags on all pages
- [ ] Verify favicon displays correctly
- [ ] Verify loading skeletons appear before chart data
- [ ] Verify error state works when results.json is missing
- [ ] Final `npm run build` + `npm run lint` — both must pass
- [ ] Git commit: "responsive: tested all breakpoints, SEO meta complete"

## Phase 10: Final Quality Check
- [ ] No TypeScript `any` types
- [ ] No console errors or warnings
- [ ] No hydration errors
- [ ] No layout shift on page load
- [ ] D3 imports are tree-shaken (individual modules only)
- [ ] Motion only used for page/element transitions
- [ ] GSAP only used for chart SVG animations
- [ ] All chart bars have metallic gradient fills (not flat colors)
- [ ] Final git commit: "v1.0: QuantiBench ready for review"
