---
"@proyecto-viviana/solidaria-components": minor
---

`TextField` now provides its `descriptionProps` / `errorMessageProps` as
`TextContext` slots (`description` / `errorMessage`) through the generic
`Provider`, mirroring react-aria-components' `TextField`. A
`<Text slot="description">` / `<Text slot="errorMessage">` child inside a
`TextField` picks up the `id` its `aria-describedby` references via the faithful
slot path. Additive: existing consumers that read these props off
`TextFieldContext` are unaffected.
