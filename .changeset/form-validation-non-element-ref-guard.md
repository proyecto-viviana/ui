---
"@proyecto-viviana/solidaria": patch
---

createFormValidation: guard the native-mode effect on `setCustomValidity`

The `native` validation effect now checks `'setCustomValidity' in input` before
calling it, matching `@react-aria/form` `useFormValidation`. A ref pointed at
something that isn't a true form element (e.g. a custom element) no longer
throws when the effect runs; the effect simply skips it, as upstream does.
