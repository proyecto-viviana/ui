---
id: 587
type: task
title: "The entry-import-budget guard has no passing test of its own, and the only chain that would show it is disabled"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 round-1 audit, the only critical finding: `guards-a/eib-test-red`, receipt `.agents/audit-2026-09-21/round-1-results.md`. `a5129cb2` (#566) rewrote the guard''s unit from dist chunks to source modules and never touched `scripts/check-entry-import-budget.test.ts`. All three cases fail: the fixture writes `exports: {"./Provider": "./dist/Provider.js"}` with no `src/Provider.ts`, and the rewrite deleted both strings the other two assert, `not built` and `build the packages first`. `vitest.config.ts` includes `scripts/**/*.test.ts` and `ci:release-readiness` runs `test:run`, so that chain and `release:prepare` are red; `certification-gates.yml` has no `test:run` step, so the one enabled workflow is blind to it. The writer knew - `.agents/close-gates-2026-09-20.log.md` records 3 failed / 64 passed and names all three - and left it unticketed, per one-ticket scope. This is that ticket. Also carries three findings about the same guard: `test-integrity/entry-import-budget-unit-swapped`, `guards-b/entry-budget-refrozen-twice`, `guards-a/eib-after-build`',
    }
---

## Scope

1. Rewrite the three cases in `scripts/check-entry-import-budget.test.ts`
   against the source-module unit the guard now measures: the fixture writes
   `src/Provider.ts`, and the unresolvable-target case asserts the guard's real
   message, `resolve to no source file`.
2. Re-derive every ceiling in `scripts/entry-import-budget.json` from one
   measured run at the revision that closes this ticket, and record the command
   and its output beside the JSON. The ceilings were raised once
   (`4bff4c57`: 21→26, 28→30, 23→24, 19→20) and then re-frozen at 53/52/57/44/35
   against a different unit, so `@proyecto-viviana/ui ./Provider` went 21 → 26 →
   53 inside one range without a regression ever going red. One unit, one
   derivation, written down.
3. Move the `guard:entry-import-budget` step in `certification-gates.yml` above
   `build`. #566 proved it reads source, not `dist`; running it after a
   twelve-minute build costs a whole walk to learn a number that was available
   at checkout.

## Done when

`vp test run scripts/check-entry-import-budget.test.ts` is green with three
cases that exercise the source-module unit, the ceilings in
`entry-import-budget.json` each name the run that produced them, and the CI step
sits before `build`.

## Proof

The test run's counts, the measuring command and its output, and the workflow
diff — in the commit and in a dated `.agents/` receipt.

## Relationship

Child of #544, stage S0-a on [#544's path](../initiatives/544-cut-the-solid-2-release-candidate-and-its-public-face.md).
Residue of #566, which wrote the guard, and of #565, which raised the ceilings.
Nothing downstream can trust `ci:release-readiness` until this is green, so #590
is blocked on it.
