---
id: 117
type: task
title: "Port PreviewTrigger"
created: 2026-08-20
parent: 25
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-80" }
---

Port the pinned RAC `PreviewTrigger` component and public export.

Read the upstream source, tests, and official docs before naming or shaping the
Solid surface. Keep state, ARIA, focus, and composition in their owning layers.

## Done when

Implementation, exports, types, docs, SSR, hydration, keyboard, pointer, focus,
accessibility, and browser evidence match upstream. Part of #82.

## Round-2 note (2026-09-01)

Delta (F-UP-011): the export exists, so `guard:rac-export-gap` is green, but local PreviewTrigger provides `PopoverTriggerContext` only with a thin overlay object (no `setOpen` / `point`) and no `PopoverContext` / `OverlayTriggerStateContext`. Do not close on the barrel name.
