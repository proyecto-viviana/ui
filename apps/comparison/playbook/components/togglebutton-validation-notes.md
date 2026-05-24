# ToggleButton Validation Notes

## Target

- Component: ToggleButton
- Slug: togglebutton
- Family or direct subcomponents: standalone ToggleButton, plus the ToggleButtonGroup item branch that changes child semantics.
- Pass goal: current-gate parity for S2 ToggleButton API, React Aria semantics, comparison route controls, styling evidence, and known-defect ledger.
- Date: 2026-05-24
- Status: accepted, with the non-blocking evidence gaps listed below.

## Task Status

| Task                   | Status   | Evidence                                                                         | Blocker or next action |
| ---------------------- | -------- | -------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | complete | React Aria ToggleButton docs/source, S2 ToggleButton docs/source.                | none                   |
| 1 Baseline             | complete | Existing strict visual rows, package tests, route controls.                      | none                   |
| 2 Route harness        | complete | `component-controls.ts`, `single-button-controls-visual.spec.ts`.                | none                   |
| 3 Source map/API       | complete | Solidaria, Solidaria Components, Solid Spectrum, installed React Aria/S2 source. | none                   |
| 4 Cross-layer audit    | complete | Source branch ledger below.                                                      | none                   |
| 5 Transitions          | n/a      | ToggleButton has press-scale interaction only; no enter/exit transition surface. | none                   |
| 6 State                | complete | `createToggleButton` and grouped selection tests.                                | none                   |
| 7 ARIA hooks           | complete | `packages/solidaria/test/createButton.test.tsx`.                                 | none                   |
| 8 Headless             | complete | `packages/solidaria-components/test/ToggleButton.test.tsx`.                      | none                   |
| 9 Styled S2            | complete | `packages/solid-spectrum/test/ToggleButton.test.tsx`, visual/e2e rows.           | none                   |
| 10 Runtime lifecycle   | complete | pointer/keyboard/click/disabled/controlled/uncontrolled behavior tests.          | none                   |
| 11 Harness integrity   | complete | React/Solid route controls drive all modeled ToggleButton axes.                  | none                   |
| 12 Comparison evidence | complete | visual matrix, manifest, reports.                                                | none                   |
| 13 Acceptance          | complete | this note and command log.                                                       | none                   |

## Agent Workflow

| Task                       | Agent role           | Context pack                                                    | Docs/skills/tools                                             | Allowed writes                      | Required output                                    | Status   |
| -------------------------- | -------------------- | --------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------- | -------- |
| ToggleButton current gates | implementation/audit | ToggleButton docs/source, comparison route, Solid button layers | React Aria skill, React Spectrum S2 skill, Playwright, Vitest | ToggleButton source/tests/docs only | fixed gaps, green focused gates, updated checklist | complete |

| Agent role           | Files read                                                                                                  | Files changed                                                                                                                                                         | Evidence added                                                                                                                  | Commands run     | Blockers | Next owner             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------- | ---------------------- |
| implementation/audit | S2 and React Aria docs/source, Solidaria button hooks, Solidaria Components ToggleButton, Solid Spectrum UI | `solidaria-components/src/ToggleButton.tsx`, ToggleButton tests, `single-button-controls-visual.spec.ts`, manifest, visual matrix, this note, README after acceptance | standalone id regression, grouped id selection-key assertion, ARIA pass-through, styled wrapper tests, full route-control drive | see Evidence Log | none     | ToggleButtonGroup pass |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated: S2 ToggleButton docs via MCP checked 2026-05-24.
- [x] Primary docs example recorded: ToggleButton with optional Icon/Avatar and Text composition.
- [x] Docs examples, slots, children, icons, collections, portals, and viewer canvas conditions inventoried: Icon/Text composition and staticColor canvas behavior mapped; no collection/portal branch.
- [x] Interactive viewer controls inventoried: children, size, staticColor, quiet, emphasized, selected, disabled, plus comparison harness iconPlacement for Icon/Text composition.
- [x] Comparison route default matches official example or deviation recorded.
- [x] Side-panel controls match official viewer controls and selection semantics.
- [x] Route tests assert visible defaults/options and mounted DOM changes.

### 2. External Authority And Standards

