---
id: 154
type: task
title: "Match upstream collection children types on Select ListBox GridList TagList"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

Published RAC types require an `items` array. ListBox / GridList / TagList
require a `(item: T) => JSX.Element` child. Upstream CollectionProps makes
`items` optional and accepts static children. Local ListBox then calls
`stateProps.items.some(...)` with no optional chaining.

## Work

Match upstream collection children types and the runtime that serves them.

## Done when

Static-children Select / ListBox / GridList / TagList type-check and run.

## Relationship

F-TS-002. Broader than #43 (Picker) and not #125 (mode generic `M`).
