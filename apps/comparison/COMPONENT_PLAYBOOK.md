# Component Playbook

Use this as the task runner for re-baselining or porting one Spectrum S2
component. Work one task at a time, in order. Open only the linked checklist for
the current task and record evidence in the component validation notes.

Read
[`docs/adr/0001-s2-styling-source-of-truth.md`](../../docs/adr/0001-s2-styling-source-of-truth.md)
before changing styled component code.

## Rules

- File existence is not parity.
- Upstream source wins when docs, APG examples, or assumptions disagree.
- Evidence authority is layered: source and semantic behavior first,
  interaction timelines next, computed styles and current pair diffs after that.
- Acceptance gates are additive. Documentation/viewer parity, external
  authority, upstream source, Solid idioms, accessibility/i18n, behavior, style,
  React-vs-Solid comparison parity, and evidence/handoff must all be checked.
  Do not use one as a substitute for another.
- Do not use per-side committed screenshot assertions as component acceptance
  gates. Remove `toHaveScreenshot`, `toMatchSnapshot`, and helper wrappers that
  compare current React to old React PNGs or current Solid to old Solid PNGs.
- When those gates are removed, record a repository hygiene follow-up to delete
  obsolete per-side PNG baselines and update report wording that still implies
  committed screenshot coverage is required.
- Stable screenshots are not enough; transitions and runtime cleanup must be
  proven before visual evidence is accepted.
- Every user-observable upstream branch in scope needs source branch coverage.
  Behavior, style, and accessibility branches cannot be accepted by inspection
  alone.
- The official S2 docs page and interactive viewer are part of the acceptance
  surface. If our route controls, examples, or notes omit a documented setting
  or state, record it as a gap.
- Route-control parity means the visible control UI matches the official
  viewer, not only that the component can receive equivalent props. Internal
  sentinel values for omitted props must not leak into the public route.
- Viewer parity includes the preview environment around the component. If an
  official viewer setting changes the canvas background, container padding,
  density, width, direction, theme, or other surrounding condition, represent
  that condition in our route or record it as a route gap.
- Do not expand every prop into a full Cartesian regression matrix by default.
  Derive prop/state/subpart dependencies from upstream source, then test the
  smallest React-vs-Solid deltas that prove each dependency. Use larger matrices
  only when source branches actually combine axes or the risk is high.
- Visual failures must be classified as `port bug`, `upstream drift`,
  `harness bug`, `threshold debt`, or `unrelated family failure` before
  acceptance changes are made.
- When a pass discovers that the current component provides context, slots,
  props, refs, or state to another component that has not been validated yet,
  create or update that future component's validation notes immediately. Record
  it under `Incoming Cross-Component Findings`; do not wait for that component's
  full pass.
- Before changing component code, run the focused component suite when it
  exists. If it is already red, record that as the baseline.
- Each task ends with evidence or a recorded blocker.
- Do not start the next task while the current task has unresolved gaps that
  affect it.
- Do not accept a component with a promise to retro-audit it later. If any
  in-scope playbook gate is partial, keep the component partial, record the
  blocker in the validation note, and close it before moving to the next
  component sweep.
- The component validation note must contain the acceptance-gates checklist.
  Task 13 cannot be marked accepted while any in-scope checkbox is unchecked.

## Task 0 - Gather Component Research

Goal: define the target and its source-backed validation obligations.

Open:

- [Acceptance Gates](./playbook/acceptance-gates.md)
- [Component Research](./playbook/component-research.md)
- [Official Docs And Viewer Parity](./playbook/official-docs-viewer-parity.md)
- [Source Index](./playbook/source-index.md)
- target React Aria, S2, APG, standards, and platform pages only when relevant

Output:

- acceptance gate checklist copied into the component validation notes;
- component target and related subcomponents;
- research notes with docs, APG patterns, source conflicts, and `none found`
  entries;
- official S2 docs section, example, and interactive viewer inventory;
- official viewer control-state inventory: option labels/order, selected
  defaults, reset behavior, omitted-prop defaults, and explicit option values;
- viewer environment inventory for settings that change the surrounding canvas,
  container, theme, direction, or background;
- validation obligations for API, behavior, styling, runtime, accessibility,
  i18n, and caveats;
- external authority obligations from React Aria/S2 docs, specs, APG/WCAG,
  ARIA-AT, Chrome/web.dev/MDN, or independent articles mapped to source,
  route, behavior, accessibility, style, or gap rows.

Validate:

- every acceptance gate category is present in the validation notes before
  research continues;
