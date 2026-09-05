---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

NumberField calls createFormValidation and native min/max/step validity so isInvalid and out-of-range values block submit, matching RAC useNumberField.
