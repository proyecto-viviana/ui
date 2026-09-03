---
id: 355
type: task
title: "Set native custom validity on Checkbox when isInvalid"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 checkbox functional pass: URL ?isInvalid=true leaves React input.validity.customError=true, checkValidity=false, :invalid, validationMessage Invalid value., requestSubmit blocked; Solid stays valid and submits. RAC useToggle calls useFormValidation; Solid createToggle does not",
    }
---

S2 Checkbox default `validationBehavior` is native. RAC `useToggle`
calls `useFormValidation`, which `setCustomValidity` when `isInvalid`
is true, so an unchecked invalid checkbox still fails HTML constraint
validation and blocks form submit.

Solid `createToggle` sets `aria-invalid` and native `required`, but
never calls `createFormValidation`. The comparison-route invalid
label `data-invalid` still matches. Native validity does not.

`createFormValidation` already exists
(`packages/solidaria/src/form/createFormValidation.ts`) and is used
by DateField / HiddenSelect. TextField is #351; Checkbox is this hook.

## Evidence

`http://127.0.0.1:4341/components/checkbox/?isInvalid=true`, islands
mounted. Injected `form[data-fp-form]` + `requestSubmit`.

| | React | Solid |
|---|---|---|
| `checkValidity()` | false | true |
| `:invalid` | true | false |
| `validationMessage` | `Invalid value.` | `""` |
| `validity.customError` | true | false |
| injected form `requestSubmit` | blocked, focus stays on the input | submits `{}` |

`?isInvalid=true&isDisabled=true` skips custom validity on both
(`checkValidity()===true`). Empty `?isRequired=true` `valueMissing`
blocks submit on both. `validationBehavior=aria` required submits on
both (`required=false`, `aria-required=true`).

The extra React error-icon HelpText row (109×52 vs 18px) is #70, not
this native-validity hole.

## Done when

`?isInvalid=true` matches S2: native custom validity,
`checkValidity()===false`, `:invalid`, and form submit blocked. A
comparison-route form walk fails if Solid submits an `isInvalid`
Checkbox. Disabled invalid stays valid on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/toggle/createToggle.ts` (missing
`createFormValidation`, which RAC `useToggle.ts` calls). Distinct
from #351 (`createTextField`) and from #70 (HelpText/FieldError
composite). Switch shares this hook; not driven here. Do not start
#254.
