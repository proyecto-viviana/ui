# ToggleButtonGroup Validation Notes

## Target

- Component: ToggleButtonGroup
- Slug: togglebuttongroup
- Family or direct subcomponents: ToggleButtonGroup, grouped ToggleButton children, Icon, Text, and the shared ActionButton style primitive.
- Pass goal: current-gate parity for S2 ToggleButtonGroup API, React Aria group semantics, comparison route controls, styling evidence, and known-defect regression protection.
- Date: 2026-05-24
- Status: accepted, with the non-blocking evidence gaps listed below.

## Task Status

| Task                   | Status   | Evidence                                                                               | Blocker or next action |
| ---------------------- | -------- | -------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | complete | React Aria ToggleButtonGroup docs/source, S2 ToggleButtonGroup docs/source.            | none                   |
| 1 Baseline             | complete | Existing route controls, strict visual rows, package tests, and prior validation note. | none                   |
| 2 Route harness        | complete | `component-controls.ts`, `button-family-demo.ts`, grouped-button Playwright spec.      | none                   |
| 3 Source map/API       | complete | Solidaria, Solidaria Components, Solid Spectrum, installed React Aria/S2 source.       | none                   |
| 4 Cross-layer audit    | complete | Source branch ledger below.                                                            | none                   |
| 5 Transitions          | n/a      | ToggleButtonGroup has selection and press states; no mounted enter/exit transition.    | none                   |
| 6 State                | complete | `createToggleGroupState` and grouped package tests.                                    | none                   |
| 7 ARIA hooks           | complete | `createToggleButtonGroup` and item tests.                                              | none                   |
| 8 Headless             | complete | `packages/solidaria-components/test/ToggleButtonGroup.test.tsx`.                       | none                   |
| 9 Styled S2            | complete | `packages/solid-spectrum/test/ToggleButtonGroup.test.tsx`, visual/e2e rows.            | none                   |
| 10 Runtime lifecycle   | complete | controlled/uncontrolled selection, keyboard navigation, disabled suppression.          | none                   |
| 11 Harness integrity   | complete | Interactive controls drive every documented S2 prop into both stacks.                  | none                   |
| 12 Comparison evidence | complete | visual matrix, manifest, reports.                                                      | none                   |
| 13 Acceptance          | complete | this note and command log.                                                             | none                   |

## Agent Workflow

| Task                            | Agent role           | Context pack                                                                | Docs/skills/tools                                             | Allowed writes                           | Required output                                    | Status   |
| ------------------------------- | -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------- | -------- |
| ToggleButtonGroup current gates | implementation/audit | ToggleButtonGroup docs/source, comparison route, Solid toggle/button layers | React Aria skill, React Spectrum S2 skill, Playwright, Vitest | ToggleButtonGroup source/tests/docs only | fixed gaps, green focused gates, updated checklist | complete |

| Agent role           | Files read                                                                                                                          | Files changed                                                                                                                                                     | Evidence added                                                                                                     | Commands run     | Blockers | Next owner |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | -------- | ---------- |
| implementation/audit | S2 and React Aria docs/source, Solidaria toggle state/hooks, Solidaria Components ToggleButtonGroup, Solid Spectrum button/group UI | Solid Spectrum ToggleButton/ToggleButtonGroup, headless/styled tests, grouped-button Playwright spec, manifest, visual matrix, this note, README after acceptance | child-prop fallback regression, root DOM ARIA pass-through, full interactive control drive, disabled item behavior | see Evidence Log | none     | Tooltip    |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated: S2 ToggleButtonGroup docs via MCP checked 2026-05-24.
- [x] Primary docs example recorded: ToggleButtonGroup with ToggleButton children and single/multiple selection.
- [x] Docs examples, slots, children, icons, collections, portals, and viewer canvas conditions inventoried: ToggleButton children, Icon/Text composition, staticColor canvas behavior; no portal branch.
- [x] Interactive viewer controls inventoried: selectionMode, selectedKeys, disallowEmptySelection, size, density, orientation, staticColor, iconPlacement, quiet, emphasized, justified, disabled.
- [x] Comparison route default matches official example or deviation recorded.
- [x] Side-panel controls match official viewer controls and selection semantics.
- [x] Route tests assert visible defaults/options and mounted DOM changes.

