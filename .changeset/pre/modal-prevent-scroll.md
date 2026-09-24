---
"@proyecto-viviana/solidaria-components": patch
---

Modal locks the page with createPreventScroll, as upstream useModalOverlay does, instead of a one-off `overflow: hidden` that joined no refcount.
