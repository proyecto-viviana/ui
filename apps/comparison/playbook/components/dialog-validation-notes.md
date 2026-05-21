# Dialog Validation Notes

Updated: 2026-05-21

## Gate Matrix

| Gate                            | Status  | Evidence                                                                                                                                                                                                    | Notes                                                                                                                                                                                                                                                                          |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Upstream React Source Parity    | covered | MCP docs checked for S2 `Dialog`, `DialogTrigger`, `DialogContainer`, `AlertDialog`, `FullscreenDialog`, `CustomDialog`, slots, and React Aria `Modal`/`Dialog` behavior.                                   | Solid covers S2 `isDismissible`, `isKeyboardDismissDisabled`, `role`, `size`, `defaultOpen`, controlled `isOpen/onOpenChange`, DialogContainer dismissal, AlertDialog actions, fullscreen/custom variants, slot composition, and close-button behavior.                        |
| Official Docs And Viewer Parity | covered | `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/dialog-demo.ts`, and `packages/solid-spectrum/test/Dialog.test.tsx`.                                                            | Side-panel controls cover trigger text, title/body content, S2 size, role, controlled open state, outside-dismiss behavior, and Escape-dismiss behavior. Package tests cover the non-viewer S2 composition APIs so the viewer table no longer hides them as undocumented gaps. |
| Route Harness                   | passing | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/e2e/dialog-visual.spec.ts`.                                        | Both stacks mount live Dialog islands with serialized props, controlled open markers, trigger pair-diff evidence, bounded open-surface pair-diff evidence, and browser assertions for viewport placement, occlusion, outside click, Escape, and focus.                         |
| Acceptance Gates                | passing | `packages/solidaria-components/test/Dialog.test.tsx`, `packages/solid-spectrum/test/Dialog.test.tsx`, `apps/comparison/e2e/dialog-visual.spec.ts`, `apps/comparison/e2e/modeled-controls-contract.spec.ts`. | Package coverage checks default open, controlled open, role, size aliases, dismissible spelling aliases, disabled Escape behavior, focus restoration, DialogContainer, AlertDialog, FullscreenDialog, CustomDialog, CloseButton, and slot visibility. Browser gates pass.      |
| Evidence And Handoff            | updated | `apps/comparison/src/data/component-controls.ts`, `apps/comparison/src/data/comparison-manifest.ts`, `apps/comparison/src/data/visual-state-matrix.ts`, this file.                                          | Dialog is live at the styled comparison layer with package-level S2 composition coverage. Live screen-reader transcript tooling remains tracked beyond the current DOM ARIA, focus containment, keyboard, and route-control assertions.                                        |

## Covered States

- Default trigger and modal surface: S2 trigger label, title, body, close button, M size, viewport placement, occlusion checks, and bounded React/Solid open-surface visual diff.
- Controlled open state: route and side-panel `isOpen` drive both stacks and update serialized comparison props.
- Dismissal behavior: outside pointer dismissal, Escape dismissal, visible close button dismissal, focus containment, and focus return to the Solid trigger.
- API variants: `role="alertdialog"`, `size="XL"`, `isKeyboardDismissDisabled`, `isDismissible`, and retained `isDismissable`/legacy size aliases.
- S2 composition APIs: `DialogTrigger` children composition, `DialogContainer`/`useDialogContainer`, `AlertDialog` primary/secondary/cancel actions, `FullscreenDialog`, `CustomDialog`, `CloseButton`, `Heading slot="title"`, `Header`, `Content`, `Footer`, `ButtonGroup`, and `Image`.
- Dismissible slot behavior: dismissible Dialog shows the S2 close button and suppresses `ButtonGroup`; non-dismissible Dialog keeps `ButtonGroup` visible.
- Modal-open viewer routing: the generic section locator uses structural DOM lookup so `aria-hidden` applied by an open Dialog does not block control-contract assertions.

## Commands

- `vp test run packages/solidaria-components/test/Dialog.test.tsx packages/solid-spectrum/test/Dialog.test.tsx`
- `vp test run packages/solid-spectrum/test/Dialog.test.tsx`
- `vp run --filter @proyecto-viviana/solid-spectrum build`
- `vp run --filter @proyecto-viviana/comparison test:dialog`
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/modeled-controls-contract.spec.ts --grep Dialog --reporter=line`

## Handoff Notes

- `apps/comparison/e2e/dialog-visual.spec.ts` owns the live React/Solid route surface, visual geometry, dismissal, and keyboard behavior.
- `packages/solid-spectrum/test/Dialog.test.tsx` owns S2 package composition that is too broad for the single interactive viewer route.
- Live screen-reader transcript evidence is still not automated in this repo; current AT evidence is DOM role/name wiring, focus containment, Escape handling, focus return, and route-control behavior.
