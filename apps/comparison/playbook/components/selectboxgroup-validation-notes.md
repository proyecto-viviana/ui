# SelectBoxGroup Validation Notes

Updated: 2026-05-20

## Target

- Component: SelectBoxGroup
- Slug: selectboxgroup
- Family or direct subcomponents: SelectBox, ListBox collection behavior,
  illustration/text slots, SelectBoxGroupContext
- Pass goal: close the current comparison-route caveat by covering dynamic and
  static item rendering, controlled and default selection, disabled keys,
  per-item disabled state, group disabled state, orientation, illustration slot
  composition, keyboard selection, route controls, and support export parity
  against current React Spectrum S2.

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                                     | Notes                                                                                                                                                                                                                   |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `SelectBoxGroup` page, React Aria MCP `GridList` selection docs, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/selectboxgroup-demo.ts`. | Viewer now drives `orientation`, `selectionMode`, controlled/default selection source, selected/default keys, `disabledKeys`, per-item `isDisabled`, group `isDisabled`, and illustration composition into both stacks. |
| External Authority And Standards         | passing | React Aria GridList selection/actions docs and installed React Spectrum S2 source.                                                                                           | The Solid component keeps the React Aria collection selection model: selected key sets, disabled item suppression, option semantics, and keyboard selection.                                                            |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/SelectBoxGroup.tsx`, `@react-spectrum/s2/exports/SelectBoxGroup.ts`, Solid source `packages/solid-spectrum/src/selectboxgroup/index.tsx`.  | Solid now matches S2's exported surface and wrapper shape: `SelectBoxGroupContext`, dynamic `items`, static `SelectBox` children, `orientation`, collection disabled keys, item disabled state, and press scaling.      |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/selectboxgroup/index.tsx`, package tests.                                                                                                       | Static child registration stays Solid-local, refs merge through the context helper, and child resolution remains lazy enough for collection rendering without duplicating user markup.                                  |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/collection-button-controls-visual.spec.ts`.                                                                                     | Covered listbox/option semantics, accessible option names, `aria-selected`, disabled option suppression, group disabled suppression, keyboard selection, and no component-local strings needing localization.           |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/SelectBoxGroup.test.tsx`, `e2e/button-family-contract.spec.ts`, `e2e/collection-button-controls-visual.spec.ts`.                               | Covered controlled `selectedKeys`, uncontrolled `defaultSelectedKeys`, `onSelectionChange`, multiple selection, `disabledKeys`, item `isDisabled`, group `isDisabled`, click suppression, and keyboard selection.       |
| Style Source-To-Computed Parity          | passing | Solid S2 style source, shared generated CSS, visual assertions for default, multiple, vertical illustrated, disabled, and hover states.                                      | Browser proof compares the current Solid rendering against current React Spectrum for wrapper layout, option sizing, disabled/selected indicators, illustration alignment, and hover text color.                        |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, shared serialized route props, component controls, visual-state matrix.                                                                         | Both fixtures import public APIs, receive the same serialized demo props, expose matching selected-key markers, and render matching content, disabled, and illustration branches.                                       |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                                                                               | SelectBoxGroup is accepted for this component pass; remaining gaps are listed below.                                                                                                                                    |

## Fixed In This Pass

- Exported `SelectBoxGroupContext` from solid-spectrum and merged context
  props, `styles`, `UNSAFE_className`, `UNSAFE_style`, and refs into the root
  listbox.
- Added static `SelectBox` children support in addition to dynamic `items`
  rendering.
- Added SelectBox `pressScale` style composition to match the upstream pressed
  transform path.
- Added shared SelectBoxGroup route data for parsing, normalization,
  serialization, defaults, key options, disabled item options, and item
  metadata.
- Expanded viewer controls for orientation, selection mode, controlled/default
  selection source, selected/default keys, `disabledKeys`, item `isDisabled`,
  group `isDisabled`, and illustration composition.
- Updated React and Solid fixtures to use the same route data and serialized
  props.
- Added package coverage for uncontrolled default selection, `disabledKeys`,
  per-item disabled state, static children, and `SelectBoxGroupContext`.
- Added browser coverage for uncontrolled default selection, disabled keys,
  disabled item/illustration parity, expanded interactive controls, and
  keyboard selection.
- Replaced the visual-state caveat with explicit default-key, controls, and
  disabled-key evidence rows.

## Covered States

- Horizontal and vertical orientation.
- Single and multiple selection.
- Controlled `selectedKeys` click changes.
- Uncontrolled `defaultSelectedKeys` initialization and later click changes.
- Group disabled state.
- Collection `disabledKeys`.
- Per-item `SelectBox.isDisabled`.
- Text-only and illustrated option composition.
- Static `SelectBox` children and dynamic `items`.
- Keyboard Space selection.
- Hover text color and selected/disabled indicator geometry against React
  Spectrum.

## Commands

- `vp test run packages/solid-spectrum/test/SelectBoxGroup.test.tsx`
  - `1` file, `7` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/selectboxgroup/index.html`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/collection-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep SelectBoxGroup --reporter=line --workers=1`
  - `11` browser tests passed after rerunning outside the sandbox because
    Chromium launch hit the local sandbox restriction.
- `vp run comparison:report:gaps`
  - report passed; SelectBoxGroup now lists explicit default-key, controls, and
    disabled-key evidence rows.
- `vp run comparison:report:exports`
  - report passed; `SelectBoxGroupContext` is no longer listed as a missing
    solid-spectrum support export.
- `vp run check`
  - formatting, lint, and typecheck passed after `vp check --fix`.

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for SelectBoxGroup.
- Focus and pressed visual states are covered through shared ListBox option
  behavior, `pressScale`, keyboard assertions, and current visual pair checks,
  not a dedicated exhaustive screenshot grid.
