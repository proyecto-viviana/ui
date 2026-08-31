---
id: 66
type: task
title: "Port ListView windowing to the S2 Virtualizer"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task listview-virtualizer-subpixel" }
---

Wrap ListView with the upstream S2 `Virtualizer` and `S2ListLayout`.

S2 places each row in an absolute, integer-snapped presentation wrapper. The
port flows rows directly in the grid. A local `z-index: 0` fixed the escaped
selection-fill layer, but bordered checkbox cases retain a small subpixel
raster difference. The current waiver is
`listview-virtualizer-subpixel` with `maxMismatchRatio: 5e-4`.

## Done when

The port uses the upstream row-windowing structure, behavior remains correct,
the affected strict pixel cases become byte-exact, and the waiver is removed.

## Relationship

Replaces `listview-virtualizer-subpixel` from `.claude/current/tech-debt.md`.
