---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Breadcrumbs no longer seeds its overflow-measurement signal from `window`, so the client's first render matches the server's and the hidden measurement copy arrives in a post-hydration update instead of throwing `Hydration Mismatch. Unable to find DOM nodes for hydration key`.
