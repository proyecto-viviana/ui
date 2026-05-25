# Popover Validation Notes

## Target

- Component: Popover
- Slug: popover
- Family or direct subcomponents: Popover, PopoverTrigger, DialogTrigger,
  Button trigger registration, createPopover, createOverlayTrigger.
- Pass goal: align the S2 Popover docs/API surface, DialogTrigger composition,
  custom `triggerRef` anchor mode, styled size/arrow props, comparison controls,
  and current regression evidence.
- Date: 2026-05-25

## Task Status

| Task                   | Status | Evidence                                                                                                  | Blocker or next action |
| ---------------------- | ------ | --------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Popover and DialogTrigger API via S2 MCP                                                               | None                   |
| 1 Baseline             | done   | Existing route was custom-anchor only and lacked modeled controls                                         | None                   |
| 2 Route harness        | done   | `popover-demo.ts`, controls, React/Solid fixtures, visual-state rows                                      | None                   |
| 3 Source map/API       | done   | Popover props/defaults, DialogTrigger `isOpen`/`onOpenChange`, trigger refs, size and arrow props mapped  | None                   |
| 4 Cross-layer audit    | done   | Button trigger ARIA, DialogTriggerContext, Popover state/position props, styled wrapper                   | None                   |
| 5 Transitions          | done   | Controlled open state covers DialogTrigger and custom anchor paths                                        | None                   |
| 6 State                | done   | Controlled `isOpen` and `onOpenChange` routed into both stacks                                            | None                   |
| 7 ARIA hooks           | done   | DialogTrigger button matches React Aria dialog trigger semantics with `aria-expanded` and `aria-controls` | None                   |
| 8 Headless             | done   | Solid Popover now consumes DialogTrigger context and S2-only positioning props                            | None                   |
| 9 Styled S2            | done   | Public S/M/L size aliases, fit-content default, default visible arrow, `hideArrow` API                    | None                   |
| 10 Runtime lifecycle   | done   | Open/close route props update mounted React and Solid overlays                                            | None                   |
| 11 Harness integrity   | done   | Modeled controls and visual-state matrix updated                                                          | None                   |
| 12 Comparison evidence | done   | Focused package tests, comparison typecheck/build, modeled Playwright, and parity report                  | None                   |
| 13 Acceptance          | done   | `vp run check` and `git diff --check` passed                                                              | None                   |

## Agent Workflow

