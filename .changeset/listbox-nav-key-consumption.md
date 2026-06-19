---
"@proyecto-viviana/solidaria": patch
---

createListBox: only consume navigation keys that move focus

Arrow-key handling now mirrors React Aria's `useSelectableCollection`: it calls
`preventDefault` only once a target key is found, so a ListBox at the
first/last item without wrapping (or an empty one) leaves the arrow alone to
bubble — e.g. to scroll an enclosing region — instead of swallowing it.
Previously every Arrow/Home/End press called `preventDefault` unconditionally.
Home and End now also leave the event untouched when Shift is held with nothing
focused, matching upstream's no-anchor early return.
