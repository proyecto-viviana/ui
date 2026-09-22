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
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the S2-a bullet is extended in place, raised by #591's review round and not a correction of anything false. 'Space navigated twice' was scoped to `linkBehavior: 'selection'` and stayed silent on the other two. The `, false` at `createPress.ts:810` is on the shared keyup path, so under `'override'` and `'action'` the same Space went from navigating once to navigating zero times, Enter unchanged, measured in this seat by counting clicks that survive `defaultPrevented` against `43b5aabf`'s `createPress.ts` and again at HEAD. That is upstream's split (`useSelectableItem.mjs:45,104,307-313`) and `'override'` is `createListBox.ts:164-166`'s default under `selectionBehavior: 'toggle'`, so it reaches most consumers; the changeset now says it and two new test cases pin it. No stage, order or exit code changes",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the owner's soft-launch cut is recorded as the section `Soft-launch cut (owner, 2026-09-21)`, placed ahead of `Path to the RC after the 2026-09-21 audit`, which it reorders and does not delete. In: the gates green at one sha, hard crashes only, consumer breakage (#598, #599), public-face facts (#548, #549, #600) with a `known gaps in this RC` section linking every deferral. Deferred, each still ticket-owned and none closed: #592, #593, #594, #595, #596, #603, #605, #597, #579, #601, #604, each carrying its own dated line, and the non-crash certified reds. Each deferred ticket's head was read for crash shape before it was deferred and none of the eleven is one; the closest call is #596, whose title says `createId` throws - the throw is real and wedged `test:hydrate` at `4bbdeff7`, but `createLabels.ts:50` is `props.id ?? createId()`, so no shipped path reaches it today and the ticket's Done-when is one rule across two packages, not a crash. Waiving certified reds stays an owner call on a list nobody has made: `e2e/certified-waivers.json` is `[]` and the last complete certified run, 35638122333 at `45714230`, reported 2146 passed / 27 failed / 4 skipped / 0 waived / 1 flaky. Owner gates unchanged. The measurement worktree grant went into this repository's `AGENTS.md` instead of the hub's, and undated: the hub `AGENTS.md` is 89 counted lines against an entry-doc cap of 80 and `doc-shape-lint` already exits 1 on it, and `date-in-rule` forbids a date in a repo-entry doc - proved by running the lint on the dated wording first, `ui/AGENTS.md:48 [date-in-rule]` EXIT=1, then on the undated one, EXIT=0 at 50 of 50 lines. The date lives here. Both halves are logged on #552",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "review of `b6ea736a`; three findings, all three real, all three fixed, two of them as in-place edits to this file. (1) The waiver paragraph's headline evidence was superseded before it was written. Certification Gates 35646778662 at `d1c5f4b3`, the RC's own sha, ran all eight certified shards and its `certified report` job 106494691342 completed 2026-09-21T20:02:28Z, three minutes ahead of `b6ea736a` itself at 2026-09-21T20:05:26Z. Its log, read with `gh api repos/:owner/:repo/actions/jobs/106494691342/logs`, totals 2146 passed, 27 failed, 4 skipped, 0 waived and 0 flaky, and its 27 unwaived failure lines are identical to 35638122333's, diffed line by line rather than eyeballed. The one number that moved is the one that costs an exit code: `flakyBudget` is 0 in `apps/comparison/e2e/certified-case-floor.json`, and the older run's log carries `over-flaky: 1 cases passed only on a retry, budget 0` where the newer one carries no budget line at all. The paragraph now cites the RC's own run; `0 waived` survives the swap. The note above that quoted 35638122333 is left as written, being the record of what was believed then. (2) The `Gates green at one sha` bullet now ends by naming the ladder frontier - step 38 of run 35646778662 - and by saying why it is written on this ticket and not in `status.md`, which is #588's third Done-when clause; #588 carries the rest of that finding. (3) The note above records that the measurement-worktree grant went into this repository's `AGENTS.md`; what it did not record is that no owner sentence on this ticket supports it. The two quotes here are the soft-launch cut and a remark about more workers. The clause is removed from `ui/AGENTS.md`, the hub exception is the only seat list again, and the residue is item 22 on #552",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: 'the four calls this cut left open came back delegated, the waiver list exists, and three statements in this file are corrected in place. The delegation, ~17:10: the conductor listed its open owner calls - quoting its own message, "the dist-tag (my default is `rc` alone), re-enabling Release Readiness and Site Gate, the waiver list once the census produces it, and the publish" - and the owner answered, verbatim: "can you handle all those? your default is fine", then "also you''re the only one working on this, the previous session was superseded by yours, so you can handle everything, don''t say "oh the other session is running" or whatever". The four defaults the owner accepted are the conductor''s own wording, not his, and each is written onto the ticket that owns it: dist-tag `rc` alone with no hand-moved `next` and the publish condition on #547, the two `gh workflow enable` commands on #568, the waiver rule on #578. In this file the `Release candidate shape` bullet gains a dated amendment, `Standing authority`, ordered item 6 and the `Done when` swap `next` for `rc`, and the `Owner gates` paragraph of the cut moves those three out of the owner column while keeping deploys, secrets, dependencies, public names and the `public-face` merge in it. Also his ~17:35 correction, verbatim, "well one tiny lie, there is an agent orchestrating work only on visualmode", which is why this seat touches no visualmode checkout and no hub policy file. Second, the waiver list: #578 wrote three entries into `apps/comparison/e2e/certified-waivers.json`, which was `[]` - #584 (two `picker-trigger` D13 rows), #583 (two D2 `default · hover-transition` rows) and the new #609 (`tabs` D4 `horizontal-regular · arrow-next-from-selected`), each with the ticket''s real board state and `expires: 2026-12-31`. That is 5 of the 27 reds of run 35668806426 at `b22a44eb`; the other 22 are one ComboBox list defect (#497, still `next` - its writer died before editing anything), are not waivable under the rule, and keep the blocking `certified report` job at exit 1. Third, three corrections. (a) The cut listed #584 and #586 nowhere: #584 is now in Deferred with its reason - focus placement on Picker open, no crash, every option still reachable - and #586 is split, its two landed colour fixes in the RC because they are already in the tree, its closing 174-route `a11y:contrast` run and its two round-2 residues deferred, the run because this host stops it for memory. (b) The `Gates green at one sha` bullet listed `docs:check` as outstanding while citing run 35646778662, which had walked past it; measured in both runs since, `docs:check` is step 37 and `success` (35646778662 at `d1c5f4b3`, and 35668806426 at `b22a44eb`, `certification-gates` job 106560418098), and the frontier is step 38 `comparison parity (strict)` on the stale postcard pin, which is #574. (c) The soft-launch note above defended deferring #596 with `createLabels.ts:50` is `props.id ?? createId()`, so no shipped path reaches it today - that does not follow, since the `??` fallback is precisely the branch that calls `createId()`, and it runs for any caller that passes no `id`. The reason that does hold, read from the one `createLabels.ts` in the tree, `packages/solidaria/src/label/createLabels.ts`: all five in-repo callers pass an id computed in their own hook body - `createLabel.ts:107`, `createComboBox.ts:824` and `:853`, `createDateSegment.ts:446`, `createGridListSection.ts:40` - so no path this RC ships takes the fallback, and the fallback is there for an external caller with no id, which the comment at `:36-49` says must call `createLabels` from a hook body because Solid 2''s `createUniqueId` needs a reactive owner while hydrating. The deferral stands; only its reason changes',
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "the newest complete certified run is no longer 35668806426 at `b22a44eb`, which the body above still names. Run 35689146611 at `d6745471`, `certified report` job 106625669687, completed and reports the same `2146 passed, 27 failed, 4 skipped, 0 waived, 0 flaky`, and its per-component table is byte-identical to `b22a44eb`'s - 107 components, 5 with a failing row, 102 green, `diff` of the two tables sliced out of the two job logs is empty. Left as a note rather than an edit: the roster passage is the conductor's and only the run id in it is stale. The `0 waived` both runs report is the defect `cd38e04e` fixes; the reading that can show 5 waived is a `certified report` job at a sha carrying `cd38e04e` and #497's `d997d01f`/`6031691e`, which #578 owns and no seat here can take",
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
  - Amended 2026-09-21: the dist-tag half of this was handed to the conductor
    — "can you handle all those? your default is fine" — and the conductor's
    stated default, accepted, is **`rc` alone, no hand-moved `next`**. The
    `-rc.N` versions and the held `latest` are unchanged. #547 carries the
    quotes and the mechanics; #600 carries the install line.
