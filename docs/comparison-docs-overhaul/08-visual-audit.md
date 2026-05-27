# 08 · Visual Audit Checkpoint

Current checkpoint for the comparison app docs-page overhaul against the
unified Spectrum 2 docs at `react-spectrum.adobe.com`.

This replaces the first visual-audit snapshot from `main`. That older audit
found the empty React panel, stacked example sub-panels, no source block in the
fold, and a stale docs shell. Those findings have either been fixed or moved
into the remaining gates below.

## Reference

- Upstream source: `react-spectrum/packages/dev/s2-docs/src/VisualExample.tsx`
- Local route checked: `apps/comparison` component pages
- Browser gate: `playwright-cli` against local dev/preview servers
- Current checkpoint date: 2026-05-27

## Verified In Browser

- Button desktop, `1280 x 720`: the example surface uses the upstream-shaped
  grid, with `preview controls` over `files controls`, no horizontal overflow,
  React and Solid panels both rendering `Save`, and generated source visible
  under the preview.
- Button control bridge: changing `variant` updates the route query string,
  React/Solid demos, and generated Solid source.
- Button mobile, `390 x 844`: the example stacks as `preview`, `controls`,
  `files` and stays within the viewport width.
- TableView desktop, `1280 x 720`: the width-sensitive preview uses stacked
  React/Solid panels so each demo keeps the full preview width instead of being
  squeezed into half-width columns.
- TableView docs-viewer controls, `1280 x 900`: the live React Spectrum S2
  route exposes `selectionMode`, `overflowMode`, `density`, and `isQuiet` in
  the top viewer. The local TableView route now keeps those as the visible
  controls and retains the remaining docs/API states as hidden query-harness
  controls.
- Accordion docs shell, local preview: the left navigation is mounted through
  Solid Spectrum `Disclosure`, `DisclosureTitle`, and `DisclosurePanel`
  components. The active component's family opens by default, the index route
  opens the first family, and the server fallback keeps the same grouping with
  native `<details>` elements.
- Accordion docs shell, live React Spectrum S2: upstream uses a quiet,
  spacious S2 Disclosure navigation for the component list, with a top-level
  `Components` disclosure and current-page link styling.

## Landed In This Checkpoint

- The component example card now mirrors upstream `VisualExample` structure:
  preview region, controls column, and files/source region in one card.
- The per-example `Color scheme` control was removed. Theme is handled by the
  page-level color scheme only.
- React and Solid rendered examples are mounted again in the first example
  surface.
- A generated Solid source panel is visible by default and follows the same
  control event bridge as the preview.
- Porting notes moved out of the preview body and into a collapsed note below
  the source panel.
- Compact examples keep the split React/Solid preview; width-sensitive
  collection/date/form examples use stacked panels to preserve component
  geometry.
- TableView no longer exposes every harness branch in the official-looking
  control column. Hidden fields still preserve route/test coverage for dynamic
  rows, visible columns, keys, disabled rows, empty state, sorting, resizing,
  dividers, row links, row actions, and ActionBar.
- The comparison left sidebar now uses S2 Disclosure primitives instead of a
  long flat link list. This intentionally keeps the local component-family
  groups rather than copying the upstream single flat `Components` disclosure,
  because the comparison app needs to expose parity taxonomy and component
  coverage progress.

## Remaining Gates

- Compare every component route's interactive controls against the official
  React Spectrum docs viewer controls. Extra harness controls must be grouped
  separately or moved out of the official-looking control column.
- Replace generated source snippets with the content-pipeline source model:
  syntax highlighting, copy/open actions, and hand-authored example code from
  the upstream MDX where applicable.
- Drive page body, ToC, and section order from adapted upstream MDX instead of
  the current parity-shaped sections.
- Replace the current API list with upstream-style grouped prop tables.
- Re-run light and dark visual captures after the component-control pass.
- Revisit the landing page separately; it is still not shaped like the
  upstream Spectrum 2 landing page.
- Continue page-chrome porting against upstream `Layout`, `Header`, `Nav`, and
  `VisualExample`: header/search behavior, page body spacing, right-side ToC,
  and footer still need the same source-backed audit.

## Process Note

For future component passes, the example surface gate is not only "does it
render". It must also record:

- official docs viewer controls vs local controls,
- harness-only controls and where they live,
- desktop/mobile geometry,
- light/dark theme behavior,
- generated/source-code behavior,
- React/Solid mount status,
- any accepted divergence from upstream and why it remains necessary.
