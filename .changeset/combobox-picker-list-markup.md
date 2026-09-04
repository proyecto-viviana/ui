---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Route Select and ComboBox field wiring through createField so description and error ids exist only when those slots render, and stop the styled layers from minting a parallel describedby path. HelpText now renders the RAC Text / FieldError slots the way S2 does.
