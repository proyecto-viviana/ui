---
id: 472
type: task
title: "Resolve Form validationBehavior after splitProps"
created: 2026-09-05
parent: 443
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "vp run test:ssr died on viviana-ui Form.ssr.test.tsx. #465 wrapped field props in a Proxy so splitProps would see Form validationBehavior. FormContext always owns that getter (default native), so the Proxy always wrapped. Solid's server splitProps rejects a getOwnPropertyDescriptor trap that disagrees with the target. viviana-ui TextField always owns an undefined validationBehavior getter.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2. Delete withFormValidationBehavior. Resolve RAC-style after splitProps: local ?? formContext.validationBehavior ?? native. TextField, NumberField, SearchField, Checkbox, DateField, TimeField, DatePicker.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: "SSR Form+TextField green. Form.test.tsx 26 passed including undefined-getter inherit. Field unit tests 343 passed / 2 skipped. test:ssr 20/43. test:hydrate 20/38.",
    }
---

#465 wrapped field props in `withFormValidationBehavior` so `splitProps`
would copy Form `validationBehavior` when the field owned an undefined
getter. RAC does not proxy. It reads FormContext after the field props:

`props.validationBehavior ?? formValidationBehavior ?? "native"`.

Solid's server `splitProps` enforces proxy invariants. The trap rewrote
`validationBehavior` to a `configurable: true` getter. viviana-ui
TextField already owns that property. SSR throws
`getOwnPropertyDescriptor` incompatibility.

FormContext always exposes `validationBehavior` (default `"native"`), so
the Proxy wrapped every field inside a Form, not only `aria` forms.

## Done when

`vp run test:ssr` renders viviana-ui Form+TextField. The headless Form
test still fails if a field with an undefined `validationBehavior` getter
keeps native `required` under Form `validationBehavior="aria"`. S2 Form
aria + `isRequired` still drops native `required`.

## Relationship

Child of #443. Remainder of #465 (same inherit, wrong mechanism). Distinct
from #459 (Form getter) and #189 (date SSR placeholders). Do not restyle
S2 tokens. Do not rewrite comparison.
