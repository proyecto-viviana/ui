---
id: 492
type: task
title: "Re-enable axe target-size and classify WCAG 2.5.8"
created: 2026-09-07
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 WCAG audit and overnight step 4; owner: document the waiver and ideally remove it; classify React Aria against the five 2.5.8 exceptions",
    }
---

Both axe configs disable `target-size` globally. Comparison:
`apps/comparison/e2e/comparison-axe.spec.ts` (`comparisonAxeDisabledRules`).
Playground: `apps/web/e2e/playground-axe.spec.ts` (`aa22DisabledRules`). The
stated reason is S2 compact tokens under 24px. That is parity, not one of
the WCAG 2.2 Success Criterion 2.5.8 exceptions (spacing, equivalent,
inline, user-agent control, essential). D8 pair-diff is not a 2.5.8
exception either.

Owner 2026-09-07: document the waiver; ideally remove it; understand whether
React Aria / S2 themselves fail 2.5.8.

Uncommitted same-lane dirt already starts the fixture-chrome floor:
`apps/comparison/src/styles/global.css` (bare `.comparison-reference-canvas
button:not([class])` at 24×24). Adopt that path. Do not invent sizes on
styled S2 controls (Rule #2 / ADR 0001).

## Work

1. Re-enable axe `target-size` in both configs.
2. Scan the React oracle and Solid on the same routes.
3. Classify every failing control against the five 2.5.8 exception clauses.
   Keep the rule on. Scoped, documented exceptions only, with the clause
   named.
4. Fix Solid-only misses. Harness chrome (UA buttons) may take a local
   24px floor. Styled control sizes stay upstream.

## Done when

- Neither axe config disables `target-size` globally.
- Every remaining fail names a 2.5.8 exception clause, a selector, and
  whether React fails the same way.
- Solid-only misses are gone.
- `vp run a11y:axe:comparison` and `vp run a11y:axe:aa` run with the rule
  on.

## Relationship

Child of #136. Feeds D8 (`apps/comparison/e2e/drivers/target-size.ts`) and
the advertised WCAG 2.2 AA bar in `certification.md` / `release-policy.md`.
Does not replace D8 pair-diff.
