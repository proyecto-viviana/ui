---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Preserve accurate source maps when the package build removes generated macro
CSS imports from JSX output. Package builds now fail if a transform reports a
broken source map.
