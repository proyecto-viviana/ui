---
id: 544
type: initiative
title: "Cut the Solid 2 release candidate and its public face"
created: 2026-09-20
status: in-progress
history:
  - {
      state: in-progress,
      at: 2026-09-20,
      note: "owner opened a quota-bounded campaign: adversarial audit, a workable main, an -rc prerelease on the next dist-tag, and better public docs and homepages. Iterative durable progress outranks reaching the RC. Owner approved the TanStack 2.0.0-rc.8 bump and gave standing push, docs-deploy and next-tag publish authority for this campaign; no Codex, no Blacksmith",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the 2026-09-21 round-1 adversarial audit landed, receipt `.agents/audit-2026-09-21/round-1-results.md`, owners in `.agents/audit-2026-09-21/OWNERS.md`. 76 findings, every one owned: 15 new tickets #587-#601, 15 existing tickets annotated, 3 findings already settled by commits that landed after the audit range closed (`13080aa0`, `495582e9` twice). The audit's standing result is that the Ordered work list above no longer describes the path, because the ladder stops before most of it: `docs:check` is the earliest blocking red, at `certification-gates.yml:235` at HEAD `65254a8c`, and Certification Gates has had no successful run since 2026-08-31. The replacement is the section `Path to the RC after the 2026-09-21 audit` at the end of this file",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "round 2 of the same audit landed, receipt `.agents/audit-2026-09-21/round-2-results.md`, owners appended to `.agents/audit-2026-09-21/OWNERS.md`. Range `4acbc9e4..65254a8c`, the sixteen commits written after round 1's range closed; 3 Opus auditors, every finding at medium or above challenged by a skeptic. 15 findings: 0 critical, 3 high, 4 medium, 8 low. Every one owned - 2 new tickets, **#602** at stage S2-g and **#603** at stage S2-h, both added to the path above; 9 existing tickets annotated (#574, #578, #584, #588, #582, #576, #586, #194, #139); 3 lows added to #601 as items 8-10. The path is unchanged in shape: S0-b is still the earliest blocking red and none of the sixteen commits has ever been seen by CI - `git merge-base --is-ancestor` is false for all sixteen against `origin/main` `96376e9a`, whose own Certification Gates run 35560076342 failed. Two merged tickets carry a dated note instead of a status move, #576 and #582, because the scheme runs forward only; #582's live residue is #603",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the path was reviewed and five gaps in it were fixed in place, all in the `Path to the RC` section, none of them a new finding about the tree. Four tickets that carried audit findings had no stage and now have one: **#574** at S0-d, the parity step at `certification-gates.yml:244` that S0-b's landing makes the frontier - measured at HEAD `2599623e`, `0f1e1198` is an ancestor and 2577 covered paths changed since it; **#578** at S0-e, the `certified report` job, whose `Merge certified reports` step at `:691` has no `continue-on-error` while the eight shards at `:646` do, and which failed run 35560076342 at `96376e9a` with 2085 passed / 88 failed / 4 skipped / 0 waived / 1 flaky; **#579** at S3-a with #597 at S3-b; and **#568** at the new S5, whose deliverable is the two `gh workflow enable` commands plus the ladder-row correction. The path now also says which mechanism makes `certified report` exit 0 - fix or a `certified-waivers.json` waiver with an open ticket and a future expiry, since `certification-debt.md` is read by no workflow or script - and carries the lens 4a/4b re-proof as a named obligation of #548 and #549 before #547 publishes, #546 staying `merged` because the scheme runs forward only",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "a new stage **S0-f #606** was added to the path, and S0-b is no longer the earliest blocking red. Measured at HEAD `45714230`: `guard layer-boundary` is `certification-gates.yml:183`, step 24 of the `gates` ladder, ahead of S0-b's `docs:check` at `:257`; `vp run guard:layer-boundary` exits 1 there with one new fork, `button/ToggleButton.tsx`, which is what stopped run 35623988073 at `e8bacb9d`. Cause is `7e93d238`, a fix written to the solid-spectrum side of a frozen byte-identical dual path only, then `45714230` on the same side again. #606 restores identity, ports the same two Form fixes into the three viviana-ui buttons baselined as diverged forks - all three carried both defects - and is `merged` in this checkout with the guard at exit 0. Second occurrence of #570's class; #606 proposes, and does not build, a `staged` entry in `vite.config.ts` over `packages/{solid-spectrum,viviana-ui}/src/**` so the existing `vp staged` pre-commit hook runs the guard, with the `ci:release-readiness` clause as a complement",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "correction to the note above and to the S0-f bullet, which is edited in place: 'all three carried both defects' is wrong. `git show 45714230:packages/viviana-ui/src/button/Button.tsx | grep -n 'useFormProps\\|defaultProps'` prints `:43` import, `:61` `useProviderProps(useFormProps(runtimeProps))`, `:72` `defaultProps`, `:78` `useFormProps(mergeProps(defaultProps, ...))`, so Button already read the Form and carried only the size defect - its merged-in `size: 'M'` left the Form nothing to fill. The same grep on `ActionButton.tsx` and `LinkButton.tsx` prints `defaultProps` with no `useFormProps`, so those two carried both, as did the stale `ToggleButton.tsx` copy that Scope 1 fixed by taking the spectrum bytes. This is also why #606's pre-fix run was 10 failed | 1 passed rather than 11 failed. No stage, order or exit code changes. Raised by #606's review; the rest of that review's badge finding was checked against the pin and rejected, see #606's fourth note",
    }
