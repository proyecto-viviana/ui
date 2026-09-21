---
id: 587
type: task
title: "The entry-import-budget guard has no passing test of its own, and the only chain that would show it is disabled"
created: 2026-09-21
parent: 544
status: merged
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 round-1 audit, the only critical finding: `guards-a/eib-test-red`, receipt `.agents/audit-2026-09-21/round-1-results.md`. `a5129cb2` (#566) rewrote the guard''s unit from dist chunks to source modules and never touched `scripts/check-entry-import-budget.test.ts`. All three cases fail: the fixture writes `exports: {"./Provider": "./dist/Provider.js"}` with no `src/Provider.ts`, and the rewrite deleted both strings the other two assert, `not built` and `build the packages first`. `vitest.config.ts` includes `scripts/**/*.test.ts` and `ci:release-readiness` runs `test:run`, so that chain and `release:prepare` are red; `certification-gates.yml` has no `test:run` step, so the one enabled workflow is blind to it. The writer knew - `.agents/close-gates-2026-09-20.log.md` records 3 failed / 64 passed and names all three - and left it unticketed, per one-ticket scope. This is that ticket. Also carries three findings about the same guard: `test-integrity/entry-import-budget-unit-swapped`, `guards-b/entry-budget-refrozen-twice`, `guards-a/eib-after-build`',
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: 'red recorded first: `vp test run scripts/check-entry-import-budget.test.ts` -> 3 failed (3), exit 1, the third case reporting `expected ... to contain ''build the packages first''` against the guard''s real `2 budgeted target(s) resolve to no source file`. Which side drifted, settled by history: the test was written in `5c57cf2f` (#553) for the dist-chunk guard, whose `not built` and `build the packages first` strings sit at lines 173 and 236 of that revision; `a5129cb2` (#566) then changed the unit to source modules by owner decision and left the test untouched (`git log f13fd341..4acbc9e4 -- scripts/check-entry-import-budget.test.ts` is empty). So the test is the stale side and the script keeps its contract. The dispatch brief asked for the opposite - move the leg after `build` because the guard "reads dist/" - on a premise the tree refutes: the guard never opens a `dist/` file, it maps an `exports` target back to `src/`, and at a checkout with no `dist/` at all (`git archive HEAD packages scripts | tar -x`, then `node --experimental-strip-types scripts/check-entry-import-budget.ts`) it reports `entries measured: 5/5`, exit 0. Implemented the ticket''s and the audit''s direction instead (`guards-a/eib-after-build`: "Move the step above `build` in `certification-gates.yml`"), and said so here rather than writing the premise into the chain',
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: 'three cases rewritten against the source-module unit, each feeding a violating fixture: an entry whose graph reaches 4 modules against a ceiling of 3 fails with `@proyecto-viviana/ui ./Provider: 4 modules, ceiling 3`; the same entry inside its ceiling passes with `entries measured: 2/2`; and an entry whose published target maps to no source file fails with `budgeted target(s) resolve to no source file` plus `Fix the exports map or the specifier`, and is asserted never to print `entry import budget OK.`. The fixture writes no `dist/` at all - it publishes `./dist/Provider.js` targets and `src/Provider.ts` sources, which is the unit and the reason the old fixture rotted. Green: `vp test run scripts/check-entry-import-budget.test.ts` -> 3 passed, exit 0; `vp test run scripts --maxWorkers=2` -> 12 files, 75 passed, exit 0 (the audit''s 3 failed / 64 passed). Each case proved to fail on pre-fix code: all three red against the pre-#566 guard (`git show 5c57cf2f:scripts/check-entry-import-budget.ts`, exit 1); against the current guard mutated to `if (!measured) continue;` only the unresolvable-target case goes red; against it mutated to not enforce the total ceiling only the over-budget case goes red. Ordering: the `guard entry-import-budget` step moved above `build package evidence` in `certification-gates.yml`, and `scripts/test-ci-guard-contracts.mjs` now asserts the inverse contract in both chains - it fails on the pre-fix workflow with `Error: Certification Gates must measure the entry import budget before building packages`, exit 1, and passes at HEAD, exit 0. No budget number changed: `vp exec tsx scripts/check-entry-import-budget.ts --print-modules` measures 53/47, 52/47, 57/47, 44/38, 35/28 against ceilings 53/47, 52/47, 57/47, 44/38, 35/28 - five of five exactly at the ceiling, so the re-derivation is a no-op and the command, the numbers and the dist-free run are now named in the JSON''s `description`, which `--write-baseline` preserves [that preservation is the defect the review below fixed: the numbers are written by the run now, and `description` names none of them]. Receipt `.agents/587-entry-import-budget-test-2026-09-21.md`. Not verified: no CI run - this seat does not push (this note first read "Certification Gates and Release Readiness are both `disabled_manually`", which is false for Certification Gates; corrected in the note below)',
    }
  - {
      state: merged,
      at: 2026-09-21,
      note: 'review of the landed work raised three problems; all three held. (1) The derivation rotted by design: `--write-baseline` rewrites every number and copied `description` and `why` forward verbatim, so the five readings this ticket wrote into `description` would have outlived the first real ceiling change - `guards-b/entry-budget-refrozen-twice` rebuilt by the fix for it. The numbers are the script''s to write now: each entry carries a `measuredAt` written by the run that set its ceiling, `description` states no measurement at all, and `--write-baseline` refuses a `why` whose opening counts disagree with what it just measured. Proved red first, against the guard at `10684229`: `vp test run scripts/check-entry-import-budget.test.ts` -> 2 failed | 6 passed, exit 1, the pre-fix `--write-baseline` exiting 0 while it rewrote a 9/9 ceiling to 3/1 under a `why` still claiming 5/2. Green after: 8 passed, exit 0. Re-froze with the fixed script (`vp run guard:entry-import-budget -- --write-baseline`, exit 0): no ceiling moved, the only content added is five `"measuredAt": "2026-09-21"` lines. (2) Three failure branches had no test, including the solidaria ceiling the guard exists for - the total is checked first as an `if`/`else if`, so the over-budget case never reaches it. Added a case at the total ceiling with 2 solidaria modules against 1 (`@proyecto-viviana/ui ./Provider: 2 solidaria modules, ceiling 1`), a case adding a root-barrel importer (`1 new file(s) import the @proyecto-viviana/solidaria root barrel` - the half that covers every entry with no ceiling, and the file is reachable from no entry, so only the inventory fails), and a case with a dead workspace specifier inside a resolving entry''s graph. Each was proved to bind its branch by mutation - the guard copied to scratch with that branch removed, `1 failed | 7 passed (8)`, exit 1, the failure being that case alone in all three. (3) "Certification Gates and Release Readiness are both `disabled_manually`" was false, and the state was read before this was written: `gh api repos/:owner/:repo/actions/workflows` -> Certification Gates `active`; only Release Readiness and Site Gate are `disabled_manually`. `gh run list --workflow=certification-gates.yml` shows five push-to-main runs today, latest `35560076342` at 2026-09-21T04:11:59Z (red on `docs:check`, the formatter trap #588 owns). So the reordered step and the new `test:ci-guard-contracts` assertion land in a live blocking ladder on the next push, and the only thing unproved is a runner execution. Suite: `vp test run scripts --maxWorkers=2` -> 12 files, 80 passed, exit 0 (75 before); `vp run guard:entry-import-budget` -> 5/5 entries, 154 importers against 154, exit 0',
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
