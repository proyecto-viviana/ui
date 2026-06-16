---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Move real DOM focus onto the focused cell during Table keyboard navigation.

`createTable` previously chased the roving tabindex with a `queueMicrotask`
callback that looked the target up by its transient `tabindex`, which raced the
reactive tabindex memo and frequently left browser focus behind — so keyboard
row selection (ArrowDown then Space) never updated the selection because focus
had not landed on the focused row. It now commits the roving tabindex and then,
from a post-commit effect, moves focus onto the focused key's element looked up
by its stable `data-key` — mirroring React Aria's `useSelectableCollection`,
which focuses by key rather than by transient tabindex. `Table` rows and cells
now expose `data-key` so the effect (and the existing PageUp/PageDown paging)
can target them.
