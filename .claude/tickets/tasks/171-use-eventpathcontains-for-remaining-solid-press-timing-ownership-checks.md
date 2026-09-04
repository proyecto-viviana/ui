---
id: 171
type: task
title: "Use eventPathContains for remaining Solid press-timing ownership checks"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
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
