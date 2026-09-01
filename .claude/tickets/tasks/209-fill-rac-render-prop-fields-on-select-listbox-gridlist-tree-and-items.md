---
id: 209
type: task
title: "Fill RAC render-prop fields on Select ListBox GridList Tree and items"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`extract-api-reference.ts` drops `*RenderProps` as "not a component", so
this surface has no table and no guard. RAC `SelectRenderProps` includes
`isInvalid` (`[data-invalid]`); local omits it and adds `isSelected`
(`packages/solidaria-components/src/Select.tsx:105-118`). Local ListBox
props declare `layout` / `orientation` and the implementation computes
drop-target state, but `ListBoxRenderProps` lacks `isDropTarget`, `layout`,
`orientation`, `state` (`ListBox.tsx:100-109, 160-181`).
`ListBoxOptionRenderProps` omits `selectionMode`, `selectionBehavior`,
`allowsDragging`, `isDragging`, `isDropTarget`. Tree and GridList repeat the
hole. A styled `class={(rp) => …}` consumer cannot branch on invalid or
layout as RAC docs describe.

## Work

Fill each render-prop interface to RAC's field set, wire the values, and add
tests that a `class` callback receives them. Include `*RenderProps` in the
api-reference extract.

## Done when

Render-prop types match RAC for Select, ListBox, GridList, Tree and their
items; the generated reference lists them.

## Relationship

F-API-006. DnD behavior stays #84; this is the public type/value surface.
