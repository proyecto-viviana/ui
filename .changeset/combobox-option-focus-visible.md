---
"@proyecto-viviana/solid-spectrum": patch
---

Keep ComboBox and Picker overlay options on one focus-visible answer, as RAC `ListBoxItem` hands the same value to `listboxItem` and `checkmark`: the row fill, the row ink and the selected checkmark all read what the option hands them, and `comboBoxCheckmark` stays plain `baseColor('accent')` with no `isFocused` variant of its own. A focused option paints focus-visible even where the interaction modality reads pointer, which is what keeps an assistive-technology click on S2's stops; until #612 moves that answer into the headless layer, an option focused by a real mouse click also takes the focus ring.
