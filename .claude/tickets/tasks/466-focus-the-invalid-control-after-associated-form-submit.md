---
id: 466
type: task
title: "Focus the invalid control after associated-form requestSubmit"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from D14 submit-attempt rows. React focuses the invalid TextField / SearchField / Checkbox; Solid leaves BODY. createFormValidation captures input.form at effect setup. D14 (and any late HTML form attribute) associates the control after mount, so the captured form is null and the focus branch is skipped. RAC reads ref.current.form at invalid-event time.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Read input.form at invalid-event time, matching useFormValidation.ts:75.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "onInvalid reads the live input.form. Package tests: createFormValidation + TextField/SearchField/Checkbox 186 passed.",
    }
---

`createFormValidation` already focuses the first invalid input, but it
closes over `input.form` when the effect first runs. A control that is
not inside a `<form>` yet — then associated with `form="…"` — has
`input.form === null` at that moment. D14's submit walk does exactly
that so it does not move React/Solid nodes.

RAC `useFormValidation` reads `ref.current?.form` inside `onInvalid`.
Solid must do the same.

## Done when

`requestSubmit` on a form associated after mount focuses the invalid
control. A package test fails if `document.activeElement` stays `BODY`
or the submitter.

## Relationship

Child of #24. Distinct from #351 (custom validity) and #465 (aria
`required`). One `createFormValidation` fix covers TextField, SearchField,
and Checkbox.
