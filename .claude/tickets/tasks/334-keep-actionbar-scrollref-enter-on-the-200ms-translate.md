---
id: 334
type: task
title: "Keep ActionBar scrollRef enter on the 200ms translate"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionbar functional pass: live selectedItemCount 0→3 with useScrollRef slides S2 from translateY 100% through ~94% at 50ms and ~39% at 100ms to 0px -8px at 200ms. Solid paints calc(0% - 8px) at t0 and 0px -8px by 16ms. isEntering is cleared on one rAF so the isEntering:full class never holds. Settled geometry and the 200ms exit match",
    }
---

S2 ActionBar with `scrollRef` enters through
`useEnterAnimation(objectRef, !!scrollRef)`: `isEntering` stays true
until the CSS translate from `full` to `-8px` actually runs (~200ms).

Solid Spectrum ActionBar sets `isEntering` true then clears it on the
next animation frame
(`packages/solid-spectrum/src/actionbar/index.tsx` enter effect). The
`isEntering: "full"` style is gone before a frame paints, so the bar
pops in at rest instead of sliding up.

Exit already matches: both keep "3 selected", `translate` moves, and
the toolbar unmounts by ~450ms.

## Evidence

`http://127.0.0.1:4341/components/actionbar/?selectedItemCount=0&useScrollRef=true`,
islands mounted, one panel at a time. Dispatch
`comparison:controls-change` `{ selectedItemCount: 3, useScrollRef: true }`.

| t | React translate | Solid translate |
|---|---|---|
| hidden | (no bar) | (no bar) |
| 0ms | `0px 100%` | `0px calc(0% - 8px)` |
| 16ms | `0px 100%` | `0px -8px` |
| 50ms | `0px calc(94.3902% - 0.448784px)` | `0px -8px` |
| 100ms | `0px calc(38.6571% - 4.90743px)` | `0px -8px` |
| 200ms | `0px -8px` | `0px -8px` |

Both keep `transitionDuration: 0.2s` / `transitionProperty` including
`translate`. Settled scroll geometry matches (`absolute`, `bottom 0`,
`insetInlineEnd 25px`, bar 330×60). Direct (no `scrollRef`) bars have
no enter indicator on either stack.

## Done when

A `scrollRef` 0→3 enter holds Solid `isEntering` until the 200ms
translate from `full` to `-8px` has run, matching S2 frame-for-frame
enough that a 50ms/100ms snapshot is still mid-slide. A comparison
route walk fails if Solid is already at `0px -8px` by 16ms.

## Relationship

Child of #24. Found by #260. Distinct from #251 (headless Popover
enter/exit) and #64 (Tooltip overlay). The contract spec only asserts
transition *properties*, not that enter actually plays. Do not start
#254.
