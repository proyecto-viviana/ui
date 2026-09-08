---
id: 209
type: task
title: "Fill RAC render-prop fields on Select ListBox GridList Tree and items"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: open,
      at: 2026-09-08,
      note: "#508 D13 step-0 split binds M1–M4 here; wrapper/context stays #254; not M5–M8, M10, or Picker root",
    }
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

## Wave-3 D13 step-0 (2026-09-02)

ComboBox field journey step 0 diffs render-prop data attributes Solid emits
and React does not, or emits on a different node:

- `data-open` on the combobox input
- `data-open` / `data-pressed` / `data-focused` on the "Show suggestions" button
- `data-hovered` already matches; `data-focus-visible` on trigger/svg is in
  the same class

These belong on this ticket (fill RAC render-prop fields and emit the matching
`data-*`), not on #248's overlay geometry. Wrapper / context composition
(plain `Button` vs `ComboBoxButton`) stays #254.

## Bind from #508 (2026-09-08)

#508 D13 step-0 split binds **M1–M4** here (ComboBox field `data-*`):

- **M1** `ComboBoxInput` `data-open` (`ComboBox.tsx:866`); RAC `Input` has none
- **M2/M3** `ComboBoxButton` copies ComboBox `isOpen` / input `isFocused`
  (`ComboBox.tsx:952-995`); use the button’s own hover/focus/press
- **M4** ComboBox root extra `data-hovered` / `data-focus-visible`
  (`ComboBox.tsx:679-695`); RAC root is `data-focused`+`data-open` only

Wave-3 already named ComboBox input/button `data-*`. Wrapper / context
(`ButtonContext`, `GroupContext`, `SelectTrigger` → `Button`) stays #254.
S2 ComboBox `isPressed={false}` waits on #254. Does not own M5–M8, M10,
Picker root, or dropping Picker chevron `data-open` (#514).
