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

## Acceptance Gate Checklist

These gates are additive. Do not mark the component accepted unless every
in-scope item is checked. Leave unchecked items visible for partial passes.

### 1. Official Docs And Viewer Parity

- [ ] Live official S2 page opened and dated:
- [ ] Primary docs example recorded:
- [ ] Docs examples, slots, children, icons, images, collections, portals, and
      viewer canvas conditions inventoried:
- [ ] Interactive viewer controls inventoried with labels, values, order,
      defaults, reset behavior, and omitted-prop behavior:
- [ ] Comparison route default matches official example or deviation recorded:
- [ ] Side-panel controls match official viewer controls and selection
      semantics:
- [ ] Route tests assert visible defaults/options and mounted DOM changes:

### 2. Upstream React Source Parity

- [ ] Upstream files identified for every relevant layer:
- [ ] Solid owner files identified or gaps recorded:
- [ ] Public props/defaults/slots/contexts/refs/exports mapped:
- [ ] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped:
- [ ] Source branch ledger covers every user-observable upstream branch:
- [ ] Every `matched` or `ported-differently` row has direct evidence:
- [ ] Remaining `gap` or `deferred-gap` rows have owners and are not counted as
      accepted:

### 3. Solid Idiomatic Implementation

- [ ] Dynamic props, context values, and derived values remain reactive:
- [ ] No prop destructuring/spread snapshots live Solid accessors:
- [ ] Children remain lazy across provider/context boundaries:
- [ ] Render props/custom roots receive live state where applicable:
- [ ] Refs use Solid semantics:
- [ ] Effects, observers, timers, listeners, and subscriptions have cleanup:
- [ ] Solid-specific deviations preserve documented public behavior:
- [ ] Tests cover relevant reactive update risks:

### 4. React-Vs-Solid Comparison Harness Parity

- [ ] React fixture imports current upstream component and official composition:
- [ ] Solid fixture imports package public API:
- [ ] Both fixtures receive the same props and environment settings:
- [ ] Focused route tests prove controls update mounted React and Solid DOM:
- [ ] Computed style, a11y, geometry, runtime, or pair-diff evidence covers
      rendering-affecting branches:
- [ ] Harness stability is proven:

### 5. Evidence And Handoff

- [ ] Focused package tests:
- [ ] Focused Playwright/runtime tests:
- [ ] Comparison reports refreshed when status/evidence changed:
- [ ] `vp run check`:
- [ ] Final status is `accepted`, `partial`, or `pre-pass`:
- [ ] Remaining gaps listed by gate and owner:

## Research

- React Aria docs:
- React Aria blog/release/example/testing pages:
- S2 docs:
- APG patterns/examples:
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

## Evidence

- Package tests:
- Playwright/runtime tests:
- Screenshots and pair diffs:
- Builds/checks:

## Handoff

- Status after this pass:
- Remaining gaps:
- Next ordered task:
- Risks or skipped checks with reason:
