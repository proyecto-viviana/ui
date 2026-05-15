# Tests And Sign-Off

A component is accepted when every changed layer has focused tests and the
comparison reports reflect the improved state.

Acceptance also requires the component's
[Acceptance Gates](./acceptance-gates.md) checklist. The gates are additive:
official docs/viewer parity, upstream React source parity, Solid idiomatic
implementation, and React-vs-Solid harness parity must all be complete for the
component to be marked accepted.

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
  `port-gap`.
- Solid idiom gate: dynamic props, lazy children, context, render props, refs,
  and cleanup risks are checked independently from upstream source parity.
- React-vs-Solid harness parity: route evidence proves both stacks match only
  after the route has been validated against the official docs/viewer.
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
- source branch ledger rows still marked `gap` or `deferred-gap`, with the
  destination component note or issue for each deferred row.
- interaction dependency rows still unproven, with the next test or owner.
- official docs/viewer items still marked `route-gap`, `port-gap`, or
  `docs-drift`, with authority and next owner.
- unchecked acceptance-gate items, grouped by gate. If any in-scope item is
  unchecked, set the component status to `partial`, not `accepted`.
