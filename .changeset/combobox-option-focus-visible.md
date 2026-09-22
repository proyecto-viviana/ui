---
"@proyecto-viviana/solid-spectrum": patch
---

Keep ComboBox and Picker overlay options on one focus-visible answer, as RAC `ListBoxItem` hands the same value to `listboxItem` and `checkmark`: the row fill, the row ink and the selected checkmark all read what the option hands them, and `comboBoxCheckmark` stays plain `baseColor('accent')` with no `isFocused` variant of its own. That answer now comes from the headless live modality read, so an assistive-technology click and `element.click()` show the focus ring and a real mouse click does not.