### 2. External Authority And Standards

- [x] React Aria/S2 docs and installed source checked.
- [x] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant: native button/radio/toolbar semantics come from React Aria/S2 source; no separate custom-widget APG branch is needed.
- [x] Chrome/web.dev/MDN/platform explainers used only for browser behavior, test strategy, or risk discovery: none needed.
- [x] Independent/famous blog posts used only as risk discovery unless tied to normative source: none used.
- [x] Source disagreements recorded with chosen authority: installed source is authority for S2 context fallback behavior.
- [x] External obligations mapped to route/source/behavior/a11y/style rows or explicit gaps.

### 3. Upstream React Source Parity

- [x] Upstream files identified for every relevant layer.
- [x] Solid owner files identified or gaps recorded.
- [x] Public props/defaults/slots/contexts/refs/exports mapped.
- [x] DOM, ARIA, state, event, style, geometry, and grouped-child branches mapped.
- [x] Source branch ledger covers every user-observable upstream branch.
- [x] Every `matched` or `ported-differently` row has direct evidence.
- [x] Remaining evidence gaps have owners and are not counted as accepted behavior.

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive.
- [x] No prop destructuring/spread snapshots live Solid accessors in accepted behavior paths.
- [x] Children remain lazy across provider/context boundaries.
- [x] Render props receive live group disabled and selected state where applicable.
- [x] Refs use Solid semantics and merge through the styled wrapper.
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup or are not applicable.
- [x] Solid-specific deviations preserve documented public behavior.
- [x] Tests cover relevant reactive update risks.

### 5. Accessibility And I18n

- [x] Native element, role, computed accessible name, description, and value.
- [x] ARIA references, generated IDs, ordering, removal timing, and multiple-instance collision checks: group `id`, `aria-describedby`, and `aria-details` pass through.
- [x] Keyboard model, focus order, focus-visible, focus return, and focus-not-obscured behavior.
- [x] Disabled/read-only/required/invalid/inert/hidden semantics: group disabled and per-item disabled suppress selection/press.
- [x] Form labels/help/error/validation/hidden-input/reset/submit behavior: not applicable for ToggleButtonGroup.
- [x] Live regions, loading/selection/drag-drop announcements, and cleanup timing: not applicable.
- [x] Forced colors, reduced motion, contrast-sensitive states, target size, and screen-reader-only affordances covered through shared ActionButton/S2 style evidence and root semantics.
- [x] Locale, direction, formatting, calendar/hour-cycle, and messages: no component-local strings.
- [x] Axe or similar smoke result, plus manual semantic assertions: package and browser semantic assertions cover the in-scope surface.

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence rows completed.
- [x] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation, outside press, disabled/read-only suppression: button press layer and ToggleButtonGroup tests cover pointer/keyboard/click/disabled; overlay branches not applicable.
- [x] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty, collection navigation: controlled, uncontrolled, default keys, and disallow-empty behavior covered.
- [x] Event ordering, callback payloads/counts/suppression, propagation, and cancellation: group tests cover `onSelectionChange` payloads and disabled suppression.
- [x] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup: not applicable.
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence: no mounted transition lifecycle.

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified.
- [x] Solid style/token path uses S2-compatible generated classes.
- [x] Comparison app CSS does not patch component behavior/style/geometry.
- [x] Size/density/staticColor/orientation/icon placement/quiet/emphasized/justified/disabled axes mapped.
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover rendering-affecting branches.
- [x] Forced-colors/reduced-motion/focus-ring/icon/slot geometry branches covered or recorded: dedicated ToggleButtonGroup forced-colors grid is not captured; shared S2 ActionButton/Button-family evidence covers the primitive.
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

