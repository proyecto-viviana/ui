---
id: 351
type: task
title: "Set native custom validity on TextField when isInvalid"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 textfield functional pass: URL ?isInvalid=true leaves React input.validity.customError=true, checkValidity=false, :invalid, validationMessage Invalid value., and requestSubmit blocked; Solid stays valid and submits. createTextField never calls createFormValidation; RAC useTextField does",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 searchfield: createSearchField delegates to createTextField, same gap. Isolated forms requestSubmit: React blocked customError=true; Solid submits {projectSearch:status}. URL invalid error slot/AX match. No new id.",
    }
---

S2 TextField default `validationBehavior` is native. RAC
`useTextField` wires `useFormValidation`, which calls
`setCustomValidity` when `isInvalid` is true, so a filled invalid
field still fails HTML constraint validation and blocks form submit.

Solid `createTextField` sets `aria-invalid` and the native `required`
attribute, but never calls `createFormValidation`. The comparison
route error row, icon, and red group border still match. Native
validity does not.

`createFormValidation` already exists
(`packages/solidaria/src/form/createFormValidation.ts`) and is used
by DateField / HiddenSelect. TextField never grew that branch.

## Evidence

`http://127.0.0.1:4341/components/textfield/?isInvalid=true`,
islands mounted. Value is still `Quarterly report`.

| | React | Solid |
|---|---|---|
| `checkValidity()` | false | true |
| `:invalid` | true | false |
| `validationMessage` | `Invalid value.` | `""` |
| `validity.customError` | true | false |
| injected form `requestSubmit` | blocked, focus stays on the input | submits `{email: "Quarterly report"}` |

AX, error slot, icon, and group `data-invalid` match. `?isInvalid=true&isDisabled=true`
skips `setCustomValidity` on both (`!input.disabled`). Empty
`?isRequired=true&value=` `valueMissing` blocks submit on both.

## Done when

`?isInvalid=true` matches S2: native custom validity, `checkValidity()===false`,
`:invalid`, and form submit blocked. A comparison-route form walk
fails if Solid submits an `isInvalid` TextField. Disabled invalid
stays valid on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/textfield/createTextField.ts` (missing
`createFormValidation`, which RAC `useTextField.ts` calls).
`createSearchField` reuses that hook. Distinct
from #273 (ComboBox native `required`) and #345 (live HelpText slot).
Do not start #254.
