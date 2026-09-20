---
"@proyecto-viviana/solidaria": patch
---

FocusScope reads the `data-solidaria-top-layer` attribute the toast region actually sets, and regains upstream's active-scope tracking so `createOverlay` no longer closes when focus moves into a child scope, such as a menu inside a dialog.
