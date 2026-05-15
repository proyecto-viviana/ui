# Acceptance Gates

A component is accepted only when every required gate below is complete. These
gates are additive: one gate can never substitute for another.

Use this checklist in every component validation note. Leave unchecked items in
place when a pass is partial.

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

## 2. Upstream React Source Parity

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

## 3. Solid Idiomatic Implementation

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

## 4. React-Vs-Solid Comparison Harness Parity

- [ ] React fixture imports the real current upstream component and uses the
      official docs/viewer composition.
- [ ] Solid fixture imports the ported component through the package public API.
- [ ] Both fixtures receive the same route props and environment settings.
- [ ] Focused route tests prove controls update mounted React and Solid DOM.
- [ ] Computed style, accessibility, geometry, runtime, or pair-diff evidence
      covers the source branches and viewer states that affect rendering.
- [ ] Harness stability is proven: theme, viewport, fonts, animation, capture
      isolation, and failure taxonomy are recorded.

## 5. Evidence And Handoff

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
