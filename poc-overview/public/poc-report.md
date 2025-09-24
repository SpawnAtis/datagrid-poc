# POC Report

This report documents how the React and Vue implementations to fulfill the system requirements, highlights styling/theming, accessibility, performance/DX notes, and lists known limitations.

## Projects

- AG-grid React: `react-app/` (`src/App.tsx`)
- AG-grid Vue: `vue-app/` (`src/components/AgGridDemo.vue`, wired in `src/App.vue`)
- TanStack examples - https://github.com/carbon-design-system/tanstack-carbon/blob/main/react/README.md

## Requirement Coverage Matrix

| Area                  | Requirement                       | React | Vue | Notes                                                                       |
| --------------------- | --------------------------------- | ----- | --- | --------------------------------------------------------------------------- |
| Basic Structure       | General guide on usage            | ✅    | ✅  | Toolbar: density selector (`rowHeight`) and toggles.                        |
|                       | Define columns, headers, density  | ✅    | ✅  | `columnDefs`, `headerName`, density → rowHeight mapping.                    |
|                       | Visual indicators for data types  | ✅    | ✅  | Sort/Filter indicators built-in; filter types per column (set/date/number). |
| Sorting & Pagination  | Single/multi-column sorting       | ✅    | ✅  | Multi-sort via Shift.                                                       |
|                       | Visual sorting indicators         | ✅    | ✅  | Built-in icons.                                                             |
|                       | Pagination for large datasets     | ✅    | ✅  | Page size selector: 10/20/50.                                               |
| States & Loading      | Empty states with messages        | ✅    | ✅  | No-rows overlay when data empty or no match.                                |
|                       | Loading states (skeleton/overlay) | ✅    | ✅  | Loading overlay with simulated delay.                                       |
|                       | Error messaging/retry             | ✅    | ✅  | Error banner + dismiss; sets empty to show overlay.                         |
|                       | Handle "no match" scenarios       | ✅    | ✅  | React `onFilterChanged`, Vue `watch(rowData)`/overlay.                      |
| Filters & Search      | Global/column filtering           | ✅    | ✅  | Quick filter and per-column floating filters.                               |
|                       | Filter by status/date/text        | ✅    | ✅  | Set filter for status/role, date filter for createdAt, text for name/email. |
|                       | Global search all columns         | ✅    | ✅  | `quickFilterText`.                                                          |
|                       | Scoped search per column          | ✅    | ✅  | Column filter popovers + floating filters.                                  |
| Row-level Actions     | Inline actions (Edit/Delete)      | ✅    | ✅  | React cellRenderer; Vue cellRenderer+onCellClicked.                         |
|                       | Actions easily accessible         | ✅    | ✅  | Buttons with labels.                                                        |
|                       | Icons/buttons for clarity         | ✅    | ✅  | Buttons present (icons can be added).                                       |
| Grouping & Expansion  | Grouped rows by category          | ⚠️    | ⚠️  | Native grouping is Enterprise-only; can simulate via sort/formatting only.  |
|                       | Visual cues for expansion         | ❌    | ❌  | Collapsible groups require Enterprise.                                      |
|                       | Collapsible groups                | ❌    | ❌  | Enterprise-only.                                                            |
| A11y & Responsiveness | Keyboard navigation               | ✅    | ✅  | Built-in; verified basic nav.                                               |
|                       | Screen reader/ARIA support        | ✅    | ✅  | Built-in ARIA; can be extended.                                             |
|                       | Focus management                  | ✅    | ✅  | Managed by grid; focus rings present.                                       |
|                       | Responsive across devices         | ✅    | ✅  | Theme responsive; horizontal scroll when needed.                            |
| Column Customization  | Show/hide columns                 | ✅    | ✅  | Toolbar checkboxes toggle visibility via columnApi.                         |
|                       | Persist user preferences          | ✅    | ✅  | localStorage: column state (order/visibility).                              |
|                       | Resize/reorder columns            | ✅    | ✅  | Resizing enabled; reorder by drag (order saved).                            |
| Content Management    | Content filtering rules           | ✅    | ✅  | Filter types constrain data entry/search.                                   |
|                       | Text wrapping/ellipsis            | ✅    | ✅  | Toggle wrapText/autoHeight; off shows ellipsis.                             |
| Navigation            | Horizontal scrolling              | ✅    | ✅  | When total width exceeds container.                                         |
|                       | Touch and mouse support           | ✅    | ✅  | Built-in.                                                                   |

## Theming & Styling

## Theming & Styling

- Theming API (v33+) is used in both apps. There is an option to not NOT include legacy CSS theme files (e.g., `ag-grid.css`, `ag-theme-quartz.css`). Mixing legacy CSS with Theming API causes errors.
- Theme is provided via the `theme` prop using a themed instance, for example:
  - React: `theme={themeQuartz.withParams({...})}` in `react-app/src/App.tsx`
  - Vue: `:theme="themeQuartz.withParams({...})"` in `vue-app/src/components/AgGridDemo.vue`
