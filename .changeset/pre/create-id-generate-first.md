---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

Generate an id in `createId` even when a default id is given, so a component that takes an `id` prop no longer shifts every id generated after it.
