# Form Validation Notes

## Target

- Component: Form
- Slug: form
- Family or direct subcomponents: TextField, Button
- Pass goal: S2 styled Form root parity, inherited field props, native/ARIA
  validation behavior, route controls, and strict default visual evidence
- Date: 2026-05-15

## Source Packet

| Source                   | Files or docs                                                    | Finding                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Form` page                                                      | Public API covers native form props, `validationBehavior`, label placement/alignment, necessity indicator, size, required, disabled, and emphasized inheritance. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Form.tsx`, `TextField.tsx`, `Button.tsx` | Form is a grid wrapper over React Aria Form and provides S2 style props through internal form context to form-aware descendants.                                 |
| Solid source before pass | `packages/solid-spectrum/src/form/index.tsx`                     | Solid Form used handwritten flex/Tailwind-style classes and did not provide S2 form prop inheritance to styled descendants.                                      |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix               | Form was an official catalogue gap with no live Solid styled route or Form-specific strict visual assertion.                                                     |

## Four-Layer Audit

| Layer      | React owner                 | Solid owner                                  | Status                                                                                         |
| ---------- | --------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/Form`   | `@proyecto-viviana/solid-spectrum/Form`      | Matched root grid, row/column gaps, label placement inheritance, size, disabled, and required. |
| Components | React Aria Components Form  | `solidaria-components` Form/TextField/Button | Matched noValidate/native submit behavior and form-provided validation behavior for TextField. |
| Headless   | React Aria text field hooks | `solidaria` `createTextField`                | Added native vs ARIA required behavior parity.                                                 |
| State      | none                        | none                                         | N/A. Form has no separate state package owner.                                                 |

## Interaction Dependency Map

| Dependency             | Upstream branch                                             | Solid validation                                                                                      | Status  |
| ---------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| `labelPosition`        | Root grid and descendant field subgrid                      | E2E computed-style contract covers top and side placement.                                            | matched |
| `labelAlign`           | Side labels align start/end                                 | E2E computed-style contract covers side/end alignment.                                                | matched |
| `size`                 | Descendant field and button sizing                          | Unit and e2e coverage exercise inherited M/S/L/XL paths.                                              | matched |
| `necessityIndicator`   | Required icon vs `(required)` label text                    | Unit and e2e coverage compare required label output.                                                  | matched |
| `isRequired`           | Descendant required state and label marker                  | Unit test covers inherited required; e2e covers native `required` vs ARIA behavior.                   | matched |
| `isDisabled`           | Descendant TextField/Button disabled state                  | Unit test and e2e contract cover inherited disabled.                                                  | matched |
| `validationBehavior`   | Native validation uses `required`; ARIA validation does not | `createTextField`, headless TextField, Form unit tests, and e2e contract cover both modes.            | matched |
| `SkeletonContext`      | Form-aware descendants are disabled while loading           | Unit test covers Skeleton wrapping a Form with TextField and Button descendants.                      | matched |
| Solid child evaluation | Descendants must be created under active form contexts      | S2 Form passes children lazily through the headless Form so both S2 and validation contexts are live. | matched |

## Changes Made

- Reworked Solid Form around the upstream S2 root grid style macro with
  `labelPosition`, `size`, and allowed style overrides.
- Added internal S2 form prop inheritance and applied it to styled TextField
  and Button descendants.
- Fixed inherited prop forwarding through Solid `splitProps` by exposing proxy
  getter descriptors and enumerable keys.
- Aligned `solidaria` text field required semantics with
  `validationBehavior="native"` vs `"aria"`.
- Wired `solidaria-components` TextField to inherit validation behavior from
  headless Form without stringifying render-prop class functions.
- Added Form comparison controls, manifest entry, visual-state matrix row,
  React/Solid fixtures, route defaults, and strict Playwright visual coverage.

## Evidence

```bash
vp test run packages/solidaria/test/createTextField.test.tsx
vp test run packages/solidaria-components/test/TextField.test.tsx
vp test run packages/solid-spectrum/test/Form.test.tsx
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/form-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
```

Results:

- Solidaria text field hook tests: `10 passed`.
- Solidaria Components TextField tests: `44 passed`.
- Solid Spectrum Form tests: `4 passed`.
- Comparison build: passed.
- Form visual suite: `3 passed`.
- Current gap report lists official styled entries live on both sides at `32`,
  missing/gap entries at `37`, visual evidence states at `48`, strict pair-diff
  states at `31`, and blocked visual states at `36`.
- Current export report lists missing React S2 value exports at `81` of `208`
  and extra Solid value exports at `3`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                           |
| -------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 0-1 research/baseline      | partial | Sources and public API were captured, but before-report lines, full viewer option/default/reset inventory, and guard baselines were not recorded.                 |
| Task 2 route harness             | partial | Route controls, prop serialization, and strict visual coverage are present; visible control labels/order/defaults and sentinel-value absence are not asserted.    |
| Tasks 3-4 source branch coverage | gap     | The dependency map is not a branch-by-branch ledger for S2 Form, headless Form/TextField, Button inheritance, `createTextField`, and lazy child evaluation paths. |
| Tasks 8-9 styled branches        | partial | Inheritance is proven for the current TextField + Button fixture; other form-aware S2 descendants remain deferred to their own component passes.                  |
| Task 10 runtime semantics        | partial | Native vs ARIA required behavior is covered; real form submit/reset/FormData/action/method behavior is not directly focus-tested in this pass.                    |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; failure taxonomy, full `vp run check`, and full guard refresh were not recorded for this component.                  |

Retro-audit gaps to backfill before release hardening:

- Add branch ledger rows for S2 Form root styles, headless Form forwarding,
  TextField inheritance, Button inheritance, `createTextField` required
  semantics, and lazy child evaluation under active contexts.
- Add route-control UI assertions for visible options, selected defaults, and
  omitted/default sentinel behavior.
- Validate FormContext inheritance for the remaining form-aware styled
  components during their own passes, including checkbox, picker, combo box,
  radio, slider, switch, text area, number field, search field, and date/time
  field families.
- Add focused real form submit/reset/FormData coverage if the Form pass becomes
  the owner for full native form behavior.
- Decide whether skeleton Form needs a strict route visual row or remains
  unit-only evidence through descendants.

## Handoff

- Form is comparison-live for the current TextField + Button fixture with
  focused evidence; it is not yet fully playbook-complete.
- Broader FormContext consumer inheritance is a deferred component-family gap
  to validate during each remaining form-aware component pass.
- The next styled pass should be selected from `vp run comparison:report:gaps`;
  carry the Form inheritance checklist forward when the next gap consumes form
  context.
