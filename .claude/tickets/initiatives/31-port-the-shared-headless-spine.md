---
id: 31
type: initiative
title: "Port the shared headless spine"
created: 2026-08-20
status: in-progress
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from roadmap item headless-spine-port" }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "pattern-audit children #494 IntersectionObserver onCleanup, #495 frozen popover/Icon/hidden-select reads, #496 mergeProps-source guard; RangeSlider stays #76",
    }
---

Port shared state, selection, keyboard, focus, and slot behavior at the lowest owning layer.

## Done when

Upper components consume the shared upstream machinery. They do not copy that machinery for each widget.

## Relationship

Replaces roadmap item `headless-spine-port`.
