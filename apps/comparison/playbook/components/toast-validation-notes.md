# Toast Validation Notes

Updated: 2026-05-21

## Gate Matrix

| Gate                                     | Status  | Evidence                                                                                                                                               | Notes                                                                                                                                                                                                                              |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 MCP `Toast` page, React Aria MCP `Toast` page, `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/toast-demo.ts`.          | Route controls cover the documented public surface: `ToastContainer`, `ToastQueue.neutral/positive/negative/info`, placement, action label, action close behavior, timeout, aria label, and multi-toast count.                     |
| External Authority And Standards         | passing | React Aria Toast docs and S2 Toast docs.                                                                                                               | Toasts are exposed in a named region, use alertdialog semantics from the headless layer, keep the close button adjacent to content, enforce non-action timeout minimums, and keep actionable toasts open unless explicitly closed. |
| Upstream React Source Parity             | passing | Installed `@react-spectrum/s2/src/Toast.tsx`, React styled fixture using `@react-spectrum/s2`, Solid `packages/solid-spectrum/src/toast/index.tsx`.    | Solid follows S2's global queue/container model, default `bottom` placement, variant queue methods, newest same-priority ordering, DOM option passthrough, localized stack controls, `clear()` semantics, and Escape collapse.     |
| Solid Idiomatic Implementation           | passing | `packages/solidaria-components/src/Toast.tsx`, `packages/solid-stately/src/toast/createToastState.ts`, `packages/solid-spectrum/src/toast/index.tsx`.  | The implementation layers the S2 API over existing Solid Aria/Stately primitives, keeps legacy helpers, and keeps queue behavior in the state layer where React Stately carries it.                                                |
| Accessibility And I18n                   | passing | `packages/solid-spectrum/test/Toast.test.tsx`, `apps/comparison/e2e/toast-visual.spec.ts`.                                                             | Browser and package tests cover the named Notifications region, localized close/Show all/Clear all/Collapse labels, action flow, collapsed/expanded stack controls, FocusScope containment, and Escape collapse.                   |
| Behavior State Machine                   | passing | Package tests for Solid Spectrum/Solid Aria/Solid Stately plus focused Playwright tests.                                                               | Covered paths include queue close functions, clear all without `onClose`, per-variant methods/icons, actionable no-auto-dismiss, action-triggered close with `onClose`, timeout routing, overlay click, and Escape collapse.       |
| Style Source-To-Computed Parity          | passing | S2 style macros, generated `packages/solid-spectrum/src/s2-generated.css`, browser route, `expectScreenshotPair`.                                      | Toast colors, icon slots, layout, stack background items, controls, and placements route through S2-style macros. The default surface now has bounded React-vs-Solid screenshot pair-diff evidence.                                |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, modeled controls contract, `apps/comparison/src/data/visual-state-matrix.ts`, `apps/comparison/e2e/toast-visual.spec.ts`. | Both stacks use real `ToastContainer`/`ToastQueue` APIs, receive the same normalized route controls, expose close/action counters, and assert the default surface pair diff.                                                       |
| Evidence And Handoff                     | passing | Commands listed below.                                                                                                                                 | Full component signoff is scoped to Toast. Comparison typecheck and build are green; the typecheck emits only existing unused-helper hints in styled fixtures.                                                                     |

## Covered States

- Default S2 ToastContainer and `ToastQueue.neutral` contract with `Notifications` region.
- Variant queue methods and icon contracts: neutral, positive, negative, and info.
- Placement values: `top`, `top end`, `bottom`, and `bottom end`.
- Multi-toast collapsed stack, Show all, Clear all, Collapse, Escape collapse, overlay collapse, and FocusScope containment.
- Actionable toasts with `actionLabel`, `onAction`, `shouldCloseOnAction`, and no auto-dismiss when an action is present.
- Non-action timeout minimum of 5000ms, queue close return functions, clear-all state, and newest same-priority ordering.
- Comparison controls for content, variant, placement, count, action, timeout, and region label.
- S2 source details added in this pass: DOM option passthrough via `filterDOMProps`, S2 localized stack controls, localized close label, and `ToastQueue.clear()` not calling per-toast `onClose`.

## Commands

- `vp test run packages/solid-spectrum/test/Toast.test.tsx packages/solidaria-components/test/Toast.test.tsx packages/solid-stately/test/createToastState.test.ts`
- `vp run comparison:typecheck`
- `vp run comparison:build`
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec --filter @proyecto-viviana/comparison playwright test e2e/toast-visual.spec.ts --reporter=line --workers=1`

## Remaining Gaps

- Zero-tolerance React-vs-Solid pixel pair-diff is not accepted for Toast; the current acceptance is bounded because React and Solid portals/style engines still produce small rendering deltas.
- Assistive-technology transcript rows are not yet captured for the Toast stack.
- Exact S2 View Transition animation choreography is not fully mirrored; Solid currently validates stable reduced/static stack behavior plus lifecycle attributes.
