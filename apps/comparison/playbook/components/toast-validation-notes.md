# Toast Validation Notes

Updated: 2026-05-20

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                               | Notes                                                                                                                                                                                                                              |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `Toast` page, React Aria MCP `Toast` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/toast-demo.ts`.          | Route controls now cover the documented public surface: `ToastContainer`, `ToastQueue.neutral/positive/negative/info`, placement, action label, action close behavior, timeout, aria label, and multi-toast count.                 |
| External Authority And Standards         | passing | React Aria Toast docs and S2 Toast docs.                                                                                                               | Toasts are exposed in a named region, use alertdialog semantics from the headless layer, keep the close button adjacent to content, enforce non-action timeout minimums, and keep actionable toasts open unless explicitly closed. |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/Toast.tsx`, React styled fixture using `@react-spectrum/s2`, Solid `packages/solid-spectrum/src/toast/index.tsx`.    | Solid now follows S2's global queue/container model, default `bottom` placement, variant queue methods, newest same-priority ordering, collapsed stack, Show all/Clear all/Collapse controls, FocusScope, and Escape collapse.     |
| Solid Idiomatic Implementation           | passing | `packages/solidaria-components/src/Toast.tsx`, `packages/solid-stately/src/toast/createToastState.ts`, `packages/solid-spectrum/src/toast/index.tsx`.  | The implementation layers the S2 API over existing Solid Aria/Stately primitives, keeps legacy helpers, and adds `clear()`/newest-first queue behavior where the state layer needed S2 parity.                                     |
| Accessibility And I18n                   | passing | `packages/solid-spectrum/test/Toast.test.tsx`, `apps/comparison/e2e/toast-visual.spec.ts`.                                                             | Browser tests cover the named Notifications region, close labels, action flow, collapsed/expanded stack controls, FocusScope containment, and Escape collapse. Provider locale wiring is inherited from the comparison fixture.    |
| Behavior State Machine                   | passing | Package tests for Solid Spectrum/Solid Aria/Solid Stately plus focused Playwright tests.                                                               | Covered paths include queue close functions, clear all, per-variant methods/icons, actionable no-auto-dismiss, action-triggered close, timeout routing, collapsed stack expansion/collapse, overlay click, and Escape collapse.    |
| Style Source-To-Computed Parity          | partial | S2 style macros, generated `packages/solid-spectrum/src/s2-generated.css`, browser route.                                                              | Toast colors, icon slots, layout, stack background items, controls, and placements are routed through S2-style macros. Strict pixel pair-diff and exact View Transition choreography remain planned hardening.                     |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, modeled controls contract, `apps/comparison/src/data/visual-state-matrix.ts`, `apps/comparison/e2e/toast-visual.spec.ts`. | Both stacks now use real `ToastContainer`/`ToastQueue` APIs and receive the same normalized route controls. The prior placeholder mismatch is removed.                                                                             |
| Evidence And Handoff                     | passing | Commands listed below.                                                                                                                                 | Full component signoff is scoped to Toast. The broad regression file still has unrelated Tooltip/Breadcrumbs/Calendar/DateField failures and is not used as the Toast acceptance gate.                                             |

## Covered States

- Default S2 ToastContainer and `ToastQueue.neutral` contract with `Notifications` region.
- Variant queue methods and icon contracts: neutral, positive, negative, and info.
- Placement values: `top`, `top end`, `bottom`, and `bottom end`.
- Multi-toast collapsed stack, Show all, Clear all, Collapse, Escape collapse, overlay collapse, and FocusScope containment.
- Actionable toasts with `actionLabel`, `onAction`, `shouldCloseOnAction`, and no auto-dismiss when an action is present.
- Non-action timeout minimum of 5000ms, queue close return functions, clear-all state, and newest same-priority ordering.
- Comparison controls for content, variant, placement, count, action, timeout, and region label.

## Commands

- `vp test run packages/solid-spectrum/test/Toast.test.tsx packages/solidaria-components/test/Toast.test.tsx packages/solid-stately/test/createToastState.test.ts`
- `vp run comparison:typecheck`
- `vp run --filter @proyecto-viviana/comparison build`
- `COMPARISON_BASE_URL=http://127.0.0.1:4333 vp exec --filter @proyecto-viviana/comparison playwright test e2e/toast-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep Toast --reporter=line --workers=1`
- `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Toast" -u`
- `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Toast"`

## Remaining Gaps

- Strict React-vs-Solid pixel pair-diff is still planned for Toast.
- Assistive-technology transcript rows are not yet captured for the Toast stack.
- Exact S2 View Transition animation choreography is not fully mirrored; Solid currently validates stable reduced/static stack behavior plus lifecycle attributes.
