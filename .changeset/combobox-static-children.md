---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

A `ComboBox` given static `ComboBoxItem` and `ComboBoxSection` children and no `items` now lists them. Before, its list opened holding only the "No results" row. Static items are filtered by the typed text, a section with no matching item leaves the list, and a `defaultSelectedKey` shows its text while the list is closed.
