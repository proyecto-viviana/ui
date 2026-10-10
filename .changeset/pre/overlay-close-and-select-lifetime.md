---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Align overlay close ownership and lifetime with React Aria: settle exit animation completion without an additional animation frame, restore Dialog trigger focus through its FocusScope, and handle Modal Escape dismissal once. Keep Select listbox content mounted for the owning Popover exit lifetime and allow pointer opening while retaining keyboard focus-visible behavior.
