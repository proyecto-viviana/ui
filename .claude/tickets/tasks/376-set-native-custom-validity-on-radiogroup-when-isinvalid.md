---
id: 376
type: task
title: "Set native custom validity on RadioGroup when isInvalid"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 radiogroup functional pass: URL ?isInvalid=true leaves React every radio customError=true, checkValidity=false, :invalid, validationMessage Invalid value., requestSubmit blocked and focus radio:starter; Solid stays valid and submits {solidaria-cl-228:starter}. createRadio never calls createFormValidation; RAC useRadio does",
    }
---

S2 RadioGroup default `validationBehavior` is native. RAC `useRadio`
calls `useFormValidation`, which `setCustomValidity` on every radio
when the group `isInvalid` is true, so a filled invalid group still
fails HTML constraint validation and blocks form submit.

Solid `createRadio` sets `aria-invalid` on the group and paints the
error slot, but never calls `createFormValidation`. The comparison
route error row, icon, and red circle border still match. Native
validity does not.

`createFormValidation` already exists
(`packages/solidaria/src/form/createFormValidation.ts`) and is used
by DateField / HiddenSelect. Radio never grew that branch.

## Evidence

`http://127.0.0.1:4341/components/radiogroup/?isInvalid=true`,
islands mounted. Selected value is still `starter`. Injected
`form[data-fp-form]` + `requestSubmit`.

| | React | Solid |
|---|---|---|
| `checkValidity()` | false (all three radios) | true |
| `:invalid` | true | false |
| `validationMessage` | `Invalid value.` | `""` |
| `validity.customError` | true | false |
| injected form `requestSubmit` | blocked, focus `radio:starter` | submits `{solidaria-cl-228: "starter"}` |

AX, error slot `Choose a plan to continue.`, icon, and circle
border `rgb(215, 50, 32)` match. `?isInvalid=true&isDisabled=true`
skips custom validity on both (`!input.disabled`). Empty
`?isRequired=true&selectedValue=none` `valueMissing` blocks submit
on both. `validationBehavior=aria` required-empty submits on both.

Live `{isInvalid:true}` is the same native hole (React `customError`
true / Solid false). Visible HelpText swap is not this ticket.

## Done when

`?isInvalid=true` matches S2: native custom validity,
`checkValidity()===false`, `:invalid`, and form submit blocked. A
comparison-route form walk fails if Solid submits an `isInvalid`
RadioGroup. Disabled invalid stays valid on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/radio/createRadio.ts` (missing
`createFormValidation`, which RAC `useRadio` calls). Distinct from
#351 (`createTextField`), #355 (`createToggle`), #362
(`createDateField` / `createTimeField`), and #368
(`createColorField`). Live describedby after the slot swap is #258.
Do not start #254.
