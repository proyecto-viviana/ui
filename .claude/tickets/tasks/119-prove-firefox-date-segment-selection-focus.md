---
id: 119
type: task
title: "Prove Firefox date-segment selection focus"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-84" }
---

Port the active-element guard in the date-segment `selectionchange` path.

The local handler collapses selection when its anchor is inside the segment.
Upstream also requires `getActiveElement() === ref.current`.

## Done when

Firefox browser tests prove selection changes inside and outside the active
segment, with keyboard and pointer focus, and other browsers do not regress.
Part of #82.
