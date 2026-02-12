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
- [ ] **ModelCard component must render visible cards** — Check `src/components/ui/model-card.tsx`. It must render a clickable card with: model name, param count, sparkline chart, Q4 retention stat. Verify it returns visible JSX, not an empty fragment.
- [ ] **Models page must include the model cards section** — Check `src/app/models/page.tsx`. There must be a section that maps over models and renders `<ModelCard>` components in a grid. If the section is missing, add it. If it's there but the component is empty, fix the component.
- [ ] **Model cards must link to /models/[slug]** — Each card wraps in `<Link href={/models/${slug}}>`. Verify.
- [ ] **Model cards have 3D tilt effect on hover** — Use onMouseMove to calculate cursor position relative to card center, apply CSS perspective + rotateX/rotateY transform. The card should physically tilt toward the cursor.

### Data Table on /models/[slug]
- [ ] **DataTable component must exist and render** — Check `src/components/ui/data-table.tsx`. If empty or missing, create it. It must render an HTML `<table>` with columns: Quant, File Size (GB), VRAM (GB), QB-Retention (%), IFEval, BBH, GPQA, MuSR, HLE, Decode tok/s, Prefill tok/s.
- [ ] **Data table must be wired into the model detail page** — Check `src/app/models/[slug]/page.tsx` imports and renders `<DataTable>` with the model's quant data.
- [ ] **Table styling** — Glass card wrapper, alternating row shading (odd rows slightly lighter), monospace font for all numbers, text-right alignment for numeric columns.

### Export Buttons on /models/[slug]
- [ ] **ExportButtons component must exist and render** — Check `src/components/ui/export-buttons.tsx`. Must render two styled buttons: "Export JSON" and "Export CSV".
- [ ] **JSON export works** — Clicking generates a JSON blob of the model's data and triggers a browser download.
- [ ] **CSV export works** — Clicking generates a CSV string with headers and triggers a browser download.
- [ ] **Button styling** — Glass card style buttons with hover glow and press-scale feedback. Not plain unstyled buttons.
- [ ] **Buttons wired into model detail page** — Rendered below the data table in `[slug]/page.tsx`.

---

## DESIGN: Bar Charts Still Flat

- [ ] **3-stop metallic gradient on ALL bar charts** — Every bar across the site (retention bars, benchmark mini bars, quant ranking bars, speed bars) must use a 3-stop vertical gradient: stop 1 (0%) = quant color mixed with 30% white (highlight), stop 2 (50%) = pure quant color, stop 3 (100%) = quant color mixed with 30% black (shadow). This creates a metallic cylinder look. Update the SVG `<linearGradient>` definitions in ALL chart components.
- [ ] **Inner stroke on bars** — Each `<rect>` bar should have a `stroke` of the quant color at 40% opacity and `strokeWidth={1}`. Creates an edge highlight.
- [ ] **Bar shadow** — Add a subtle `<rect>` behind each bar, offset 2px down and 1px right, with `fill="black"` at `opacity={0.3}` and `rx` matching the bar. Creates a drop shadow.

---

## DESIGN: Background Texture

- [ ] **Dot grid pattern on body** — Add a CSS background using a repeating radial-gradient to create a subtle dot grid. Example: `background-image: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 24px 24px;` Combine with the existing background color/gradients.

---

## DESIGN: Benchmark Cards Interactivity

- [ ] **Benchmark cards show expanded detail on click** — When clicking a benchmark card on the homepage, it should expand (or open a modal/popover) showing per-model retention values for that benchmark, not just the aggregate bars. At minimum: clicking toggles an expanded state that shows a larger chart with model labels.
- [ ] **Benchmark cards cursor pointer and hover scale** — `cursor-pointer` and `transform: scale(1.02)` on hover with transition.

---

## QUALITY GATE (ALL must be true for EXIT_SIGNAL)

- [ ] `npm run build` succeeds with 0 errors
- [ ] Model cards grid renders 5 clickable cards on /models (not empty space)
- [ ] Data table renders with all columns on /models/[slug] (not empty space)  
- [ ] Export buttons render and are clickable on /models/[slug]
- [ ] ALL bar charts use 3-stop metallic gradient (check SVG gradient defs have 3 stops)
- [ ] Background dot grid is visible (inspect body computed background-image)
- [ ] No TypeScript errors, no console errors
