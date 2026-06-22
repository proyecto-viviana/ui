---
"@proyecto-viviana/solidaria-components": minor
---

ComboBox, DatePicker, and DateRangePicker now provide their description and
errorMessage as TextContext slots, so a `<Text slot="description">` /
`<Text slot="errorMessage">` child resolves the id its `aria-describedby`
references — mirroring upstream react-aria-components field wiring. The existing
per-component description/error sub-components are unchanged.
