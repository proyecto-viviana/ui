# ToggleButton Validation Notes

Updated: 2026-05-20

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                     |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `ToggleButton` page, React Aria MCP `ToggleButton` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/visual-state-matrix.ts`.                                                                 | Route controls cover the documented S2 visual/API axes: children, size, staticColor, quiet, emphasized, selected, and disabled. `iconPlacement` is a comparison harness control for the documented Icon/Text children composition.        |
| External Authority And Standards         | passing | React Aria `ToggleButton` docs and S2 `ToggleButton` docs.                                                                                                                                                                           | ToggleButton uses native button semantics with `aria-pressed` for standalone selection state, `isSelected`/`defaultSelected`, disabled suppression, and press/change callbacks from the headless layer.                                   |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/ToggleButton.tsx`, React styled fixture using `@react-spectrum/s2`, Solid `packages/solid-spectrum/src/button/ToggleButton.tsx`.                                                                   | Solid follows S2's `ToggleButton` shape: React Aria ToggleButton primitive, S2 ActionButton styling, group context inheritance, Text/Icon/Skeleton contexts, `pressScale`, and `isEmphasized` selected styling.                           |
| Solid Idiomatic Implementation           | passing | `packages/solidaria-components/src/ToggleButton.tsx`, `packages/solid-spectrum/src/button/ToggleButton.tsx`, `packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`.                                                            | Dynamic props and group/context values remain getter-backed, children stay lazy across Icon/Text providers, refs are merged through Solid context helpers, and press-scale styles are derived from live render props.                     |
| Accessibility And I18n                   | passing | `packages/solidaria-components/test/ToggleButton.test.tsx`, `packages/solidaria-components/test/Button.test.tsx`, `apps/comparison/e2e/single-button-controls-visual.spec.ts`, `apps/comparison/e2e/button-family-contract.spec.ts`. | Package and browser tests cover button role/name, selected `aria-pressed`, disabled behavior, icon-only `aria-label`, selected URL state, click toggling, and disabled suppression. No component-local locale strings are needed.         |
| Behavior State Machine                   | passing | Focused package tests and browser route tests listed below.                                                                                                                                                                          | Covered paths include controlled `isSelected`, uncontrolled `defaultSelected`, `onChange`, disabled suppression, render props, context selection from ToggleButtonGroup, route control updates, click toggle, and selected URL hydration. |
| Style Source-To-Computed Parity          | passing | `packages/solid-spectrum/src/button/s2-action-button-styles.ts`, generated S2 classes, `apps/comparison/e2e/single-button-controls-visual.spec.ts`, `apps/comparison/e2e/button-family-contract.spec.ts`.                            | Strict zero-tolerance screenshots cover default, icon-leading, selected icon-leading, and icon-only states. Browser style/geometry checks cover icon/text centerlines, text colors, staticColor black/white, and S2 viewer backdrops.     |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, modeled controls contract embedded in `single-button-controls-visual.spec.ts`, visual-state matrix.                                                                                                     | Both stacks import public APIs, receive the same serialized props, expose matching selected-state markers, and mount the same S2 children composition for text, icon-leading, and icon-only states.                                       |
| Evidence And Handoff                     | passing | Commands listed below.                                                                                                                                                                                                               | ToggleButton is accepted for the current gate pass. ToggleButtonGroup remains a separate component pass, though group context interaction is covered here because it affects ToggleButton rendering.                                      |

## Covered States

- Default unselected ToggleButton with text content.
- Icon-leading and icon-only children composition, including icon/text centerline geometry.
- Controlled selected route state and click toggling on both stacks.
- Size, staticColor, quiet, emphasized, selected, and disabled route controls.
- Standalone context props and ToggleButtonGroup context inheritance for size, selected state, disabled state, and S2 styling.
- StaticColor black/white computed style and comparison viewer backdrop parity through the shared button-family contract.

## Commands

- `vp test run packages/solidaria-components/test/ToggleButton.test.tsx packages/solidaria-components/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/single-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep "ToggleButton" --reporter=line --workers=1`
- `vp run check`

## Remaining Gaps

- Assistive-technology transcript rows are not yet captured for standalone ToggleButton.
- Hover/focus/pressed screenshots are covered through shared ActionButton styling evidence, not a dedicated standalone ToggleButton state grid.
- ToggleButtonGroup has its own component pass pending; this note only accepts the standalone ToggleButton surface plus the group-context branches that affect child rendering.
