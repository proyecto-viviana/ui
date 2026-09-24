---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Open links by dispatching the click the browser would have produced instead of navigating, so routers, `preventDefault` and the link's own `target`/`rel` still apply, and keep one implementation of `openLink`.
