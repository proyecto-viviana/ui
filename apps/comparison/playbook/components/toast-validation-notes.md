# Toast Validation Notes

## Target

- Component: Toast
- Slug: toast
- Family or direct subcomponents: ToastContainer, ToastQueue, ToastRegion, Toast, DefaultToast, ToastTitle, ToastDescription.
- Pass goal: current-gate parity for the S2 Toast API, comparison route, accessibility/runtime behavior, and known-defect ledger.
- Date: 2026-05-24
- Status: accepted, with the non-blocking release-hardening gaps listed below.

## Task Status

| Task                   | Status   | Evidence                                                                                                        | Blocker or next action |
| ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | complete | S2 Toast docs, React Aria Toast docs, installed `@react-spectrum/s2` and `@react-aria/toast` source.            | none                   |
| 1 Baseline             | complete | `e2e/toast-visual.spec.ts`, package tests.                                                                      | none                   |
| 2 Route harness        | complete | `apps/comparison/src/data/toast-demo.ts`, `e2e/toast-visual.spec.ts`.                                           | none                   |
| 3 Source map/API       | complete | Solid Spectrum, Solidaria Components, Solidaria, Solid Stately toast files.                                     | none                   |
| 4 Cross-layer audit    | complete | queue/container/headless/style rows below.                                                                      | none                   |
| 5 Transitions          | partial  | static/reduced/lifecycle behavior is asserted; exact S2 View Transition choreography remains release-hardening. | Toast owner            |
| 6 State                | complete | `packages/solid-stately/test/createToastState.test.ts`, Solid Spectrum tests.                                   | none                   |
| 7 ARIA hooks           | complete | `packages/solidaria/test/createToast.test.tsx`.                                                                 | none                   |
| 8 Headless             | complete | `packages/solidaria-components/test/Toast.test.tsx`.                                                            | none                   |
| 9 Styled S2            | complete | `packages/solid-spectrum/test/Toast.test.tsx`, e2e pair diff.                                                   | none                   |
| 10 Runtime lifecycle   | complete | focus, hover, timeout, action, close, stack, overlay/Escape tests.                                              | none                   |
| 11 Harness integrity   | complete | mirrored React/Solid route assertions and modeled controls.                                                     | none                   |
| 12 Comparison evidence | complete | visual matrix, manifest, reports.                                                                               | none                   |
| 13 Acceptance          | complete | this note and command log.                                                                                      | none                   |

## Agent Workflow

| Task                    | Agent role           | Context pack                                                       | Docs/skills/tools                                             | Allowed writes               | Required output                                    | Status   |
| ----------------------- | -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- | -------- |
| Toast current-gate pass | implementation/audit | Toast docs, installed source, comparison route, Solid toast layers | React Aria skill, React Spectrum S2 skill, Playwright, Vitest | Toast source/tests/docs only | fixed gaps, green focused gates, updated checklist | complete |

| Agent role           | Files read                                                                                      | Files changed                                                                                             | Evidence added                                                                                          | Commands run     | Blockers                                    | Next owner        |
| -------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------- | ----------------- |
| implementation/audit | S2 Toast docs/source, React Aria Toast docs/source, Solid toast layers, comparison route, notes | Solidaria ToastRegion, Solidaria Components ToastRegion, Toast tests, comparison docs/e2e/matrix/manifest | F6 landmark, top-layer marker, focus recovery, live-region assertions, pair-diff/default e2e assertions | see Evidence Log | exact View Transition choreography deferred | ToggleButton pass |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated: official S2 Toast docs via MCP checked 2026-05-24.
- [x] Primary docs example recorded: app-level `ToastContainer` with `ToastQueue` variant methods.
- [x] Docs examples, slots, children, icons, collections, portals, and viewer canvas conditions inventoried.
- [x] Interactive viewer controls inventoried: content, variant, placement, count, action, close-on-action, timeout, region aria-label.
- [x] Comparison route default matches official example or deviation recorded.
- [x] Side-panel controls match official viewer controls and selection semantics.
- [x] Route tests assert visible defaults/options and mounted DOM changes.

### 2. External Authority And Standards