- [x] React Aria/S2 docs and installed source checked.
- [x] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant: native button semantics and `aria-pressed` come from React Aria/S2; no separate APG custom widget pattern is needed.
- [x] Chrome/web.dev/MDN/platform explainers used only for browser behavior, test strategy, or risk discovery: none needed.
- [x] Independent/famous blog posts used only as risk discovery unless tied to normative source: none used.
- [x] Source disagreements recorded with chosen authority: installed source is authority where docs mention Avatar but the local S2 source only wires Text/Icon/Skeleton contexts.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or explicit gaps.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer.
- [x] Solid owner files identified or gaps recorded.
- [x] Public props/defaults/slots/contexts/refs/exports mapped.
- [x] DOM, ARIA, state, event, style, geometry, and group-item branches mapped.
- [x] Source branch ledger covers every user-observable upstream branch.
- [x] Every `matched` or `ported-differently` row has direct evidence.
- [x] Remaining `deferred-gap` rows have owners and are not counted as accepted behavior.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive.
- [x] No prop destructuring/spread snapshots live Solid accessors in accepted behavior paths.
- [x] Children remain lazy across provider/context boundaries.
- [x] Render props receive live selected, pressed, hover, focus, and disabled state.
- [x] Refs use Solid semantics and merge through the styled wrapper.
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup or are not applicable.
- [x] Solid-specific deviations preserve documented public behavior.
- [x] Tests cover relevant reactive update risks.

### 5. Accessibility And I18n

- [x] Native element, role, computed accessible name, description, and value.
- [x] ARIA references, generated IDs, ordering, removal timing, and multiple-instance collision checks: documented ARIA props pass through; standalone `id` is DOM id; grouped `id` is selection key only.
- [x] Keyboard model, focus order, focus-visible, focus return, and focus-not-obscured behavior.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: disabled suppresses selection and press callbacks.
- [x] Form labels/help/error/validation/hidden-input/reset/submit behavior: not applicable for ToggleButton.
- [x] Live regions, loading/selection/drag-drop announcements, and cleanup timing: not applicable.
- [x] Forced colors, reduced motion, contrast-sensitive states, target size, and screen-reader-only affordances covered through shared ActionButton/S2 style evidence and root semantics.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages: no component-local strings.
- [x] Axe or similar smoke result, plus manual semantic assertions: package and browser semantic assertions cover the in-scope standalone surface.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence rows completed.
- [x] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation, outside press, disabled/read-only suppression: button press layer and ToggleButton tests cover pointer/keyboard/click/disabled; overlay branches not applicable.
- [x] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty, collection navigation: controlled, uncontrolled, and defaults covered; other rows not applicable.
- [x] Event ordering, callback payloads/counts/suppression, propagation, and cancellation: press layer tests cover ordering; ToggleButton tests cover `onChange` payloads and suppression.
- [x] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup: not applicable.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence: press-scale behavior covered through Button family; no mounted transition lifecycle.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified.
- [x] Solid style/token path uses S2-compatible generated classes.
- [x] Comparison app CSS does not patch component behavior/style/geometry.
- [x] Size/density/variant/staticColor/orientation/placement/field-state and provider/form style axes mapped: size, staticColor, quiet, emphasized, disabled, selected, group context, Icon/Text composition.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover rendering-affecting branches.
- [x] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal geometry branches covered or recorded: dedicated ToggleButton forced-colors grid is not captured; shared S2 ActionButton/Button-family evidence covers the style primitive.
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

| Gate                                     | Outcome  | Evidence                                                                         | Blockers/owner                                                     |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Official Docs And Viewer Parity          | accepted | S2 docs, route controls, e2e route-control assertions.                           | none                                                               |
| External Authority And Standards         | accepted | React Aria docs/source for native button and `aria-pressed` semantics.           | none                                                               |
| Upstream React Source Parity             | accepted | source branch ledger below.                                                      | none                                                               |
| Solid Idiomatic Implementation           | accepted | Solid wrapper fix, render props, styled wrapper tests.                           | none                                                               |
| Accessibility And I18n                   | accepted | role/name/state/id/ARIA/disabled assertions.                                     | AT transcript is evidence backfill                                 |
| Behavior State Machine                   | accepted | controlled/uncontrolled/default/disabled/group-key tests.                        | none                                                               |
| Style Source-To-Computed Parity          | accepted | strict visual states, Icon/Text geometry, Button-family computed style evidence. | dedicated hover/focus/pressed screenshot grid is release-hardening |
| React-Vs-Solid Comparison Harness Parity | accepted | mirrored fixtures, serialized props, mounted DOM assertions, pair-diff rows.     | none                                                               |
| Known Defects And Regression Protection  | accepted | standalone id bug fixed with package regressions.                                | non-blocking evidence gaps only                                    |
| Evidence And Handoff                     | accepted | command log and refreshed reports.                                               | none                                                               |

## Research

