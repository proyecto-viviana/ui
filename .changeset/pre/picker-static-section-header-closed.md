---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

A closed `Picker` with static `PickerSection` children no longer shows each section's `Header` text beside its trigger. The copy of the children that registers the items while the list is closed rendered the styled `Header`; it now renders nothing there.
