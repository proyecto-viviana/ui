---
id: 457
type: task
title: "Retarget the package tests that 87da0f75 left stale"
created: 2026-09-04
parent: 443
status: verified
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from bbed61d4 test:run: 13 test-stale + 6 snapshot-stale, all from 87da0f75; source already matches upstream (same class as #445). Owner-confirmed title.",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "Git v2 implement; retarget groups A–E from the head-test-failures plan",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "groups A–E retargeted; test:run 0 failed (5994 passed) at 535f7bbb working tree",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 0b55a494; test agent vp run test:run 292/292 files, 5994 passed, 0 failed.",
    }
---

`87da0f75` moved source to match S2/RAC (FieldContextualHelp labelledby,
formatColorValue hex uppercase, createNumberField native aria-required omit,
createFormValidation `title=""`, createToggle skip label keyboard press). The
ten failing package-test files were not updated. Same class as #445: hold the
upstream behaviour in the test, do not move source back.

Tests only. Groups A–E from
`.agents/vivianastack/head-test-failures/plan.md`. No package source
change; no changeset.

## Evidence

Artifacts: `.agents/vivianastack/head-test-failures/` (`plan.md`, `grill.md`
verdict `go`). Cwd `/home/emoporemilio/projects/viviana-hub/ui`. Proof
revision `535f7bbb` (working tree; tests only).

Before (research at `bbed61d4`): `vp run test:run` → Test Files 10 failed |
280 passed (290); Tests 19 failed | 5960 passed | 1 expected fail | 6 skipped
(5986). Snapshots 6 failed.

After groups A–E:

- A: `vp test run` ComboBox/DateField/DatePicker/Picker/TimeField → 5
  passed (5); 69 passed. Exact composed AccName.
- B: `vp test run` color.test.ts Color.test.tsx → 2 passed (2); 164 passed.
  Uppercase hex `inputValue` including unreached `#FFFFFE`.
- C: `vp test run packages/solid-spectrum/test/regression.test.tsx -u` → 6
  snapshots updated, 50 passed. Hunks are `title=""` only (Checkbox,
  DateField, SearchField, Switch, TextArea, TextField). NumberField snap
  untouched.
- D: SAC NumberField native omit; hook aria-positive after `:231`.
  `vp test run packages/solidaria/test/createNumberField.test.tsx` → 49
  passed (49).
- E: TestSwitch spreads `{...getInputProps()}`; Space assertion kept.
  Passed in the D+E file run.

`vp run test:run` → Test Files 292 passed (292); Tests 5994 passed | 1
expected fail | 6 skipped (6001); 0 failed. Duration 56.66s. Extra vs
research baseline is #446 (green).

`vp fmt` on the 10 named test files. `vp lint` on those files exit 0.
`git diff --check` on named paths exit 0. No `packages/*/src/**`, no
`.changeset/*`.

Deviation: plan D snippet used `not.toBeRequired()` on the aria-positive
case. jest-dom `toBeRequired()` is true when `aria-required="true"`, so
that matcher cannot hold native omit. HTML dump had no `required`
attribute. Assert `not.toHaveAttribute("required")` instead.

## Done when

`vp run test:run` is green at the tip. Each retargeted assertion names the
upstream behaviour it holds (composed ContextualHelp AccName, uppercase hex
`inputValue`, Mozilla `title=""`, native omit / aria `aria-required`, native
Space on a fixture that spreads input key handlers). No package source
change; no changeset.

## Relationship

Child of #443 (release train). Found by the #260 D3 walk that landed in
`87da0f75`. Same retarget class as merged #445. Distinct from open #363 (help
button wrap under the label, not the labelledby name) and open #382 (FormContext
/ headless NumberField does not forward `validationBehavior`). Merged family:
#353 Search Help name, #370 hex uppercase, #349 native aria-required omit, #351
`title=""` via createFormValidation, #354 skip label keyboard press.
#445 is verified with this suite-green Done-when.
