---
"@proyecto-viviana/solidaria": patch
---

createListBox: only swallow Escape when it clears a selection

Escape handling now mirrors React Aria's `useSelectableCollection`: it calls
`preventDefault`/`stopPropagation` and clears the selection only when there is
actually a selection to clear and empty selection is allowed. Previously
`createListBox` called `preventDefault` on every Escape, so a ListBox rendered
inside a popover, combobox, or dialog swallowed Escape even when nothing was
selected — preventing the enclosing overlay from closing. It also now stops
propagation when it does clear, so an Escape that clears the selection no longer
also bubbles up to close the overlay.
