---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

createDialog resolves its title and content ids through createSlotId, so a dialog without a title no longer points aria-labelledby at a missing element; Dialog falls back to its trigger's id reactively.