| Gate                                     | Outcome  | Evidence                                                                     | Blockers/owner                                                     |
| ---------------------------------------- | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Official Docs And Viewer Parity          | accepted | S2 docs, route controls, e2e route-control assertions.                       | none                                                               |
| External Authority And Standards         | accepted | React Aria docs/source for radiogroup, toolbar, and selected-key semantics.  | none                                                               |
| Upstream React Source Parity             | accepted | source branch ledger below.                                                  | none                                                               |
| Solid Idiomatic Implementation           | accepted | Solid wrapper fix, getter-backed context values, package tests.              | none                                                               |
| Accessibility And I18n                   | accepted | role/name/state/id/ARIA/disabled assertions.                                 | AT transcript is evidence backfill                                 |
| Behavior State Machine                   | accepted | controlled/uncontrolled/default/disallow-empty/disabled tests.               | none                                                               |
| Style Source-To-Computed Parity          | accepted | strict visual states, Icon/Text geometry, group layout assertions.           | dedicated hover/focus/pressed screenshot grid is release-hardening |
| React-Vs-Solid Comparison Harness Parity | accepted | mirrored fixtures, serialized props, mounted DOM assertions, pair-diff rows. | none                                                               |
| Known Defects And Regression Protection  | accepted | child-prop masking bug fixed with package/e2e regressions.                   | non-blocking evidence gaps only                                    |
| Evidence And Handoff                     | accepted | command log and refreshed reports.                                           | none                                                               |

## Research

- React Aria docs: ToggleButtonGroup page for single/multiple selection, selected key APIs, disabled group, orientation, and root ARIA/DOM props.
- React Aria source: installed `react-aria-components` ToggleButtonGroup and `@react-aria/button` hooks confirm `radiogroup`/`radio` semantics for single selection and `toolbar`/button semantics for multiple selection.
- React Stately source: installed `@react-stately/toggle` confirms controlled/uncontrolled selected key behavior and `disallowEmptySelection`.
- S2 docs: ToggleButtonGroup page for `density`, `size`, `orientation`, `staticColor`, `isQuiet`, `isEmphasized`, `isJustified`, selection props, disabled state, and styles/unsafe props.
- S2 source: installed `@react-spectrum/s2/src/ToggleButtonGroup.tsx` and `ToggleButton.tsx` for group defaults, child-context fallback, ActionButtonGroup classes, and ToggleButton child styling.
- APG patterns/examples: no separate APG source needed; React Aria source owns the applied radiogroup/toolbar behavior.
- W3C/WHATWG/WCAG/ARIA-AT/evaluation sources: no extra component-specific source needed beyond native button/radio semantics.
- Chrome/web.dev/MDN platform explainers: none needed.
- Independent blog posts or articles: none used.
- Source disagreements and chosen authority: installed S2 source is authority for child visual prop fallback because the docs only list the public API.
- Missing related docs recorded as `none found`: ARIA-AT transcript for ToggleButtonGroup.

## Official Docs And Viewer Parity

| Docs item                | Official setting/example                          | Route/control                       | Status  | Evidence                          |
| ------------------------ | ------------------------------------------------- | ----------------------------------- | ------- | --------------------------------- |
| Selection mode           | `selectionMode` single/multiple, default single   | selectionMode control               | matched | package/e2e tests                 |
| Selected keys            | `selectedKeys`, `defaultSelectedKeys`             | selectedKeys control                | matched | package/e2e tests                 |
| Empty selection          | `disallowEmptySelection`                          | disallowEmptySelection control      | matched | package/e2e tests                 |
| Size/density/orientation | XS/S/M/L/XL, regular/compact, horizontal/vertical | size, density, orientation controls | matched | strict visual and layout tests    |
| Static color             | auto/black/white                                  | staticColor control                 | matched | e2e route controls                |
| Quiet/emphasis           | quiet group, emphasized selected buttons          | isQuiet, isEmphasized controls      | matched | e2e route controls                |
| Justified                | children divide available width                   | isJustified control                 | matched | e2e route controls                |
| Disabled                 | disabled group and disabled child suppression     | isDisabled control and package test | matched | package/e2e tests                 |
| Root ARIA/DOM props      | id, aria-describedby, aria-details, labels        | package regression                  | matched | headless component tests          |
| Icon/Text composition    | ToggleButton children use Icon/Text contexts      | iconPlacement harness control       | matched | strict visual/icon geometry tests |

