# SegmentedControl Validation Notes

Updated: 2026-05-20

## Target

- Component: SegmentedControl
- Slug: segmentedcontrol
- Family or direct subcomponents: SegmentedControlItem, ToggleButtonGroup,
  ToggleButton, SelectionIndicator, Icon/Text contexts
- Pass goal: close the current comparison-route caveat by covering controlled
  and default selection, item disabled state, icon/text item composition,
  justified geometry, keyboard selection, and route controls against current
  React Spectrum S2.

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                                        | Notes                                                                                                                                                                                                                       |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `SegmentedControl` page, React Aria MCP `ToggleButtonGroup` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/segmentedcontrol-demo.ts`. | Viewer now drives `selectionSource`, `selectedKey`, `defaultSelectedKey`, item `isDisabled`, item icon placement, `isJustified`, and group `isDisabled` into both stacks.                                                   |
| External Authority And Standards         | passing | React Aria ToggleButtonGroup docs and installed React Spectrum S2 source.                                                                                                       | The component follows the React Aria single-selection radiogroup/radio model and S2's `disallowEmptySelection` wrapper behavior.                                                                                            |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/SegmentedControl.tsx`, Solid source `packages/solid-spectrum/src/segmentedcontrol/index.tsx`.                                                 | Solid matches S2's wrapper shape: single horizontal ToggleButtonGroup, selected/default key mapping, first-item fallback, item registration, SelectionIndicator, press transform, icon context, and text wrapping.          |
| Solid Idiomatic Implementation           | passing | `packages/solid-spectrum/src/segmentedcontrol/index.tsx`, package tests.                                                                                                        | Props and context remain getter-backed where needed, children are resolved lazily inside item content, refs remain Solid-local, and default selection registration happens after mount.                                     |
| Accessibility And I18n                   | passing | Package tests and browser assertions in `e2e/collection-button-controls-visual.spec.ts`.                                                                                        | Covered radiogroup/radio semantics, accessible names for text and icon-only items, `aria-checked`, disabled suppression, keyboard Space selection, and no component-local strings needing localization.                     |
| Behavior State Machine                   | passing | `packages/solid-spectrum/test/SegmentedControl.test.tsx`, `e2e/button-family-contract.spec.ts`, `e2e/collection-button-controls-visual.spec.ts`.                                | Covered first-item fallback, `defaultSelectedKey`, controlled `selectedKey`, external controlled updates, `onSelectionChange`, group disabled, item disabled, click and keyboard selection, and disabled-click suppression. |
| Style Source-To-Computed Parity          | passing | Solid S2 style source, selected-indicator geometry assertions, justified equal-width assertions, visual pair checks for justified and icon-only disabled states.                | Browser proof compares root background, indicator geometry, selected width, equal item widths, and icon geometry to React Spectrum.                                                                                         |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, serialized route props, component controls, visual-state matrix.                                                                                   | Both fixtures import public APIs, receive the same serialized demo props, expose matching selected-key markers, and render matching item content/disabled branches.                                                         |
| Evidence And Handoff                     | passing | Focused commands listed below.                                                                                                                                                  | SegmentedControl is accepted for this component pass; remaining gaps are listed below.                                                                                                                                      |

## Fixed In This Pass

- Added shared SegmentedControl route data for parsing, normalization,
  serialization, defaults, item metadata, and key options.
- Added viewer controls for controlled/default selection source,
  `defaultSelectedKey`, item `isDisabled`, and item icon composition.
- Updated React and Solid fixtures to pass the same controlled or uncontrolled
  selection props, disabled item prop, and icon/text or icon-only children.
- Added package coverage for `defaultSelectedKey`, item disabled suppression,
  `SegmentedControlContext`, and icon-only `aria-label` items.
- Added browser route coverage for uncontrolled default selection, icon-only
  disabled item parity, and the expanded interactive controls.
- Exported `SegmentedControlContext` and merged context `styles`,
  `UNSAFE_className`, `UNSAFE_style`, and refs into the root radiogroup.
- Updated S2 icon-only selectors to recognize Solid icons rendered with
  `data-slot="icon"` so icon-only SegmentedControl item sizing matches React
  Spectrum.
- Replaced the visual-state caveat with explicit default-key and
  icon-disabled evidence rows.

## Covered States

- Default first-item selection.
- Controlled `selectedKey` click changes.
- Uncontrolled `defaultSelectedKey` initialization and later click changes.
- Group disabled state.
- Item disabled state.
- Text-only, icon-leading, and icon-only items with accessible names.
- Justified selected indicator geometry.
- Keyboard Space selection.

## Commands

- `vp test run packages/solid-spectrum/test/SegmentedControl.test.tsx`
  - `1` file, `8` tests passed.
- `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/segmentedcontrol/index.html`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/collection-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep SegmentedControl --reporter=line --workers=1`
  - `7` browser tests passed.
- `vp run comparison:report:gaps`
  - report passed; SegmentedControl now lists explicit default-key and
    icon-disabled evidence rows instead of the previous icon-slot caveat.
- `vp run comparison:report:exports`
  - report passed; `SegmentedControlContext` is no longer listed as a missing
    solid-spectrum support export.
- `vp run check`
  - formatting, lint, and typecheck passed.

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for
  SegmentedControl.
- Hover/focus/pressed visual states are covered through shared ToggleButton
  behavior and selected-indicator geometry, not a dedicated exhaustive
  screenshot grid.
