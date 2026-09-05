---
id: 465
type: task
title: "Drop native required when Form validationBehavior is aria"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the D14 form aria-required-empty row. React drops native required when Form validationBehavior is aria; Solid still sets it, so valueMissing still fires. Headless Form+TextField already inherits. S2 TextField always owns a validationBehavior getter that returns undefined, and splitProps takes that descriptor instead of the Form-context Proxy.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Wrap existing validationBehavior descriptors in withFormValidationBehavior so splitProps sees the Form fallback. S2 TextField only injects validationBehavior when validationState is set, matching upstream S2.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "S2 Form aria + inherited or local isRequired no longer sets native required. Package tests: Form/TextField 125 passed (spectrum + headless).",
    }
---

D14 `form` / `aria-required-empty` passes `validationBehavior=aria` and
`isRequired` on the S2 Form. React RAC TextField reads FormContext and
omits native `required`. Solid S2 TextField always merges

`validationBehavior: headless ?? (validationState ? "aria" : undefined)`.

That own getter is `undefined` when `validationState` is unset.
`splitProps` copies the raw descriptor and never hits the Form-context
Proxy `get` trap. `createTextField` then defaults to native and sets
`required`, so `valueMissing` still fires.

Headless `Form` + `TextField` already passes. The comparison fixture is
the S2 path.

## Done when

S2 `Form validationBehavior="aria"` plus inherited or local `isRequired`
does not set native `required` and does not report `valueMissing`. A
package test fails if the input stays `required`.

## Relationship

Child of #24. Distinct from #383 (HelpText after blocked native submit)
and #459 (Form `validationBehavior` is a getter). Do not treat SearchField
or Checkbox as this ticket.
