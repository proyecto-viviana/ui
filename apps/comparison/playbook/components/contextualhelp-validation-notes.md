# ContextualHelp Validation Notes

Updated: 2026-05-20

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                                                   | Notes                                                                                                                                                                                                                                     |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `ContextualHelp` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/contextualhelp-demo.ts`.                                         | Route controls cover the documented S2 API: children, trigger label, variant, ActionButton size, placement, offset, crossOffset, containerPadding, controlled open, and flip behavior.                                                    |
| External Authority And Standards         | passing | React Aria MCP `Tooltip` Interactions section and S2 `ContextualHelp` docs.                                                                                                | React Aria documents that Tooltip is not shown on touch. ContextualHelp is implemented as the press-open Popover substitute for touch-essential help.                                                                                     |
| Upstream React Source Parity             | partial | React styled fixture using `@react-spectrum/s2` `ContextualHelp`, Solid `packages/solid-spectrum/src/contextualhelp/index.tsx`.                                            | Solid now mirrors the S2 public surface for this styled slice. Strict pixel pair-diff and assistive transcript rows remain tracked, and React S2 currently renders a visible RAC dialog without a matching `aria-controls` target id.     |
| Solid Idiomatic Implementation           | passing | `PopoverTrigger`, `ActionButton`, `Popover`, `HeadingContext`, and `TextContext` composition in `packages/solid-spectrum/src/contextualhelp/index.tsx`.                    | The component no longer uses Tooltip. It opens from press/touch, supports controlled/uncontrolled state, variant icons, size, placement geometry, and legacy `content` as an alias while preferring S2 children.                          |
| Accessibility And I18n                   | passing | `packages/solidaria-components/test/Popover.test.tsx`, `packages/solid-spectrum/test/ContextualHelpTrigger.test.tsx`, `apps/comparison/e2e/contextualhelp-visual.spec.ts`. | Solid trigger ARIA exposes expanded state and a resolvable dialog relationship. Browser tests assert dialog role/content and touch-like press activation on both stacks. Provider locale wiring is inherited from the comparison fixture. |
| Behavior State Machine                   | passing | Package tests plus `apps/comparison/e2e/contextualhelp-visual.spec.ts`.                                                                                                    | Covered paths include controlled open, controlled close guard, touch-like press open, variant label defaults, info/help icon variants, legacy content alias, and Popover trigger ARIA.                                                    |
| Style Source-To-Computed Parity          | partial | `packages/solid-spectrum/src/contextualhelp/index.tsx`, S2 generated popover/action button styles, browser route.                                                          | Trigger and popover composition use existing S2 ActionButton/Popover styling. Strict open-popover pair-diff remains tracked separately.                                                                                                   |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, modeled controls contract, and visual-state matrix.                                                                                           | Both stacks receive the same normalized route/form props and expose serialized `data-comparison-control-props`; browser coverage asserts controlled open, route controls, and touch-like press.                                           |
| Evidence And Handoff                     | passing | Commands listed below.                                                                                                                                                     | ContextualHelp is accepted for the press/touch substitution slice, with strict visual pair-diff and assistive transcript rows still tracked as future hardening.                                                                          |

## Covered States

- Default S2 ContextualHelp composition with icon-only quiet ActionButton trigger.
- `help` and `info` variants, `XS` and `S` trigger sizes, and trigger label routing.
- Controlled open state, controlled close guard, and serialized route props on both stacks.
- Popover geometry controls: placement, offset, crossOffset, containerPadding, and shouldFlip.
- Touch-like press activation opens a dialog popover and does not rely on Tooltip behavior.
- Children-based heading/content rendering plus the legacy `content` alias.

## Commands

- `vp test run packages/solidaria/test/createTooltip.test.tsx packages/solidaria-components/test/Tooltip.test.tsx packages/solidaria-components/test/Popover.test.tsx packages/solid-spectrum/test/Tooltip.test.tsx packages/solid-spectrum/test/ContextualHelpTrigger.test.tsx`
- `vp run --filter @proyecto-viviana/comparison typecheck`
- `vp run --filter @proyecto-viviana/comparison build`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/contextualhelp-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/tooltip-visual.spec.ts e2e/contextualhelp-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep "Tooltip|ContextualHelp" --reporter=line`

## Remaining Gaps

- Strict open-popover React-vs-Solid visual pair-diff is still planned.
- Assistive-technology transcript rows are not yet captured for the ContextualHelp dialog.
