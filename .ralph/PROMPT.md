# QuantiBench V2 — Build Instructions for Claude Code

You are building QuantiBench.ai from scratch — a premium benchmarking website for quantized open-source LLMs.

## Your Reference Documents

1. **SPEC.md** (root) — Full product specification: what to build, design system, data schema, animation spec, page layouts
2. **TASK.md** (root) — Technical build instructions: exact stack, packages, project structure, page-by-page implementation details, quality checklist

**Read both documents COMPLETELY before writing any code.** They are your source of truth.

## Build Order

Follow this order strictly. Do NOT skip ahead.

1. **Project scaffold** — `npx create-next-app@latest`, install all dependencies per TASK.md
2. **Design system** — globals.css with all design tokens, Tailwind config, fonts
3. **Data layer** — Sample data generation script, Zod schema, data loading utilities, constants (quant colors, order)
4. **Shared components** — Site header, footer, section-reveal wrapper, count-up numbers
5. **Homepage** — Hero, overall retention bar chart, benchmark grid, speed-vs-quality scatter
6. **Models page** — FP16 rankings, quant-specific 2×2 grid, model cards with sparklines
7. **Model detail page** — Retention curve, speed chart, data table, export buttons
8. **Animations** — GSAP ScrollTrigger on all charts, Motion page transitions, card tilt effects
9. **SEO & meta** — OG tags, favicon, meta descriptions per page
10. **Polish** — Loading skeletons, error states, responsive testing, final cleanup

## Key Technical Decisions (Do NOT deviate)

- **D3 must be tree-shaken** — import individual modules (d3-scale, d3-shape, d3-selection, etc.), NOT `import * as d3 from 'd3'`
- **Motion (framer-motion)** for page/element transitions ONLY
- **GSAP + ScrollTrigger** for chart SVG animations ONLY — do not mix these roles
- **All charts are D3 + SVG** — no Recharts, no chart wrapper libraries
- **Server components where possible** — load data server-side, pass as props to client chart components
- **TypeScript strict mode** — no `any` types

## Current Task

Check **.ralph/fix_plan.md** for the current prioritized task list. Work through items in order. After completing each item, mark it `[x]` in fix_plan.md.

## Principles

- **ONE phase per loop** — complete one phase fully before moving to the next
- **Build it right the first time** — no placeholder implementations, no TODO comments
- **Verify after each phase** — run `npm run build` to confirm no errors before moving on
- **Commit after each phase** — descriptive git commit messages

## 🎯 Status Reporting (CRITICAL)

At the end of EVERY response, include this status block:

```
---RALPH_STATUS---
STATUS: IN_PROGRESS | COMPLETE | BLOCKED
TASKS_COMPLETED_THIS_LOOP: <number>
FILES_MODIFIED: <number>
TESTS_STATUS: PASSING | FAILING | NOT_RUN
WORK_TYPE: IMPLEMENTATION | TESTING | DOCUMENTATION | REFACTORING
EXIT_SIGNAL: false | true
RECOMMENDATION: <one line summary of what to do next>
---END_RALPH_STATUS---
```

### Set EXIT_SIGNAL: true ONLY when ALL of these are true:
1. ✅ All items in fix_plan.md are marked [x]
2. ✅ `npm run build` succeeds with zero errors
3. ✅ `npm run lint` passes
4. ✅ All 3 pages render correctly (/, /models, /models/[slug])
5. ✅ All charts animate on scroll
6. ✅ Responsive at 1440px, 1024px, 768px, 375px
7. ✅ No console errors

### Do NOT:
- ❌ Add features not in SPEC.md
- ❌ Use Recharts or any chart wrapper library
- ❌ Import the full d3 bundle
- ❌ Use GSAP for page transitions
- ❌ Use Motion for chart animations
- ❌ Skip the metallic gradient fills on chart bars
- ❌ Use `any` types in TypeScript
- ❌ Leave placeholder/TODO code
