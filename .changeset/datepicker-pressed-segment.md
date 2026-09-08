---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solid-spectrum": patch
"@proyecto-viviana/ui": patch
---

Stop nested DatePicker trigger presses from focusing a field segment, and restore `data-pressed` on the DateRangePicker calendar button. `createPress` now stopPropagates an already-pressed pointerdown the way RAC `usePress` does; S2 `calendarButton` takes live `isPressed` from render props like `inputButton`.