| Agent role | Files read                                                                                               | Files changed                                                                                                                                                                                                                                                        | Evidence added                                                                                                   | Commands run                                                                                                      | Blockers | Next owner |
| ---------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 MCP Popover/DialogTrigger docs; Solid Button/Dialog/Popover sources; comparison fixtures and controls | `packages/solidaria-components/src/{Button,Dialog,Popover,contexts}.tsx`, `packages/solid-spectrum/src/popover/index.tsx`, comparison React/Solid fixtures, `popover-demo.ts`, `component-controls.ts`, `visual-state-matrix.ts`, manifest, package tests, this note | DialogTrigger composition, dismiss/underlay, focus, styled regression tests, modeled controls, visual-state rows | Focused package tests; `comparison:typecheck`; `comparison:build`; focused Playwright; `comparison:report:parity` | none     | main       |

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                               | Blockers/owner |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 docs show `DialogTrigger > Button + Popover`; API viewer includes DialogTrigger controlled props and Popover geometry props.        | none           |
| External Authority And Standards         | complete | Overlay semantics are covered by React Aria/S2 docs; no extra normative pattern conflicts found for this component pass.               | none           |
| Upstream React Source Parity             | complete | Public props/defaults are mapped: DialogTrigger control, `hideArrow`, fit/S/M/L size, placement, offsets, flip, maxHeight.             | none           |
| Solid Idiomatic Implementation           | complete | DialogTrigger props remain context-backed and reactive; Popover props are passed as accessors where fixture values update.             | none           |
| Accessibility And I18n                   | complete | Button gets dialog trigger ARIA relationship; accessible label is routed; RAC dismiss buttons and root modal underlay are mirrored.    | none           |
| Behavior State Machine                   | complete | Controlled open/close works through DialogTrigger and custom anchor modes, with the shared overlay guard used by other popover routes. | none           |
| Style Source-To-Computed Parity          | complete | Styled API now follows S2 size names, fit-content default, macro token styling, S2 arrow default, and S2 offset math.                  | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2`; Solid fixture imports public Solid Spectrum API; both use normalized route props.          | none           |
| Known Defects And Regression Protection  | complete | Old custom-anchor-only route and `sm/md/lg`/`showArrow` mismatch are fixed with tests and modeled controls.                            | none           |
| Evidence And Handoff                     | complete | Focused package, comparison, parity, repo-level, and whitespace gates passed.                                                          | none           |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Official S2 Popover and DialogTrigger APIs checked through S2 MCP on
      2026-05-25.
- [x] Primary docs composition recorded:
      `DialogTrigger > Button + Popover`.
- [x] Custom anchor composition recorded:
      controlled `isOpen`, `onOpenChange`, `triggerRef`, and button state.
- [x] Route controls cover trigger mode, trigger label, accessible label, body
      text, placement, fit/S/M/L size, offsets, container padding, maxHeight,
      controlled open, flip, arrow visibility, and form content.

### 2. External Authority And Standards

- [x] React Aria/S2 overlay docs used as the authority for trigger composition
      and Popover positioning props.
- [x] No standalone APG pattern is more specific than the S2/RAC overlay
      contract for this component pass.

### 3. Upstream React Source Parity

- [x] Upstream docs/API surface identified for `Popover` and `DialogTrigger`.
- [x] Solid owners identified:
      `packages/solidaria-components/src/Dialog.tsx`,
      `packages/solidaria-components/src/Button.tsx`,
      `packages/solidaria-components/src/Popover.tsx`, and
      `packages/solid-spectrum/src/popover/index.tsx`.
- [x] Public prop mapping covers `containerPadding`, `crossOffset`,
      `defaultOpen`, `hideArrow`, `isOpen`, `maxHeight`, `offset`,
      `onOpenChange`, `placement`, `shouldFlip`, `size`, `triggerRef`,
      `arrowRef`, `boundaryElement`, `scrollRef`, and ARIA labels.

### 4. Solid Idiomatic Implementation

- [x] DialogTrigger exposes trigger and overlay props through context instead
      of stale local snapshots.
- [x] Button reads context props through accessors and only applies dialog
      trigger ARIA when it is registered as a dialog trigger.
- [x] Popover resolves DialogTrigger context reactively and preserves local
      `triggerRef` override for custom anchors.
- [x] Comparison fixtures keep dynamic props normalized through shared demo
      data.

### 5. Accessibility And I18n

- [x] DialogTrigger button exposes `aria-expanded` and `aria-controls` linked
      to the popover dialog id.
- [x] DialogTrigger button intentionally omits `aria-haspopup`, matching React
      Aria `useOverlayTrigger({ type: "dialog" })`.
- [x] Popover accessible label is controlled by the route and routed to both
      stacks.
- [x] Modal Popover renders leading and trailing hidden dismiss buttons, while
      non-modal Popover renders the trailing dismiss button, matching React Aria
      Components source behavior.
- [x] Root modal Popover renders the fixed underlay used by React Aria
      Components.
- [x] Locale-specific text is not owned by Popover itself; content remains
      caller-provided.

### 6. Behavior State Machine

- [x] DialogTrigger controlled open path opens and closes the overlay.
- [x] Custom anchor controlled path toggles with a separate `triggerRef`.
- [x] Focus fallback waits for descendant focus opportunity before focusing the
      popover root, matching React Aria intent without stealing focus from a
      mounted child.
- [x] Controlled-open route guard keeps side-by-side comparison toggles stable
      when modal focus movement requests close, matching the existing
      ContextualHelp/Tooltip fixture pattern.
- [x] Placement, offset, crossOffset, containerPadding, shouldFlip, maxHeight,
      and hideArrow route changes update both mounted stacks.

### 7. Style Source-To-Computed Parity

- [x] Solid styled Popover accepts S2 `size="S" | "M" | "L"`.
- [x] Omitted size maps to S2 fit-content behavior instead of a forced medium
      max-width.
- [x] Arrow is visible by default; `hideArrow` removes it.
- [x] Offset includes the S2 arrow allowance:
      `(props.offset ?? 8) + (hideArrow ? 0 : 8)`.
- [x] Styling uses S2 macro tokens for layer background, radius, outline,
      elevation, width, and max viewport width instead of legacy utility
      classes.
- [x] The measured arrow ref is routed into headless positioning when the arrow
      is visible.
- [x] ContextualHelp omits `hideArrow` from its local public surface and keeps
      its own hidden-arrow composition.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current `@react-spectrum/s2` Button,
      DialogTrigger, Popover, Form, TextField, and Switch.
- [x] Solid fixture imports public `@proyecto-viviana/solid-spectrum`
      equivalents.
- [x] Shared serialized props drive both fixtures and the modeled-controls
      contract.
- [x] Visual-state matrix rows record DialogTrigger, custom anchor, and prop
      control evidence.

### 9. Known Defects And Regression Protection

- [x] The comparison route no longer hides the official DialogTrigger
      composition behind a custom-anchor-only fixture.
- [x] Styled Popover no longer exposes legacy `sm/md/lg` sizes or `showArrow`
      for the S2 Popover path.
- [x] DialogTrigger ARIA control wiring is covered by package tests.
- [x] Hidden dismiss buttons, root modal underlay, and descendant focus behavior
      are covered by package tests.

### 10. Evidence And Handoff

- [x] Focused package tests:
      `vp test run packages/solidaria-components/test/Popover.test.tsx packages/solid-spectrum/test/regression.test.tsx`.
- [x] Focused Playwright/runtime tests:
      `COMPARISON_BASE_URL=http://127.0.0.1:4323 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/modeled-controls-contract.spec.ts --grep Popover --reporter=line`.
