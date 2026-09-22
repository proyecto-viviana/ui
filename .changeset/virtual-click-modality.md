---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solid-spectrum": patch
---

Treat an untrusted `detail: 0` click as virtual interaction modality, as react-aria does, so an assistive-technology click and `element.click()` show a focus ring. An option's focus-visible answer is now the live modality read `useOption` makes: the option is focused, the collection is focused, and the global modality is not pointer. ComboBox and Picker options take that answer from the option render props; a real mouse click stays pointer and does not paint the focus ring.
