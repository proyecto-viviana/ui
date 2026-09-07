---
id: 494
type: task
title: "Disconnect collection IntersectionObservers on cleanup"
created: 2026-09-07
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 Solid pattern audit: Tree, Table, GridList, ListBox, and Menu return a disconnect function from an effect, which Solid ignores",
    }
---

Five headless collection hosts return a disconnect function from `createEffect`.
Solid ignores that return value, so old `IntersectionObserver` instances leak
on rerun. The fix is `onCleanup`, matching how Solid tears down effects.

Do not invent a different observer lifecycle than upstream. Port the
disconnect into `onCleanup` at the same sites.

## Done when

Tree, Table, GridList, ListBox, and Menu disconnect observers in
`onCleanup`. A regression test or guard fails if a collection effect
returns a function instead of registering cleanup. No observer leak on
collection rerun.

## Relationship

Child of #31. Pattern-audit follow-up to the 2026-09-07 evaluation.
Does not fold RangeSlider (#76) or mergeProps source (#496).
