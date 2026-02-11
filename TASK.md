# QuantiBench — Build Instructions

You are building QuantiBench.ai from scratch. Read SPEC.md first for the full product vision. This file tells you exactly what to build and how.

---

## Tech Stack

```
Framework:    Next.js 16 (App Router, server components where possible)
Language:     TypeScript (strict mode)
Styling:      Tailwind CSS v4
Animations:   Motion (framer-motion) — page transitions + element entrance animations
              GSAP + ScrollTrigger — chart-specific animations ONLY (bar growth, line draw, scatter pop-in)
Charts:       D3.js (tree-shaken — import only d3-scale, d3-shape, d3-selection, d3-array, d3-axis, d3-format as needed. NOT the full d3 bundle.)
3D Accents:   CSS transforms for card tilt effects (no Three.js needed for V1)
Fonts:        Geist Sans + Geist Mono (included with Next.js via next/font)
Validation:   Zod for data schema validation
```

### IMPORTANT: Animation Library Roles
- **Motion** handles: page transitions (AnimatePresence), section fade-in (whileInView), component mount/unmount animations, layout animations.
- **GSAP + ScrollTrigger** handles: SVG chart animations only — bar height tweens, line stroke-dashoffset drawing, scatter dot scaling, number count-ups. GSAP operates on SVG elements via React refs AFTER React has rendered them.
- **Do NOT mix these.** Do not use GSAP for page transitions. Do not use Motion for chart element animations.

### Install Command

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint
npm install motion gsap d3-scale d3-shape d3-selection d3-array d3-axis d3-format d3-interpolate zod
npm install -D @types/d3-scale @types/d3-shape @types/d3-selection @types/d3-array @types/d3-axis @types/d3-format @types/d3-interpolate
```

Note: Geist fonts are included with Next.js by default. Tree-shake D3 by importing individual modules — do NOT `npm install d3` (the full bundle is ~240KB).

---

## Project Structure

```
src/
  app/
    layout.tsx              # Root layout: fonts, nav, footer, page transition wrapper
    page.tsx                # Homepage
    globals.css             # Tailwind imports + custom CSS variables
    models/
      page.tsx              # Models list page
      [slug]/
        page.tsx            # Individual model page
  components/
    layout/
      site-header.tsx       # Navigation bar
      site-footer.tsx       # Footer
      page-transition.tsx   # Motion AnimatePresence wrapper
    charts/
      overall-retention-bar.tsx     # Homepage: overall quant retention bars
      benchmark-grid.tsx            # Homepage: benchmark breakdown grid
      speed-quality-scatter.tsx     # Homepage: scatter plot
      model-ranking-bars.tsx        # Models page: FP16 + quant-specific bars
      retention-curve.tsx           # Model detail: line chart
      speed-bar.tsx                 # Model detail: decode tok/s bars
      sparkline.tsx                 # Tiny retention curve for model cards
    ui/
      model-card.tsx        # Clickable model card with glass morphism
      data-table.tsx        # Full data table for model detail page
      export-buttons.tsx    # JSON/CSV download buttons
      count-up.tsx          # Animated number counter
      section-reveal.tsx    # Scroll-triggered section fade-in wrapper
  lib/
    data.ts                 # Load and parse results.json
    schema.ts               # Zod schemas for data validation
    utils.ts                # Helpers (formatting, calculations)
    constants.ts            # Quant colors, quant order, benchmark metadata
data/
  results.json              # Benchmark data (generated sample for now)
public/
  (static assets)
