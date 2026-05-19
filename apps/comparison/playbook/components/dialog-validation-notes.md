# Dialog Validation Notes

Updated: 2026-05-19

## Gate Matrix

| Gate                            | Status  | Evidence                                                                                                                                                                                                    | Notes                                                                                                                                                                                                                                                                             |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upstream React Source Parity    | partial | MCP docs checked for S2 `Dialog`, `DialogTrigger`, `DialogContainer`, and React Aria `Modal`/`Dialog` APIs.                                                                                                 | Solid now covers the S2 `isDismissible`, `isKeyboardDismissDisabled`, `role`, `size`, `defaultOpen`, and controlled `isOpen/onOpenChange` surface while retaining the older `isDismissable` and `sm/md/lg` aliases used by existing examples.                                     |
| Official Docs And Viewer Parity | partial | `apps/comparison/src/data/component-controls.ts` and `apps/comparison/src/data/dialog-demo.ts`.                                                                                                             | Side-panel controls cover trigger text, title/body content, S2 size, role, controlled open state, outside-dismiss behavior, and Escape-dismiss behavior. DialogContainer/onDismiss and fullscreen/custom dialog variants remain tracked separately.                               |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/dialog-visual.spec.ts`.                                        | Both stacks mount live Dialog islands with serialized props, controlled open markers, trigger pair-diff evidence, bounded open-surface pair-diff evidence, and browser assertions for viewport placement, occlusion, outside click, Escape, and focus.                            |
| Acceptance Gates                | passing | `packages/solidaria-components/test/Dialog.test.tsx`, `packages/solid-spectrum/test/Dialog.test.tsx`, `apps/comparison/e2e/dialog-visual.spec.ts`, `apps/comparison/e2e/modeled-controls-contract.spec.ts`. | Package coverage checks default open, controlled open, role, size aliases, dismissible spelling aliases, disabled Escape behavior, and real focus restoration. Browser gates pass for default visual surface, route controls, modal focus return, and side-panel control routing. |
| Evidence And Handoff            | updated | `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                                                                            | Dialog is moved from missing Solid styled wiring to live partial parity with explicit remaining gaps.                                                                                                                                                                             |

## Covered States

- Default trigger and modal surface: S2 trigger label, title, body, close button, M size, viewport placement, occlusion checks, and bounded React/Solid open-surface visual diff.
- Controlled open state: route and side-panel `isOpen` drive both stacks and update serialized comparison props.
- Dismissal behavior: outside pointer dismissal, Escape dismissal, visible close button dismissal, focus containment, and focus return to the Solid trigger.
- API variants: `role="alertdialog"`, `size="XL"`, `isKeyboardDismissDisabled`, `isDismissible`, and retained `isDismissable`/legacy size aliases.
- Modal-open viewer routing: the generic section locator uses structural DOM lookup so `aria-hidden` applied by an open Dialog does not block control-contract assertions.

## Commands

- `vp test run packages/solidaria-components/test/Dialog.test.tsx packages/solid-spectrum/test/Dialog.test.tsx`
- `vp test run packages/solidaria/test/FocusScope.test.tsx packages/solidaria/test/FocusScopeOwnerDocument.test.tsx`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/dialog-visual.spec.ts --reporter=line`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep Dialog --reporter=line`
- `vp run --filter @proyecto-viviana/comparison typecheck`
- `vp run --filter @proyecto-viviana/comparison build`

## Remaining Gaps

- DialogContainer/onDismiss composition remains tracked beyond this default Dialog slice.
- FullscreenDialog, CustomDialog, and AlertDialog variant styling remain tracked separately.
- Screen-reader transcript evidence remains open beyond DOM-level ARIA, focus containment, and keyboard assertions.
