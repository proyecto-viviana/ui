---
"@proyecto-viviana/solidaria-components": patch
---

Load-more sentinels now disconnect IntersectionObservers on effect cleanup so observers do not leak on rerun or unmount.