- [x] React Aria/S2 docs and installed source checked.
- [x] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant: W3C WCAG ARIA20/ARIA13 checked for named `region` landmark expectations; Toast has no APG widget pattern; React Aria source is the chosen behavior authority for F6 and focus recovery.
- [x] Chrome/web.dev/MDN/platform explainers used only for browser behavior, test strategy, or risk discovery: none needed.
- [x] Independent/famous blog posts used only as risk discovery unless tied to normative source: none used.
- [x] Source disagreements recorded with chosen authority: React internal `data-react-aria-top-layer` maps to Solid's existing `data-solidaria-top-layer` convention.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or explicit gaps.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer.
- [x] Solid owner files identified or gaps recorded.
- [x] Public props/defaults/slots/contexts/refs/exports mapped.
- [x] DOM, ARIA, state, event, effect, cleanup, style, geometry, and cross-component branches mapped.
- [x] Source branch ledger covers every user-observable upstream branch.
- [x] Every `matched` or `ported-differently` row has direct evidence.
- [x] Remaining `deferred-gap` rows have owners and are not counted as accepted behavior.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive.
- [x] No prop destructuring/spread snapshots live Solid accessors.
- [x] Children remain lazy across provider/context boundaries.
- [x] Render props/custom roots receive live state where applicable.
- [x] Refs use Solid semantics.
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup.
- [x] Solid-specific deviations preserve documented public behavior.
- [x] Tests cover relevant reactive update risks.

### 5. Accessibility And I18n

- [x] Native element, role, computed accessible name, description, and value.
- [x] ARIA references, generated IDs, ordering, removal timing, and multiple-instance collision checks.
- [x] Keyboard model, focus order, focus-visible, focus return, and focus-not-obscured behavior.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: not applicable to Toast beyond actionable/close controls.
- [x] Form labels/help/error/validation/hidden-input/reset/submit behavior: not applicable.
- [x] Live regions, loading/selection/drag-drop announcements, and cleanup timing.
- [x] Forced colors, reduced motion, contrast-sensitive states, target size, and screen-reader-only affordances.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages.
- [x] Axe or similar smoke result, plus manual semantic assertions.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence rows completed.
- [x] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation, outside press, disabled/read-only suppression.
- [x] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty, collection navigation.
- [x] Event ordering, callback payloads/counts/suppression, propagation, and cancellation.
- [x] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified.
- [x] Solid style/token path uses S2-compatible generated classes.
- [x] Comparison app CSS does not patch component behavior/style/geometry.
- [x] Size/density/variant/staticColor/orientation/placement/field-state and provider/form style axes mapped.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover rendering-affecting branches.
- [x] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal geometry branches covered.
- [x] Official viewer canvas/background/scale/width/direction/theme conditions represented or recorded as gaps.
- [x] Visual deviations classified.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official composition.
- [x] Solid fixture imports package public API.
- [x] Both fixtures receive the same props and environment settings.
- [x] Focused route tests prove controls update mounted React and Solid DOM.
- [x] Computed style, a11y, geometry, runtime, and pair-diff evidence covers rendering-affecting branches.
- [x] Shared serialized route props are route-plumbing evidence only and are not counted as implementation parity without DOM/style/a11y/interaction proof.
- [x] Harness stability is proven.

### 9. Known Defects And Regression Protection

- [x] Known defect search completed across notes, blockers, TODO/FIXME comments, skipped tests, focused failures, comparison reports, and observed UI bugs.
- [x] Known behavioral, styling, layout, accessibility, API, i18n, lifecycle, or harness defects classified.
- [x] Known `port bug` and unresolved `harness bug` rows block acceptance.
- [x] Fixed user-visible bugs have durable regression assertions.
- [x] Layout and geometry regressions checked explicitly.
- [x] Canonical user scenarios exercised end to end.
- [x] Expected composition contexts exercised.
- [x] Legacy accepted status handled.

### 10. Evidence And Handoff

