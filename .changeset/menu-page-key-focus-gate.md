---
"@proyecto-viviana/solidaria": patch
---

`createMenu`: gate PageUp/PageDown on a focused key

Mirror `useSelectableCollection`, which only enters its Page-key block — and
only `preventDefault`s — when a key is focused. The menu's PageUp/PageDown
handlers previously called `preventDefault()` unconditionally, so with nothing
focused they swallowed the key while doing nothing, instead of letting it bubble
to scroll an enclosing region (the same gap its arrow keys were already fixed
for). They now read the focused key first and bail before `preventDefault` when
none is set; the existing focused-key paging is unchanged (a non-empty
collection always yields a page target, so a focused key still moves focus and
swallows the event).