```

---

## Design Tokens

Define these as CSS custom properties in `globals.css` and/or Tailwind config:

### Backgrounds
```
--bg-primary:    #09090B     (matte black)
--bg-card:       #18181B     (dark surface)
--bg-elevated:   #27272A     (raised elements)
```

### Text
```
--text-primary:  #FAFAFA     (icy white)
--text-secondary:#A1A1AA     (metallic gray)
--text-muted:    #71717A     (dim)
```

### Borders
```
--border:        #3F3F46     (use at 50-60% opacity)
```

### Quant Colors
```
--q-fp16:        #C8C8C8     (platinum silver)
--q-q8:          #60A5FA     (steel blue)
--q-q6:          #2DD4BF     (teal)
--q-q5:          #A3E635     (lime)
--q-q4:          #FBBF24     (gold)
--q-q3:          #FB923C     (amber)
--q-iq2:         #F87171     (coral)
--q-iq1:         #EF4444     (red)
```

### Card Style
Cards use glass morphism:
```css
background: rgba(24, 24, 27, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(63, 63, 70, 0.4);
border-radius: 12px;
```

---

## Sample Data Generation

Create a script at `scripts/generate-sample-data.ts` that generates `data/results.json`.

The script should:
1. Define 5 models with realistic FP16 benchmark scores
2. For each model, generate scores at each quant level with realistic degradation
3. Compute QB-Retention per benchmark and overall
4. Generate realistic speed metrics (faster at lower quants)
5. Generate realistic file sizes and VRAM (smaller at lower quants)
6. Write to `data/results.json`

Add to package.json scripts: `"generate-data": "tsx scripts/generate-sample-data.ts"`

### Realistic FP16 baselines (approximate):

| Model | IFEval | BBH | GPQA | MuSR | HLE |
|-------|--------|-----|------|------|-----|
| Llama 3.1 8B | 72 | 67 | 31 | 40 | 5 |
| Qwen 2.5 7B | 75 | 65 | 33 | 38 | 7 |
| Mistral 7B v0.3 | 60 | 58 | 28 | 35 | 3 |
| Gemma 2 9B | 71 | 72 | 35 | 43 | 6 |
| Phi-4 | 78 | 78 | 42 | 48 | 10 |

Apply degradation per quant level (see SPEC.md §10 for retention ranges). Add ±1-3% random variance per model per benchmark to make data look natural.

---

## Page-by-Page Build Instructions

### Homepage ( / )

**Hero:**
- Centered layout, generous vertical padding (py-24 or more)
- "QuantiBench" as large heading with subtle metallic text gradient (silver → white)
- Subtitle in text-secondary: *"Does quantization harm LLM performance? We measured it."*
- Description paragraph in text-muted explaining the methodology in 2-3 sentences
- Wrap in `<SectionReveal>` for fade-up on load

**Overall Quant Retention Chart:**
- Build with D3 as an SVG bar chart
- Full width of the content container (max-w-6xl or similar)
- 8 vertical bars, one per quant level, left (FP16) to right (IQ1_S)
- Each bar: metallic gradient fill using its quant color → slightly darker shade
- Label above each bar: retention percentage (e.g., "99.2%")
- Label below each bar: quant name
- Animation: bars grow from height 0 to final height on scroll entry, staggered 60ms apart, ease-out curve (use GSAP ScrollTrigger)
- Hover: bar glows slightly, tooltip shows exact value

**Benchmark Grid:**
- CSS Grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Each cell is a glass-morphism card containing:
  - Benchmark name (bold)
  - One-line description (muted text)
  - Smaller version of the retention bar chart for that specific benchmark
- Cards fade-in staggered on scroll entry

**Speed vs Quality Scatter:**
- D3 scatter plot
- X-axis: QB-Retention %, Y-axis: Decode tok/s
- Each dot = one (model, quant) pair, colored by quant color
- Dot radius encodes VRAM (larger = more VRAM)
- Hover tooltip: model name, quant, retention %, speed, VRAM
- Dots animate in on scroll entry: scale from 0 to 1, staggered, with slight bounce

### Models Page ( /models )

**FP16 Rankings Chart:**
- Grouped bar chart: models ordered by FP16 aggregate score
- Each model shows all quant levels as grouped bars
- Full width, D3-rendered
- Same scroll-entry animation as homepage bars

**Quant-Specific Rankings (2×2 Grid):**
- Four charts in grid: Q8_0, Q4_K_M, IQ2_XXS, IQ1_S
- Each chart shows models ranked by that specific quant's retention
- Only the relevant quant's bar shown per model (not all quants)
- Smaller charts, glass-morphism card containers

**Model Cards:**
- CSS Grid: 3 columns desktop, 2 tablet, 1 mobile
- Each card:
  - Model name (bold heading)
  - Param count badge
  - Sparkline: tiny SVG line chart (D3) showing retention across quants
  - Key stat: "Q4 Retention: XX.X%"
  - Glass morphism background
  - Hover: scale(1.02), elevated shadow, subtle border brightness increase
  - 3D tilt on hover: CSS perspective transform, card tilts toward cursor position
  - Click → navigates to /models/[slug]

### Individual Model Page ( /models/[slug] )

**Header:**
- Model name (large), param count, external link to HuggingFace (opens new tab)
- Breadcrumb: Models → Model Name

**Retention Curve:**
- D3 line chart
- X-axis: quant levels (FP16 → IQ1_S)
- Y-axis: QB-Retention %
- Line draws itself on scroll entry (GSAP, stroke-dashoffset animation)
- Data points shown as dots on the line, colored by quant color
- Hover on dots: tooltip with exact value

**Speed Chart:**
- D3 bar chart: decode tok/s per quant
- Bars in quant colors with metallic gradient
- Scroll-entry grow animation

**Data Table:**
- Full-width table with all metrics
- Columns: Quant, File Size, VRAM, QB-Retention, IFEval, BBH, GPQA, MuSR, HLE, Decode tok/s, Prefill tok/s
- Alternating row backgrounds (zinc-900 / zinc-950)
- Numbers in monospace font
- Subtle hover highlight on rows
- Table should scroll horizontally on mobile

**Export Buttons:**
- Two buttons: "Download JSON" and "Download CSV"
- Generate files client-side from the model data
- Styled: glass morphism, icon + text, hover glow

---

## Animation Implementation Details

### Section Reveal Component
```tsx
// Wrap each section in this. Uses Motion.
// Fades up (y: 30 → 0, opacity: 0 → 1) when element enters viewport.
// Use IntersectionObserver or motion's whileInView.
```

### GSAP ScrollTrigger for Charts
```tsx
// Register GSAP ScrollTrigger plugin once in a client component.
// Each chart component:
//   1. Renders SVG with final dimensions but bars at height 0 / lines at dashoffset 100%
//   2. On mount, sets up ScrollTrigger that plays the entrance animation when scrolled into view
//   3. Uses gsap.to() with stagger for bars, or gsap.fromTo for lines
```

### Count-Up Numbers
```tsx
// For percentage labels and stats.
// Animate from 0 to target number over ~1.5s with ease-out.
// Use Motion's useMotionValue + useTransform + animate, or a simple requestAnimationFrame counter.
// Trigger on scroll entry (IntersectionObserver).
```

### Card Tilt Effect
```tsx
// Track mouse position relative to card center.
// Apply rotateX/rotateY via CSS transform (max ±5 degrees).
// perspective: 1000px on parent.
// Smooth with transition: transform 0.1s ease-out.
// Reset to flat on mouse leave.
```

---

## Navigation

- Sticky top nav bar with glass morphism background
- Logo on left: "QuantiBench" (text, not an image)
- Links on right: Home, Models (V1 only — add more in V2)
- Mobile: hamburger menu that slides open
- Active page indicator: subtle underline or brightness

## SEO & Meta

- Every page must have: `<title>`, `<meta name="description">`
- Every page must have Open Graph tags: `og:title`, `og:description`, `og:url`
- Homepage OG image: create a simple static image in `/public/og.png` (1200×630, dark background, "QuantiBench" branding + tagline)
- Favicon: simple "QB" monogram in `/public/favicon.ico` and `/public/favicon.svg`
- Use Next.js metadata API (export const metadata / generateMetadata)

## Loading & Error Handling

- Before chart data renders, show skeleton placeholders (subtle low-opacity outlines of chart areas)
- Load `data/results.json` in server components, pass data as props to client chart components
- If JSON is missing or invalid, render a friendly message ("No benchmark data loaded. Run `npm run generate-data` first.") instead of crashing
- Use Zod to validate the data shape on load

---

## Quality Checklist

Before considering the build done:

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run lint` passes
- [ ] TypeScript strict mode, no `any` types
- [ ] All charts render correctly with sample data
- [ ] All animations are smooth 60fps (test in Chrome DevTools Performance tab)
- [ ] Responsive: test at 1440px, 1024px, 768px, 375px widths
- [ ] Dark theme only (no light mode toggle needed)
- [ ] All links/navigation works
- [ ] Model cards link to correct model pages
- [ ] Export buttons generate valid JSON and CSV
- [ ] No hydration errors in console
- [ ] No layout shift on page load
- [ ] Lighthouse performance score > 85
- [ ] D3 is tree-shaken (individual module imports, NOT full d3 bundle)
- [ ] Motion used for page/element transitions only; GSAP used for chart SVG animations only
- [ ] OG meta tags present on all pages
- [ ] Favicon present
- [ ] Loading skeletons shown before charts animate
- [ ] Graceful fallback if results.json is missing

---

## After Building

1. Run `npm run build` — must succeed
2. Run `npm run dev` — visually verify all pages
3. Initialize git repo and make initial commit
4. Verify the site looks premium, animations are smooth, charts are interactive

Do NOT push to any remote. Just build and verify locally.
