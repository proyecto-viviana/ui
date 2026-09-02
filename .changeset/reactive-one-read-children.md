---
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
"@proyecto-viviana/kumo": patch
---

Keep direct reactive children live in ComboBox option, Picker item, StatusLight,
and Kumo Button: the single children read is a tracked memo, so hydration keys
stay aligned and `{label()}` content follows its signal.
