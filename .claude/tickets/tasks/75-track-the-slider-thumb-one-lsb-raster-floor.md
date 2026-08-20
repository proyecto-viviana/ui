---
id: 75
type: task
title: "Track the Slider thumb one-LSB raster floor"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task slider-thumb-antialias-1lsb" }
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
