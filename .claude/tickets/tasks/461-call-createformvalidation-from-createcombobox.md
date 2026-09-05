---
id: 461
type: task
title: "Call createFormValidation from createComboBox"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from the 2026-09-04 overnight adversarial audit. #273 landed native required. Upstream useComboBox.ts:302 still routes the input through useTextField (useFormValidation). Solid createComboBox never does. ComboBox.tsx FieldErrorContext paints only from ariaProps.isInvalid. isInvalid ComboBox submits.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Same displayValidation wiring as #383 / RAC useTextField inside useComboBox.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "createComboBox calls createFormValidation + createFormReset; FieldErrorContext reads displayValidation. Package test: isInvalid ComboBox customError=true, requestSubmit blocked. Landed 74d42826.",
    }
---

#273 set native `required` on ComboBox. RAC `useComboBox` still routes the
input through `useTextField`, which calls `useFormValidation`. Solid
`createComboBox` never does. `ComboBox.tsx` forges `FieldErrorContext` from
the `isInvalid` prop. A filled `isInvalid` ComboBox submits.

## Done when

`?isInvalid=true` matches S2: native custom validity, `checkValidity()===false`,
and form submit blocked. FieldError reads `displayValidation`. Disabled
invalid stays valid. A package test fails if Solid submits an `isInvalid`
ComboBox.

## Relationship

Child of #24. Follows #273. Same hole as #351 (TextField) and #376 (Radio).
Do not start #254.
