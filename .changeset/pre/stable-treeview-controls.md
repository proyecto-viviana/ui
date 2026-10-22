---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Keep TreeView rows and their controls mounted by item key across collection rebuilds, including controlled focus changes. Preserve row state and in-flight button presses while keeping item data, expansion render state, and expand-button labels reactive. Avoid seeding keyboard entry focus when a pointer focuses a row, so a first-key delegate query cannot override the pointer's controlled focus change.
