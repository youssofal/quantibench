# QuantiBench V2 — Design Fix Plan

## Context
V1 build is functionally complete (3 pages, data layer, charts render) but the design is flat, generic, and broken in multiple places. This document lists every issue found by visual inspection of all 3 pages against SPEC.md. Fix ALL items in order.

---

## CRITICAL BUGS (Things that are broken/missing)

### Models Page (/models)
- [ ] **Quant-specific ranking bars are INVISIBLE** — The 4 cards (Q8_0, Q4_K_M, IQ2_XXS, IQ1_S) show titles and x-axis labels but the actual bars don't render. Only empty glass cards with model names at the bottom. Fix the QuantRankingBars component — the bars must be visible with their correct quant colors.
- [ ] **Model cards grid is MISSING** — The bottom section of /models should show a grid of clickable model cards (one per model) with sparklines and Q4 retention stats. It's not rendering at all — just empty space before the footer. Check if the ModelCard component and the section in models/page.tsx are rendering.

### Model Detail Page (/models/[slug])
- [ ] **Speed bars are INVISIBLE** — The "Decode Speed" section shows axis labels but no bars. Same bug as the quant ranking bars — the SpeedBar component isn't rendering its bars. Fix it.
- [ ] **Data table is MISSING** — SPEC calls for a full data table with columns: Quant, File Size, VRAM, QB-Retention, IFEval, BBH, GPQA, MuSR, HLE, Decode tok/s, Prefill tok/s. Check if DataTable component exists and is imported. If not, create it.
- [ ] **Export buttons are MISSING** — SPEC calls for JSON and CSV download buttons. Check if ExportButtons component exists. If not, create it.

---

## DESIGN OVERHAUL — Flatness & Depth

The #1 complaint: **everything is flat.** Every element sits on the same visual plane. There's no dimensionality, no layers, no depth. Fix this systematically:

### Background & Atmosphere
- [ ] **Add a subtle dot grid or noise texture to the body background** — Very faint (opacity 0.03-0.05), creates a sense of texture instead of pure flat black. Use a CSS repeating pattern or an inline SVG. The SPEC explicitly calls for "subtle grid/dot patterns in backgrounds for depth."
- [ ] **Create alternating section backgrounds** — Not every section should be the same color. Alternate between `#09090B` (primary) and `#0C0C0F` or similar — barely perceptible but creates rhythm. Some sections could have a very faint radial gradient behind them (like a soft spotlight effect centered on the chart).
- [ ] **Add a faint gradient glow behind the hero title** — A very subtle radial gradient (blue-ish or white at ~3% opacity) behind "QuantiBench" to make it feel like it's emitting light. Not a blur glow — a background radial.

### Glass Cards — Make Them Actually Visible
- [ ] **Increase glass card contrast** — Current cards are `rgba(24, 24, 27, 0.7)` on a `#09090B` background — barely distinguishable. Change to: background `rgba(255, 255, 255, 0.03)`, stronger border `rgba(255, 255, 255, 0.08)`, add a subtle top-edge highlight: `border-top: 1px solid rgba(255, 255, 255, 0.1)`. The card should feel like a slightly frosted glass panel floating above the background.
- [ ] **Add drop shadow to glass cards** — `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)` — creates the illusion the card is lifted off the page.
- [ ] **Inner highlight on glass cards** — Add `inset 0 1px 0 rgba(255, 255, 255, 0.06)` to box-shadow for a top-edge catch light, like real glass reflecting overhead light.

### Bar Charts — Make Them Premium, Not Cheap
- [ ] **Metallic gradient on bars** — Current bars have a basic top-to-bottom darkening. Replace with a 3-stop metallic gradient: lighter highlight at top-left (the quant color at 100% + white mixed at 20%), the solid quant color in the middle, and a darker shade at the bottom. This creates a brushed-metal/3D cylinder look.
- [ ] **Add inner highlight to bars** — A thin 1px `stroke` on each bar in a lighter shade of its color (the color + white at 30%) creates an edge catch that makes bars look 3D instead of flat rectangles.
- [ ] **Add subtle shadow under each bar** — A small `<rect>` behind each bar with slight offset and blur, or use CSS filter. Makes bars feel like they're standing up from the surface.
- [ ] **Round the tops more aggressively** — Current `rx={4}` is too subtle. Use `rx={6}` on the main chart, `rx={4}` on mini charts. The rounded tops help the 3D illusion.

