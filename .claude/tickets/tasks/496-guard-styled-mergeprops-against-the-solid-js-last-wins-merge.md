---
id: 496
type: task
title: "Guard styled mergeProps against the solid-js last-wins merge"
created: 2026-09-07
parent: 31
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 Solid pattern audit: ~40 styled files merge provider, context, and local props with solid-js mergeProps",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implement guard-styled-mergeprops: solidaria chaining at styled event-layering sites, flags split so local onPress is not double-fired, guard:idiomatic-solid third check, styled Button dual-onPress tests",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "chaining merges use solidaria; guard in idiomatic-solid family; local onPress no longer drops context onPress. Prove: vp run guard:idiomatic-solid PASS (mergeProps rule); vp test run scripts/check-idiomatic-solid.test.ts — 8 passed; vp test run packages/solid-spectrum/test/Button.test.tsx — 39 passed; vp test run packages/viviana-ui/test/Button.test.tsx — 4 passed. cwd /home/emoporemilio/projects/viviana-hub/ui. RangeSlider import+call-shape only (#76 spine untouched). Kumo out.",
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
