---
id: 77
type: task
title: "Track the Form side-label raster floor"
created: 2026-08-20
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from legacy task form-side-label-halfpixel-baseline",
    }
---

Keep the Form `labelPosition="side"` pixel waiver limited to the measured
one-pixel glyph translation caused by a half-pixel baseline.

React and Solid have matching DOM, CSS, text ink range, and live and cloned
geometry. The current scenario-only waiver uses `maxMismatchRatio: 0.006`,
`maxDimensionDelta: 0`, and `pixelThreshold: 0`; the worst observed mismatch is
0.49 percent.

## Done when

Re-run the evidence after a relevant field-label change. Remove the waiver if
the baseline becomes byte-exact. Otherwise retain it with current measured
evidence.

## Relationship

Replaces `form-side-label-halfpixel-baseline` from
`.claude/current/tech-debt.md`.
