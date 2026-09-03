---
"@proyecto-viviana/solidaria-components": patch
---

Menu stays mounted while its Popover is exiting and no longer restores trigger focus itself, matching RAC MenuInner. Escape then ArrowUp focuses the last item after the overlay unmounts.
