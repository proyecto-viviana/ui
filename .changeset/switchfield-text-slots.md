---
"@proyecto-viviana/solidaria": minor
"@proyecto-viviana/solidaria-components": minor
---

SwitchField now mirrors upstream react-aria-components exactly for help text.
`createToggle`/`createSwitch` mint `descriptionProps`/`errorMessageProps` (slot
ids) and bake the combined `aria-describedby` into the input, and `SwitchField`
exposes those ids through `TextContext` slots.

Breaking: `SwitchField` no longer accepts `description` / `errorMessage` props.
Render the help text as children instead — `<Text slot="description">…</Text>`
and `<FieldError>…</FieldError>` — matching upstream. The legacy `ToggleSwitch`
monolith is unchanged.
