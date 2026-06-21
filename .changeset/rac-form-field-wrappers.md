---
"@proyecto-viviana/solidaria-components": minor
---

Add the RAC 1.19 form-field split: `SwitchField`/`SwitchButton`/`SwitchFieldContext`, `CheckboxField`/`CheckboxButton`/`CheckboxFieldContext`, `RadioField`/`RadioButton`/`RadioFieldContext`

Upstream `react-aria-components` 1.19 split each monolithic Switch / Checkbox /
Radio into a `*Field` wrapper (owns toggle state, validation, and help text) that
contains a `*Button` control (the clickable label + indicator). The nine names
are now exported from `@proyecto-viviana/solidaria-components`, closing the
`guard:rac-export-gap` shortfall (0 RAC names missing).

The split is faithful to upstream's component contract — same render-prop shapes
(`isSelected`/`isDisabled`/`isReadOnly`/`isInvalid`/`isRequired`, plus
`isIndeterminate`/`isPressed` where upstream exposes them), `data-*` attributes,
and `description`/`errorMessage` bridged onto `aria-describedby`. Because our
`<Provider>` is a no-op and `TextContext` is inert (the tracked `port-context-slots`
debt), the field→button handoff uses a native context (`Internal*Context`) read
inside the provider via the proven `Show … keyed` owner pattern rather than
upstream's `Provider values={…}` slot mechanism. The deprecated monolith
wrappers (`ToggleSwitch`, `Checkbox`, `Radio`) remain the styled primaries.
