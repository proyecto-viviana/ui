---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Keep ActionButton and Badge dynamic text children reactive through server rendering and hydration. Cache child accessors under their owning slot so mixed text updates preserve static siblings and live node identity.
