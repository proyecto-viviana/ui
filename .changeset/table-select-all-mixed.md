---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Match RAC Select All mixed state: `isIndeterminate` is `!isEmpty && !isSelectAll`, and the native checkbox re-applies `indeterminate` after `checked` writes so Chromium keeps `[checked=mixed]`.
