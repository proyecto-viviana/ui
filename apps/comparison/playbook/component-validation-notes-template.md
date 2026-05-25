# Component Validation Notes Template

Use this as the working note for one component pass. Keep entries short and
source-backed. Link evidence instead of pasting long output.

Suggested location for component files:
`apps/comparison/playbook/components/<slug>-validation-notes.md`.

## Target

- Component:
- Slug:
- Family or direct subcomponents:
- Pass goal:
- Date:

## Task Status

| Task                   | Status  | Evidence | Blocker or next action |
| ---------------------- | ------- | -------- | ---------------------- |
| 0 Research             | pending |          |                        |
| 1 Baseline             | pending |          |                        |
| 2 Route harness        | pending |          |                        |
| 3 Source map/API       | pending |          |                        |
| 4 Cross-layer audit    | pending |          |                        |
| 5 Transitions          | pending |          |                        |
| 6 State                | n/a     |          |                        |
| 7 ARIA hooks           | n/a     |          |                        |
| 8 Headless             | n/a     |          |                        |
| 9 Styled S2            | n/a     |          |                        |
| 10 Runtime lifecycle   | pending |          |                        |
| 11 Harness integrity   | pending |          |                        |
| 12 Comparison evidence | pending |          |                        |
| 13 Acceptance          | pending |          |                        |

## Agent Workflow

Use `agent-workflow.md` when assigning AI agents. Keep each row narrow enough
that the agent can finish with concrete evidence or a blocker.

| Task | Agent role | Context pack | Docs/skills/tools | Allowed writes | Required output | Status |
| ---- | ---------- | ------------ | ----------------- | -------------- | --------------- | ------ |
|      |            |              |                   |                |                 |        |

| Agent role | Files read | Files changed | Evidence added | Commands run | Blockers | Next owner |
| ---------- | ---------- | ------------- | -------------- | ------------ | -------- | ---------- |
|            |            |               |                |              |          |            |

## Acceptance Gate Checklist

These gates are additive. Do not mark the component accepted unless every
in-scope item is checked. Leave unchecked items visible for partial passes.

## Gate Outcome Summary

Every gate gets an explicit outcome. Do not merge gates together. Use
`not applicable` on individual rows only when the source proves that row is out
of scope.

| Gate                                     | Outcome     | Evidence | Blockers/owner |
| ---------------------------------------- | ----------- | -------- | -------------- |
| Official Docs And Viewer Parity          | not-started |          |                |
| External Authority And Standards         | not-started |          |                |
| Upstream React Source Parity             | not-started |          |                |
| Solid Idiomatic Implementation           | not-started |          |                |
| Accessibility And I18n                   | not-started |          |                |
| Behavior State Machine                   | not-started |          |                |
| Style Source-To-Computed Parity          | not-started |          |                |
| React-Vs-Solid Comparison Harness Parity | not-started |          |                |
| Known Defects And Regression Protection  | not-started |          |                |
| Evidence And Handoff                     | not-started |          |                |

### 1. Official Docs And Viewer Parity

- [ ] Live official S2 page opened and dated:
- [ ] Primary docs example recorded:
- [ ] Docs examples, slots, children, icons, images, collections, portals, and
      viewer canvas conditions inventoried:
- [ ] Interactive viewer controls inventoried with labels, values, order,
      defaults, reset behavior, and omitted-prop behavior:
- [ ] Official viewer controls, API/source extra controls, regression extra
      controls, and internal omitted-prop sentinels classified separately:
- [ ] Comparison route default matches official example or deviation recorded:
- [ ] Side-panel controls match official viewer controls and selection
      semantics:
- [ ] Non-viewer side-panel controls have API/source or regression rationale:
- [ ] Route tests assert visible defaults/options and mounted DOM changes:

### 2. External Authority And Standards

- [ ] React Aria/S2 docs, testing docs, blog/release/example pages checked or
      recorded as `none found`:
- [ ] W3C/WHATWG/APG/WCAG/ARIA-AT/evaluation sources checked where relevant:
- [ ] Chrome/web.dev/MDN/platform explainers used only for browser behavior,
      test strategy, or risk discovery:
- [ ] Independent/famous blog posts used only as risk discovery unless tied to
      normative source, installed source, or reproducible behavior:
- [ ] Source disagreements recorded with chosen authority:
- [ ] External obligations mapped to route/source/behavior/a11y/style rows or
      explicit gaps:

### 3. Upstream React Source Parity

- [ ] Upstream files identified for every relevant layer:
- [ ] Solid owner files identified or gaps recorded:
- [ ] Public props/defaults/slots/contexts/refs/exports mapped:
- [ ] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped:
- [ ] Source branch ledger covers every user-observable upstream branch:
- [ ] Every `matched` or `ported-differently` row has direct evidence:
- [ ] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted:

### 4. Solid Idiomatic Implementation

- [ ] Dynamic props, context values, and derived values remain reactive:
- [ ] No prop destructuring/spread snapshots live Solid accessors:
- [ ] Children remain lazy across provider/context boundaries:
- [ ] Render props/custom roots receive live state where applicable:
- [ ] Refs use Solid semantics:
- [ ] Effects, observers, timers, listeners, and subscriptions have cleanup:
- [ ] Solid-specific deviations preserve documented public behavior:
- [ ] Tests cover relevant reactive update risks:

