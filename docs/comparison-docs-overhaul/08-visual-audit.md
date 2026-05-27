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
- Docs top bar, live React Spectrum S2: upstream uses a `banner` landmark with
  a three-column layout, centered search trigger, top navigation links, a
  divider before the color-scheme control, and a dynamic theme-toggle label.
- Docs top bar, local comparison preview: the Solid top bar and Astro fallback
  now expose a `banner` landmark, centered component search trigger, top links,
  divider, real workflow icons, dynamic theme-toggle label, and a mobile layout
  that keeps brand/theme/menu controls without an empty divider column.
- Component search, local comparison preview: clicking the search trigger opens
  a dialog backed by Solid Spectrum `SearchField`, filters component catalogue
  entries, exposes result links, updates `aria-expanded`, and closes with
  Escape.
- Accordion docs shell, local comparison preview: the right rail is the
  upstream-shaped desktop ToC rail (`180px`, sticky, overflow-hidden wrapper)
  with an `On this page` title, scrollable `nav` list, current-section indicator,
  divider, and source link action outside the nav.
- Accordion docs shell, local comparison preview: the footer now uses a
  Spectrum divider and right-aligned `body-2xs` project links, matching the
  upstream footer structure while swapping Adobe legal links for local project
  destinations.
- Accordion docs shell, live React Spectrum S2: upstream page chrome is split
  across `Layout`, `Header`, `MobileHeader`, `MobileOnPageNav`, and page content
  wrappers. Mobile hides the left nav and desktop ToC, then moves the current
  page's ToC picker into the header.
- Accordion docs shell, local comparison preview: desktop body spacing, sticky
  right rail, mobile sidebar/ToC hiding, mobile header ToC picker, mobile card
  radius/shadow removal, and mobile `#api` section selection are covered by
  `e2e/component-detail-chrome.spec.ts`.
- Accordion control column, local comparison preview: long prop-control labels
  wrap beside contextual help without overlapping.

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
- The comparison top bar now follows the upstream docs header geometry: brand on
  the left, centered search trigger on desktop, top actions on the right, and a
  compact mobile header with no blank trailing grid column.
- The search trigger is functional instead of decorative. It opens a modal
  component-search dialog, filters the local component catalogue, and links to
  component routes.
- Theme and navigation chrome use exported Solid Spectrum workflow icons rather
  than CSS pseudo-icons, and the theme toggle now updates its accessible label
  whenever the resolved color scheme changes.
- The comparison ToC no longer depends on legacy global `.s2-toc` styles. Solid
  and Astro fallback markup now share the source-backed ToC structure, and the
  hydrated ToC uses an `IntersectionObserver` scroll-spy to mark the current
  section.
- The comparison footer no longer depends on legacy global `.s2-docs-footer`
  styles. Solid and fallback footers use the same divider and small link-row
  structure.
- The page ToC is now source-backed from one shared helper used by the Solid
  rail, Astro fallback rail, and mobile header picker.
- Component detail page body layout, desktop ToC rail, and mobile header/body
  chrome moved out of stale global layout CSS and into Solid Spectrum macro
  styles with explicit browser-contract sentinels.
- Mobile component pages now expose an S2 Picker for the current page's ToC in
  the header. The brand wordmark is hidden at the mobile breakpoint so the
  picker and action icons do not collide.
- Picker object-backed items now honor `getKey`/`getTextValue`; this fixes the
  mobile ToC picker using `#section` keys rather than `[object Object]`.
- Prop-control labels now use a bounded grid layout so long option names and
  contextual-help icons can wrap without visual overlap.

## Remaining Gates

- Compare every component route's interactive controls against the official
  React Spectrum docs viewer controls. Extra harness controls must be grouped
  separately or moved out of the official-looking control column.
- Replace generated source snippets with the content-pipeline source model:
  syntax highlighting, copy/open actions, and hand-authored example code from
  the upstream MDX where applicable.
- Drive page body and section order from adapted upstream MDX instead of the
  current parity-shaped sections.
- Replace the current API list with upstream-style grouped prop tables.
- Re-run light and dark visual captures after the component-control pass.
- Revisit the landing page separately; it is still not shaped like the
  upstream Spectrum 2 landing page.
- Continue page-chrome porting against upstream `Layout`, `Header`, `Nav`, and
  `VisualExample`: mobile ToC/header behavior has a first browser gate, but the
  content pipeline, route-specific body sections, search menu richness, and
  link taxonomy still need source-backed decisions.
- Decide how far the local search should follow upstream `SearchMenuTrigger`.
  Current behavior covers the comparison-app component catalogue, but upstream
  search includes richer site-wide result content and keyboard/menu behavior.
- Keep the local top links intentionally comparison-specific unless the
  information architecture changes. Upstream exposes `Docs`, `Releases`,
  `Blog`, `GitHub`, and `npm`; the comparison app currently exposes `Docs`,
  `React Spectrum`, and `npm`.
- Remove the remaining mobile-nav-panel descendant CSS once the off-canvas
  sidebar panel itself is fully ported to macro-owned styles.

## Process Note

For future component passes, the example surface gate is not only "does it
render". It must also record:

- official docs viewer controls vs local controls,
- harness-only controls and where they live,
- desktop/mobile geometry,
- light/dark theme behavior,
- generated/source-code behavior,
- React/Solid mount status,
- source-backed upstream files checked for the page/component structure,
- contract selectors or macro sentinels that protect each ported surface,
- any accepted divergence from upstream and why it remains necessary.
