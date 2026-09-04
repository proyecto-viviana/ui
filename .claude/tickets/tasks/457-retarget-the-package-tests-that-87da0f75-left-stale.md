---
id: 457
type: task
title: "Retarget the package tests that 87da0f75 left stale"
created: 2026-09-04
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed from bbed61d4 test:run: 13 test-stale + 6 snapshot-stale, all from 87da0f75; source already matches upstream (same class as #445). Owner-confirmed title.",
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
#445 stays merged; this ticket owns the remaining suite-green Done-when.
