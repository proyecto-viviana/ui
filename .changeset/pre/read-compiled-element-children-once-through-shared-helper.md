---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Read compiled element children once through shared helper evaluateRenderChildren across headless and styled components, preventing double-evaluation and hydration key drift under SSR.
