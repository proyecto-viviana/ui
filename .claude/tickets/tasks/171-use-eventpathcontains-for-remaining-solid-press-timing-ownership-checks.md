---
id: 171
type: task
title: "Use eventPathContains for remaining Solid press-timing ownership checks"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: verified,
      at: 2026-10-06,
      note: "Exported eventPathContains from solidaria utils/dom.ts and utils/index.ts, migrated createHover, createActionGroup onKeyDown, createKeyboard shortcut handlers, createDatePickerGroup onKeyDown, createSelectableCollection onFocusIn, and createCollectionRowInteraction shouldIgnoreRowEvent to eventPathContains. Added regression tests across all ownership check areas verifying in-target handling when a child replaces the target mid-bubble.",
    }
---

## Cause

`createPress` already falls back to `event.composedPath()` when a child
replaces the target mid-bubble. `createHover`, ActionGroup / keyboard /
date-segment keydown, selectable-collection `focusin`, and collection-row
`shouldIgnoreRowEvent` still use live `nodeContains` only.

## Work

Use the same `eventPathContains` helper at those ownership checks. Add a
regression where a child handler replaces the target mid-bubble.

## Done when

Those handlers still treat the original in-target action as in-target.

## Relationship

F-SOLID-010. patterns.md DOM Event Paths adapter.
