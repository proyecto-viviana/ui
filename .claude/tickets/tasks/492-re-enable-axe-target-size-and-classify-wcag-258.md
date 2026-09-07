---
id: 492
type: task
title: "Re-enable axe target-size and classify WCAG 2.5.8"
created: 2026-09-07
parent: 136
status: merged
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "filed from the 2026-09-07 WCAG audit and overnight step 4; owner: document the waiver and ideally remove it; classify React Aria against the five 2.5.8 exceptions",
    }
  - {
      state: in-progress,
      at: 2026-09-07,
      note: "implementer: adopt global.css dirt, narrow the harness UA floor off ActionGroup hosts, re-enable axe target-size, census and classify",
    }
  - {
      state: merged,
      at: 2026-09-07,
      note: "target-size on in both WCAG 2.2 AA smokes; remaining comparison fails are User Agent Control (React ActionGroup oracle items, Toolbar fixture items, Autocomplete unstyled search input). Playground zero target-size nodes. Prove: COMPARISON_CHROMIUM_ARGS=--disable-software-rasterizer vp run a11y:axe:comparison (81 passed); vp run a11y:axe:aa (2 passed). cwd /home/emoporemilio/projects/viviana-hub/ui. D8 assert24 unused.",
    }
---

Classification record: `.claude/current/wcag-258-target-size.md`. Executable
selectors: `apps/comparison/e2e/target-size-exemptions.ts`,
`apps/web/e2e/helpers/target-size-exemptions.ts`. Neither smoke config disables
`target-size` globally. Remaining comparison fails are User Agent Control
(React ActionGroup oracle items; Toolbar fixture items on both stacks;
Autocomplete unstyled search input on both stacks). Playground WCAG 2.2 AA
produced zero `target-size` nodes. No Solid-only miss. D8 `assert24` stays
unused.

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
