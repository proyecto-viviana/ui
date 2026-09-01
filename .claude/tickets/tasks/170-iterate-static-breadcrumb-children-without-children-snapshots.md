---
id: 170
type: task
title: "Iterate static Breadcrumb children without children snapshots"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Headless Breadcrumbs static path does `resolveChildren(() => props.children)`
and `toArray()` before wrapping each child in `<li>`. Styled BreadcrumbItem
already captures children once; the headless static path undoes that.

## Work

Walk static children without recursively snapshotting mixed text.

## Done when

Reactive labels inside static Breadcrumb items update after hydration.

## Relationship

F-SOLID-009.
