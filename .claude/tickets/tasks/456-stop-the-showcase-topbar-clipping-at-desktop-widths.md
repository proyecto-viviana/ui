---
id: 456
type: task
title: "Stop the showcase topbar clipping at desktop widths"
created: 2026-09-04
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09 train: showcase topbar clips at desktop widths; distinct from T9 theme transition",
    }
---

The `/showcase` topbar clips at desktop widths. Measure `.gls-topbar-nav`
overflow and stop the clip without changing the docs theme transition.

`apps/web` only. Not `apps/comparison`. Not a package.

## Done when

The showcase topbar does not clip at desktop widths. The overflow is
measured before and after. Distinct from the pixel-art light/dark theme
transition (T9, unminted).

## Relationship

Child of #26. Distinct from #449 (viviana-ui docs entry) and from T9
(docs theme transition). Grill of T9 is unrelated.
