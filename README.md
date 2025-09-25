# AG Grid Community POC (React + Vue)

This workspace contains Proof of Concept implementations of AG Grid Community in both React and Vue 3 to validate enterprise table requirements: sorting, filtering, pagination, column resizing, accessibility, theming, and developer experience.

## Structure

- `react-app/` — Create React App (TypeScript) with AG Grid Community
- `vue-app/` — Vite + Vue 3 (TypeScript) with AG Grid Community
- `docs/` — POC report and requirement coverage

## Run locally

### React

```bash
# From workspace root
npm start --prefix react-app
```

Dev server: http://localhost:3000

### Vue

```bash
# From workspace root
npm install --prefix vue-app
npm run dev --prefix vue-app
```

Dev server: http://localhost:5173 (default)

## Features implemented (both apps)

- Sorting (single and multi-column with Shift)
- Column filters (text/number/date/set) + floating filters
- Pagination (10/20/50)
- Column resizing and reordering
- Column show/hide toggles
- Global search (quick filter)
- Row-level actions column (Edit/Delete)
- Overlays for loading, empty/no-match, error
- State persistence (column order/visibility via localStorage)
- Text wrapping toggle (wrapText/autoHeight)
- Theming overrides using CSS variables (Quartz theme)
- Accessibility: keyboard navigation and ARIA from AG Grid defaults

## Notes

- Row Grouping/Expansion is an AG Grid Enterprise feature. Community edition cannot provide native collapsible groups. Workarounds are possible, but limited; see `docs/ag-grid-poc-report.md`.

- If native grouping is required -> AG Grid Enterprise