- [x] Focused package tests.
- [x] Focused Playwright/runtime tests.
- [x] Comparison reports refreshed when status/evidence changed.
- [x] `vp run check`.
- [x] Final status is `accepted`.
- [x] Remaining gaps listed by gate and owner.
- [x] Blocker labels used where applicable.

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                     | Blockers/owner                                    |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------- |
| Official Docs And Viewer Parity          | accepted | S2 docs/source, comparison route controls, e2e route assertions.             | none                                              |
| External Authority And Standards         | accepted | React Aria docs/source for Toast region/F6/focus recovery.                   | none                                              |
| Upstream React Source Parity             | accepted | source branch ledger below.                                                  | exact animation choreography is release-hardening |
| Solid Idiomatic Implementation           | accepted | reactive `ToastRegion`, Solid state wrapper, cleanup tests.                  | none                                              |
| Accessibility And I18n                   | accepted | package/e2e tests for region, alertdialog, labels, top-layer, locale labels. | AT transcript is evidence backfill                |
| Behavior State Machine                   | accepted | queue/action/timeout/stack/focus-removal tests.                              | none                                              |
| Style Source-To-Computed Parity          | accepted | S2 icon/classes/computed style/default pair-diff tests.                      | bounded pair diff, not zero tolerance             |
| React-Vs-Solid Comparison Harness Parity | accepted | mirrored fixtures, serialized props, DOM/style/a11y assertions.              | none                                              |
| Known Defects And Regression Protection  | accepted | known defect ledger below.                                                   | non-blocking release-hardening only               |
| Evidence And Handoff                     | accepted | command log and refreshed reports.                                           | none                                              |

## Research

- React Aria docs: Toast page and `useToastRegion` source behavior for named region, F6 landmark, timer pause, top-layer marker, and focus restoration.
- React Aria blog/release/example/testing pages: none required after docs/source covered behavior.
- S2 docs: Toast page for `ToastContainer`, `ToastQueue`, `actionLabel`, `shouldCloseOnAction`, variant methods, placement, and timeout rules.
- APG patterns/examples: none found for Toast; React Aria source is authority for Toast-specific F6/focus behavior.
- W3C/WHATWG/WCAG/ARIA-AT/evaluation sources: W3C WCAG ARIA20 and ARIA13 checked for named region/landmark requirements; no Toast-specific APG pattern found.
- Chrome/web.dev/MDN platform explainers: none needed.
- Independent blog posts or articles: none used.
- Other standards from Source Index: installed upstream React source.
- Source disagreements and chosen authority: Solid uses `data-solidaria-top-layer` instead of React's internal attribute name because Solid overlay utilities already recognize that marker.
- Missing related docs recorded as `none found`: APG Toast pattern and ARIA-AT transcript.

## Official Docs And Viewer Parity

| Docs item             | Official setting/example                                                | Route/control                                  | Status  | Evidence                           |
| --------------------- | ----------------------------------------------------------------------- | ---------------------------------------------- | ------- | ---------------------------------- |
| Container root        | `ToastContainer` mounted at app root                                    | comparison route mounts React and Solid stacks | matched | `toast-visual.spec.ts`             |
| Default region        | aria-label defaults to `Notifications`, placement defaults to `bottom`  | default route                                  | matched | e2e/default assertions             |
| Variant queue methods | neutral, positive, negative, info                                       | variant control                                | matched | e2e variants, Solid Spectrum tests |
| Action                | `actionLabel`, `onAction`, `shouldCloseOnAction`                        | action controls                                | matched | e2e action tests                   |
| Timeout               | min 5s, no auto-dismiss when actionable                                 | timeout/autoDismiss controls                   | matched | e2e/package tests                  |
| Stack controls        | collapsed stack, show all, clear all, collapse, Escape/outside collapse | count control                                  | matched | e2e stack tests                    |

## Source Branch Ledger

| Source branch                                   | React/S2 behavior                                                 | Solid behavior                                         | Status             | Evidence                       |
| ----------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ | ------------------ | ------------------------------ |
| ToastContainer default placement and aria label | default `bottom`, `Notifications`                                 | same defaults                                          | ported             | e2e default                    |
| ToastQueue singleton variant methods            | `neutral`, `positive`, `negative`, `info`                         | same public methods                                    | ported             | e2e variants, package tests    |
| Timeout rules                                   | 5s minimum; action disables auto-dismiss                          | same queue normalization                               | ported             | Solid Spectrum tests           |
| DOM passthrough                                 | `id` and data props flow to toast root                            | same                                                   | ported             | package tests                  |
| Stack controls                                  | localized Show all/Clear all/Collapse and Escape/outside collapse | same                                                   | ported             | e2e stack, locale package test |
| Landmark registration                           | region is navigable with F6                                       | `createLandmark` registration while visible            | ported             | Solidaria tests                |
| Top-layer marker                                | `data-react-aria-top-layer`                                       | `data-solidaria-top-layer`                             | ported-differently | e2e/package tests              |
| Timer pause                                     | pause while hovered or focused                                    | same combined pause/resume logic                       | ported             | Solidaria tests                |
| Focus recovery                                  | focus next/previous toast or restore prior focus when removed     | same user-observable behavior                          | ported             | Solidaria tests                |
| Exact View Transition choreography              | React S2 uses upstream animation choreography                     | Solid validates static/reduced/lifecycle behavior only | deferred-gap       | known defects                  |

