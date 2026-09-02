---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Make Virtualizer context-only as RAC does: the collection element is the scroller, CollectionRoot owns the scroll view and a single content div, and the extra `[data-virtualizer]` wrapper is gone.