- [x] Comparison reports refreshed:
      `vp run comparison:typecheck`, `vp run comparison:build`, and
      `vp run comparison:report:parity`.
- [x] `vp run check`.
- [x] `git diff --check`.
- [x] Final status recorded after verification.

## Source Branch Ledger

| Branch                    | React source behavior                                        | Solid owner                            | Status  | Evidence                          |
| ------------------------- | ------------------------------------------------------------ | -------------------------------------- | ------- | --------------------------------- |
| DialogTrigger composition | `DialogTrigger` owns trigger open state and overlay id       | `DialogTriggerContext`, `Button`       | matched | Package tests                     |
| Custom anchor             | `triggerRef` plus controlled `isOpen`/`onOpenChange`         | `Popover` local triggerRef path        | matched | Modeled controls route            |
| Size                      | `undefined` fits contents, `S/M/L` set max width             | `solid-spectrum/src/popover/index.tsx` | matched | Styled wrapper and route controls |
| Arrow                     | Visible by default, hidden through `hideArrow`               | `Popover` styled wrapper               | matched | Styled wrapper and route controls |
| Geometry props            | placement, offsets, padding, flip, maxHeight, boundary refs  | `createPopover` integration            | matched | Headless prop routing             |
| Dismiss controls          | Modal gets leading/trailing dismiss; non-modal gets trailing | `PopoverDismissButton`                 | matched | Package tests                     |
| Modal underlay            | Root modal Popover renders fixed underlay                    | `Popover` portal wrapper               | matched | Package tests                     |
| Focus fallback            | Root focuses only when descendant focus is absent            | `Popover` lifecycle effect             | matched | Package tests                     |

## Remaining Gaps

- Live assistive-technology transcript evidence is still a cross-component
  evidence gap beyond DOM ARIA assertions.

## Final Status

Accepted under the current gate model. The implementation follows the S2
Popover docs surface, React Aria behavior branches, and modeled comparison
requirements, with focused package, browser, comparison, repo-level, and
whitespace gates passing.
