---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Hydrate virtualized collections and element-children options over SSR markup without a mismatch: the scroll view defers its first viewport measurement until Solid has finished claiming the server window, and ListBox, ComboBox, and Select options read their children once instead of probing them for a primitive label first.