## Source Map And Public Contract

| Layer               | Upstream files                                                                  | Solid files                                                                                                | Status |
| ------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------ |
| State               | `@react-stately/toggle/src/useToggleGroupState.ts`                              | `packages/solid-stately/src/toggle/createToggleGroupState.ts`                                              | ported |
| ARIA hooks          | `@react-aria/button/src/useToggleButtonGroup.ts`, `useToggleButtonGroupItem`    | `packages/solidaria/src/button/createToggleButtonGroup.ts`, `createToggleButton.ts`, `createButton.ts`     | ported |
| Headless components | `react-aria-components/dist/private/ToggleButtonGroup.js`                       | `packages/solidaria-components/src/ToggleButtonGroup.tsx`, `ToggleButton.tsx`                              | ported |
| Styled S2           | `node_modules/@react-spectrum/s2/src/ToggleButtonGroup.tsx`, `ToggleButton.tsx` | `packages/solid-spectrum/src/togglebuttongroup/index.tsx`, `button/ToggleButton.tsx`, action-button styles | ported |
| Comparison route    | official S2 package on React stack                                              | `component-controls.ts`, `button-family-demo.ts`, React/Solid fixtures, e2e specs                          | ported |

## Source Branch Ledger

| Source branch                      | React/S2 behavior                                                  | Solid behavior                                     | Status | Evidence                   |
| ---------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------- | ------ | -------------------------- |
| Single selection                   | root `radiogroup`; children `radio` with `aria-checked`            | same                                               | ported | package/e2e tests          |
| Multiple selection                 | root `toolbar`; children buttons with `aria-pressed`               | same                                               | ported | package/e2e tests          |
| Controlled `selectedKeys`          | click requests next Set through `onSelectionChange`                | same                                               | ported | package/e2e tests          |
| Uncontrolled `defaultSelectedKeys` | initial selected key set comes from default keys                   | same                                               | ported | package tests              |
| `disallowEmptySelection`           | final selected key cannot be cleared                               | same                                               | ported | package/e2e tests          |
| Group disabled                     | root `aria-disabled`; children disabled; callbacks suppressed      | same                                               | ported | package/e2e tests          |
| Per-item disabled                  | item remains disabled inside enabled group                         | same                                               | ported | new package regression     |
| Root ARIA/DOM props                | id and ARIA refs pass through the root div                         | same                                               | ported | new package regression     |
| S2 group visual props              | group props flow to child ToggleButtons                            | same                                               | ported | package/e2e tests          |
| S2 child visual prop fallback      | omitted group values do not mask child ToggleButton props          | fixed to use raw group context plus child fallback | ported | new package regression     |
| Icon/Text child composition        | child ToggleButtons receive Text/Icon contexts                     | same                                               | ported | visual/e2e tests           |
| Group layout and compact radii     | ActionButtonGroup classes set gap/flex direction and compact edges | same                                               | ported | strict visual/layout tests |

## Accessibility And I18n

| Area           | Expected behavior                                                       | Evidence          | Status   |
| -------------- | ----------------------------------------------------------------------- | ----------------- | -------- |
| Single root    | `radiogroup` with accessible name and `aria-orientation`                | package/e2e tests | accepted |
| Single item    | child `radio`, selected item has `aria-checked=true`, no `aria-pressed` | package tests     | accepted |
| Multiple root  | `toolbar` with accessible name                                          | package/e2e tests | accepted |
| Multiple item  | child button exposes `aria-pressed`                                     | package/e2e tests | accepted |
| Root ARIA refs | `id`, `aria-describedby`, `aria-details`, labels pass through           | package test      | accepted |
| Disabled       | group disabled and per-item disabled suppress callbacks and selection   | package/e2e tests | accepted |
| Keyboard       | arrow navigation between group items                                    | package tests     | accepted |
| I18n           | no component-local strings or formatting                                | source audit      | accepted |

