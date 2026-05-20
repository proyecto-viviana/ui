# ToggleButtonGroup Validation Notes

Updated: 2026-05-20

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                                                                                                    | Notes                                                                                                                                                                                                                                                                                         |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `ToggleButtonGroup` page, React Aria MCP `ToggleButtonGroup` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/button-family-demo.ts`.                                                               | The viewer now covers the documented behavior/style axes: `selectionMode`, `selectedKeys`, `disallowEmptySelection`, size, density, orientation, quiet, emphasized, justified, staticColor, disabled state, and Icon/Text child composition through the harness-only `iconPlacement` control. |
| External Authority And Standards         | passing | React Aria docs and installed `react-aria-components/src/ToggleButtonGroup.tsx`, `@react-aria/button/src/useToggleButtonGroup.ts`, `@react-stately/toggle/src/useToggleGroupState.ts`.                                                      | Solid matches the React Aria contract: single selection renders radiogroup/radio semantics, multiple selection renders toolbar/button semantics, selected state is key-based, and `disallowEmptySelection` prevents clearing the final selected key.                                          |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/ToggleButtonGroup.tsx`, React fixture `apps/comparison/src/components/react/fixtures/styled.jsx`, Solid wrapper `packages/solid-spectrum/src/togglebuttongroup/index.tsx`.                                | Solid follows S2's wrapper shape: defaults density/size/orientation, forwards React Aria selection props, applies ActionButtonGroup S2 classes, and provides ToggleButtonGroup context to child ToggleButtons.                                                                                |
| Solid Idiomatic Implementation           | passing | `packages/solidaria-components/src/ToggleButtonGroup.tsx`, `packages/solidaria-components/src/ToggleButton.tsx`, `packages/solidaria/src/button/createToggleButtonGroup.ts`, `packages/solid-stately/src/toggle/createToggleGroupState.ts`. | State, context, render props, and context inheritance remain getter-backed. Children stay lazy, refs are merged through local helpers, and group props are filtered/merged before render.                                                                                                     |
| Accessibility And I18n                   | passing | `packages/solidaria-components/test/ToggleButtonGroup.test.tsx`, `packages/solidaria/test/createToggleButtonGroup.test.tsx`, browser gates listed below.                                                                                    | Tests cover accessible name, radiogroup/radio, toolbar/button, `aria-checked`, `aria-pressed`, `aria-orientation`, `aria-disabled`, disabled suppression, and keyboard arrow navigation. No component-local strings require localization.                                                     |
| Behavior State Machine                   | passing | `packages/solid-stately/test/createToggleGroupState.test.ts`, package tests, `apps/comparison/e2e/button-family-contract.spec.ts`.                                                                                                          | Covered paths include single selection, multiple selection, controlled and uncontrolled selected keys, default selected keys, `onSelectionChange`, disabled group state, keyboard navigation, and `disallowEmptySelection` on package and comparison routes.                                  |
| Style Source-To-Computed Parity          | passing | `packages/solid-spectrum/src/button/s2-action-button-styles.ts`, `apps/comparison/e2e/grouped-button-controls-visual.spec.ts`.                                                                                                              | Zero-tolerance screenshots cover default and compact vertical selected icon-leading states. Browser assertions compare group flex direction, radiogroup orientation, gap, selected key markers, and icon/text centerline geometry against current React Spectrum.                             |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid fixtures, serialized group props, modeled controls contract, visual-state matrix.                                                                                                                                               | Both stacks import public APIs, receive the same serialized props, expose matching selected-key markers, and route the same group controls into children. This pass fixed the missing `disallowEmptySelection` viewer/control serialization.                                                  |
| Evidence And Handoff                     | passing | Commands listed below.                                                                                                                                                                                                                      | ToggleButtonGroup is accepted for the current gate pass with the documented viewer gap fixed.                                                                                                                                                                                                 |

## Fixed In This Pass

- Added `disallowEmptySelection` to the comparison prop model, URL parsing, normalization, serialization, and interactive control list.
- Forwarded `disallowEmptySelection` through both React Spectrum and Solid Spectrum comparison fixtures.
- Added package tests for headless and styled ToggleButtonGroup `disallowEmptySelection` behavior.
- Added browser coverage for route behavior, planned group props, and interactive controls.

## Covered States

- Default single-selection text ToggleButtonGroup.
- Compact vertical XL icon-leading selected ToggleButtonGroup.
- Single selection key change on both stacks.
- Empty-selection prevention through `disallowEmptySelection`.
- Multiple-selection toolbar semantics in package tests.
- Size, density, orientation, staticColor, quiet, emphasized, justified, disabled, and child Icon/Text composition controls.

## Commands

- `vp test run packages/solidaria-components/test/ToggleButtonGroup.test.tsx packages/solidaria-components/test/ToggleButton.test.tsx packages/solid-spectrum/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solidaria/test/createToggleButtonGroup.test.tsx packages/solid-stately/test/createToggleGroupState.test.ts`
- `vp run comparison:build`
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/grouped-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep ToggleButtonGroup --reporter=line --workers=1`
- `vp run check`

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for ToggleButtonGroup.
- Hover/focus/pressed visual states are covered through shared ActionButton styling evidence and package render props, not a dedicated exhaustive ToggleButtonGroup screenshot grid.
