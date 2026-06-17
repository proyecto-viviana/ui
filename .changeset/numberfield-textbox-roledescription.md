---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solid-spectrum": patch
---

NumberField a11y: render the input as a textbox, not a spinbutton

**solidaria / createNumberField**: mirror upstream `useNumberField`, which wraps `useSpinButton` but deliberately overrides its output — `role: null` plus `aria-valuenow/min/max/text: null` — because a `spinbutton` cannot be focused with VoiceOver. The input is now a plain `textbox` inside the existing `role=group` wrapper, with `aria-roledescription="number field"`; the formatted value is announced through the input's own value. Previously we leaked the raw spinbutton semantics (`role="spinbutton"` + `aria-value*`), diverging from `@react-aria/numberfield` `useNumberField.ts`.

**solidaria-components / NumberField** and **solid-spectrum / NumberField** inherit the corrected contract: their rendered input now exposes `role=textbox` (queryable as such) rather than `spinbutton`. Date/time-segment spinbuttons are unaffected.
