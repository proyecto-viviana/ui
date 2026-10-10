---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Resolve field prefix adornment once with `children()` memo under component owner to prevent duplicate instantiation across TextField, ComboBox, NumberField, and ColorField.
