---
"@proyecto-viviana/solidaria": minor
"@proyecto-viviana/solidaria-components": minor
---

Make `RadioField` help text faithful to upstream react-aria-components. The
per-option `description` / `errorMessage` props are dropped; `RadioField` now
provides a `TextContext` description slot so a child `<Text slot="description">`
resolves the id that the radio's `aria-describedby` references. `createRadio`
exposes `descriptionProps` and bakes the slot id into the input's
`aria-describedby` in upstream order (the user's own describedby, the radio's own
description, then the group's invalid error message and shared description),
mirroring `useRadio`. Radios have no per-option error slot — errors are reported
at the group level. The deprecated `Radio` monolith keeps its prop-based help
text.