### Typography — Create Hierarchy
- [ ] **Hero title size increase** — "QuantiBench" should be bigger and bolder. Current text-5xl/text-7xl is okay but the metallic gradient is too subtle. Make the gradient go from pure white (#FFFFFF) at top to #71717A at bottom — much more dramatic contrast. Also add a very faint text-shadow: `0 0 40px rgba(255,255,255,0.1)` for a subtle glow.
- [ ] **Subtitle readability** — "Does quantization harm LLM performance?" is too dim. Change from `text-text-secondary` (#A1A1AA) to `text-text-primary` (#FAFAFA) or at least #D4D4D8 (zinc-300). The subtitle is the hook — it needs to be readable.
- [ ] **Section headings need visual weight** — Add a subtle left accent (a 3px colored bar to the left of section headings) or make headings larger. Current headings all look identical in weight to each other.
- [ ] **Use monospace for ALL numbers in charts** — Percentages, speeds, VRAM — all numeric data should use Geist Mono for that technical, premium data-viz feel. Check all chart components.

---

## INTERACTIVITY — Dead Cards, Missing Hover States

- [ ] **Benchmark cards must be interactive** — When you click a benchmark card (IFEval, BBH, etc.), it should either: (a) expand to show a larger version of the chart with per-model breakdown, or (b) have a visible hover state that shows more detail in a tooltip/popover. At minimum: cursor pointer, scale(1.02) on hover, and show retention values on hover.
- [ ] **Quant-specific ranking cards need hover tooltips** — Hovering a bar in the Q8_0/Q4_K_M/IQ2_XXS/IQ1_S ranking charts should show the model name and exact retention value.
- [ ] **Model cards need 3D tilt effect** — SPEC calls for CSS perspective transform on hover — card tilts toward cursor position. Implement using onMouseMove to calculate tilt angle based on cursor position relative to card center.
- [ ] **Scatter plot needs a legend** — There's no way to tell which color is which quant level. Add a color legend below or beside the scatter plot showing all 8 quant levels with their colors.
- [ ] **Model cards sparkline needs to be larger** — Currently tiny. Make the sparkline at least 120px wide and 40px tall so the retention curve is actually readable.

---

## PAGE-SPECIFIC FIXES

### Homepage
- [ ] **Wrap ALL chart sections in glass cards** — The retention bar is now wrapped but ensure benchmark grid cards and scatter plot section also have proper containment.
- [ ] **Add key stats in the hero** — Below the description, add 3-4 key stats in a row: "5 Models", "8 Quant Levels", "5 Benchmarks", "200+ Data Points" — each with a count-up animation. These anchor the hero and give it substance.
- [ ] **Benchmark grid layout** — 5 cards in a 3+2 layout leaves an awkward gap. Either: make it 2+3 (2 top, 3 bottom), or make the bottom 2 cards wider to fill the row. Or use a 5-column layout on desktop.

### Models Page
- [ ] **Grouped bar chart needs glass card wrapper** — Currently floating on the background with no frame.
- [ ] **Quant ranking cards need glass card styling** — They have it but verify it's rendering correctly since the bars inside are broken.
- [ ] **Fix model name truncation** — Model names on x-axis are cut off ("Gemma 2 9B Ins...", "Qwen 2.5 7B In..."). Either rotate labels 45°, or use abbreviated names, or increase chart width.

### Model Detail Page  
- [ ] **Wrap retention curve and speed chart in glass cards** — Currently floating.
- [ ] **Add glass card wrapper around data table** — Premium look, consistent with rest of site.
- [ ] **Style export buttons** — Glass card style, with hover glow and press-scale feedback. Icon + text.

---

## POLISH

- [ ] **Nav active state** — Current active link has an underline. Make it more visible — could be a bottom border glow or a filled pill background.
- [ ] **Footer is too plain** — Just two lines of text. Add a subtle top border gradient (same style as section dividers) and slightly elevated background.
- [ ] **Smooth scroll between sections** — Add `scroll-behavior: smooth` to html element.
- [ ] **Page transition animation** — Verify Motion AnimatePresence is working for route transitions. Currently page changes feel instant/hard-cut.
- [ ] **Loading skeletons** — SPEC calls for skeleton placeholders before charts animate in. Add subtle pulsing skeleton outlines in the chart areas.

---

## QUALITY CHECKLIST (Must pass before EXIT_SIGNAL: true)

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes
- [ ] All 3 pages render correctly (/, /models, /models/[slug])
- [ ] ALL bars visible on ALL charts (retention, benchmark grid, quant rankings, speed bars)
- [ ] Data table renders on model detail page
- [ ] Export buttons work on model detail page
- [ ] Glass cards are visually distinct from background on all pages
- [ ] Bar charts have metallic gradient (not flat fills)
- [ ] Benchmark cards respond to hover/click
- [ ] Scatter plot has a color legend
- [ ] Dot grid/texture visible in background
- [ ] No console errors
- [ ] Responsive at 1440px, 1024px, 768px, 375px
