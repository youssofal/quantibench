# QuantiBench — Design & Product Specification

## 1. Overview

QuantiBench (quantibench.ai) answers a question the local LLM community argues about constantly: **does quantization actually hurt model quality, and if so, by how much?**

We benchmark popular open-source LLMs at every major quantization level (FP16 down to IQ1_S) across rigorous evaluation suites, then present the results on a beautiful, interactive website. All data is open-source.

The goal is to become the authoritative reference for quantization impact — and to build credibility and notability on r/LocalLLaMA and the broader AI community.

---

## 2. Models Tested

| Model | Parameters |
|-------|-----------|
| Llama 3.1 8B Instruct | 8B |
| Qwen 2.5 7B Instruct | 7B |
| Mistral 7B v0.3 Instruct | 7B |
| Gemma 2 9B Instruct | 9B |
| Phi-4 | 14B |

Source: llama.cpp GGUF models from **bartowski** and dynamic quant models from **Unsloth** for deterministic, controlled experiments.

---

## 3. Quantization Levels Tested

FP16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ2_XXS, IQ1_S

Ordered from highest fidelity (FP16) to most aggressive compression (IQ1_S).

---

## 4. Benchmarks Used

| Benchmark | Questions | What It Tests |
|-----------|-----------|---------------|
| IFEval | 500 | Instruction following |
| BBH (Big Bench Hard) | 6,500 | Complex reasoning |
| GPQA Diamond | 198 | Graduate-level science |
| MuSR | 750 | Multistep reasoning |
| HLE (Humanity's Last Exam) | 2,500 | Expert-level ceiling |

Speed & resource metrics are also recorded: **Decode tok/s**, **Prefill tok/s**, **VRAM usage (GB)**, **File size (GB)**.

---

## 5. Key Metric: QB-Retention

```
QB-Retention = (quant_score / FP16_score) × 100
```

This answers: *"How much quality do I keep at this quantization level?"*

FP16 is always 100%. A QB-Retention of 93% at Q4_K_M means you lose 7% quality but get a much smaller, faster model.

**Overall retention** for a given quant = simple average of per-benchmark retentions. For example, if Q4_K_M retains 95% on IFEval, 92% on BBH, 91% on GPQA, 93% on MuSR, and 90% on HLE, overall Q4 retention = (95+92+91+93+90)/5 = 92.2%.

---

## 6. Design System

### Aesthetic Direction

**Think: MacBook Pro product page. Linear.app. Vercel.com.**

The site must feel premium, expensive, and authoritative. Like a billion-dollar company built it.

- **Matte black** backgrounds — not washed-out dark gray, actual near-black
- **Icy white / off-white** text — crisp, high contrast
- **Metallic gray** for secondary elements — like brushed aluminum
- **No purple anywhere** — the color palette is strictly cool metallics warming to hot danger tones
- **Glass morphism** on cards — subtle `backdrop-blur` with semi-transparent backgrounds
- **Large whitespace** — let the content breathe, don't cram things together
- **Subtle grid/dot patterns** in backgrounds for depth (very faint, not distracting)

### Color Palette

```
Background (primary):    #09090B   (matte black — zinc-950)
Background (card):       #18181B   (dark surface — zinc-900)
Background (elevated):   #27272A   (raised surface — zinc-800)
Border:                  #3F3F46   (subtle — zinc-700, use at 50-60% opacity)
Text (primary):          #FAFAFA   (icy white — zinc-50)
Text (secondary):        #A1A1AA   (metallic gray — zinc-400)
Text (muted):            #71717A   (dim — zinc-500)
```

### Quant Color Scale (metallic gradient, cool → warm)

Each quantization level has a signature color. The gradient flows from premium/cool (high quality) to danger/hot (heavy compression):

```
FP16:      #C8C8C8   (platinum silver)
Q8_0:      #60A5FA   (steel blue)
Q6_K:      #2DD4BF   (teal)
Q5_K_M:    #A3E635   (lime)
Q4_K_M:    #FBBF24   (gold)
Q3_K_M:    #FB923C   (amber)
IQ2_XXS:   #F87171   (coral)
IQ1_S:     #EF4444   (red)
```

Every quant must be instantly distinguishable from its neighbors. The gradient flows: silver → blue → teal → lime → gold → amber → coral → red. No two adjacent colors should be from the same hue family.

These colors should have a subtle metallic/gradient sheen when used in chart bars — not flat fills. Use CSS gradients or slight opacity layering to achieve this.

### Typography

- **Headings:** Geist Sans (Vercel's font) or Inter — clean, modern, geometric
- **Body:** Same sans-serif family
- **Data / Numbers / Code:** Geist Mono or JetBrains Mono — monospaced for tabular data and metric displays
- **Sizes:** Large and confident for headings. Don't be shy with font size on hero sections.

---

## 7. V1 Pages (Build These)

### 7a. Homepage ( / )

**Hero Section:**
- Logo: "QuantiBench" in clean type, possibly with a subtle metallic gradient on the text
- Subtitle: *"Does quantization harm LLM performance? We measured it."*
- Smaller description paragraph explaining: we benchmarked X models at 8 quantization levels across 5 evaluation suites, measuring exactly how much quality you keep — and what you trade for speed and size
- The hero should feel big, bold, and premium. Plenty of whitespace.

**Section 1 — Overall Quant Retention:**
- Title: *"Average Quality Retention by Quantization Level"*
- Full-width horizontal bar chart
- Bars ordered left to right: FP16 (100%) → Q8_0 → Q6_K → Q5_K_M → Q4_K_M → Q3_K_M → IQ2_XXS → IQ1_S
- Each bar uses its signature quant color with metallic gradient fill
- Bars should show the retention percentage as a label
- This is an aggregate across all models and all benchmarks

**Section 2 — Benchmark Breakdown Grid:**
- Title: *"Retention by Benchmark"*
- Grid layout (2 or 3 columns) with one chart per benchmark (IFEval, BBH, GPQA, MuSR, HLE)
- Each chart shows quant-level retention for that specific benchmark (aggregated across models)
- Same bar chart style as the overall chart, but smaller/compact
- Each card has the benchmark name and a one-line description of what it tests

**Section 3 — Speed vs Quality Tradeoff:**
- Title: *"Speed vs Quality"*
- Scatter plot with QB-Retention % on X-axis, Decode tok/s on Y-axis
- Each dot = one model at one quant level
- Dots colored by their quant color
- Dot size could encode VRAM usage (larger = more VRAM)
- Hover tooltip showing model name, quant, exact retention, speed, VRAM
- This is the "money chart" — it shows the tradeoff visually

### 7b. Models Page ( /models )

**Section 1 — Overall Model Performance:**
- Title: *"Model Performance at FP16"*
- Full-width grouped bar chart showing all models ordered by their FP16 aggregate score (best → worst, left to right)
- Each model shows all its quant levels as grouped bars

**Section 2 — Quant-Specific Rankings (2×2 Grid):**
- Four smaller charts in a grid:
  - Q8_0: models ranked by Q8_0 retention (only Q8_0 bars)
  - Q4_K_M: models ranked by Q4_K_M retention (only Q4_K_M bars)
  - IQ2_XXS: models ranked by IQ2_XXS retention
  - IQ1_S: models ranked by IQ1_S retention
- Shows which models hold up best at each quant level — rankings can differ!

**Section 3 — Model Cards Grid:**
- Grid of clickable cards, one per model
- Each card shows:
  - Model name
  - Parameter count
  - Mini sparkline showing the retention curve (tiny line chart from FP16 → IQ1_S)
  - A key stat like "Q4 Retention: 94.2%"
- Cards link to `/models/[slug]`
- Cards should have glass morphism styling and a subtle hover animation (slight scale + glow)

### 7c. Individual Model Page ( /models/[slug] )

- **Header:** Model name, parameter count, link to HuggingFace page
- **Retention Curve:** Line chart showing QB-Retention % across all quant levels. X-axis = quant levels, Y-axis = retention %. The line should draw itself on scroll entry.
- **Speed Chart:** Bar chart showing decode tok/s for each quant level. Bars in quant colors.
- **Full Data Table:** Columns: Quant, File Size (GB), VRAM (GB), QB-Retention (%), IFEval, BBH, GPQA, MuSR, HLE, Decode tok/s, Prefill tok/s. Clean table with alternating row shading. Numbers in monospace font.
- **Export Buttons:** JSON and CSV download of this model's data. Styled buttons, not plain links.

---

## 8. V2 Pages (Future — Do Not Build Yet)

These pages are planned but deferred:

- **/compare** — Side-by-side comparison of 2-3 models with overlaid retention curves
- **/benchmarks** — Deep dive per benchmark with cards explaining what each tests
- **/methodology** — Transparency page with hardware specs, software versions, reproducibility details

---

## 9. Animation & Interaction Specification

The site should feel alive. Every section should have motion. But tasteful — Apple-level, not a cheap WordPress theme.

### Library Roles (IMPORTANT — do not mix these up)
- **Motion (framer-motion):** Page transitions (AnimatePresence crossfade between routes), element entrance animations (whileInView fade/slide), layout animations. Handles React component lifecycle animations.
- **GSAP + ScrollTrigger:** Chart-specific animations ONLY. Bar growth, line drawing (stroke-dashoffset), scatter dot entrance, count-up numbers. GSAP controls SVG elements via refs after React renders them. Do not use GSAP for page transitions or component mounting.

### Page-Level (Motion)
- Smooth page transitions between routes (crossfade or slide) via AnimatePresence
- Scroll-linked section reveals — sections fade/slide up as they enter the viewport via whileInView

### Charts
- Bar charts: bars grow upward from zero on scroll entry, staggered left-to-right (each bar starts 50-80ms after the previous)
- Line charts: line draws itself from left to right on scroll entry
- Scatter plots: dots scale in from zero with staggered timing, slight bounce easing
- Numbers: count-up animation from 0 to final value when they enter viewport
- All chart transitions should use natural easing (ease-out or spring physics), not linear

### Interactive States
- Hover on chart elements: subtle glow + tooltip with detailed data
- Hover on cards: slight scale-up (1.02×) + elevated shadow + subtle border glow
- Hover on nav links: underline slides in from left
- Click feedback: subtle press-down scale (0.98×) on buttons
- Active/selected states: bright accent border or glow

### 3D Accents (Tasteful, Not Overdone)
- Consider a subtle 3D tilt effect on model cards (CSS perspective transform on hover — card tilts toward cursor)
- Optional: a very subtle animated mesh gradient or noise texture in the hero background for depth
- Do NOT make the entire site 3D. These are accents only.

### Performance
- All animations must be GPU-accelerated (transform/opacity only, no layout thrashing)
- Lazy load charts — don't animate things below the fold until they're scrolled into view
- Ensure smooth 60fps. If an animation causes jank, simplify or remove it.
- Tree-shake D3 — import only the modules you use (d3-scale, d3-shape, d3-selection, etc.), NOT the full `d3` bundle
- Code-split chart components with `next/dynamic` where appropriate
- Target Lighthouse performance score > 85

### Loading & Error States
- Before charts animate in, show a subtle skeleton placeholder (low-opacity outline of the chart area)
- If `data/results.json` is missing or fails to parse, show a friendly error state ("No benchmark data available") rather than crashing
- All data loading happens server-side (read JSON in server components, pass to client chart components as props)

### SEO & Social
- Set page-level `<title>` and `<meta name="description">` for each route
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url` on every page
- Generate a simple OG image (static is fine for V1 — a branded card with "QuantiBench" + tagline)
- Include a favicon (simple "QB" monogram or similar)

---

## 10. Data Schema

### results.json

```typescript
interface BenchmarkScores {
  ifeval: number;       // 0–100
  bbh: number;          // 0–100
  gpqa: number;         // 0–100
  musr: number;         // 0–100
  hle: number;          // 0–100
}

interface QuantResult {
  quant: string;                  // "FP16" | "Q8_0" | "Q6_K" | etc.
  fileSizeGb: number;
  vramGb: number;
  decodeToksPerSec: number;
  prefillToksPerSec: number;
  scores: BenchmarkScores;
  retention: number;              // QB-Retention (0–100), computed as aggregate
  retentionPerBenchmark: BenchmarkScores; // retention per individual benchmark
}

interface ModelResult {
  slug: string;                   // URL-safe, e.g. "llama-3.1-8b"
  name: string;                   // Display name, e.g. "Llama 3.1 8B Instruct"
  params: string;                 // "8B", "7B", "9B", "14B"
  huggingface: string;            // Full HuggingFace URL
  quants: QuantResult[];          // One entry per quantization level
}

// Top-level: ModelResult[]
```

### Sample Data Expectations

When generating sample data, use these approximate retention curves (vary ±2-3% per model to make it realistic — different models degrade differently):

| Quant | ~Retention |
|-------|-----------|
| FP16 | 100% |
| Q8_0 | 98–99.5% |
| Q6_K | 96–98% |
| Q5_K_M | 94–97% |
| Q4_K_M | 91–95% |
| Q3_K_M | 85–90% |
| IQ2_XXS | 73–82% |
| IQ1_S | 58–70% |

Speed should increase as quant gets more aggressive (smaller = faster decode). File size and VRAM should decrease accordingly.

---

## 11. Responsiveness

- Desktop-first design (this is a data-heavy site, most users are on desktop)
- Must still work cleanly on tablet and mobile
- Charts should resize gracefully — consider horizontal scroll on mobile for wide charts rather than squishing them
- Navigation should collapse to a hamburger menu on mobile
- Model cards grid should reflow (3 cols → 2 → 1)