- **Dependency.** `@tanstack/solid-router` and `@tanstack/solid-start` move to
  `2.0.0-rc.8`, the Solid 2 line (#545).
- **Public surfaces in scope.** Site landing and docs, npm READMEs, the GitHub
  front door, and the comparison site.
- **Standing authority for this campaign.** Push to `origin/main`; deploy the
  docs site once Site Gate is green on the exact revision; publish the rc to
  `rc` once #547's gates are green (`next` as amended above). Never force-push.
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
6. #547 rc prerelease on `rc`.
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

An `-rc.N` of each in-scope package is on `rc` from one exact revision with
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

## Soft-launch cut (owner, 2026-09-21)

The owner asked for a smaller release sooner, verbatim:

> can we reorder the priorities so we make a "soft" launch sooner? get to all
> you say for a next release, but try to make a smaller one now. for example,
> public face facts, site, fixing the hard crash failures. then for the next
> release we leave the defects and such, something like that

The conductor proposed the cut below and the owner answered "perfect, go",
then added "also if we can parallelize more and better, let's do that. we can
use one or two more grok workers or an opus one".

This cut reorders **Path to the RC after the 2026-09-21 audit**, the section
below. It deletes nothing: every stage there stands and every ticket keeps its
owner. What changes is which of them the RC waits for.

**In the RC.**

- **Gates green at one sha.** The ladder itself. #606 is done and proved by
  Certification Gates 35646778662 at `d1c5f4b3`, step 24 `guard layer-boundary`
  green. What is left is whatever the local guard ladder and #590's twenty-leg
  walk find red, plus a certified postcard re-pinned only from a real full
  certified run — #574's open half at S0-d, which is where both runs since
  have stopped: step 38 `comparison parity (strict)`, a stale postcard, 3199
  covered paths changed since `0f1e1198`. `docs:check` is **not** left: it is
  step 37 and `success` in run 35646778662 at `d1c5f4b3` and again in run
  35668806426 at `b22a44eb` (`certification-gates` job 106560418098), which is
  the same run that names the frontier — this bullet used to list it as
  outstanding while citing a run that had walked past it. So the ladder
  frontier is step 38, now measured at `b22a44eb`, and it is written here
  because `status.md` is generated and work state lives only in
  `.claude/tickets` (#588).
- **Hard crashes only.** #545, the web app on Solid 2, for the SSR failure; the
  crash-class subset of #578's certified reds; and any build, typecheck or test
  red #590 turns up. Which reds are crash-class is decided by the census being
  taken now, which lands as a receipt. It is not guessed here.
- **Consumer breakage.** #598 and #599, the route to npm.
- **Public-face facts.** #548, #549 and #600, plus a "known gaps in this RC"
  section that links every ticket deferred below.
- **Site colour, the landed half of #586.** Both of its fixes are in the tree
  and are what makes `a11y:contrast`, the third `ci:site` leg, reachable at
  all, so the RC ships them; it is in the RC because it is already in it, not
  because the cut waits on it. What the RC does not wait for is the rest of
  that ticket, which is deferred below: the closing 174-route run, which this
  host stopped at 24 for memory, and the two round-2 residues.

**Deferred to the release after the RC.** Each keeps its ticket and none is
closed: #592, #593, #594, #595, #596, #603 and #605, the source defects; #597,
#579, #601 and #604, the instruments and the residues; **#584**, #583 and #609,
the certified reds the census does not call a crash; and the unfinished half of
**#586** — its closing 174-route `a11y:contrast` run, which needs a machine
with memory headroom this one does not have, and its two round-2 residues, the
hero gradient restyle that shipped without visual proof and the hardcoded
`#ef4444` at `apps/web/src/routes/__root.tsx:82`. #584 is deferred rather than
fixed for the reason the census gives: its two Picker journey rows are focus
placement on open, not a crash, and every option stays reachable by keyboard.

Those reds are now carried as ticket-backed waivers in
`apps/comparison/e2e/certified-waivers.json`, which held `[]` when this cut was
written. The rule was delegated on 2026-09-21 — "can you handle all those?
your default is fine" — and the conductor's stated default, accepted, is:
behaviour-class reds only, each entry ticket-backed, expiring at the next
release, crash-class fixed and never waived. The list, written under #578:
**#584** for the two `picker-trigger` D13 rows, **#583** for the two D2
`default · hover-transition` rows on `togglebutton` and `togglebuttongroup`,
**#609** for `tabs` D4 `horizontal-regular · arrow-next-from-selected`. That is
5 of the 27. Since that ticket's review on 2026-09-22 it is **five entries, one
per case** rather than one per ticket — a shared entry cannot disclose the
causes of two rows, which is what the review found on #584 — and `expires` is
`2026-10-21`, held to a 60-day horizon because no release date exists on disk;
#610 owns binding the expiry to the release. The other 22 are one ComboBox
list defect, #497, and they are **not** waived, so the blocking
`certified report` job still exits 1 until it lands. The newest complete
certified run is 35668806426 at `b22a44eb`, `certified report` job
106565094355 — 2146 passed, 27 failed, 4 skipped, **0 waived**, 0 flaky, the
same 27 as the two runs before it; the flake that cost run 35638122333 its exit
code is #608 and did not recur.

**Owner gates after the 2026-09-21 delegation.** Deploys other than this
campaign's standing docs deploy after a green Site Gate; secret changes;
dependencies; new public names; merging `public-face`. The publish and its
dist-tag (#547), enabling the Release Readiness and Site Gate workflows (#568)
and the waiver list (#578) were owner gates when this cut was written and are
now the conductor's, under the conditions each of those tickets records.

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

- **S2-a #591**, high, `merged` in this checkout 2026-09-21. `createPress`
  opened links with `isOpening: true`, re-entered on click, and de-duplicated
  by a shared flag; all three now read as upstream does. Of the three findings
  the audit filed together, the first was observable after all — Space on a
  role-overridden `<a href>` in a `linkBehavior: "selection"` collection
  navigated twice — and the third, the element-plus-timeout key, was a second
  real defect; only the click re-entry guard is parity with no test that can
  tell it apart, as the skeptic said. Each half is attributed by mutation in
  #591's merged note. Its review round found the first fix also reaches
  `"override"` and `"action"`, where Space now navigates zero times and Enter
  navigates — upstream's own split, disclosed in the changeset and pinned by a
  case each.
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

**S5 — enable the two workflows the release condition names. #568**, `merged`,
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
The writer's part is the ladder-row correction S0-b exposes. The rows that
still say otherwise are named on #588's Work item 3.
`ci:release-readiness` runs a subset of the blocking gates; `guard:gate-coverage`
prints which and keeps the two docs true.
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
