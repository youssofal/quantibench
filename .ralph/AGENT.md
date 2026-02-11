# QuantiBench V2 — Agent Notes

## Project Type
Next.js 16 web application (TypeScript, Tailwind CSS v4)

## Build & Run
```bash
npm install           # Install dependencies
npm run generate-data # Generate sample benchmark data
npm run dev           # Development server at localhost:3000
npm run build         # Production build
npm run lint          # ESLint
```

## Key Files
- `SPEC.md` — Product specification (design system, pages, animations, data schema)
- `TASK.md` — Technical build instructions (stack, structure, page-by-page details)
- `data/results.json` — Sample benchmark data (generated)
- `src/lib/constants.ts` — Quant colors, order, benchmark metadata
- `src/lib/schema.ts` — Zod validation schemas
- `src/lib/data.ts` — Server-side data loading
