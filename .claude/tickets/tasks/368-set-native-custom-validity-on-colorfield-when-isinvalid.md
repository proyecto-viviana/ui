---
id: 368
type: task
title: "Set native custom validity on ColorField when isInvalid"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorfield functional pass: URL ?isInvalid=true leaves React input.validity.customError=true, checkValidity=false, :invalid, validationMessage Invalid value., requestSubmit blocked; Solid stays valid and submits {brandColor:#336699}. createColorField never calls createFormValidation; RAC useColorField reaches it through useFormattedTextField",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "createColorField calls createFormValidation. ColorField test fails if isInvalid leaves customError false.",
    }
---

S2 ColorField default `validationBehavior` is native. RAC
`useColorField` routes through `useFormattedTextField` →
`useFormValidation`, which calls `setCustomValidity` when
`isInvalid` is true, so a filled invalid field still fails HTML
constraint validation and blocks form submit.

Solid `createColorField` sets `aria-invalid` and the native
`required` attribute, but never calls `createFormValidation`. The
comparison route error row, icon, and red group border still match.
Native validity does not.

## Evidence

`http://127.0.0.1:4341/components/colorfield/?isInvalid=true`,
islands mounted. Value is still `#336699`. Injected
`form[data-fp-form]` + `requestSubmit`.

|                               | React                             | Solid                             |
| ----------------------------- | --------------------------------- | --------------------------------- |
| `checkValidity()`             | false                             | true                              |
| `:invalid`                    | true                              | false                             |
| `validationMessage`           | `Invalid value.`                  | `""`                              |
| `validity.customError`        | true                              | false                             |
| injected form `requestSubmit` | blocked, focus stays on the input | submits `{brandColor: "#336699"}` |

AX, error slot, icon, and group `data-invalid` match.
`?isInvalid=true&isDisabled=true` skips custom validity on both.
Empty `?isRequired=true&value=` `valueMissing` blocks submit on both.

## Done when

`?isInvalid=true` matches S2: native custom validity,
`checkValidity()===false`, `:invalid`, and form submit blocked. A
comparison-route form walk fails if Solid submits an `isInvalid`
ColorField. Disabled invalid stays valid on both.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solidaria/src/color/createColorField.ts` (missing
`createFormValidation`, which RAC `useColorField` reaches through
`useFormattedTextField`). Distinct from #351 (`createTextField`)
and #355 (`createToggle`). Live HelpText slot is #345. Do not
start #254.
