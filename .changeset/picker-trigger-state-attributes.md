---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Align Select trigger state attributes and typeahead keyboard ordering with upstream React Aria: emit `data-pressed` while open on SelectTrigger, drop invented `data-open`, `data-disabled`, `data-focus-visible` from `createSelect`'s `triggerProps`, and respect `e.defaultPrevented` for typeahead space navigation.
