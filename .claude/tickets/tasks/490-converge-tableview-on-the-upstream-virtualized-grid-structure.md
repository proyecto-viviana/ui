---
id: 490
type: task
title: "Converge TableView on the upstream virtualized grid structure"
created: 2026-09-07
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "opened when #89 was decided by Rule #2 under the owner's 2026-09-07 delegation; owns the convergence #89 only had to decide",
    }
---

Decision (2026-09-07, recorded in `.claude/current/steering.md`): TableView
converges on upstream. The native `<table>` is not a local architecture.

## Evidence

- React Spectrum S2 `TableView` (pin 1.5.1,
  `react-spectrum/packages/@react-spectrum/s2/src/TableView.tsx:535`) always
  renders inside `<Virtualizer layout={S2TableLayout}>`. There is no
  non-virtualized branch.
- RAC `Table` renders `<div>` for every table element whenever `isVirtualized`
  (`react-aria-components/src/Table.tsx:1060`) and a native `<table>` only when
  it is not. S2 therefore ships `div[role="grid"]` with absolutely positioned
  rows and cells, `display: grid`/`flex` sub-structure and a sticky header.
- `packages/solid-spectrum/src/table/index.tsx` renders a native
  `<table>`/`<thead>`/`<tbody>` tree with spacer-row virtualization and no
  Virtualizer. That is why `apps/comparison/e2e/certified/tableview.certified.spec.ts`
  is D6-only: D1/D2/D3 diff the computed `display` and raster of a structure
  upstream never produces. The current exclusions are not certification.

## What already exists

- `solidaria-components` `TableHost` (`src/Table.tsx:144`) already renders
  `<div>` when `virtualized` is set, mirroring RAC.
- `Virtualizer` and `VirtualizerLayouts.ts` exist, but
  `TableLayout extends ListLayout {}` (`VirtualizerLayouts.ts:238`) is an empty
  subclass, not a port of react-stately `layout/TableLayout.ts` (column widths,
  header/body/row rects, sticky header, `buildCollection` body width).

## Structure

1. Port `TableLayout` for real in `solidaria-components` (lowest owning
   layer), with unit tests mirroring upstream's TableLayout coverage.
2. Port `S2TableLayout` and move `solid-spectrum` TableView onto
   `<Virtualizer layout={S2TableLayout}>`; delete spacer-row virtualization.
3. Re-run the TableView certification with the full driver set (D1–D5 back
   in), same waiver policy as the other Tier-4 collections; keep D6.

## Done when

- TableView renders `div[role="grid"]` through the Virtualizer with S2's
  row/cell structure and sticky header.
- `tableview.certified.spec.ts` no longer scopes out paint and focus drivers;
  its note no longer cites the native table.
- #89's exclusions are gone from the certification record (#194).

## Relationship

Child of #24. Owns the work #89 decided. Scheduled after the 2026-09 release
(#443); not part of it.
