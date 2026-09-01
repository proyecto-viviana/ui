---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Align TabPanel sequential focus with React Aria. `createTabPanel` now returns
`tabIndex: undefined` when a selected panel contains a tabbable descendant,
widening the public prop type from `number` to `number | undefined`; panels
without a tabbable descendant retain `tabIndex: 0`.