### 5. Accessibility And I18n

- [ ] Native element, role, computed accessible name, description, and value:
- [ ] ARIA references, generated IDs, ordering, removal timing, and
      multiple-instance collision checks:
- [ ] Keyboard model, focus order, focus-visible, focus return, and
      focus-not-obscured behavior:
- [ ] Disabled/read-only/required/invalid/inert/hidden semantics:
- [ ] Form labels/help/error/validation/hidden-input/reset/submit behavior:
- [ ] Live regions, loading/selection/drag-drop announcements, and cleanup
      timing:
- [ ] Forced colors, reduced motion, contrast-sensitive states, target size,
      and screen-reader-only affordances:
- [ ] Locale, direction, formatting, calendar/hour-cycle, and messages:
- [ ] Axe or similar smoke result, plus manual semantic assertions:

### 6. Behavior State Machine

- [ ] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed:
- [ ] Pointer, keyboard, touch, virtual click, blur, Escape, cancellation,
      outside press, disabled/read-only suppression:
- [ ] Controlled/uncontrolled, defaults, reset, submit, async/loading/empty,
      collection navigation:
- [ ] Event ordering, callback payloads/counts/suppression, propagation, and
      cancellation:
- [ ] Overlay/portal/scroll-lock/hiding/focus/timer/observer/listener cleanup:
- [ ] Before/trigger/immediate/transient/settled/cleanup transition evidence:

### 7. Style Source-To-Computed Parity

- [ ] Upstream S2 style declarations and owner branches identified:
- [ ] Solid style/token path uses S2-compatible generated classes:
- [ ] Comparison app CSS does not patch component behavior/style/geometry:
- [ ] Size/density/variant/staticColor/orientation/placement/field-state and
      provider/form style axes mapped:
- [ ] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches:
- [ ] Forced-colors/reduced-motion/focus-ring/icon/image/avatar/slot/portal
      geometry branches covered:
- [ ] Official viewer canvas/background/scale/width/direction/theme conditions
      represented or recorded as gaps:
- [ ] Visual deviations classified:

### 8. React-Vs-Solid Comparison Harness Parity

- [ ] React fixture imports current upstream component and official composition:
- [ ] Solid fixture imports package public API:
- [ ] Both fixtures receive the same props and environment settings:
- [ ] Focused route tests prove controls update mounted React and Solid DOM:
- [ ] Computed style, a11y, geometry, runtime, or pair-diff evidence covers
      rendering-affecting branches:
- [ ] Shared serialized route props are route-plumbing evidence only and are not
      counted as implementation parity without DOM/style/a11y/interaction proof:
- [ ] Harness stability is proven:

### 9. Known Defects And Regression Protection

- [ ] Known defect search completed across notes, blockers, TODO/FIXME comments,
      skipped tests, focused failures, comparison reports, and observed UI bugs:
- [ ] Known behavioral, styling, layout, accessibility, API, i18n, lifecycle, or
      harness defects classified:
- [ ] Known `port bug` and unresolved `harness bug` rows block acceptance:
- [ ] Fixed user-visible bugs have durable regression assertions:
- [ ] Layout and geometry regressions checked explicitly:
- [ ] Canonical user scenarios exercised end to end:
- [ ] Expected composition contexts exercised:
- [ ] Legacy accepted status handled:

### 10. Evidence And Handoff

- [ ] Focused package tests:
- [ ] Focused Playwright/runtime tests:
- [ ] Comparison reports refreshed when status/evidence changed:
- [ ] `vp run check`:
- [ ] Final status is `accepted`, `partial`, or `pre-pass`:
- [ ] Remaining gaps listed by gate and owner:
- [ ] Blocker labels used where applicable:

## Research

- React Aria docs:
- React Aria blog/release/example/testing pages:
- S2 docs:
- APG patterns/examples:
- W3C/WHATWG/WCAG/ARIA-AT/evaluation sources:
- Chrome/web.dev/MDN platform explainers:
- Independent blog posts or articles:
- Other standards from Source Index:
- Source disagreements and chosen authority:
- Missing related docs recorded as `none found`:

## Official Docs And Viewer Parity

Record the public docs surface users see on the official S2 page. Extract
section names, examples, settings, defaults, states, and caveats; do not copy
long prose.

| Docs item | Official setting/example | Route/control | Status | Evidence |
| --------- | ------------------------ | ------------- | ------ | -------- |
|           |                          |               |        |          |

| Route control | Source surface | Official values | Route values | Status | Evidence |
| ------------- | -------------- | --------------- | ------------ | ------ | -------- |
|               |                |                 |              |        |          |

## Incoming Cross-Component Findings

Record findings discovered while validating another component. These notes do
not make this component accepted; they are reminders that this component has an
inbound composition contract to validate during its own pass.

| Discovered in | Upstream owner | Affected API/context | Required later validation |
| ------------- | -------------- | -------------------- | ------------------------- |
|               |                |                      |                           |

