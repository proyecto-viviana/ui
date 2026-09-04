---
"@proyecto-viviana/solidaria": patch
---

Keep ActionGroup host `role` and `aria-orientation` live when `selectionMode` or `orientation` change after mount. Nested toolbar detection writes a signal the getters read instead of one-shot `setAttribute`.
