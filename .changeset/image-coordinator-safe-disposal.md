---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Unregister removed ImageCoordinator images synchronously outside the disposing Solid owner so keyed row removal can reveal surviving loaded images without an owned-scope write error.

Update Image rendering when context visibility changes, including images that start hidden and later become visible.
