---
id: 129
type: task
title: "Port layout-delegate page navigation"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from the completed upstream behavior sweep" }
---

Port shared PageUp and PageDown navigation for ListBox and GridList.

These components have no page navigation. A faithful port needs root-ref and
per-item geometry through the upstream layout-delegate model. Do not copy Menu's
local `clientHeight` traversal into each widget.

## Done when

The shared delegate returns page targets from real geometry, boundary keys are
consumed only when a target exists, virtualized and non-virtualized collections
match upstream, and browser evidence covers scroll containers.