## Baseline

- `comparison:report:gaps` lines:
- `comparison:report:exports` lines:
- `guard:rac-export-gap` result:
- Improvement target:

## Source Map And Public Contract

| Layer               | Upstream files | Solid files | Status |
| ------------------- | -------------- | ----------- | ------ |
| State               |                |             |        |
| ARIA hooks          |                |             |        |
| Headless components |                |             |        |
| Styled S2           |                |             |        |

- Public props/defaults:
- Slots/subcomponents:
- Contexts/providers:
- Refs/imperative methods:
- Unsupported or intentionally different branches:

## Cross-Layer Audit

| Layer               | Matched | Ported differently | Not applicable | Gaps |
| ------------------- | ------- | ------------------ | -------------- | ---- |
| State               |         |                    |                |      |
| ARIA hooks          |         |                    |                |      |
| Headless components |         |                    |                |      |
| Styled S2           |         |                    |                |      |

- Solid idioms checked:
  - child/provider laziness:
  - dynamic prop/context getters:
  - render-prop/custom root liveness:
  - refs and cleanup ownership:

## Interaction Dependency Map

Use this to avoid unbounded combination testing. A row means source or docs show
that changing an input should change a subpart. Prove the React delta matches
the Solid delta.

| Subpart | Upstream input | Observable output | Minimal proof | Status | Evidence |
| ------- | -------------- | ----------------- | ------------- | ------ | -------- |
|         |                |                   |               |        |          |

## Source Branch Coverage

Every relevant upstream branch must appear here or in a linked component-specific
ledger. User-observable behavior, style, accessibility, timing, cleanup,
context, slot, and ref branches need direct evidence before they can be marked
`matched` or `ported-differently`.

| Layer | Upstream branch | Solid owner | Class | Observable | Status | Evidence |
| ----- | --------------- | ----------- | ----- | ---------- | ------ | -------- |
|       |                 |             |       |            |        |          |

## Transition Plan

- Static states:
- Interaction timelines:
- Overlay timelines:
- Loading/async timelines:
- Cleanup assertions:
- Visual-state rows changed:

## Behavior State Machine

Use one row per source-backed behavior, not one row per prop combination. The
row is complete only when React and Solid are both observed.

| State/input | Trigger | Expected React | Expected Solid | Status | Evidence |
| ----------- | ------- | -------------- | -------------- | ------ | -------- |
|             |         |                |                |        |          |

## Accessibility And I18n

Record harsh semantic proof. Automated scans are only smoke tests.

| Surface                                             | Upstream/current React | Solid | Status | Evidence |
| --------------------------------------------------- | ---------------------- | ----- | ------ | -------- |
| Role/name/description/value                         |                        |       |        |          |
| ARIA references and generated IDs                   |                        |       |        |          |
| Keyboard and focus                                  |                        |       |        |          |
| Disabled/readonly/required/invalid/hidden semantics |                        |       |        |          |
| Form labels/help/error/reset/submit                 |                        |       |        |          |
| Live announcements and cleanup                      |                        |       |        |          |
| Forced colors/reduced motion/contrast/target size   |                        |       |        |          |
| Locale/direction/formatting/messages                |                        |       |        |          |
| Multiple instances                                  |                        |       |        |          |

## Style Source-To-Computed

Trace each visual claim from upstream S2 source to Solid owner code and
browser-observable output.

| Style branch | Upstream declaration | Solid owner | Observable proof | Status |
| ------------ | -------------------- | ----------- | ---------------- | ------ |
|              |                      |             |                  |        |

## Runtime Semantics

- Native element/role decision:
- Accessible name/description assertions:
- ID stability and collision checks:
- Modality rows tested or not applicable:
- Event pipeline and consumer handler assertions:
- Solid idiom regression assertions:
- Announcements:
- Portal/provider/global cleanup:
- SSR/hydration note:

## Harness Integrity

- Pre-change focused-suite status:
- Evidence authority for this pass:
- Font/theme/viewport/animation stabilization:
- React/Solid capture isolation:
- Failure taxonomy:
- Browser/device coverage:

## Known Defects And Regression Protection

Use this table before acceptance, including for components previously marked
accepted under an older gate model.

| Finding source | Defect or risk | Class | Blocking? | Regression evidence or owner |
| -------------- | -------------- | ----- | --------- | ---------------------------- |
|                |                |       |           |                              |

Canonical scenario smoke:

| Scenario | React result | Solid result | Status | Evidence |
| -------- | ------------ | ------------ | ------ | -------- |
|          |              |              |        |          |

Composition smoke:

| Composition context | Upstream expectation | Solid result | Status | Evidence |
| ------------------- | -------------------- | ------------ | ------ | -------- |
|                     |                      |              |        |          |

## Evidence

- Package tests:
- Playwright/runtime tests:
- Screenshots and pair diffs:
- Builds/checks:

## Blockers

Use the blocker labels from `acceptance-gates.md`.

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
|       |      |         |                   |

## Handoff

- Status after this pass:
- Remaining gaps:
- Next ordered task:
- Risks or skipped checks with reason:
