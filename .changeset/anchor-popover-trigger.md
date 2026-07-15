---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/ui": patch
---

Fix overlay positioning so Popover-based components (Picker, ComboBox, DatePicker, Menu) anchor to their trigger instead of rendering at the viewport origin. The popover ref is now a reactive signal, so the position effect re-runs once the overlay's portal node mounts — matching React Aria's layout-effect timing.
