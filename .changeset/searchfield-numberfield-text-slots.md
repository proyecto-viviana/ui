---
"@proyecto-viviana/solidaria-components": minor
---

SearchField and NumberField now provide their description and errorMessage as
TextContext slots, so a `<Text slot="description">` / `<Text slot="errorMessage">`
child picks up the id its `aria-describedby` references — mirroring upstream
react-aria-components field wiring.
