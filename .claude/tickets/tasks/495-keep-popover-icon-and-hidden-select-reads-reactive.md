---
id: 495
type: task
title: "Keep popover, Icon, and hidden-select reads reactive"
created: 2026-09-07
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 Solid pattern audit: frozen shouldCloseOnInteractOutside, Icon prop snapshot, hidden-select reset reading a plain ref",
    }
---

Three frozen-read sites of the same class as the Popover 0,0 latch:

- `createPopover` snapshots `shouldCloseOnInteractOutside` once.
- Both Icon components snapshot the icon prop.
- The hidden-select form-reset effect reads a plain ref instead of the
  signal the same file maintains.

A destructured or once-read Solid getter freezes. Forward the getter, or
read it inside the effect / JSX.

## Done when

Each named site re-reads on change. A regression test fails if
`shouldCloseOnInteractOutside`, the Icon renderer, or hidden-select reset
ignores an updated value. No new snapshot of a reactive prop.

## Relationship

Child of #31. Same class as the Popover anchor-signal fix. Not #192
(lying freeze comments on `createToggleState`).
