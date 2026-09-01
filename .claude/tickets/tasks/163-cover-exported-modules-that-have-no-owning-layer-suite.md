---
id: 163
type: task
title: "Cover exported modules that have no owning-layer suite"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Public exports with no unit file: `createStepListState`,
`createTokenFieldState`, `createDroppableCollectionState`, Label, ElementTag,
HiddenDateInput, DragPreview. `@proyecto-viviana/ui` has two client unit
files for a full barrel.

## Work

Add real failure-mode suites at the owning layer. PreviewTrigger / TokenField
RAC ports stay on #117 / #118; this ticket is the missing tests once those
exist, plus the already-exported holes.

## Done when

Each named export has a suite that would fail if the behavior drifted.

## Relationship

F-TEST-005, F-TEST-006, F-TEST-007, F-TEST-013. Delta on #84 / #99 / #118.
