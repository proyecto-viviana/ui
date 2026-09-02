---
"@proyecto-viviana/solidaria-components": patch
---

Popover renders a render-prop child once over a getter view of its render values instead of re-creating the subtree when `placement`, `isEntering`, or `isExiting` change. An S2 Menu inside a Popover kept losing its focused item ~200 ms after opening, when the enter animation settled and the menu was rebuilt.
