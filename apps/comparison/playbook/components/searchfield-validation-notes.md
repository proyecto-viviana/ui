# SearchField Validation Notes

Date: 2026-05-28
Status: accepted

## Scope

- Component: `SearchField`
- Family or direct subcomponents: S2 `SearchField`, React Aria SearchField
  behavior, Solid Spectrum `SearchField`, Solidaria Components `SearchField`,
  and Solidaria `createSearchField`/`createTextField`.
- Source owner touched:
  `packages/solid-spectrum/src/searchfield/index.tsx`,
  `packages/solid-spectrum/src/index.ts`,
  `packages/solidaria-components/src/SearchField.tsx`,
  `packages/solidaria/src/searchfield/createSearchField.ts`, and
  `packages/solidaria/src/textfield/createTextField.ts`.
- Comparison owner touched:
  `apps/comparison/src/data/searchfield-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`, React/Solid styled
  fixtures, `visual-state-matrix.ts`, and `e2e/searchfield-visual.spec.ts`.

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                                                                 | Notes                                                                                                                                                                                                                               |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `SearchField` page, installed S2 source, component controls, `searchfield-demo.ts`.                               | Viewer drives label, value, placeholder, size, label placement/alignment, necessity indicator, contextualHelp, name/form/type, validationBehavior, description/error text, disabled/read-only/required/invalid, and clear behavior. |
| External Authority And Standards         | passing | React Aria SearchField behavior and installed React Spectrum S2 source.                                                  | Solid keeps React Aria value/defaultValue/onChange behavior, native validation by default, aria validation opt-in, form/name/type DOM props, clear button behavior, and search input semantics.                                     |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/SearchField.tsx`, Solid source, package tests.                                         | Solid now supports S2 field layout props, contextualHelp, form inheritance, `SearchFieldContext`, unsafe style/class merging, native cancel hiding, and read-only clear button suppression.                                         |
| Solid Idiomatic Implementation           | passing | Solid Spectrum and Solidaria source plus package tests.                                                                  | Context merges are accessors-safe, lower layers own validation prop flow, and wrapper state is supplied through Solid context rather than duplicated DOM logic.                                                                     |
| Accessibility And I18n                   | passing | Package tests and `e2e/searchfield-visual.spec.ts`.                                                                      | Covered accessible input naming, native required semantics, aria validation behavior, description/error association, contextual help presence, name/form/type forwarding, read-only clear suppression, and controlled updates.      |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/SearchField.test.tsx`, Solidaria tests, browser e2e.                                       | Covered controlled values, clear/focus behavior, disabled/read-only branches, required validation branches, Form validation inheritance, and context prop merging.                                                                  |
| Style Source-To-Computed Parity          | passing | Solid source and browser computed comparisons for default, invalid XL, side-label form/aria, and read-only clear states. | Browser proof compares current Solid rendering against current React Spectrum for field geometry, group/input metrics, search icon, clear button, label placement, required text, and help/error surfaces.                          |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared route normalization/serialization, component controls, visual-state matrix.          | Both stacks receive the same serialized demo props and expose matching geometry/DOM markers for the SearchField visual contract.                                                                                                    |
| Known Defects And Regression Protection  | passing | Focused package and browser tests, parity metadata, and validation note coverage.                                        | Fixed the contextualHelp fixture child contract crash, strict optional boolean typing issues, missing form/type forwarding, and read-only clear visibility. No component-owned blockers remain for this pass.                       |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                           | SearchField is accepted for this component pass.                                                                                                                                                                                    |

## Agent Workflow

- Read the official S2 SearchField docs through MCP and compared installed
  React Spectrum S2 `SearchField.tsx` against the Solid wrapper.
- Closed lower-layer prop forwarding first so validation behavior, form/name,
  type, enterKeyHint, and tab exclusion flow from public props to the input.
- Added wrapper support for S2 field layout props, contextualHelp, Form
  inheritance, context slots, error context, unsafe style/class merging, and
  read-only clear button hiding.
- Expanded the comparison controls and shared demo normalization so React and
  Solid receive the same modeled props.
- Added package tests and browser evidence for default, invalid XL, side label
  form/aria validation, read-only clear suppression, and controlled clear
  behavior.

## Behavior State Machine

- Controlled branch: `value` drives the input and clear behavior updates the
  live value marker in both React and Solid fixtures.
- Native validation branch: required SearchFields pass native `required` by
  default, matching React Aria's default validation behavior.
- Aria validation branch: `validationBehavior="aria"` keeps required semantics
  available through ARIA while suppressing native required form blocking.
- Disabled and read-only states preserve input state and suppress interactive
  clear affordances where React Spectrum does.
- Form inheritance supplies validation behavior unless locally overridden.

## Accessibility And I18n

- Input receives its accessible name from the visible label or ARIA props.
- Description and invalid error text are associated through described-by ids;
  invalid error text renders only when the field is invalid.
- Required visual indicators follow S2 `necessityIndicator`: icon by default
  and `(required)` text for `necessityIndicator="label"`.
- Contextual help is rendered through the S2 contextual help surface used by
  the rest of the Solid Spectrum field family.
- No locale-sensitive formatting or new translation catalogs are introduced in
  this component pass.

## Style Source-To-Computed

- Root field layout now receives S2 size, in-form, label position, and label
  alignment inputs.
- FieldGroup uses S2 pill radius, spacing, icon placement, and clear button
  affordance behavior.
- Native browser search cancel controls are hidden so the visible clear action
  matches S2.
- Browser computed assertions cover default M, invalid required XL, side-label
  required form/aria, and read-only clear-hidden states against React Spectrum.

## Known Defects And Regression Protection

- Fixed during this pass: Solid contextual help fixture children were not
  passed as Solid child arrays, which prevented the side-label visual state
  from mounting. The SearchField e2e state now covers that path.
- Fixed during this pass: lower-layer SearchField did not forward form, type,
  validation behavior, enterKeyHint, or excludeFromTabOrder.
- Fixed during this pass: read-only SearchField rendered a clear button where
  React Spectrum hides it.
- No component-owned blockers remain for SearchField acceptance.

## Verification

- `vp test packages/solidaria/test/createSearchField.test.tsx packages/solidaria-components/test/SearchField.test.tsx packages/solid-spectrum/test/SearchField.test.tsx`
  - `3` files, `96` tests passed.
- `vp run comparison:build`
  - Passed with the SearchField comparison route generated.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/searchfield-visual.spec.ts --project=chromium --reporter=line`
  - `6` Chromium tests passed.

## Handoff

- Status after this pass: accepted.
- SearchField now has current component-owned validation notes and current
  visual/asserted evidence. Continue with the remaining missing validation-note
  owners: Switch, TextArea, and TextField.
