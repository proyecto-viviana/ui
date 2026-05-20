# Checkbox Validation Notes

Updated: 2026-05-20

## Target

- Component: Checkbox
- Slug: checkbox
- Family or direct subcomponents: Checkbox, CheckboxContext, React Aria
  checkbox input behavior, Form inheritance
- Pass goal: close the current comparison-route caveat by covering default and
  selected visual states, controlled and default selection, indeterminate,
  emphasized, invalid, disabled, read-only, required, form name/value/form
  props, validation behavior, context props, form inheritance, side-panel
  controls, and support export parity against current React Spectrum S2.

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                  | Notes                                                                                                                                                                                                                                          |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `Checkbox` page, React Aria MCP `Checkbox` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/checkbox-demo.ts`.    | Viewer now drives label text, size, controlled/default selected source, `defaultSelected`, indeterminate, emphasized, name/value/form, validation behavior, required, disabled, read-only, and invalid state into both stacks.                 |
| External Authority And Standards         | passing | React Aria Checkbox docs and installed React Spectrum S2 source.                                                                                          | The Solid component keeps React Aria's checkbox role/input model, label click and Space toggling, presentational indeterminate state, read-only suppression, hidden input form participation, and native/ARIA validation behavior passthrough. |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/Checkbox.tsx`, `@react-spectrum/s2/exports/Checkbox.ts`, Solid source `packages/solid-spectrum/src/checkbox/index.tsx`. | Solid now matches S2's wrapper shape for `CheckboxContext`, provider/form props, slot/ref/inputRef merging, `styles`, `UNSAFE_className`, `UNSAFE_style`, and form-aware field placement.                                                      |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/checkbox/index.tsx`, package tests.                                                                                          | Context and local props merge through Solid getters, refs merge without dropping caller refs, and CheckboxGroup-specific context/form behavior is covered in the separate CheckboxGroup pass.                                                  |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/checkbox-visual.spec.ts`.                                                                                    | Covered accessible names, checked state, default selection, indeterminate rendering, Space/click toggling, disabled/read-only suppression, invalid/required attributes, form props, and no component-local strings needing localization.       |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/Checkbox.test.tsx`, `e2e/checkbox-visual.spec.ts`, `e2e/modeled-controls-contract.spec.ts`.                                 | Covered uncontrolled `defaultSelected`, controlled `isSelected`, `onChange`, label click, Space key, touch press, disabled/read-only, invalid, required, Form disabled inheritance, context defaults, root refs, and input refs.               |
| Style Source-To-Computed Parity          | passing | Solid S2 style source, shared generated CSS, visual assertions for default, selected emphasized XL, invalid, read-only, disabled, and pressed states.     | Browser proof compares current Solid rendering against current React Spectrum for text color, box size, box color, border color, icon sizing/centerline, baseline alignment, and pressed transform suppression.                                |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared serialized route props, component controls, visual-state matrix.                                                      | Both fixtures import public APIs, receive the same serialized demo props, expose matching checked markers, and render matching controlled/default, form, validation, disabled, read-only, invalid, and indeterminate branches.                 |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                                                            | Checkbox is accepted for this component pass; remaining gaps are listed below.                                                                                                                                                                 |

## Fixed In This Pass

- Exported `CheckboxContext` from solid-spectrum and merged context props,
  `styles`, `UNSAFE_className`, `UNSAFE_style`, root refs, and input refs into
  the S2 Checkbox wrapper.
- Added Form/provider integration so inherited disabled state and form-aware
  field layout reach standalone Checkbox.
- Added shared Checkbox route data for parsing, normalization, serialization,
  defaults, controlled/default selection source, name/value/form, validation
  behavior, and required state.
- Expanded viewer controls for selection source, `defaultSelected`, form props,
  validation behavior, required state, and the existing visual/interaction
  states.
- Updated React and Solid fixtures to pass either controlled `isSelected` or
  uncontrolled `defaultSelected`, preserve live checked markers, and avoid
  mutating route props for uncontrolled changes.
- Added package coverage for Form disabled inheritance, hidden input form props,
  `validationBehavior="aria"`, and `CheckboxContext` prop/style/ref/inputRef
  merging.
- Added browser coverage for default visual parity, default-selected form prop
  initialization, uncontrolled toggling, selected emphasized XL geometry,
  invalid/read-only/disabled states, pressed transform, and expanded
  side-panel controls.
- Replaced the visual-state caveat with explicit default and
  default-selected/form evidence rows.

## Covered States

- Default unchecked state against current React Spectrum.
- Selected emphasized XL state.
- Controlled `isSelected` click changes.
- Uncontrolled `defaultSelected` initialization and later click changes.
- Indeterminate visual state.
- Hidden input `name`, `value`, and `form` participation.
- Required and validation behavior passthrough.
- Disabled, read-only, and invalid states.
- Label click, Space key, and touch press.
- Context prop, class, style, root ref, and input ref merging.

## Commands

- `vp test run packages/solid-spectrum/test/Checkbox.test.tsx`
  - `1` file, `31` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/checkbox/index.html`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/checkbox-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep Checkbox --reporter=line --workers=1`
  - `9` browser tests passed after running outside the sandbox because Chromium
    launch hit the local sandbox restriction.
- `vp run comparison:report:gaps`
  - report passed; Checkbox now lists explicit default and selected evidence
    rows and no longer appears in states without complete visual/pair-diff
    coverage.
- `vp run comparison:report:exports`
  - report passed; `CheckboxContext` is no longer listed as a missing
    solid-spectrum support export.
- `vp run check`
  - formatting, lint, and typecheck passed after `vp check --fix`.

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for Checkbox.
- Hover/focus visual states are covered through current geometry/data-state
  checks and shared React Aria behavior, not a dedicated exhaustive screenshot
  grid.
- CheckboxGroup-specific context/default-state coverage is tracked in
  `checkboxgroup-validation-notes.md`.
