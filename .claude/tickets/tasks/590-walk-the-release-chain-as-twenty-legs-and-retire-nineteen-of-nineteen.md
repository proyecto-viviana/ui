---
id: 590
type: task
title: "Walk ci:release-readiness as twenty legs at one revision, and retire the nineteen-of-nineteen-green claim"
created: 2026-09-21
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Five findings: `guards-a/nineteen-green-stale`, `test-integrity/no-whole-suite-green-at-head`, `board-truth/chain-20-never-walked`, `555-b/no-ci-leg-for-555-tests`, `555-a/ssr-suites-unrun`, plus `ci-truth/unit-suite-never-runs-on-main` and `test-integrity/unit-suite-runs-in-no-enabled-ci`, which are the same hole seen from CI. Counted here at HEAD: `ci:release-readiness` is **twenty** `&&` legs - check, guard:workflow-pins, guard:gate-server-reuse, guard:attribution, guard:generated-icons, guard:theme-base, guard:dependency-security, guard:certified-case-floor, guard:source-artifacts, guard:entry-import-budget, build, guard:package-sourcemaps, typecheck:apps, test:run, test:ssr, test:hydrate, test:comparison-ssr, test:comparison-hydrate, test:web, comparison:test:journeys-driver. The twentieth, `guard:entry-import-budget`, was added by `a5129cb2` (#566) on 2026-09-20 at 20:37. The only whole-chain receipt is `.agents/chain-walk-2026-09-20/full-chain-3f220fb6.out.txt`, taken at `3f220fb6` before that, 53 commits back. So no tree has a whole-chain green, including HEAD, and the nineteen-green line is quoted in `.agents/UI-CAMPAIGN-544-*` and in ticket notes as if it were one",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "blocked on #587. Leg 14 is `test:run`, and `scripts/check-entry-import-budget.test.ts` is three red cases inside it, so the chain cannot reach leg 15 today - walking it before #587 closes measures nothing but that",
    }
  - {
      state: verified,
      at: 2026-09-23,
      note: "walked the complete ci:release-readiness chain (now 21 && legs including guard:gate-coverage) at 7f039dd57b3b661aef19ea7468e5b5e6c86faa06 in one unbroken run; all legs exited 0. Test:run passed 366/366 files (6,898 tests), ssr/hydrate passed, and journeys driver passed. Receipt committed beside 3f220fb6 at `.agents/chain-walk-2026-09-20/full-chain-7f039dd5.out.txt`.",
    }
---

## Scope

1. Run `vp run ci:release-readiness` once, whole, at one revision, detached,
   with the output committed beside the `3f220fb6` receipt. Record the leg that
   fails first, or the fact that all twenty passed and the revision they passed
   at.
2. Replace the "nineteen of nineteen green at one tree" claim everywhere it is
   cited — the campaign log, `.claude/current/status.md`, #547's blocker set —
   with the new receipt, or with "unwalked" until there is one. That walk was
   taken at 18:42 and three commits changed the chain after it: `4bff4c57`
   (#565, 19:58) raised five ceilings, `e0ccb27e` (20:27), and `a5129cb2`
   (#566, 20:37) added the twentieth leg. #565 and #566 both say in their own
   words that the guard's absence from the chain "is why the nineteen-green
   walk at `3f220fb6` did not see it red", which is the admission.
3. Give the jsdom suites a leg in an enabled workflow. `vp test run` appears
   only inside `ci:release-readiness`, and Release Readiness is
   `disabled_manually`; Certification Gates runs `test:ci-guard-contracts`,
   `test:ssr`, `test:hydrate` and Playwright, and no vitest jsdom suite at all.
   Every test #555 offers as proof — `overlays.test.tsx`,
   `ButtonGroup.test.tsx` twice, `openLink.test.ts`,
   `createPreventScroll.test.tsx`, `Dialog.test.tsx` — runs nowhere, and so
   does every unit test written in this campaign. Either add a `vp run test:run`
   step to `certification-gates.yml` or re-enable Release Readiness; the second
   is an owner action and the release path already names the two commands.
4. Run the SSR suites the id-ordering commit shipped with excluded, and record
   the result on the ticket that claimed them.

## Done when

One receipt shows twenty legs walked at one named revision, `test:run` has a
step in a workflow that is enabled, and one run id proves that step executed.
No document in the tree says "nineteen".

## Proof

The chain receipt, its revision and its per-leg result; the workflow diff; the
run id.

## Relationship

Child of #544, stage S1. Blocked by #587. #568 is the standing measurement of
how little the chain covers — this ticket is the other half: not what it
covers, but whether it has ever been run. Downgrades #555's proof to unverified
until step 3 lands, which is recorded on #555.
