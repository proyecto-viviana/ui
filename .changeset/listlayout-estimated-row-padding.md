---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Honor ListLayout `estimatedRowHeight` and `padding`, observe measured row size, and position VirtualizerItem from layoutInfo. ComboBox and Picker listboxes match S2 `padding: 0` so the 8px inset lives in the layout, not CSS.