## Accessibility And I18n

| Area                | Expected behavior                                                        | Evidence                   | Status   |
| ------------------- | ------------------------------------------------------------------------ | -------------------------- | -------- |
| Region              | named `region` with `Notifications` default                              | e2e, package tests         | accepted |
| Landmark navigation | F6 reaches the visible toast region                                      | `createToast.test.tsx`     | accepted |
| Alert semantics     | toast root is `alertdialog`, content is live-region compatible           | Solidaria Components tests | accepted |
| Focus recovery      | focused toast removal transfers focus; last toast restores prior focus   | Solidaria tests            | accepted |
| Timer readability   | timers pause on focus and hover                                          | Solidaria tests            | accepted |
| Overlay exclusion   | top-layer marker prevents outside aria hiding/interact-outside conflicts | e2e/package tests          | accepted |
| I18n                | localized close, Show all, Clear all, Collapse labels                    | Solid Spectrum tests       | accepted |

## Behavior State Machine

| State/input                         | Expected React                            | Expected Solid | Evidence          | Status   |
| ----------------------------------- | ----------------------------------------- | -------------- | ----------------- | -------- |
| Add neutral toast                   | default surface and close button render   | same           | e2e default       | accepted |
| Variant method                      | variant icon/message render               | same           | e2e/package tests | accepted |
| Add multiple toasts                 | newest visible, stack collapses           | same           | e2e stack         | accepted |
| Show all -> Collapse/Escape/outside | expanded list closes                      | same           | e2e stack         | accepted |
| Clear all                           | queue empties without per-toast `onClose` | same           | e2e/package tests | accepted |
| Action press                        | `onAction` fires, optional close          | same           | e2e/package tests | accepted |
| Action with timeout                 | remains visible                           | same           | e2e timeout       | accepted |
| Focused toast removed               | focus transfers/restores                  | same           | Solidaria tests   | accepted |

## Style Source-To-Computed

| Style branch    | Expected                                                                      | Evidence                     | Status                                 |
| --------------- | ----------------------------------------------------------------------------- | ---------------------------- | -------------------------------------- |
| Default surface | background, text color, display, min-height, radius align with S2             | computed style and pair diff | accepted                               |
| Icons           | CheckmarkCircle, AlertTriangle, InfoCircle contracts match S2 generated icons | package tests                | accepted                               |
| Placement       | top/top end/bottom/bottom end geometry routes correctly                       | e2e placement                | accepted                               |
| Stack visuals   | background items, overlay, control buttons                                    | e2e stack and package tests  | accepted                               |
| Motion          | lifecycle/static/reduced behavior stable                                      | package/e2e behavior         | accepted with release-hardening caveat |

## Known Defects And Regression Protection

| Item                                                                                                                                  | Classification                | Acceptance impact                                                                                               | Owner                  |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Zero-tolerance React-vs-Solid pixel pair diff is not accepted for Toast because portals/style engines produce small rendering deltas. | known visual delta            | non-blocking; bounded diff asserted                                                                             | comparison/Toast       |
| Exact S2 View Transition animation choreography is not fully mirrored.                                                                | release-hardening gap         | non-blocking for public API/a11y/static behavior; must be fixed if animation parity becomes a signoff criterion | Toast                  |
| Assistive-technology transcript rows are not captured.                                                                                | evidence backfill             | non-blocking; semantic/live-region/focus assertions exist                                                       | accessibility backfill |
| Initial `comparison:typecheck` failed when run in parallel with build due shared `dist` cleanup.                                      | operator/harness interference | non-blocking; serial rerun passed                                                                               | none                   |

## Evidence Log

- `vp test run packages/solidaria/test/createToast.test.tsx packages/solidaria-components/test/Toast.test.tsx`
- `vp test run packages/solid-spectrum/test/Toast.test.tsx packages/solidaria/test/createToast.test.tsx packages/solidaria-components/test/Toast.test.tsx packages/solid-stately/test/createToastState.test.ts`
- `vp run comparison:build`
- `vp run comparison:typecheck`
- `vp exec playwright test e2e/toast-visual.spec.ts --reporter=line`
- `vp run comparison:report:gaps`
- `vp run comparison:report:exports`
- `vp run check`
- `git diff --check`
