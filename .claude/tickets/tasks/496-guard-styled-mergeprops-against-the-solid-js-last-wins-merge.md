---
id: 496
type: task
title: "Guard styled mergeProps against the solid-js last-wins merge"
created: 2026-09-07
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 Solid pattern audit: ~40 styled files merge provider, context, and local props with solid-js mergeProps",
    }
---

Headless utils document that provider + context + local props need
solidaria's chaining `mergeProps`. About forty styled files import
`mergeProps` from `solid-js`, which is last-wins, so a local handler
silently drops a context handler.

This is a lint / guard, not a one-off edit. RangeSlider layering stays
#76.

## Work

1. Inventory every styled `mergeProps` import and classify chaining vs
   last-wins.
2. Switch the chaining sites to solidaria `mergeProps`.
3. Add a guard that fails a styled file that merges event props with
   `solid-js/mergeProps`.

## Done when

Chaining merges use solidaria. The guard is in `vp run check` or the
idiomatic-solid family. A local `onPress` no longer drops a context
`onPress`.

## Relationship

Child of #31. Coordinate with `guard:idiomatic-solid`. Does not change
#76.