- React Aria docs: ToggleButton page for selected state, standalone button semantics, controlled/uncontrolled selection, press/focus/hover props.
- React Aria source: installed `ToggleButton` source confirms standalone `id` is a DOM id and grouped `id` is passed to `useToggleButtonGroupItem` as the selection key.
- S2 docs: ToggleButton page for `size`, `staticColor`, `isQuiet`, `isEmphasized`, `isDisabled`, Icon/Text composition, selected props, and event props.
- S2 source: installed `@react-spectrum/s2/src/ToggleButton.tsx` for RAC primitive wrapping, group context inheritance, Text/Icon/Skeleton contexts, ActionButton styles, and `pressScale`.
- APG patterns/examples: no separate APG pattern needed; React Aria native button semantics are the behavior authority.
- W3C/WHATWG/WCAG/ARIA-AT/evaluation sources: no extra component-specific source needed beyond native button/ARIA semantics.
- Chrome/web.dev/MDN platform explainers: none needed.
- Independent blog posts or articles: none used.
- Source disagreements and chosen authority: docs mention Avatar composition, but installed S2 source for this version wires Text/Icon/Skeleton contexts; Avatar remains a Button-family docs-drift follow-up, not a ToggleButton port blocker.
- Missing related docs recorded as `none found`: ARIA-AT transcript for ToggleButton.

## Official Docs And Viewer Parity

| Docs item             | Official setting/example                         | Route/control                                 | Status  | Evidence                             |
| --------------------- | ------------------------------------------------ | --------------------------------------------- | ------- | ------------------------------------ |
| Text content          | `children` renders visible text                  | children control                              | matched | e2e route controls                   |
| Icon/Text composition | Icon plus Text composition                       | iconPlacement comparison control and fixtures | matched | strict visual/icon geometry tests    |
| Size                  | XS/S/M/L/XL, default M                           | size control                                  | matched | e2e controls and visual matrix       |
| Static color          | auto/black/white over matching canvas/background | staticColor control                           | matched | e2e controls, Button-family contract |
| Quiet/emphasized      | quiet surface and emphasized selected state      | `isQuiet`, `isEmphasized` controls            | matched | e2e controls, style tests            |
| Selection             | `isSelected`, `defaultSelected`, `onChange`      | selected control and click assertions         | matched | package/e2e tests                    |
| Disabled              | disabled suppresses press/selection              | disabled control                              | matched | package/e2e tests                    |
| Standalone id         | DOM id on standalone ToggleButton                | package regression                            | matched | component/styled/headless tests      |
| Grouped id            | selection key inside ToggleButtonGroup           | package regression                            | matched | component tests                      |

## Source Map And Public Contract

| Layer               | Upstream files                                                | Solid files                                                                                                 | Status |
| ------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------ |
| State               | `react-aria-components` ToggleButton source, `useToggleState` | `packages/solidaria/src/button/createToggleButton.ts`                                                       | ported |
| ARIA hooks          | `useToggleButton`, `useToggleButtonGroupItem`, `useButton`    | `packages/solidaria/src/button/createButton.ts`, `packages/solidaria/src/button/createToggleButtonGroup.ts` | ported |
| Headless components | `react-aria-components/src/ToggleButton.tsx`                  | `packages/solidaria-components/src/ToggleButton.tsx`, `ToggleButtonGroup.tsx`                               | ported |
| Styled S2           | `node_modules/@react-spectrum/s2/src/ToggleButton.tsx`        | `packages/solid-spectrum/src/button/ToggleButton.tsx`, `s2-action-button-styles.ts`                         | ported |
| Comparison route    | official S2 package on React stack                            | `apps/comparison/src/data/component-controls.ts`, route fixture, e2e specs                                  | ported |

## Source Branch Ledger

| Source branch                  | React/S2 behavior                                              | Solid behavior                                             | Status             | Evidence               |
| ------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------- | ------------------ | ---------------------- |
| Standalone selected state      | native button with `aria-pressed`                              | same                                                       | ported             | package/e2e tests      |
| Controlled `isSelected`        | click calls `onChange(next)` without mutating controlled state | same                                                       | ported             | package tests          |
| Uncontrolled/default selection | internal state toggles from default                            | same                                                       | ported             | package tests          |
| Disabled                       | disabled suppresses selection and press                        | same                                                       | ported             | package/e2e tests      |
| Standalone `id`                | rendered as DOM `id`                                           | fixed to pass through from wrapper to hook                 | ported             | new regression tests   |
| Grouped `id`                   | selection key only; DOM id removed by group item hook          | same                                                       | ported             | new regression tests   |
| ARIA button props              | `aria-controls`, `aria-expanded`, `aria-haspopup` pass through | same                                                       | ported             | component tests        |
| `excludeFromTabOrder`          | `tabIndex=-1`                                                  | same                                                       | ported             | component tests        |
| Icon/Text/Skeleton contexts    | S2 contexts wrap children                                      | same Text/Icon/Skeleton contexts                           | ported             | styled tests and e2e   |
| Group context styling          | group values override child visual props                       | same group context inheritance                             | ported             | group/styled tests     |
| Press scale                    | S2 `pressScale` transform                                      | Solid `pressScale` equivalent                              | ported             | Button-family tests    |
| Avatar docs mention            | docs mention Avatar, installed source does not wire context    | source-compatible Text/Icon behavior; Avatar drift tracked | ported-differently | research/known defects |

