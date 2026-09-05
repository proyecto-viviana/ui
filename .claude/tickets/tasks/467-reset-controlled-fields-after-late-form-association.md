---
id: 467
type: task
title: "Reset controlled fields after late form association"
created: 2026-09-04
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-04,
      note: 'Same class as #466. createFormReset captures element.form at effect time. D14-style late form="" leaves the captured form null, so native reset never restores the controlled value. Listen for reset and read the live association.',
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement. Document-level reset listener; compare e.target to the live element.form. Skip when defaultPrevented, matching useFormReset.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "createFormReset reads element.form at reset time. Package tests: createFormReset + TextField 70 passed, including late form attribute.",
    }
---

`createFormReset` closes over `element.form` when the effect first
runs. A control that is not inside a `<form>` yet — then associated
with `form="…"` — has `element.form === null` at that moment, so the
hook returns without a listener. D14's reset walk does exactly that.

The hook must read the live `element.form` when a reset fires, the
same class of fix as #466 (`createFormValidation` reads `input.form`
inside `onInvalid`).

## Done when

A native reset on a form associated after mount restores the
controlled default. A package test fails if `onReset` is not called.

## Proof

```bash
vp test run packages/solidaria/test/createFormReset.test.tsx packages/solidaria-components/test/TextField.test.tsx
# 70 passed (late form="" reset + cancelled reset)

vp test run packages/solidaria-components/test/Checkbox.test.tsx packages/solidaria-components/test/SearchField.test.tsx packages/solidaria/test/createTextField.test.tsx
# 127 passed
```

## Relationship

Child of #24. Distinct from #463 (wiring createFormReset onto
TextField/Toggle) and #466 (focus after late-associated
requestSubmit). `createFormValidation` still captures `form` at
effect time for its own reset listener; that is validation-state
reset, not this ticket.
