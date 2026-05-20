# CheckboxGroup Validation Notes

## Scope

- Component: `CheckboxGroup`
- Family or direct subcomponents: `Checkbox`, `CheckboxGroupContext`,
  React Aria CheckboxGroup behavior, S2 Form field context
- Source owner touched:
  `packages/solid-spectrum/src/checkbox/index.tsx`,
  `packages/solidaria-components/src/Checkbox.tsx`
- Comparison owner touched:
  `apps/comparison/src/data/checkboxgroup-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`,
  React/Solid styled fixtures, `e2e/checkboxgroup-visual.spec.ts`

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                                                                       | Notes                                                                                                                                                                                                                                                      |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `CheckboxGroup` page, React Aria MCP `CheckboxGroup` page, component controls, `checkboxgroup-demo.ts`.                 | Viewer drives label, controlled/default selected values, S2 size, orientation, label position/alignment, necessity indicator, name/form, validation behavior, help/error text, contextualHelp, and states.                                                 |
| External Authority And Standards         | passing | React Aria CheckboxGroup docs and installed React Spectrum S2 source.                                                          | Solid keeps the React Aria group role/checkbox input model, value/defaultValue selection semantics, form submission props, required validation, disabled/read-only suppression, and focus-within behavior.                                                 |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/CheckboxGroup.tsx`, `@react-spectrum/s2/exports/CheckboxGroup.ts`, Solid source.             | Solid now exports/consumes `CheckboxGroupContext`, merges slotted context/local props, supports refs, form inheritance, field layout props, contextualHelp, child size/emphasis context, and UNSAFE/style props.                                           |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/checkbox/index.tsx`, package tests.                                                               | Context values use Solid getters where values can change, child checkbox required state is isolated through `FormContext`, and the headless root ref is exposed without altering group state behavior.                                                     |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/checkboxgroup-visual.spec.ts`.                                                    | Covered accessible group naming, default and controlled values, name/form propagation, required/validation attributes, description/error association, disabled/read-only behavior, and no new localizable component strings beyond S2-required indicators. |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/Checkbox.test.tsx`, `e2e/checkboxgroup-visual.spec.ts`, `e2e/modeled-controls-contract.spec.ts`. | Covered controlled `value`, uncontrolled `defaultValue`, repeated multi-selection updates, Form inheritance, required selected-child isolation, context defaults, root refs, and group state markers.                                                      |
| Style Source-To-Computed Parity          | passing | Solid S2 style source, generated CSS, visual assertions for default and selected emphasized invalid XL states.                 | Browser proof compares current Solid rendering against current React Spectrum for group layout, item flex direction, child checkbox size/color/icon metrics, text color, help text, and invalid state.                                                     |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared route normalization/serialization, component controls, visual-state matrix.                | Both stacks receive the same serialized demo props and expose matching live selected-value markers for controlled and uncontrolled branches.                                                                                                               |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                                 | CheckboxGroup is accepted for this component pass; remaining cross-suite gaps are listed below.                                                                                                                                                            |

## Agent Workflow

- Read the official S2 and React Aria CheckboxGroup docs through MCP.
- Compared the installed S2 source against the Solid wrapper and headless
  `CheckboxGroup` implementation.
- Implemented the wrapper parity gaps before expanding viewer controls.
- Added package coverage for group form props, context merging, Form
  inheritance, default values, and root refs.
- Expanded browser evidence for default rendering, selected emphasized invalid
  geometry, controlled interactions, and uncontrolled defaultValue/form props.

## Behavior State Machine

- Controlled branch: `value` drives selected checkboxes, `onChange` updates the
  live selected-value marker and serialized controlled value.
- Uncontrolled branch: `defaultValue` initializes selected checkboxes, clicks
  update the live selected-value marker without rewriting the serialized route
  props.
- Disabled and read-only states suppress selection changes through the shared
  React Aria group state.
- Required group state marks child inputs required only while the group has no
  selected values; a required Form does not force already-selected children to
  remain individually required.
- Group `name`, `form`, and `validationBehavior` flow to child checkbox inputs
  through group state.

## Accessibility And I18n

- Group receives `role="group"` and an accessible name from visible `label` or
  explicit ARIA props.
- Description and invalid error text are attached to the group and child inputs
  through described-by ids.
- Required visual indicators follow S2 `necessityIndicator` behavior:
  icon for required by default, text for `necessityIndicator="label"`.
- No locale-sensitive formatting or new translation catalogs are introduced in
  this component pass.

## Style Source-To-Computed

- Root layout uses S2 `field()` with form-aware grid placement.
- Label wrapper now honors `labelPosition` and `labelAlign`.
- Help text mirrors S2 `HelpText` inline-size containment, field padding, and
  invalid-only error rendering so hidden error text does not widen the default
  group.
- Item layout honors vertical/horizontal orientation and preserves S2 row/column
  gap behavior.
- Child Checkboxes receive group size and emphasized state through Solid context
  and the public `CheckboxContext`, matching the React S2 source shape.

## Verification

- `vp test run packages/solid-spectrum/test/Checkbox.test.tsx`
  - `1` file, `34` tests passed.
- `vp run comparison:build`
  - Passed with the CheckboxGroup comparison route generated.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/checkboxgroup-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep CheckboxGroup --reporter=line --workers=1`
  - `5` Chromium tests passed outside the command sandbox because Chromium's
    local browser sandbox is not available inside the tool sandbox.
- `vp run comparison:report:gaps`
  - Passed; CheckboxGroup is no longer in the missing/gap official entries and
    is tracked with current visual evidence.
- `vp run comparison:report:exports`
  - Passed; `CheckboxGroupContext` is no longer listed as a missing support
    export.
- `vp run check`
  - Passed formatting, lint, and root TypeScript typecheck.

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for CheckboxGroup.
- Hover/focus visual states are covered through current geometry/data-state
  checks and shared React Aria behavior, not a dedicated exhaustive screenshot
  grid.
