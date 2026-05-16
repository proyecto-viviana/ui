# Acceptance Gates

A component is accepted only when every required gate below is complete. These
gates are additive: one gate can never substitute for another.

Use this checklist in every component validation note. Leave unchecked items in
place when a pass is partial.

## Gate Summary

| Gate                                     | Blocks acceptance when                                                                                                                |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | The comparison route does not represent the public S2 docs page, examples, viewer controls, or viewer environment.                    |
| External Authority And Standards         | Relevant docs, specs, accessibility guidance, or platform behavior were not checked or disagreements were not resolved.               |
| Upstream React Source Parity             | Installed upstream behavior, structure, state, ARIA, styling, or cleanup branches are unmapped or unproven.                           |
| Solid Idiomatic Implementation           | Solid reactivity, ownership, refs, children, context, cleanup, or render-prop semantics are only React-shaped, not Solid-sound.       |
| Accessibility And I18n                   | Roles, names, descriptions, focus, keyboard, announcements, forced colors, RTL, forms, or multiple-instance behavior are unproven.    |
| Behavior State Machine                   | Inputs, events, transitions, callback ordering, controlled/uncontrolled paths, or cleanup are not modeled and tested.                 |
| Style Source-To-Computed Parity          | S2 style branches, tokens, geometry, icons, forced colors, or viewer canvas conditions are not traced from source to computed output. |
| React-Vs-Solid Comparison Harness Parity | The route, controls, fixtures, or pair evidence cannot prove the same public state in React and Solid.                                |
| Evidence And Handoff                     | Tests, reports, status, blockers, or ownership are missing.                                                                           |

## Gate Outcome Summary

Every component validation note must include a gate outcome table before the
detailed checklist. The outcome table is the reviewer-facing status; the
detailed checklist is the evidence behind it.

Use only these gate outcomes:

- `complete`: every in-scope row in the gate is checked, and every
  not-applicable row has a reason.
- `partial`: at least one in-scope row is unchecked, unproven, blocked, or has
  an unresolved owner.
- `not-started`: the gate has not been evaluated in this pass.

Do not use a gate-level `not-applicable` outcome unless this file explicitly
allows it for that gate. In normal component passes, `not applicable` belongs
to individual rows inside a gate, not to the whole gate.

```md
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
| Evidence And Handoff                     | not-started |          |                |
```

## 1. Official Docs And Viewer Parity

- [ ] Live official S2 page opened and dated.
- [ ] Primary docs example recorded.
- [ ] Every docs example, child composition, slot, icon, image, collection item,
      portal, and surrounding canvas condition inventoried.
- [ ] Every interactive viewer control recorded with prop name, labels, option
      values, option order, selected default, reset behavior, and omitted-prop
      behavior.
- [ ] Comparison route default matches the official example, or the deviation is
      recorded as `docs-drift`, `route-gap`, or `not-applicable`.
- [ ] Side-panel controls match the official viewer's public controls and
      selection semantics.
- [ ] Route tests assert the visible defaults and option surface, not only
      serialized props.

## 2. External Authority And Standards

- [ ] Relevant React Aria, S2, testing, blog, release, and example docs checked
      for the target component or recorded as `none found`.
- [ ] Relevant W3C, WHATWG, APG, WCAG, ARIA-AT, and evaluation sources checked
      when the component has roles, keyboard behavior, focus management,
      announcements, forms, overlays, collections, or color/motion obligations.
- [ ] Chrome/web.dev/MDN or other platform explainers used only to clarify
      browser behavior, test strategy, or risk areas; they do not override
      installed source or formal specs.
- [ ] Independent/famous blog posts used only as risk discovery unless they
      point to a normative source, installed source branch, or reproducible
      browser behavior.
- [ ] Source disagreements recorded with the chosen authority and reason.
- [ ] Every obligation discovered from external docs maps to a route item,
      source branch row, behavior-state row, accessibility row, style row, or
      explicit gap.

## 3. Upstream React Source Parity

- [ ] Upstream files identified for every relevant layer:
      `@react-stately`, `@react-aria`, `react-aria-components`, and
      `@react-spectrum/s2`.
- [ ] Solid owner files identified for every upstream file, or a gap recorded.
- [ ] Public props, defaults, omitted props, slots, contexts, refs, exports, and
      unsupported branches mapped.
- [ ] DOM structure, ARIA attributes, state paths, event paths, effects,
      cleanup, style branches, geometry, and cross-component contracts mapped.
- [ ] Source branch ledger has a row for every user-observable upstream branch.
- [ ] Every `matched` or `ported-differently` source row has direct evidence.
- [ ] Every remaining `gap` or `deferred-gap` has an owner and is not counted as
      accepted parity.

## 4. Solid Idiomatic Implementation

- [ ] Dynamic props, context values, and derived values remain reactive.
- [ ] Props are not destructured or spread in ways that snapshot Solid accessors.
- [ ] Children remain lazy across provider/context boundaries.
- [ ] Render props/custom roots receive live state when upstream state changes.
- [ ] Refs are composed with Solid semantics and do not copy React ref timing by
      assumption.
- [ ] Effects, observers, timers, event listeners, and subscriptions have Solid
      ownership and cleanup.
- [ ] Solid-specific deviations from upstream structure are documented with the
      public behavior they preserve.
- [ ] Tests cover at least one reactive update for every relevant idiom risk.

## 5. Accessibility And I18n

- [ ] Native element, role, computed accessible name, computed description, and
      accessible value match upstream/current React.
