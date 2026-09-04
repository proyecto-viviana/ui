---
id: 75
type: task
title: "Track the Slider thumb one-LSB raster floor"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task slider-thumb-antialias-1lsb" }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 slider: isolated inner-knob rest matches 20×20 white 2px on both; SNAP 6×22 vs 20×20 was a selector artifact (role=slider container vs inner knob). 1LSB raster not observed as user-visible this pass. No new id.",
    }
---

Keep the strict Slider pixel waiver limited to one 8-bit channel step on the
anti-aliased thumb edge.

Computed styles and geometry match upstream. The current waiver sets
`maxMismatchRatio: 0`, `maxDimensionDelta: 0`, and `pixelThreshold: 1`; it still
fails any channel difference of two or more and any size change.

## Done when

Re-run this evidence after #74 or another relevant thumb-paint change. Remove
the waiver if the edge becomes byte-exact. Otherwise retain it as the measured
raster floor with current evidence.

## Relationship

Replaces `slider-thumb-antialias-1lsb` from
`.claude/current/tech-debt.md`.
