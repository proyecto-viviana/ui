---
id: 121
type: task
title: "Add Switch field positioning context"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-89" }
---

Port the S2 Switch field `position: relative` style from the pinned source.

Use the S2 style macro and source token structure. Do not patch the comparison
app or hand-author a screenshot fix.

## Done when

The generated style matches upstream and computed, visual, size, density,
interaction, and installed-consumer evidence passes. Part of #82.
