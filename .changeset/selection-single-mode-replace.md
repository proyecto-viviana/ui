---
"@proyecto-viviana/solid-stately": patch
---

createSelectionState: ignore `selectionBehavior` in single selection mode

`select()` now mirrors React Aria's `useSelectableItem` `onSelect`: in single
selection mode the selection behavior is ignored, so re-selecting the currently
selected item deselects it when empty selection is allowed (and keeps it
selected when `disallowEmptySelection` is set). Previously a `"replace"`
behavior short-circuited this path and left the item selected, so a single-mode
ListBox/Menu with highlight selection could never be cleared by re-activating
its selected item.
