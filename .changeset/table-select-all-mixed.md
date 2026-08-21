---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/ui": patch
---

Match RAC Select All state transitions. The shared grid state now recognizes an
explicit full selection and can deselect a row from the `"all"` selection. The
native checkbox also reapplies `indeterminate` after `checked` writes so
Chromium keeps `[checked=mixed]`.
