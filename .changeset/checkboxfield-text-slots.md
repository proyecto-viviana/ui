---
"@proyecto-viviana/solidaria": minor
"@proyecto-viviana/solidaria-components": minor
---

Make `CheckboxField` help text faithful to upstream react-aria-components. The
`description` / `errorMessage` props are dropped; `CheckboxField` now provides
`TextContext` description/errorMessage slots so a child `<Text slot="description">`
or `<FieldError>` resolves the id that the checkbox's `aria-describedby` references.
`createCheckbox` / `createCheckboxGroupItem` now expose `descriptionProps` /
`errorMessageProps` and bake the slot ids into the input's `aria-describedby`
(grouped items keep their own describedby and append the group's shared ids,
mirroring `useCheckboxGroupItem`). The deprecated `Checkbox` monolith keeps its
prop-based help text.
