---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Stop createUIIcon from consuming IconContext. S2 ui-icons never pass through Icon.tsx, so ComboBox/Picker/Menu checkmarks stay raw svgs in the checkmark grid cell instead of inheriting the item IconContext wrapper.
