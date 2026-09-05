---
id: 468
type: task
title: "Reset validation state after late form association"
created: 2026-09-05
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-05,
      note: 'Remainder after #467. createFormValidation still captures input.form at effect time for the validation reset listener. Late form="" leaves that capture null, so displayValidation stays invalid after native reset. Same class as #466 (focus) and #467 (value reset).',
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Git v2 implement. Document-level reset listener; compare e.target to the live input.form. Keep the form.reset patch when a form is already associated.",
    }
  - {
      state: merged,
      at: 2026-09-05,
      note: 'Reset listener reads live input.form. Package tests: createFormValidation 14 passed (in-form + late form=""); TextField/SearchField/Checkbox 176 passed.',
    }
---

`createFormValidation` already reads `input.form` inside `onInvalid`
(#466). Its **reset** listener still closes over `input.form` when the
effect first runs. A control associated with `form="…"` after mount
never gets `resetValidation()`, so committed `displayValidation` stays
invalid.

#467 fixed the same late-association hole for **value** reset in
`createFormReset`. This ticket is the validation-state twin.

## Done when

A native reset on a form associated after mount clears
`displayValidation`. A package test fails if the committed error
survives the reset.

## Proof

```bash
vp test run packages/solidaria/test/createFormValidation.test.tsx
# 14 passed

vp test run packages/solidaria-components/test/TextField.test.tsx packages/solidaria-components/test/SearchField.test.tsx packages/solidaria-components/test/Checkbox.test.tsx
# 176 passed
```

## Relationship

Child of #24. Distinct from #466 (focus) and #467 (controlled value).