## Behavior State Machine

| State/input                | Expected React                                       | Expected Solid | Evidence      | Status   |
| -------------------------- | ---------------------------------------------------- | -------------- | ------------- | -------- |
| Initial single selection   | selected key renders checked radio                   | same           | package/e2e   | accepted |
| Click selected single item | selection clears unless disallowed                   | same           | package tests | accepted |
| Click other single item    | selected key moves and callback receives next Set    | same           | package/e2e   | accepted |
| Multiple selection click   | selected key toggles and button `aria-pressed` flips | same           | package/e2e   | accepted |
| `defaultSelectedKeys`      | uncontrolled group starts selected                   | same           | package tests | accepted |
| Controlled `selectedKeys`  | mounted DOM reflects controlled props                | same           | e2e controls  | accepted |
| Group disabled             | child press and selection callbacks are suppressed   | same           | package/e2e   | accepted |
| Per-item disabled          | disabled child does not press inside enabled group   | same           | package test  | accepted |
| Route controls             | all modeled docs props update mounted DOM            | same           | e2e controls  | accepted |

## Style Source-To-Computed

| Style branch        | Expected                                                    | Evidence                             | Status                                 |
| ------------------- | ----------------------------------------------------------- | ------------------------------------ | -------------------------------------- |
| Default             | default text ToggleButtonGroup matches S2                   | strict visual row                    | accepted                               |
| Compact vertical    | compact vertical XL group uses S2 layout and edge radii     | strict visual row and layout asserts | accepted                               |
| Icon/Text geometry  | icon-leading selected child keeps icon/text centerline      | visual geometry assertions           | accepted                               |
| Static color        | staticColor flows through group context into children       | route-control assertions             | accepted                               |
| Quiet/emphasis      | quiet and emphasized group state affects selected children  | package/e2e tests                    | accepted                               |
| Justified           | child buttons divide container width                        | route-control assertions             | accepted                               |
| Disabled            | disabled group and child states use native/S2 disabled path | package/e2e tests                    | accepted                               |
| Child prop fallback | child props survive omitted group context values            | package regression                   | accepted                               |
| Focus/hover/press   | S2 ActionButton primitive states apply                      | Button-family evidence               | accepted with evidence-backfill caveat |

## Known Defects And Regression Protection

| Item                                                                                                                              | Classification             | Acceptance impact                                                                       | Owner                        |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------- |
| Solid styled group context previously provided defaulted values that masked child ToggleButton props when the group omitted them. | fixed port bug             | blocking bug fixed; package regression covers disabled child and child visual prop path | none                         |
| Interactive viewer previously did not exercise every documented S2 prop at once.                                                  | fixed harness gap          | blocking gap fixed; Playwright now drives selection, style, layout, and disabled axes   | none                         |
| Root DOM ARIA refs were not covered by the headless component test.                                                               | fixed evidence gap         | regression added for root id, description, and details forwarding                       | none                         |
| Assistive-technology transcript rows are not captured for ToggleButtonGroup.                                                      | evidence backfill          | non-blocking; role/name/state/disabled semantic assertions exist                        | accessibility backfill       |
| Dedicated hover/focus/pressed screenshot grid is not captured for ToggleButtonGroup.                                              | release-hardening evidence | non-blocking; shared Button-family/S2 ActionButton evidence covers the primitive        | comparison/ToggleButtonGroup |

## Evidence Log

- `vp test run packages/solid-spectrum/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/ToggleButton.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solidaria-components/test/ToggleButtonGroup.test.tsx packages/solidaria-components/test/ToggleButton.test.tsx packages/solidaria/test/createToggleButtonGroup.test.tsx packages/solidaria/test/createButton.test.tsx packages/solid-stately/test/createToggleGroupState.test.ts`
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec playwright test e2e/grouped-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --grep ToggleButtonGroup --reporter=line --workers=1`
- `vp run comparison:report:gaps`
- `vp run comparison:report:exports`
- `vp run check`
- `git diff --check`
