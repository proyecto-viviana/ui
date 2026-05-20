# ComboBox Validation Notes

## Scope

- Component: `ComboBox`
- Family or direct subcomponents: `ComboBoxItem`, `ComboBoxContext`,
  `SearchAutocomplete`, React Aria ComboBox behavior, S2 Form field context
- Source owner touched:
  `packages/solid-spectrum/src/combobox/index.tsx`,
  `packages/solid-spectrum/src/autocomplete/index.tsx`,
  `packages/solidaria-components/src/ComboBox.tsx`
- Comparison owner touched:
  `apps/comparison/src/data/combobox-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`,
  React/Solid styled fixtures, `e2e/combobox-visual.spec.ts`

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                                                             | Notes                                                                                                                                                                                                                                                                    |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Official Docs And Viewer Parity          | passing | S2 MCP `ComboBox` page, React Aria MCP `ComboBox` page, component controls, `combobox-demo.ts`.                      | Viewer now drives controlled/default selection and input source, label placement/alignment/necessity, contextual help, form props, validation behavior, popover trigger/placement/width, custom values, disabled item state, read-only, disabled, required, and invalid. |
| External Authority And Standards         | passing | React Aria ComboBox docs and installed React Spectrum S2 source.                                                     | Solid keeps the React Aria input/listbox/option model, selected key and input value contracts, name/form submission behavior, required/invalid states, and manual/focus/input menu trigger behavior.                                                                     |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/ComboBox.tsx`, Solid source, package tests.                                        | Solid now exports/consumes `ComboBoxContext`, merges slotted context/local props, inherits Form props, renders contextualHelp beside the label, measures trigger width for the popover, and supports root refs through the headless layer.                               |
| Solid Idiomatic Implementation           | passing | Solid wrapper and headless source.                                                                                   | Context values remain reactive through Solid getters, root refs avoid extra DOM wrappers, and `SearchAutocomplete` now composes through the public pre-wired ComboBox API instead of the old internal composition.                                                       |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/combobox-visual.spec.ts`.                                               | Covered visible label naming, description/error ids, invalid state, form name/formValue behavior, required and read-only attributes, contextual help trigger, disabled option state, focus-visible field group, and option accessible labels.                            |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/ComboBox.test.tsx`, `e2e/combobox-visual.spec.ts`, `e2e/modeled-controls-contract.ts`. | Covered controlled selected/input values, custom text submission, Form inheritance, context defaults, manual popover opening, pointer selection, keyboard ArrowDown/Enter flow, input typing, close-on-select, and first option hover/focus state.                       |
| Style Source-To-Computed Parity          | passing | Solid S2 style source and browser geometry/screenshot assertions.                                                    | Browser proof compares default field screenshots, invalid required XL field geometry, icon sizes/colors, help text color, focus ring, popover surface, popover width, option grid, option sizing, and list checkmark sizing against React Spectrum.                      |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared route normalization/serialization, component controls, visual-state matrix.      | Both stacks receive the same serialized demo props and expose matching live selected-key/input markers for controlled branches.                                                                                                                                          |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                       | ComboBox is accepted for this component pass; remaining lower collection-model gaps are listed below.                                                                                                                                                                    |

## Verification

- `vp test run packages/solid-spectrum/test/ComboBox.test.tsx`
  - 9 tests passed.
- `vp run comparison:build`
  - Completed successfully after the final source/format pass.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/combobox-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ComboBox --reporter=line --workers=1`
  - 10 tests passed in Chromium.
- `vp run comparison:report:gaps`
  - Completed; ComboBox default field has current visual evidence and the remaining catalogue gaps are outside this component pass.
- `vp run comparison:report:exports`
  - Completed; `ComboBoxContext` is now exported and `ComboBoxSection` remains tracked as a lower collection-model gap.
- `vp run check`
  - Formatting, lint, and repository typecheck passed.

## Remaining Gaps

- `ComboBoxSection` and fully static JSX collection children still need a
  section-aware Solid collection model. This pass keeps function-rendered
  `items` parity current, which is the route used by the comparison harness.
- Loading rows and delayed field/list progress indicators are not yet modeled
  in Solid ComboBox.
- Assistive-technology transcript rows are not yet captured for ComboBox.