- [ ] ARIA references exist only while valid, are removed when upstream removes
      them, keep upstream ordering where announcements depend on order, and do
      not collide across multiple instances.
- [ ] Keyboard model, focus order, focus-visible state, focus return, and
      focus-not-obscured behavior match upstream and relevant APG/spec
      expectations.
- [ ] Disabled, read-only, required, invalid, inert, and hidden semantics use
      native HTML or ARIA in the same places upstream does.
- [ ] Forms expose labels, help text, error text, validation state, hidden
      inputs, reset, and submit behavior equivalent to upstream.
- [ ] Live regions, loading text, selection announcements, drag/drop
      announcements, and cleanup timing match upstream where applicable.
- [ ] Forced colors, reduced motion, contrast-sensitive states, target size, and
      screen-reader-only affordances are covered or recorded as not applicable.
- [ ] Locale, direction, number/date formatting, calendar system, hour cycle,
      and message catalogs inherit from provider context where applicable.
- [ ] Automated a11y scans are treated as smoke tests only; they do not replace
      semantic, keyboard, focus, and announcement assertions.

## 6. Behavior State Machine

- [ ] Component behavior is modeled as rows of state/input, trigger, expected
      React result, expected Solid result, and evidence.
- [ ] Pointer, keyboard, touch, screen-reader virtual click, blur, Escape,
      cancellation, outside press, and disabled/read-only suppression paths are
      covered or marked not applicable.
- [ ] Controlled and uncontrolled modes, default values, reset, form submit,
      async/loading/empty states, and collection navigation are covered where
      upstream supports them.
- [ ] Event ordering, callback payloads, callback suppression, propagation, and
      cancellation match upstream.
- [ ] Overlay, portal, scroll-lock, hiding, focus-scope, timer, observer,
      listener, animation-frame, and unmount cleanup match upstream.
- [ ] Transition evidence includes before, trigger, immediate, transient,
      settled, and cleanup points for every visual or semantic state that
      changes over time.

## 7. Style Source-To-Computed Parity

- [ ] Upstream S2 style declarations and owner branches are identified before
      Solid styles are changed.
- [ ] Solid uses the S2-compatible style/token path; comparison app CSS does
      not patch component behavior, state, geometry, or token output.
- [ ] Size, density, variant, static color, orientation, placement,
      label-position, field-state, provider/form inheritance, and other style
      axes map from upstream branches to Solid owner code.
- [ ] Computed-style, class, attribute, geometry, or CSS-variable assertions
      cover rendering-affecting branches; screenshots alone are not sufficient.
- [ ] Forced-colors, reduced-motion, focus-ring, icon, image, avatar, slot, and
      portal geometry branches are covered where upstream has them.
- [ ] Official viewer canvas/background/scale/width/direction/theme conditions
      are represented in the route or recorded as route gaps when they affect
      rendering.
- [ ] Any visual deviation is classified as `port bug`, `upstream drift`,
      `harness bug`, `threshold debt`, or `unrelated family failure`.

## 8. React-Vs-Solid Comparison Harness Parity

- [ ] React fixture imports the real current upstream component and uses the
      official docs/viewer composition.
- [ ] Solid fixture imports the ported component through the package public API.
- [ ] Both fixtures receive the same route props and environment settings.
- [ ] Focused route tests prove controls update mounted React and Solid DOM.
- [ ] Computed style, accessibility, geometry, runtime, or pair-diff evidence
      covers the source branches and viewer states that affect rendering.
- [ ] Harness stability is proven: theme, viewport, fonts, animation, capture
      isolation, and failure taxonomy are recorded.

## 9. Evidence And Handoff

- [ ] Focused package tests run or are marked not applicable with reason.
- [ ] Focused Playwright/runtime tests run.
- [ ] Comparison reports refreshed when component status or evidence changes.
- [ ] `vp run check` passes.
- [ ] Component validation note states `accepted`, `partial`, or `pre-pass`.
- [ ] Handoff lists any remaining gaps by gate and owner.

## Blocking Rule

Do not mark Task 13 accepted while any in-scope checklist item is unchecked.
If one gate is incomplete, the component status is `partial` even when the other
gates are green.

The component validation note must show a `complete` outcome for every gate
before the component can be marked `accepted`. If any gate outcome is `partial`
or `not-started`, the component status is `partial` or `pre-pass`.

Use these blocker labels in component notes and handoffs:

| Label               | Use when                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `docs-blocker`      | Official docs, examples, viewer controls, or viewer environment are missing or unresolved.                             |
| `authority-blocker` | External documentation, specs, or source disagreements are unresolved.                                                 |
| `source-blocker`    | Installed upstream branches are unmapped, unowned, or unproven.                                                        |
| `idiom-blocker`     | Solid reactivity, ownership, refs, context, children, or cleanup are unsound.                                          |
| `a11y-blocker`      | Accessibility, keyboard, focus, forms, announcements, i18n, or forced-colors behavior is unproven or wrong.            |
| `behavior-blocker`  | State machine, event, interaction, callback, controlled/uncontrolled, async, or cleanup behavior is unproven or wrong. |
| `style-blocker`     | S2 token/style, computed style, geometry, icon/image, forced-colors, or viewer canvas parity is unproven or wrong.     |
| `route-blocker`     | The comparison route, controls, fixtures, or harness cannot prove parity.                                              |
| `evidence-blocker`  | Required tests, reports, notes, status, or ownership are missing.                                                      |
