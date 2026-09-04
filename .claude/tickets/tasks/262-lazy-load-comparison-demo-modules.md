---
id: 262
type: task
title: "Lazy-load per-slug demo modules in comparison component-controls"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "production leftover of #250 / overlap with #255 item 3: component-controls.ts still statically imports 64 *-demo modules on every component page",
    }
---

`apps/comparison/src/data/component-controls.ts` statically imports **64**
`*-demo` modules. `component-example-section-mount.tsx` always imports
`initializeComparisonControls` before the lazy `react-mount` / `solid-mount`.
Every component page hydrates a controls chunk that knows every slug's demo
defaults.

## Why

#250 cut giant `react-mount` / `solid-mount` chunks. Preview JS is still
2.12 MB / 265 files on picker because the controls graph is not per-slug.
#255 named this as a **dev** work item; the production effect is this ticket.

## Do not

- Fold this into #255 or start #255 without the owner.
- Patch S2 styling to hide the cost.

## Done when

A Button page does not parse ComboBox/TableView/ColorWheel demo modules.
Production preview JS request count for one slug is recorded against today's
265-file picker baseline.

## Relationship

Child of #26. Production sibling of #255 item 3. Surfaced by #259.