---

Owner direction, 2026-09-20. Spend the remaining Fable and Opus quota on this
repository without wasting it on menial work. Land progress in small verified
slices so that a quota cut loses nothing. Reaching the release candidate is the
aim, not a deadline.

This initiative overlays [#87's ordered plan](../tasks/87-close-every-remaining-audit-item-in-order.md).
It does not replace that census, release a held decision, or lower #537's bar
for a `latest` release.

## Owner decisions recorded here

- **Release candidate shape.** Version the Adobe-stack packages and
  `@proyecto-viviana/ui` as `-rc.N` prereleases on the npm `next` dist-tag, as
  Solid does. Consumers move to the rc at once; nothing important is in
  production. Certified failures may ship as named debt in
  `certification-debt.md`. `latest` stays held to #537.
- **Dependency.** `@tanstack/solid-router` and `@tanstack/solid-start` move to
  `2.0.0-rc.8`, the Solid 2 line (#545).
- **Public surfaces in scope.** Site landing and docs, npm READMEs, the GitHub
  front door, and the comparison site.
- **Standing authority for this campaign.** Push to `origin/main`; deploy the
  docs site once Site Gate is green on the exact revision; publish the rc to
  `next` once #547's gates are green. Never force-push.
- **CI.** GitHub-hosted runners and local checks only. No Blacksmith (#551).
- **Workers.** Fable conducts, decides, and accepts diffs. Opus takes audit
  lenses, hard slices, and the second review seat. AGY is the default
  implementer, runner, and drafter. Grok is the spare reader. No Codex today.

## Ordered work

1. #194 slice: restore the import line the Solid 2 codemod dropped from
   `apps/comparison/scripts/merge-certified-reports.ts`. Two red workflows
   share that one cause.
2. #546 adversarial audit, read-only, in parallel with the writer seat.
3. #534 Hover slice: finish or revert the five preserved files.
4. #545 web app on Solid 2. Site Gate cannot pass before this.
5. #543 remainder, then #139 and the rest of #194, as #87 orders them.
6. #547 rc prerelease on `next`.
7. #548 npm READMEs and GitHub front door.
8. #549 site landing and docs, then deploy.
9. #550 comparison site as public evidence.
10. #551 CI runner record.

Confirmed critical audit findings jump the queue at the writer seat.

Superseded as an ordering by **Path to the RC after the 2026-09-21 audit**, at
the end of this file. The items above are still in scope; the stages there say
which of them can be reached, and in what order.

## How this runs

- One writer in this git at a time. Audit, review, research, and drafting run
  in parallel only when read-only, or when they write outside the checkout.
- Launch long workers through the owned OS runtime with `repo:ui` cataloged.
  They outlive the conductor session. Every Claude worker names
  `--model claude-opus-5`; the host default is Fable.
- A worker writes its result to a named artifact before it reports. Audit
  lenses append findings as they find them, never only at the end.
- Name a slice's write paths in its ticket history before the worker starts,
  so uncommitted work is attributable after a cut.
- One commit per verified slice, pushed at each checkpoint. One dated receipt
  in `.agents/` per five-hour session.

## Done when

An `-rc.N` of each in-scope package is on `next` from one exact revision with
its gates recorded on #547. The public site builds from that revision and is
deployed. The READMEs and front door describe what is certified, what is
experimental, and the Solid 2 requirement, with a proof for each claim.
Confirmed audit findings are fixed or ticketed.

## Relationship

Siblings #443 (the `latest` train), #531 (Solid 2 foundation), #136 (audit),
#26 (comparison site). The scheme forbids an initiative parent. Children:
#547, #548, #549, and the seventeen the 2026-09-21 audit opened — #587-#601
from round 1, #602 and #603 from round 2.
#545 sits under #531, #546 and #551 under #136, #550 under #26.

## Path to the RC after the 2026-09-21 audit

Written 2026-09-21 from `.agents/audit-2026-09-21/round-1-results.md`; owners
in `.agents/audit-2026-09-21/OWNERS.md`. The stages are ordered by what blocks
what, not by severity. Each one is finished when its tickets are, and the next
one is worth starting only then, because until S1 nothing here can be measured
whole.

Revised the same day after a review of this path: every ticket carrying a high
or confirmed finding now has a stage — #574 at S0-d, #578 at S0-e, #579 at
S3-a, #568 at the new S5 — and the mechanism that clears each blocking job is
named rather than assumed.

**S0 — make Certification Gates reach a verdict.** Two of its jobs are
blocking and both are red at the last run, 35560076342 at `96376e9a`: the
`gates` ladder stops at `docs:check` and the `certified report` job fails at
`Merge certified reports`, which carries no `continue-on-error`
(`certification-gates.yml:691`) although the eight shards do (`:646`), and
whose summary row calls the job Blocking (`:402`). Everything after either
stop is unexecuted, so the repository has no verdict on most of its own gates.

- **S0-a #587**, critical. `guard:entry-import-budget` is the twentieth leg of
  the release chain and its own unit test is red, so the chain cannot be walked
  whole until it passes. Also fixes its position: it reads `dist/` and runs
  before `build`.
- **S0-b #588**, high, and the ladder's stop once S0-f is green. The generated
  board views are stale at the commit that generates them, `docs:check` exits
  1, and it is `certification-gates.yml:235` at HEAD `2599623e`, `:257` at HEAD
  `45714230`. Includes the reproducibility of `docs:generate`. The ladder-row
  correction it exposes is #568's, at S5.
- **S0-c #589**, medium. CI reports verdicts it does not hold: the eight
  certified shards are `continue-on-error`, `cancel-in-progress` erases a
  verdict rather than deferring it, and one contrast leg is mislabelled.
- **S0-d #574**, high (round-2 `r2-guards/r2-guards-1`), `in-progress`, and the
  next stop once S0-b lands: `comparison parity (strict)` at
  `certification-gates.yml:244`, no `continue-on-error`. Measured at HEAD
  `2599623e`: the postcard revision `0f1e1198` is an ancestor
  (`git merge-base --is-ancestor` exits 0) and 2577 covered paths have changed
  since it, so the currency rule fails and the step blocks. This ticket cannot
  clear it alone — the step goes green only when
  `lastFullCertifiedSuiteRun` (`apps/comparison/src/data/certified-suite-evidence.ts:21-31`)
  is re-pinned to a revision with a fresh full certified run, which is S0-e's to
  supply. What #574 owes before that pin is the covered-path widening and the
  uncovered-but-decisive test, so the pin is not recorded under a rule that
  cannot see the runner, the merger or the pinned oracle.
- **S0-e #578**, `in-progress`, the certified job and the other blocking red.
  Its merge step reported `Run status: failed`, `2085 passed, 88 failed,
4 skipped, 0 waived, 1 flaky` at `96376e9a` and exited 1. It supplies the
  revision S0-d's pin needs, so S0-d's rule lands first and S0-e's run is
  recorded under it.
- **S0-f #606**, `merged` in this checkout and lettered last because it was
  found last, though it sits earliest on the ladder: `guard layer-boundary` at
  `certification-gates.yml:183` is step 24, ahead of S0-b's `docs:check` at
  `:257`, and it stopped run 35623988073 at `e8bacb9d` before S0-b's step ever
  ran. One frozen byte-identical dual path forked — `7e93d238` edited
  `packages/solid-spectrum/src/button/ToggleButton.tsx` and left its viviana-ui
  copy behind — so the guard reported one new fork and exited 1. Fixed by
  restoring identity and porting the same two Form fixes into the three
  viviana-ui buttons that are baselined as diverged forks. Of those three,
  `Button` carried only the size defect — it already wrapped in `useFormProps`
  (`Button.tsx:61,78`) but merged `defaultProps` first, so `size: "M"` left the
  Form nothing to fill — while `ActionButton` and `LinkButton` carried both, as
  did the stale `ToggleButton` copy. `vp run guard:layer-boundary` exits 0 at
  `45714230`'s successor.

**What makes `certified report` exit 0**, since the release condition rests on
it. `merge-certified-reports.ts` exits 1 when a shard cannot explain its exit,
when a budget is over, or when `waiverGateFails`, which is true while any
failure is unwaived (`apps/comparison/scripts/certified-waivers.ts:282-284`).
So exactly two mechanisms reach green: fix the failure, or waive it in
`apps/comparison/e2e/certified-waivers.json` — `[]` at HEAD — with a future
`expires` and the ticket's board state recorded in the entry itself
(`ticketStatus`, and not one of verified/merged/closed), both enforced by that
script. The run never reads the board: `comparison:guard:certified-waiver-tickets`
holds the recorded state to `.claude/tickets` outside the certified job, because
a board file is outside `certifiedSuiteCoveredPathspecs` and a verdict that read
one could move without the postcard seeing it (#574).
`certification-debt.md` is neither: no workflow, script or `package.json` entry
reads it (grepped at HEAD). So the owner decision above that certified failures
may ship as named debt is carried out as a waiver **per named failure** plus its
debt entry, never as the debt entry alone. The conductor's default is #578's own
order — fix by cause first, and waive only what an owner call names as a
deliberate Solid 2 divergence. Today 88 failures are the roster and 0 are
waived, so nothing is being waived by default.

**S1 — walk the chain as twenty legs. #590**, high, blocked by #587. Retires
"nineteen of nineteen green": the chain grew a twentieth leg on 2026-09-20 and
has not been walked whole since. Ends with one sha, twenty recorded exit codes,
and a CI leg that actually runs the unit suite — which today runs in no enabled
workflow, and so has never proved #555's or #556's tests.

**S2 — the source defects the audit confirmed.** Independent of each other; all
of them are behaviour in published packages, so they land before anything is
published.

- **S2-a #591**, high. `createPress` opens links with `isOpening: true`,
  re-enters on click, and de-duplicates by a shared flag.
- **S2-b #592**, medium. Link items bypass the router at four call sites; a
  pre-existing parity gap, not a regression from this campaign.
- **S2-c #593**, medium. `FocusScope` restores focus without asking which scope
  is active, plus the `focusin` retargeting residue.
- **S2-d #594**, medium. `createPress` injects an un-nonced `<style>`.
- **S2-e #595**, medium. `Dialog` labels itself with an id no element carries.
  Read its note before starting: the audit's prescribed fix diverges from RAC
  1.21.0, and the real gap is at `Button.tsx:483`.
- **S2-f #596**, medium. `createId` throws without an owner and one call site
  was bypassed rather than fixed.
- **S2-g #602**, high, from round 2. `ActionButton` passes its own
  `isDisabled` after the spread, so the `useFormProps` proxy `7e93d238` adopted
  is bypassed and `<Form isDisabled>` does not disable it. One line and one
  test case; its siblings already read through the proxy.
- **S2-h #603**, medium, from round 2. The DatePicker popover's enter: #582's
  fix is right and nothing can tell it from the implementation it reverses, and
  the entering seam still reports entering before it is placed. A
  discriminating test, then match RAC or name the deviation.

**S3 — stop the ratchets outrunning their receipts.** Two tickets in order,
because the second measures with the first's instrument.

- **S3-a #579**, `open`. The upstream-test-parity oracle attributes every fact
  by filename, so a component's vocabulary is filed under another's name.
- **S3-b #597**, high, `open`, blocked by S3-a in fact: nine of the thirty facts
  absorbed into the parity baseline are the mis-pairing #579 names, so
  re-measuring before the attribution rule is fixed measures the same bug again.

**S4 — the publish path. #598** (medium): `guard:publish-drift` measures from a
bump that was never published and skips every package with a pending changeset.
**#599** (medium): the local publish route is gated by a hand-written
attestation. Both are about the route to npm being checkable rather than
attested.

**S5 — enable the two workflows the release condition names. #568**, `open`,
carrying `test-integrity/main-red-and-release-unsatisfiable` (high) and
`guards-b/553-guards-run-nowhere` (medium). Its deliverable is two parts. The
owner action, which this seat may not take:

```
gh workflow enable release-readiness.yml
gh workflow enable site-gate.yml
```

`gh workflow list --all` still reports both `disabled_manually`, and
`scripts/check-release-evidence.mjs:9-13` requires a successful run of
`certification-gates.yml`, `release-readiness.yml` and `site-gate.yml` at the
exact release sha, so the release condition is unmeetable until both are on.
The writer's part is the ladder-row correction S0-b exposes — the earliest
blocking step is `:235`, and the rows that still say otherwise are named on
#588's Work item 3 — plus this ticket's own question of what the chain is for.
Before Site, because Site Gate renders no route while it is off, and before
#547, which cites all three runs.

**Site — #545, #549.** Unblocked by S0-b only in the sense that a red ladder
hides their evidence; the real gate is that Site Gate is `disabled_manually`,
so no CI run in this campaign has rendered an `apps/web` route. That enable is
S5's.

**Public face — #548, #550, #600.** #548 and #550 fix facts in copy Fable owns.
#600 is the install tag, and it is blocked on an owner call: `rc` alone, or
`rc` plus a hand-moved `next`. The conductor's default is `rc` alone.

One prerequisite of #547 rides here, from `board-truth/546-lens4-unproved`
(high, confirmed). #546 is `merged` with lens 4 unproved by design; it handed
`lens4a-site-claims.md`, `lens4b-site-examples.md` and `lens4c-links.md` to
#548 and #549. The status is not walked back — the scheme's lifecycle runs
forward only, OWNERS deviation 5 — so the re-proof is a named obligation of the
consumers instead: **#548 re-proves every lens 4a/4b row it publishes and #549
every row it fixes in `apps/web`, and neither is done while a row it consumes
is unproved.** #549's Done-when leans on Site Gate, which proves no claim row,
so the re-proof is row-by-row work, not a gate result.

**Then #547**, the publish itself, after S5's three runs are green at one sha
and the lens 4a/4b rows are re-proved.

Off the path: **#601**, the low residues the stages do not claim — seven from
round 1, three more from round 2. Nothing in it gates a gate.

**The release condition, in one sentence.** At one sha: the twenty-leg chain
green locally with its exit codes recorded, and Certification Gates — both its
`gates` ladder and its blocking `certified report` job, which is S0's whole
subject — Release Readiness and Site Gate each with a successful run at that
same sha, which S5 makes possible by enabling the two disabled workflows, and
only then publish.
