---
id: 112
type: task
title: "End Table resize through the move lifecycle"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-70" }
  - {
      state: verified,
      at: 2026-09-26,
      note: "routed column resize through createMove and createPress lifecycle with mouse, touch, click, hold, cancel, blur, and unmount cleanup coverage",
    }
---

Route Table column-resize completion through the shared move lifecycle.

The local handle ends resize on `pointerup`. Upstream ends mouse and touch resize
through `useMove.onMoveEnd`, which also covers click and hold paths.

## Done when

Mouse, touch, click, hold, cancel, and cleanup tests prove that resize never
remains active. Include a real-browser stuck-after-hold regression. Part of #82.
