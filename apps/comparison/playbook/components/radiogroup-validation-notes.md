# RadioGroup Validation Notes

Date: 2026-05-28
Status: accepted

## Scope

- Component: `RadioGroup`
- Family or direct subcomponents: S2 `RadioGroup`, S2 `Radio`, React Aria
  RadioGroup behavior, Solid Spectrum `RadioGroup`/`Radio`, Solidaria
  `RadioGroup`/`Radio`.
- Source owner touched:
  `packages/solid-spectrum/src/radio/index.tsx`,
  `packages/solidaria-components/src/RadioGroup.tsx`, and
  `packages/solidaria/src/radio/createRadio.ts`.
- Comparison owner touched:
  `apps/comparison/src/data/radiogroup-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`, React/Solid styled
  fixtures, `visual-state-matrix.ts`, and `e2e/radiogroup-visual.spec.ts`.

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                                                                     | Notes                                                                                                                                                                                                                                                                        |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `RadioGroup` page, React Aria MCP RadioGroup docs, component controls, `radiogroup-demo.ts`.                          | Viewer drives label, selected value, S2 size, orientation, label position/alignment, necessity indicator, name/form, validation behavior, help/error text, contextualHelp, emphasized treatment, and disabled/read-only/required/invalid states into both stacks.            |
| External Authority And Standards         | passing | React Aria RadioGroup docs and installed React Spectrum S2 source.                                                           | Solid keeps React Aria radio group value/defaultValue/onChange semantics, required group semantics, form props, native-vs-aria validation behavior, and disabled/read-only suppression.                                                                                      |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/RadioGroup.tsx`, Solid source, package tests.                                              | Solid now supports S2 field layout props, necessity indicator, contextualHelp, form inheritance, size/emphasis context, context exports, refs, input refs, and unsafe style/class merging.                                                                                   |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/radio/index.tsx`, package tests.                                                                | Context values use Solid accessors where values can change, radio children inherit group size/emphasis through context, and lower-layer validation props flow through state instead of duplicated wrapper logic.                                                             |
| Accessibility And I18n                   | passing | Package tests and `e2e/radiogroup-visual.spec.ts`.                                                                           | Covered accessible group naming, required group state, native required inputs, `validationBehavior="aria"` suppressing child native required without adding per-input `aria-required`, description/error association, contextual help trigger presence, name/form, and refs. |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/Radio.test.tsx`, Solidaria group/state tests, `e2e/radiogroup-visual.spec.ts`.                 | Covered controlled value updates, repeated label selection changes, disabled/read-only behavior, group context merging, Form inheritance, required validation modes, and selected DOM synchronization.                                                                       |
| Style Source-To-Computed Parity          | passing | Solid S2 source, generated CSS, browser computed comparisons for default, invalid emphasized XL, and side-label form states. | Browser proof compares current Solid rendering against current React Spectrum for field label text/color, orientation, item flex direction, radio circle metrics/color/transform/will-change, help text, invalid state, and contextual help affordance.                      |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared route normalization/serialization, component controls, visual-state matrix.              | Both stacks receive the same serialized demo props, expose matching live selected-value markers, and are driven by the same side-panel controls.                                                                                                                             |
| Known Defects And Regression Protection  | passing | Focused package and browser tests, parity metadata, and validation note coverage.                                            | The aria-validation mismatch found during e2e was fixed at the lower radio input layer and captured in package plus browser assertions. No component-owned blockers remain for this pass.                                                                                    |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                               | RadioGroup is accepted for this component pass.                                                                                                                                                                                                                              |

## Agent Workflow

- Read the official S2 RadioGroup docs through MCP and checked React Aria
  RadioGroup docs for value, forms, and validation behavior.
- Compared installed React Spectrum S2 `RadioGroup.tsx` against the Solid
  wrapper and lower Solidaria radio implementation.
- Closed wrapper gaps before expanding comparison controls, then used the
  React-vs-Solid app to catch and fix the `validationBehavior="aria"` input
  attribute difference.
- Added package coverage for S2 field props, context merging, Form inheritance,
  refs, size aliases, and validation behavior.
- Added browser evidence for default computed geometry, emphasized invalid XL
  geometry, repeated selection changes, side-label form props, contextualHelp,
  and modeled side-panel controls.

## Behavior State Machine

- Controlled branch: `value` drives the selected radio and `onChange` updates
  the live selected-value marker.
- Native validation branch: required groups pass `required` to radio inputs so
  browser form validation can run.
- Aria validation branch: required groups keep `aria-required` on the group and
  suppress native `required` plus per-input `aria-required`, matching React
  Spectrum.
- Disabled and read-only states suppress selection changes through shared React
  Aria group state.
- Form inheritance supplies size, necessity indicator, disabled/read-only, and
  validation behavior unless locally overridden.

## Accessibility And I18n

- Group receives `role="radiogroup"` and an accessible name from visible
  `label` or ARIA props.
- Description and invalid error text are associated through described-by ids;
  invalid error text renders only when the group is invalid, matching S2
  `HelpText`.
- Required visual indicators follow S2 `necessityIndicator`: icon by default
  and `(required)` text for `necessityIndicator="label"`.
- No locale-sensitive formatting or new translation catalogs are introduced in
  this component pass.

## Style Source-To-Computed

- Root layout uses the same S2 field layout inputs for size, form context, label
  position, and label alignment.
- Item layout honors vertical/horizontal orientation and S2 gap behavior.
- Radio children receive group size and emphasized state through Solid context
  and public `RadioContext`, matching the S2 source shape.
- Browser computed assertions cover default M vertical, horizontal XL
  emphasized invalid, and side-label required form states against React
  Spectrum.

## Known Defects And Regression Protection

- Fixed during this pass: Solid previously added `aria-required="true"` to each
  child radio input for `validationBehavior="aria"`; React Spectrum keeps the
  required ARIA state on the group only. This is now covered in package and
  browser tests.
- No component-owned blockers remain for RadioGroup acceptance.

## Verification

- `vp test packages/solidaria-components/test/RadioGroup.test.tsx packages/solidaria/test/createRadioGroup.test.tsx packages/solid-stately/test/createRadioGroupState.test.ts packages/solid-spectrum/test/Radio.test.tsx`
  - `4` files, `170` tests passed.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/radiogroup-visual.spec.ts e2e/modeled-controls-contract.spec.ts --project=chromium --reporter=line --grep "comparison RadioGroup visual parity|RadioGroup side-panel controls"`
  - `5` Chromium tests passed.
- `vp run comparison:build`
  - Passed with the RadioGroup comparison route generated.

## Handoff

- Status after this pass: accepted.
- RadioGroup now has current component-owned validation notes and current
  visual/asserted evidence. Continue with the remaining missing validation-note
  owners: SearchField, Switch, TextArea, and TextField.
