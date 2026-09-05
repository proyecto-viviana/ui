# Certified-suite subset — 2026-09-05

This is **not** a postcard. Ticket #194. Do not copy these counts into
`lastFullCertifiedSuiteRun`. Certification Gates cannot treat this as a pass.

## Why there is no new postcard

The last complete certified suite is still `0f1e1198` (2026-08-21, 2170 passed /
0 failed / 4 skipped). WSL Chromium 151 / SwiftShader never issues a compositor
frame. D3 `locator.screenshot` waits for element stability and, after the
harness bound, fails at 15s (`waiting for element to be stable`) instead of
hanging for the 180s test timeout. A painting CI machine can finish; this box
cannot recertify pixels.

`lastFullCertifiedSuiteRun` stays `0f1e1198`. The parity report prints
`STALE certified-suite postcard` whenever HEAD differs.

## What did run against a real SHA

- Revision recorded by the certified-summary reporter:
  `15ca6d4cd685289daa9666485b58fbb059f1c300`
- Scope: `e2e/certified/field-validity.certified.spec.ts` (D14 only,
  `paintBudgetMs: 0`)
- Totals: **39 passed / 0 failed / 0 skipped**
- JSON: `playbook/evidence/certified-head-d14-subset.json`

D14 cells: TextField 6, SearchField 4, Checkbox 5, RadioGroup 6, NumberField 9,
ComboBox 3, Form 6.

## Form-ticket walks

#351 TextField `?isInvalid=true`: both stacks `customError`,
`checkValidity` path blocked, `submits: 0`, `invalids: 1`, focus on the
filled input. JSON in `playbook/components/textfield-validation-notes.md`.

#376 RadioGroup `?isInvalid=true`: both stacks `customError` on all three
radios, `submits: 0`, `invalids: 3`, focus `starter`. Required-empty submit
is the same block with `valueMissing`. JSON in
`playbook/components/radiogroup-validation-notes.md`.

NumberField min/max/step oracles were not weakened (9/9 in this subset).

## Harness

- `waitForPaintSettle` races `fonts.ready` + two rAFs against a budget.
- D14 keeps `paintBudgetMs: 0`.
- `scrollLocatorIntoView` replaces Playwright `scrollIntoViewIfNeeded` on
  certified D4 / D13 / Dialog paths.
- Screenshot and action timeouts are 15s so a stuck compositor fails closed.

A machine that paints can run `vp run comparison:test:certified` and, if that
full suite is green with `skipped === 4` registered fixmes, replace the
postcard SHA with that HEAD. Until then the stale postcard is a blocking gap.
