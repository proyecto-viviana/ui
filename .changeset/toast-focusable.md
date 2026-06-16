---
"@proyecto-viviana/solidaria": patch
---

Make the toast container keyboard-focusable (tabIndex: 0).

`createToast` now includes `tabIndex: 0` in `toastProps`, matching
`@react-aria/toast` 3.48.0's `useToast` output. The `role="alertdialog"`
container must be focusable so keyboard users and F6 landmark navigation can
move focus into a toast to interact with its close button and read its content.