## Accessibility And I18n

| Area              | Expected behavior                                                             | Evidence                | Status   |
| ----------------- | ----------------------------------------------------------------------------- | ----------------------- | -------- |
| Standalone role   | native `button` with accessible name and `aria-pressed`                       | package/e2e tests       | accepted |
| Group single mode | item role changes to `radio` with `aria-checked`; no duplicate `aria-pressed` | ToggleButtonGroup tests | accepted |
| Group multiple    | item remains button with `aria-pressed`                                       | ToggleButtonGroup tests | accepted |
| DOM id semantics  | standalone `id` renders; grouped `id` is only the selection key               | regression tests        | accepted |
| Disabled          | native disabled and `data-disabled`; no selection callback                    | package/e2e tests       | accepted |
| Keyboard          | Enter and Space toggle through shared button press layer                      | solidaria tests         | accepted |
| I18n              | no component-local strings or formatting                                      | source audit            | accepted |

## Behavior State Machine

| State/input         | Expected React                             | Expected Solid | Evidence         | Status   |
| ------------------- | ------------------------------------------ | -------------- | ---------------- | -------- |
| Initial standalone  | `aria-pressed=false`                       | same           | package/e2e      | accepted |
| Click standalone    | toggles to selected and fires `onChange`   | same           | package/e2e      | accepted |
| Controlled selected | callback requested, DOM remains controlled | same           | package tests    | accepted |
| `defaultSelected`   | starts selected, can toggle off            | same           | package tests    | accepted |
| Disabled selected   | remains announced selected but disabled    | same           | package/e2e      | accepted |
| Standalone `id`     | DOM id renders                             | same           | regression tests | accepted |
| Grouped `id`        | selection key, not DOM id                  | same           | regression tests | accepted |
| Route controls      | all modeled props update mounted DOM       | same           | e2e controls     | accepted |

## Style Source-To-Computed

| Style branch      | Expected                                                    | Evidence                                      | Status                                 |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| Default           | unselected text ToggleButton matches S2                     | strict visual row                             | accepted                               |
| Icon/Text         | icon-leading, selected icon-leading, and icon-only geometry | strict visual rows                            | accepted                               |
| Selected/emphasis | selected and emphasized state uses S2 ActionButton styles   | e2e/package tests                             | accepted                               |
| Static color      | black/white static color uses viewer backdrop contract      | e2e route controls and Button-family contract | accepted                               |
| Disabled          | native disabled plus S2 disabled visuals                    | package/e2e tests                             | accepted                               |
| Focus/hover/press | S2 ActionButton primitive states apply                      | Button-family evidence                        | accepted with evidence-backfill caveat |

## Known Defects And Regression Protection

| Item                                                                                                       | Classification             | Acceptance impact                                                                                               | Owner                   |
| ---------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- | ----------------------- |
| Solid headless wrapper previously swallowed standalone `id` by splitting it out and deleting DOM id props. | fixed port bug             | blocking bug fixed; headless/component/styled tests now lock behavior                                           | none                    |
| Assistive-technology transcript rows are not captured for standalone ToggleButton.                         | evidence backfill          | non-blocking; role/name/state/id/disabled semantic assertions exist                                             | accessibility backfill  |
| Dedicated hover/focus/pressed screenshot grid is not captured for standalone ToggleButton.                 | release-hardening evidence | non-blocking; shared Button-family/S2 ActionButton evidence covers the primitive                                | comparison/ToggleButton |
| Docs mention Avatar composition while installed S2 source only wires Text/Icon/Skeleton contexts.          | docs/source drift          | non-blocking; source-compatible behavior accepted and tracked in Button family                                  | Button family           |
| ToggleButtonGroup has its own component pass pending.                                                      | scope boundary             | non-blocking for standalone acceptance; grouped child branch is covered here only where it affects ToggleButton | ToggleButtonGroup       |

## Evidence Log

- `vp test run packages/solidaria/test/createButton.test.tsx packages/solidaria-components/test/ToggleButton.test.tsx packages/solidaria-components/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ToggleButton.test.tsx packages/solid-spectrum/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx`
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec playwright test e2e/single-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep ToggleButton --reporter=line --workers=1`
- `vp run comparison:report:gaps`
- `vp run comparison:report:exports`
- `vp run check`
- `git diff --check`
