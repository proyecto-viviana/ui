---
"@proyecto-viviana/solidaria-components": patch
---

DatePicker and DateRangePicker trigger buttons wrote their interaction state
through the `attr:` JSX namespace, which reached the DOM verbatim as
`attr:data-focused` instead of compiling away to `data-focused`. No selector
matching `data-hovered`, `data-focused`, `data-focus-visible` or `data-pressed`
could match either trigger, so styled siblings never painted hover, focus ring
or pressed state on them. The eight props now use the house idiom,
`data-focused={dataAttr(isFocused())}`, as every other component does.
