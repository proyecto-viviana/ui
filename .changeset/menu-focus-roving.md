---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Move real DOM focus onto the focused item during Menu keyboard navigation.

Arrow/Home/End keys flipped each item's `tabIndex` (the declarative half of
roving tabindex) but never called `element.focus()`, so the keyboard cursor and
the assistive-technology cursor never moved off the menu container — making the
Menu unusable with a screen reader. `createMenuItem` now imperatively focuses
the item's element when it becomes the collection's focused key (and the menu is
focused), mirroring React Aria's `useSelectableItem`. `Menu` wires the item ref
through to the behavior, including the inner anchor for link items.
