---
id: 169
type: task
title: "Render SelectBox slot styles at render and keep item children reactive"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`SelectBoxContent` uses `resolveChildren` and `createEffect` +
`querySelectorAll` to stamp illustration/label/description classes. Server
markup has slot attributes; first paint can miss generated layout classes.

## Work

Assign slot classes at render. Stop snapshotting authored children through
`children()`.

## Done when

SelectBox SSR HTML includes the layout classes, and mixed text children stay
reactive after hydration.

## Relationship

F-SOLID-008. Same class as #102 (Tree/GridList), different component.
