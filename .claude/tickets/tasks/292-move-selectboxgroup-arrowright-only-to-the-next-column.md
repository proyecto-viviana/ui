---
id: 292
type: task
title: "Move SelectBoxGroup ArrowRight only to the next column"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 selectboxgroup functional pass: default horizontal cards wrap to one column; React ArrowRight is a no-op, Solid moves to the next option",
    }
---

S2 SelectBoxGroup is a `ListBox` with `layout="grid"`. In a wrapped
horizontal grid (one visual column), ArrowRight must stay on the current
item; ArrowDown moves to the next row. Solid ArrowRight walks collection
order like a horizontal stack.

## Evidence

`http://127.0.0.1:4341/components/selectboxgroup/` — default
`orientation=horizontal`. The 368px cards fill the canvas, so the group
is `grid-template-columns: 368px` / two 84px rows.

Isolated Tab onto Starter, then ArrowRight:

- React: focus stays on Starter (`tabIndex=0`, `data-focused` +
  `data-focus-visible`, 2px focus ring).
- Solid: focus moves to Pro.

ArrowDown, ArrowUp, Home, End, ArrowLeft, and vertical
`?orientation=vertical` ArrowRight (no-op) already match.

`createSelectableList` constructs `ListKeyboardDelegate` without `layout`,
so it defaults to `stack`. `createListBox` also never forwards `layout`.
The host still emits `data-layout=grid`.

## Done when

On the default comparison SelectBoxGroup, ArrowRight does not leave
Starter when the cards are stacked in one column, matching React.
ArrowDown still reaches Pro. A test fails if `layout="grid"` +
`orientation="horizontal"` treats ArrowRight as next-in-collection.

## Relationship

Child of #24. Found by #260. ListBox family keyboard; observed on
SelectBoxGroup. Distinct from #290 (disabled-item skip). Do not start
#254.
