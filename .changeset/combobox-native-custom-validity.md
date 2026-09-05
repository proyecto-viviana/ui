---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

ComboBox calls createFormValidation so isInvalid fails native constraint validation, matching RAC useComboBox via useTextField.
