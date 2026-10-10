---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Unregister removed ImageCoordinator images synchronously outside the disposing Solid owner so keyed row removal can reveal surviving loaded images without an owned-scope write error.

Update Image rendering when context visibility changes, including images that start hidden and later become visible.

Retain the native image and wrapper when a scalar source changes, keeping pending replacement images and loaded siblings behind the coordinator barrier. Ignore completion events from replaced, hidden or disposed images, and invalidate queued cached completion when its source or lifecycle changes.
