---
"@proyecto-viviana/solidaria": patch
---

createMenu: only consume navigation keys that move focus

ArrowDown/ArrowUp now call `preventDefault` only once a target item is found,
so a Menu at the first/last item without wrapping leaves the arrow alone to
bubble instead of swallowing it — matching React Aria's
`useSelectableCollection` and the same fix just applied to `createListBox`.
Home and End also leave the event untouched when Shift is held with nothing
focused. (Menu's geometry-based PageDown/PageUp are unchanged for now.)
