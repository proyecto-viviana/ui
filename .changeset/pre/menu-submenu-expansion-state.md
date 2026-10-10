---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria-components": patch
---

Track nested menu expansion with a root expanded-submenu stack: opening a sibling replaces deeper entries, closing a submenu removes its descendants, and closing the root clears the stack. Controlled and default-open SubmenuTrigger paths retain independent overlay state.
