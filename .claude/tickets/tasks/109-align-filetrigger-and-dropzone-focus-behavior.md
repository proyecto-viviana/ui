---
id: 109
type: task
title: "Align FileTrigger and DropZone focus behavior"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-62" }
  - {
      state: open,
      at: 2026-09-01,
      note: "owner 2026-09-01: FileTrigger is a DropZone support export; it does not get a separate 10-gate catalogue page (#177)",
    }
---

Port the current FileTrigger and DropZone focus fixes.

The FileTrigger hidden input must stop click propagation. DropZone must restore
focus with native `.focus()` on its hidden button, as upstream does, instead of
`focusWithoutScrolling`.

## Done when

Browser regressions prove click propagation, focus restoration, scroll behavior,
keyboard activation, and assistive-technology behavior. Part of #82.