- Customization is done by passing params (e.g., `backgroundColor`, `foregroundColor`, `headerBackgroundColor`, `headerTextColor`, `rowHoverColor`, `selectedRowBackgroundColor`, `fontSize`).
- To build a custom theme, start from a base (e.g., `themeQuartz`) and call `.withParams(...)` with your design tokens. You can centralize these tokens and swap them for light/dark.
- References:
  - Theming API docs: https://www.ag-grid.com/javascript-data-grid/themes/
  - Migration guide (from CSS themes to Theming API): https://www.ag-grid.com/javascript-data-grid/theming-migration/

## Accessibility Notes

- AG Grid provides keyboard navigation and ARIA attributes out of the box.
- Our action buttons include `aria-label`s; columns/filters announce state changes.
- Further audits (NVDA/VoiceOver) can be done if required; AG Grid docs include A11y guidance.

## Performance Considerations

- This POC uses the client-side row model with 50 rows. For large datasets, consider:
  - Server-Side Row Model (Enterprise) for virtualization across pagination
  - Infinite Row Model (Community) as an alternative
  - Column virtualization is built-in; cell renderers should be kept light.

## Developer Experience (DX)

- API is comprehensive and strongly typed.
- Documentation is extensive; examples available for most patterns.
- React and Vue bindings are consistent; concepts map 1:1 across frameworks.

## Limitations / Risks

- Row Grouping/Expansion and some advanced enterprise features are not available in Community:
  - Collapsible group rows
  - Pivoting, Aggregations, Server-Side Row Model
- If native grouping is a hard requirement, budget for AG Grid Enterprise or accept a simplified UX.

## Recommendation

- AG Grid Community meets the vast majority of the requirements out of the box in both React and Vue.
- If grouping/expansion must be first-class, evaluate AG Grid Enterprise; otherwise, AG Grid Community is a solid choice given functionality, docs, and ecosystem.

## How to Validate

1. Open React POC link (3000) and Vue POC link (5173) from the header buttons.
2. Use the toolbar to test:
   - Global search, density, wrap text
   - Column show/hide, save/restore state
   - Simulate loading and error; verify overlays
   - Multi-sort (hold Shift)
   - Row actions (Edit/Delete)

## TanStack Table: The Headless Approach Deep Dive

TanStack Table is a headless table library that provides powerful data manipulation logic without any UI components. It handles sorting, filtering, pagination, grouping, and other table functionality while leaving the visual presentation entirely to the developer.

### The Headless Philosophy

- Logic Only: Provides data management, state handling, and business logic
- Maximum Control: Complete freedom over HTML structure and styling
- Framework Agnostic: Works with React, Vue, Angular, Svelte, or vanilla JS

### TanStack Table with Design Systems

- Carbon Design System Integration: TanStack Carbon demonstrates how TanStack Table integrates with IBM's Carbon Design System
  - https://github.com/carbon-design-system/tanstack-carbon

## TanStack Examples

https://github.com/carbon-design-system/tanstack-carbon/blob/main/react/README.md

## TanStack Table: Pros and Cons

### Pros

- Strong headless architecture: maximum control over markup, behavior, and styling; easy to integrate with any design system.
- Lightweight and fast: small core bundle, excellent performance characteristics.
- First-class TypeScript: strong typing and predictable state management.
- Framework-agnostic: works with React, Vue, Svelte, Solid, and vanilla JS.
- Composable API: modular features (sorting, filtering, pagination, grouping, selection, column sizing/reordering).
- Server-side friendly: pairs well with server-side pagination/filtering/sorting.
- Highly customizable UX: replicate complex enterprise UX exactly as required.

### Cons

- No built-in UI or styles: you must implement headers, rows, cells, menus, overlays.
- More development effort: column menus, filter panels, toolbars, overlays, keyboard shortcuts, and accessibility require custom work.
- Ecosystem maturity varies by framework: React is richest; Vue/Svelte examples are fewer.
- Advanced features not turnkey: tree data, pivoting, master-detail, complex grouping/aggregation, virtualization need extra work or libraries.
- Accessibility is on you: ARIA, focus management, screen reader behavior must be implemented carefully.
- Editing and complex cells: no built-in editors; you implement editors, validation, and commit/cancel flows.

### When to use TanStack

- You have a design system and need pixel-perfect control over UI/UX.
- SSR-first or highly customized rendering is required.
- You prefer minimal runtime dependencies and tight performance control.
- The team is comfortable building the surrounding UI (menus, filters, overlays) in-house.

### When to consider alternatives

- You need a fully featured data grid with UI out-of-the-box and minimal custom work.
- Enterprise features like pivoting, server-side row model, master-detail, or rich editors are needed quickly.
- The team prefers configuration over composition and wants built-in themes.
