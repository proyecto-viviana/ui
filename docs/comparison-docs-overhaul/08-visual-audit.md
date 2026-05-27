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

## Remaining Gates

- Compare every component route's interactive controls against the official
  React Spectrum docs viewer controls. Extra harness controls must be grouped
  separately or moved out of the official-looking control column.
- TableView still proves this gap: its example becomes very tall because our
  local controls expose more options than the upstream viewer. That is a
  component-controls parity task, not a shell-layout task.
- Replace generated source snippets with the content-pipeline source model:
  syntax highlighting, copy/open actions, and hand-authored example code from
  the upstream MDX where applicable.
- Drive page body, ToC, and section order from adapted upstream MDX instead of
  the current parity-shaped sections.
- Replace the current API list with upstream-style grouped prop tables.
- Re-run light and dark visual captures after the component-control pass.
- Revisit the landing page separately; it is still not shaped like the
  upstream Spectrum 2 landing page.

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
