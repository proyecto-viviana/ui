---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Match RAC ToastContent: the toast message is `role="alert"` (aria-atomic, hidden until mounted). S2 and Viviana render the headless ToastContent instead of a raw div.
