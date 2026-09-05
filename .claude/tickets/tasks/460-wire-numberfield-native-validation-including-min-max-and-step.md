---
id: 460
type: task
title: "Wire NumberField native validation including min, max, and step"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09-04 overnight adversarial audit. Upstream useNumberField goes through useFormattedTextField → useTextField → useFormValidation, then useNativeValidation for min/max/step. Solid createNumberField hand-rolls inputProps, never calls createFormValidation, and NumberField.tsx forges FieldErrorContext from the isInvalid prop. No ticket existed.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Mix createFormValidationState into createNumberFieldState like useNumberFieldState. createFormValidation + createNativeValidation in createNumberField. FieldErrorContext reads displayValidation.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "createNumberFieldState owns FormValidationState and commitBehavior. createNumberField calls createFormValidation, createNativeValidation, and createFormReset. FieldErrorContext reads displayValidation. Package tests: isInvalid customError blocks requestSubmit; required-empty submit paints FieldError; commitBehavior=validate value over max blocks submit. S2 Form HelpText swaps after required NumberField submit.",
    }
---

RAC `useNumberField` routes the input through `useTextField` (which calls
`useFormValidation`) and then `useNativeValidation` for min/max/step
(`useNumberField.ts:318-328, 437-503`). Solid `createNumberField` hand-rolls
`inputProps`, never calls `createFormValidation`, and the headless
`NumberField` forges `FieldErrorContext` from the `isInvalid` prop.

`createNumberField` already takes an `inputRef`. The floor is the same as
#351/#383/#376: `createFormValidation` so `isInvalid` sets `customError` and
blocks submit, and `displayValidation` drives `aria-invalid` / FieldError.
Then port `useNativeValidation` so min/max/step fail native constraint
validation the way S2 does. Do not invent a min/max/step machine.

## Done when

An `isInvalid` NumberField fails `checkValidity()` and blocks
`requestSubmit`. A value outside min/max/step fails native validity like
S2. FieldError / HelpText read `displayValidation`, not the prop. A
package test fails if either hole returns.

## Relationship

Child of #24. Found by the 2026-09-04 overnight audit. Distinct from #351
(TextField) and #273 (ComboBox native required). No `useNativeValidation`
equivalent exists yet.
