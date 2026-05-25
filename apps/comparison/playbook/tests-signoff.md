# Tests And Sign-Off

A component is accepted when every changed layer has focused tests and the
comparison reports reflect the improved state.

Acceptance also requires the component's
[Acceptance Gates](./acceptance-gates.md) checklist. The gates are additive:
documentation/viewer parity, external authority, upstream source, Solid idioms,
accessibility/i18n, behavior, style, React-vs-Solid harness parity, and
known-defect/regression protection, and evidence/handoff must all be complete
for the component to be marked accepted.

## Layer Sign-Off

- Cross-layer source audit: each relevant upstream file has a Solid
  responsibility map, and every upstream branch is `matched`,
  `ported-differently`, or `not-applicable`.
- Source branch coverage: every user-observable behavior, style, accessibility,
  timing, cleanup, context, slot, and ref branch has direct evidence or a
  recorded blocker. Inspection-only acceptance is limited to non-observable
  type/internal branches with a reason.
- Interaction dependency map: every source-discovered prop/state/context/input
  to subpart-output coupling has a minimal React-vs-Solid delta proof or a
  recorded gap. Standalone screenshots for each prop do not prove coupled
  behavior.
- Official docs/viewer parity: every official S2 docs example and interactive
  viewer setting is covered by route controls, examples, source branch rows, and
  evidence, or recorded as `docs-drift`, `not-applicable`, `route-gap`, or
  `port-gap`. API/source extras, regression extras, and internal sentinels are
  classified separately and are not substitute evidence for official viewer
  parity.
- External authority: relevant React Aria/S2 docs, testing docs, release notes,
  specs, APG/WCAG/ARIA-AT/evaluation guidance, platform explainers, and
  articles are checked or recorded as `none found`; disagreements name the
  chosen authority.
- Solid idiom gate: dynamic props, lazy children, context, render props, refs,
  and cleanup risks are checked independently from upstream source parity.
- Accessibility/i18n gate: role/name/description/value, ARIA references,
  keyboard, focus, forms, announcements, forced colors, reduced motion, locale,
  RTL, and multiple-instance behavior are proven or marked not applicable.
- Behavior state-machine gate: state/input, trigger, expected React, expected
  Solid, and evidence rows cover interactions, callbacks, controlled modes,
  async states, overlays, and cleanup where applicable.
- Style source-to-computed gate: upstream S2 style branches map to Solid owner
  code and browser-observable computed style, class, geometry, attribute, or
  CSS-variable evidence.
- React-vs-Solid harness parity: route evidence proves both stacks match only
  after the route has been validated against the official docs/viewer.
- Known defect/regression protection: current notes, blockers, TODO/FIXME
  comments, skipped tests, focused failures, comparison reports, and observed UI
  bugs are checked; known port bugs and unresolved harness bugs block
  acceptance.
- Regression coverage: every fixed user-visible bug has a durable assertion in
  the owning layer. Inspection-only fixes are not accepted for behavior,
  styling, layout, accessibility, API, i18n, lifecycle, or harness bugs.
- `solid-stately`: controlled/uncontrolled state, callbacks, validation,
  disabled/readonly, collection/date edge cases.
- `solidaria`: ARIA attributes, labels, descriptions, keyboard handlers, focus,
  press/touch/virtual-click paths, live announcements, overlay hiding, native
  semantics, generated IDs.
- `solidaria-components`: slots, contexts, render props, data attributes,
  event merging, user refs, hidden inputs, portals, compound children.
- `solid-spectrum`: S2 styles, tokens, icons, provider/form inheritance,
  geometry, visual states.
- `apps/comparison`: route harness, controls, state matrix, harness integrity,
  screenshots, pair diffs, runtime lifecycle checks, focused e2e specs.
- Visual evidence: semantic behavior, interaction timelines, computed styles,
  and current pair diffs are green. Per-side committed screenshot assertions are
  not acceptance gates and should be removed from focused suites.
- Route-plumbing evidence: matching serialized route props proves the harness
  sent the same input only. It must not be counted as implementation parity
  without observable DOM, accessibility, interaction, computed style, geometry,
  event, or cleanup assertions.
- Known-defect evidence: use
  [Known Defects And Regression Protection](./known-defects-regression.md) for
  search commands, classification, scenario smoke, and composition smoke before
  status closeout.

## Status Source Of Truth

The component validation note's gate outcome table is the source of truth for
accepted, partial, or pre-pass status. Manifest badges, component README lists,
coverage reports, and handoff summaries must not claim a stronger status than
the note.

Use `legacy-accepted` or `accepted-prior-gates` for components accepted before
the current gate model. They become current accepted only after every gate,
including known-defect/regression protection, is complete.

## Required Commands

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp run comparison:report:gaps
vp run comparison:report:exports
vp run check
```

Also run the focused package tests and focused Playwright spec for the
component. Record any browser sandbox escalation needed on this host.

## Handoff Notes

Record:

- upstream files inspected;
- Solid files changed;
- report lines before and after;
- focused tests run;
- runtime semantics and lifecycle evidence;
- harness-integrity status and failure taxonomy;
- planned or blocked state rows that remain.
- known defects searched and classified, including user-observed visual or
  behavior bugs.
- fixed defects and the regression assertion that now protects each fix.
- source branch ledger rows still marked `gap` or `deferred-gap`, with the
  destination component note or issue for each deferred row.
- interaction dependency rows still unproven, with the next test or owner.
- official docs/viewer items still marked `route-gap`, `port-gap`, or
  `docs-drift`, with authority and next owner.
- unchecked acceptance-gate items, grouped by gate. If any in-scope item is
  unchecked, set the component status to `partial`, not `accepted`.
- gate outcome summary, with every gate marked `complete` before accepted
  status is used. A `partial` or `not-started` gate keeps the component
  `partial` or `pre-pass`.
- blocker labels from `acceptance-gates.md` for every remaining blocker.
- agent handoffs copied into the validation note when AI agents were used, with
  role, files read/changed, evidence, commands, blockers, and next owner.