- every source disagreement names the authority used for this pass;
- every validation category is sourced, explicitly not applicable, or assigned
  to source audit;
- every official S2 example and viewer setting is mapped to a route/control,
  source branch row, or explicit gap;
- every optional viewer control distinguishes omitted/default state from an
  explicit option value unless current React behavior proves they are identical;
- viewer-only environmental changes are mapped as route obligations, not
  dismissed as documentation chrome;
- no implementation code changed.

Stop: the next task can capture baseline reports without reopening unrelated
docs.

## Task 1 - Capture Current Baseline

Goal: record the current state and the improvement target.

Open:

- this file
- current reports

Output:

- before-report lines;
- exact target for this pass.

Validate:

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
```

Stop: the target and measurable report lines are recorded.

## Task 2 - Route Harness

Goal: make the comparison route trustworthy before auditing behavior.

Open:

- [Route Harness](./playbook/route-harness.md)
- target manifest, controls, fixtures, and focused e2e files

Output:

- React and Solid fixtures mount real components or visible missing states;
- public S2 controls drive both sides and cover the official viewer settings;
- documented examples that affect behavior, style, accessibility, geometry, or
  composition are represented in route fixtures or marked as route gaps;
- viewer backgrounds, container padding, forced widths, direction, theme, and
  other setting-dependent canvas conditions are represented when they affect
  the component's observable rendering;
- optional prop controls preserve official viewer selection semantics, including
  unselected defaults and non-public route sentinels;
- route harness evidence.

Validate:

- both panels render;
- exactly one `data-comparison-control-root` exists per fixture;
- controls update mounted DOM and serialized props;
- route controls use official S2 prop names, option values, and defaults;
- route-control tests assert visible option labels/order, selected default, and
  absence of internal sentinel values for optional props;
- setting-dependent viewer environment changes update both React and Solid
  fixtures, not only the component props;
- a focused test proves the route is not a missing fallback.

Stop: the route can be used as an audit surface.

## Task 3 - Source Map And Public Contract

Goal: identify every relevant upstream file and consumer-visible API surface.

Open:

- [Upstream Source Map](./playbook/upstream-source-map.md)
- [Public API](./playbook/public-api.md)
- files discovered by those checklists

Output:

- upstream-to-Solid file map across all layers;
- public props, slots, defaults, contexts, exports, refs, and unsupported
  branches marked as `matched`, `ported-differently`, `not-applicable`, or
  `gap`.

Validate:

- every upstream file has an owning Solid file or recorded gap;
- every public contract item has a status;
- no implementation code changed except obvious docs or route references needed
  for the audit.

Stop: the component has source map and public contract notes.

## Task 4 - Cross-Layer Source Audit

Goal: prove behavior across state, ARIA hooks, headless components, and styled
S2 before changing code.

Open:

- [Cross-Layer Source Audit](./playbook/cross-layer-source-audit.md)
- [Source Branch Coverage](./playbook/source-branch-coverage.md)
- [Solid Idioms And Reactivity](./playbook/solid-idioms.md)
- [Acceptance Gates](./playbook/acceptance-gates.md)
- files from Task 3

Output:

- responsibility map for state, props, events, effects, DOM, styles, and tests;
- source branch ledger for every relevant upstream file;
- interaction dependency map for subparts whose output depends on props, state,
  context, environment, or child composition;
- gaps assigned to the layer task that owns them;
- pre-pass notes for any future component whose context, slot, child
  composition, ref, or state contract was discovered during this audit.

Validate:

- no branch is accepted because a same-named file exists;
- React source patterns that rely on context, render props, refs, child
  composition, or dynamic props have an equivalent Solid idiom identified;
- Solid idiom risks from the acceptance gate are checked as their own evidence
  category, not folded into source parity prose;
- accessibility, behavior, and style risks are recorded as their own gate rows,
  not folded into a general source-audit summary;
- every source-discovered dependency names the affected subpart, upstream input,
  observable output, and planned proof;
- cross-component contracts discovered for future components are recorded in
  those components' validation notes under `Incoming Cross-Component Findings`;
- every `matched` or `ported-differently` claim names evidence or the test that
  must be added later.
- every user-observable behavior, style, or accessibility branch is tested,
  assigned to a later layer task, marked not applicable, or recorded as a gap.

Stop: implementation can proceed layer by layer without rediscovering the
component.

## Task 5 - Transition And State Plan

Goal: turn state changes and source-discovered dependencies into explicit
transition, runtime, and visual-state obligations.

Open:

- [State Transitions And Timelines](./playbook/state-transitions.md)
- [Visual Regression](./playbook/visual-regression.md)
- target visual-state matrix entry

Output:

- transition inventory from upstream source and Task 0 research;
- dependency-driven test plan: baseline plus pairwise/delta checks for each
  prop/state/subpart coupling found in Task 4;
- behavior state-machine rows for every source-backed input, trigger, expected
  React result, expected Solid result, and evidence requirement;
- visual-state rows with `planned`, `blocked`, `asserted`, or `strict` status;
- list of transitions requiring Playwright replay.

Validate:

- stateful props, render props, handlers, timers, measurement hooks, and
  animation branches are covered or not applicable;
- mouse, keyboard, touch, and virtual-click transitions are planned or not
  applicable;
- hover/press/focus and overlay open/close are not collapsed into settled
  screenshots.
- each dependency is covered by a semantic assertion, computed subpart contract,
  focused pair diff, or recorded gap;
- any broad combination matrix has a written reason and is not used as a
  substitute for dependency proof.

Stop: the component has an explicit transition and visual-state plan.

## Task 6 - State Layer

Goal: close only the assigned `solid-stately` gaps.

Open:

- [State](./playbook/state.md)
- relevant `@react-stately` and `packages/solid-stately` files

Output:

- state-layer fixes;
- focused state tests.

Validate:

- controlled/uncontrolled behavior, defaults, resets, derived state, callback
  ordering, disabled/read-only/invalid branches, and collection or date/time
  edges where applicable.
- source branch ledger rows owned by the state layer are closed or blocked.

Stop: state-layer gaps are closed or explicitly blocked.

## Task 7 - ARIA Hooks

Goal: close only the assigned `solidaria` behavior and semantics gaps.

Open:

- [ARIA](./playbook/aria.md)
- [Keyboard](./playbook/keyboard.md)
- [Focus](./playbook/focus.md)
- [Overlay](./playbook/overlay.md) when applicable

Output:

- ARIA-hook fixes;
- semantic behavior tests.

Validate:

- native element choice, computed names/descriptions, ARIA attributes, keyboard,
  focus-visible, focus return, overlay dismissal, live announcements, and touch
  paths where applicable.
- source branch ledger rows owned by the ARIA-hook layer are closed or blocked.

Stop: ARIA-hook gaps are closed or explicitly blocked.

## Task 8 - Headless Components

Goal: close only the assigned `solidaria-components` composition gaps.

Open:

- [Slots And Context](./playbook/slots-context.md)
- [Solid Idioms And Reactivity](./playbook/solid-idioms.md)
- [Forms And Validation](./playbook/forms-validation.md)
- [Collections, Async, And Virtualization](./playbook/collections-async-virtualization.md)
  when applicable

Output:

- slots, contexts, render props, data attributes, hidden inputs, portals, and
  collection wiring;
- pre-pass component notes for any newly discovered child component interaction;
- focused headless tests.

Validate:

- compound structure, render-prop state, form behavior, portals, and collection
  children match upstream or have recorded deviations.
- static JSX children and render-function children both work where upstream
  supports both, especially across context provider boundaries.
- any component that is affected by this component's contexts or slots has a
  validation note entry before this task is closed.
- source branch ledger rows owned by the headless layer are closed or blocked.

Stop: headless component gaps are closed or explicitly blocked.

## Task 9 - Styled S2

Goal: close only the assigned `solid-spectrum` styling and structure gaps.

Open:

- [Styling](./playbook/styling.md)
- [Interactions And Motion](./playbook/interactions-motion.md)
- [Geometry](./playbook/geometry.md)
- [Solid Idioms And Reactivity](./playbook/solid-idioms.md)
- upstream S2 and target `solid-spectrum` files

Output:

- S2 structure and style declarations ported through the S2-compatible style
  system;
- cross-component S2 composition findings backfilled into the affected
  component notes;
- focused styled build or tests.

Validate:

- style conditions, tokens, forced-colors branches, icons, provider/form
  inheritance, geometry, and motion match upstream or have recorded deviations.
- Solid wrappers do not snapshot context, style props, render props, refs, or
  child slot content that should update dynamically.
- parent-provided context or slot behavior for future support components is
  recorded on the future component's validation note, even if that support
  component is not fully validated in this pass.
- source branch ledger rows owned by the styled S2 layer are closed or blocked.

Stop: styled S2 gaps are closed or explicitly blocked.

## Task 10 - Runtime Semantics And Lifecycle

Goal: prove browser-observable behavior after layer fixes and before visual
acceptance.

Open:

- [Runtime Semantics And Lifecycle](./playbook/runtime-semantics-lifecycle.md)
- [Solid Idioms And Reactivity](./playbook/solid-idioms.md)
- [Source Index](./playbook/source-index.md) only for external source authority
- target route and focused runtime tests

Output:

- runtime evidence for source authority, native semantics, accessible
  computation, modality paths, event pipeline, announcements, IDs,
  provider/portal behavior, and cleanup.

Validate:

- names/descriptions are computed correctly;
- ID references exist, stay stable, and do not collide;
- accessibility/i18n gate rows are covered for role/value, keyboard/focus,
  ARIA references, forms, live announcements, forced colors, reduced motion,
  locale, RTL, and multiple instances where applicable;
- consumer handlers, refs, cancellation, propagation, and disabled suppression
  match upstream;
- modality, forced-colors, and reduced-motion paths are tested or not
  applicable;
- portals, hiding, scroll locks, timers, observers, listeners, and transient
  states clean up.
- source branch ledger rows that need browser-observable proof are backed by
  runtime tests, a11y snapshots, computed-style checks, or exact pair evidence.

Stop: runtime semantics are proven or remaining gaps are assigned to the owning
layer task.

## Task 11 - Harness And Evidence Integrity

Goal: prove the comparison harness is stable enough to make visual evidence
meaningful.

Open:

- [Harness And Evidence Integrity](./playbook/harness-evidence-integrity.md)
- [Visual Regression](./playbook/visual-regression.md)
- target focused e2e helper files

Output:

- harness integrity notes for font readiness, theme/viewport pinning, animation
  freeze, isolated captures, and failure taxonomy;
- evidence hierarchy for the target pass;
- focused pre/post failure classification;
- deferred cleanup notes for obsolete per-side PNG baselines and committed
  screenshot report wording, if either still exists.

Validate:

- React and Solid screenshots cannot overlap or contaminate each other;
- no per-side committed screenshot assertions remain in the focused acceptance
  path;
- failures are classified before snapshots are updated or implementation is
  accepted.

Stop: visual evidence can be interpreted without guessing whether a failure is
a port bug, harness bug, threshold debt, upstream drift, or unrelated family
failure.

## Task 12 - Comparison Evidence

Goal: attach visual and timeline evidence to already-proven behavior.

Open:

- target comparison route
- visual-state matrix
- focused e2e spec

Output:

- screenshots, pair diffs, computed-style checks, and timeline replays required
  by Tasks 5 and 10.

Validate:

- route does not render the missing fallback;
- stable states have screenshots and pair-diff status;
- official docs examples and viewer states that affect rendering are represented
  in visual-state rows or explicitly recorded as gaps;
- viewer canvas conditions that affect rendering, such as `staticColor`
  backdrops, are covered by computed-style checks or exact pair evidence;
- small subpart visuals such as spinner strokes, icon fills, badge placement,
  hidden slots, and focus-ring geometry use computed contracts when screenshots
  are too coarse to identify the source of a mismatch;
- transitions prove before, trigger, transient, settled, and cleanup points.

Stop: comparison evidence matches the visual-state matrix claims.

## Task 13 - Acceptance And Handoff

Goal: accept only the facts proven in this pass and leave future work ordered.

Open:

- [Tests And Sign-Off](./playbook/tests-signoff.md)
- [Acceptance Gates](./playbook/acceptance-gates.md)
- files changed in Tasks 2-12

Output:

- final checks;
- report/doc updates only for proven facts;
- handoff with remaining blockers assigned to future ordered tasks.

Validate:

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp run comparison:report:gaps
vp run comparison:report:exports
vp run check
```

Also run focused package tests and the focused Playwright spec for the target.

The source branch ledger must have no in-scope `gap` rows. Any `deferred-gap`
must point to a future component validation note or issue and cannot be counted
as accepted parity for the current component.

The interaction dependency map must have no unproven in-scope rows. A component
is not accepted just because every standalone prop state has a screenshot.

The official docs/viewer parity table must have no in-scope `route-gap` or
`port-gap` rows unless the handoff explicitly keeps the component unaccepted for
that surface. `docs-drift` rows must name whether installed source or current
React behavior was used as authority.

The acceptance-gates checklist must show all in-scope items complete. If one
gate remains incomplete, mark the component `partial` and list the blocker
under that gate.

The component validation note must state whether the pass is fully accepted,
partial, or pre-pass only. Do not use `comparison-live` as a substitute for
full playbook acceptance.

Stop: status matches evidence and remaining gaps are not bundled into the
current task.
