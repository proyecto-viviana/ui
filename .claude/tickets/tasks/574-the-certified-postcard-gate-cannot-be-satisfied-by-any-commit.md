---
id: 574
type: task
title: "The certified-postcard gate cannot be satisfied by any commit, so comparison parity (strict) is red forever"
created: 2026-09-20
parent: 544
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor running step 239 of the ladder, `vp run comparison:report:parity:strict`, EXIT=1. The sole blocking gap is `Recorded full certified suite evidence is invalid: 1` - every other always-blocking section printed `[pass]`, and the two `[gap]` control/validation sections are inside the frozen baseline, so `structuralBlockingGaps` is exactly this one. It is not staleness that a re-run fixes: `certifiedSuitePostcardIsCurrent` is `headSha === evidence.revision` (`apps/comparison/src/data/certified-suite-evidence.ts:36`), `evidence.revision` is a hand-edited string literal in that committed source file (`:22`), and nothing writes it - no workflow references it and the only script that reads it is the report itself. Updating the literal creates the commit that falsifies it. Evidence `.agents/chain-walk-2026-09-20/ladder-comparison-parity-strict.out.txt`",
    }
  - {
      state: open,
      at: 2026-09-20,
      note: "shape decided by the conductor and written into the ticket as `The decision`: ancestry plus coverage, with `apps/comparison/src/data/certified-suite-evidence.ts` excluded from the covered set - that exclusion is the witness the gate never had, since without it the commit that records a run invalidates the run it records, which is equality's bug in a new spelling. Two constraints found while deciding, both cheap to miss. `actions/checkout` in `certification-gates.yml` sets no `fetch-depth` (lines 47, 420, 474), so CI clones at depth 1 and neither `merge-base --is-ancestor` nor a `revision..HEAD` path diff can run; the job that runs step 239 needs `fetch-depth: 0`, and a revision missing from the object graph must fail with a message naming it rather than degrade to a pass. And the postcard file has exactly three readers - itself, `acceptance-schema.test.ts` and `report-component-parity.ts` - so the blast radius of changing the rule is three files. Not yet handed to the writer: ladder order puts #572 (219) and #573 (227) first",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "unblocked, queued behind #578. Both ladder predecessors this ticket was held for have closed - #572 at 219 and #573 at 227 (`2b444a89`) - and CI confirms the ladder has walked past them: `Certification Gates` run 35554086311 at `1a98e250` failed at executed step 38, which is step 239, `comparison parity (strict)`. That is this ticket, reached for the first time, and it is now the first red step of the `gates` job rather than a prediction. It stays behind #578 only because #578 is the `certified` job and the evidence #547 asks for; nothing else blocks it. The shape is already decided in the entry above and in `The decision` - ancestry plus coverage, excluding `apps/comparison/src/data/certified-suite-evidence.ts` from the covered set - so the writer taking this implements a decision rather than making one. Two constraints carry forward and are easy to lose: the job needs `fetch-depth: 0` (checkout is depth 1 at lines 47, 420, 474, so neither `merge-base --is-ancestor` nor a `revision..HEAD` diff can run), and a revision missing from the object graph must fail naming it, never degrade to a pass. Note the ordering coupling with #194 and #578: this gate decides what re-pinning the postcard means, and #578 decides which revision is worth pinning, so fixing this one first is correct - it makes the pin expressible, and #578 then supplies the revision",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the decided shape landed, and the gate stays red, now for the honest reason. `certifiedSuitePostcardIsCurrent` is gone; `certifiedSuitePostcardCurrency(evidence, head, git)` fails with a named reason when HEAD is unknown, when the revision is not in the clone (the message names `fetch-depth: 0`), when it is not an ancestor of HEAD, or when any `certifiedSuiteCoveredPathspecs` path changed since it. Those paths are `packages/*/src/**`, `apps/comparison/src/**` and `apps/comparison/e2e/**`, excluding the evidence file itself and READMEs. `apps/comparison/scripts/certified-postcard-git.ts` answers those questions from real git, and the report prints the reason plus this ticket on both STALE lines. The certified-gates checkout at :47 now has `fetch-depth: 0`, and :420 and :474 do not run step 239. Tests: `acceptance-schema.test.ts` now covers the rule with a fake probe, and the new `certified-postcard-git.test.ts` runs a real temp repo (passes on the recorded commit and after a commit touching the evidence file, a README, docs and `.agents`; fails on a covered source change, a side-branch revision and a depth-1 clone), 15 passed. Mutation: drop the evidence-file exclusion and exactly the witness test fails; put equality back and 4 fail. Real history: `git diff 7e93d238 80c429ec` over the pathspecs lists 0 files, so a postcard at `7e93d238` would be current at `80c429ec`; `413b2f23..80c429ec` lists the Button and fixture files, so one at `413b2f23` would fail. `vp run comparison:report:parity:strict` today exits 1 with the postcard as its sole blocking gap: 2575 covered paths changed since `0f1e1198`. That is correct, and the Done-when bar (a named commit exiting 0) needs a fresh full certified run to record, which is #547/#194's to supply. #194's 'a certified record older than HEAD fails it too' holds under this rule: older and covered-path-changed fails",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`, finding `guards-b/postcard-test-tautology` - and it is **already settled**, by `13080aa0`, which landed after the audit range closed. The finding said the only test guarding this gate asserts the implementation's own literal and cannot fail. At HEAD the test drives a `PostcardGitProbe` through five distinct outcomes - current, HEAD unknown, commit absent with the `fetch-depth: 0` reason, not-an-ancestor, and four covered paths changed - so it has negative cases and is not a tautology. Recorded rather than re-opened.",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`. Two findings, both on the rule this ticket landed. `r2-guards/r2-guards-1`, high: `certifiedSuiteCoveredPathspecs` (`apps/comparison/src/data/certified-suite-evidence.ts:38-44`) covers component source and fixtures only, so everything that turns a certified run into a verdict is invisible to the postcard - `apps/comparison/scripts/**` (the merger whose exit code is the gate, the waiver logic, the budgets), `playwright.config.ts`, `apps/comparison/package.json` and the lockfile that pin the upstream oracle, `apps/comparison/vendor/**` (174 files) and `packages/*/package.json`. Measured: `git ls-files apps/comparison/scripts` is 17 files, none matched, and `git diff --name-only 9e0df73c^ 9e0df73c` over the pathspecs lists 0 files although `9e0df73c` repaired `merge-certified-reports.ts`. Latent rather than live - the postcard is already 2577 covered-paths stale at `65254a8c` and the certified shards rerun on every push - so it is owed before the next pin, not before this ticket closes. Fix: widen the list, or better invert it to cover-everything-minus-a-reviewed-allowlist (`.claude`, `.agents`, docs, `**/*.md`, the evidence file) so a new directory defaults to invalidating rather than to invisible. `r2-guards/r2-guards-2`, medium: the two new tests never write a file that is uncovered-but-decisive - the real-git fixture writes only `packages/p/src`, `e2e`, `docs`, `.agents`, a README and the evidence file, and `acceptance-schema.test.ts` stubs `changedCoveredPaths`, so the pathspec list is exercised by no test. A coverage gap, not fake proof; the skeptic refuted the harder reading that the `current: true` case pins the hole open, since the paths it commits are the intended exclusions. Write the widening test first: commit `apps/comparison/scripts/merge-certified-reports.ts` and `apps/comparison/package.json` into the fixture repo and assert not-current, watch it fail on today's code, then widen",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "placed at stage S0-d of #544's path, which had scheduled no ticket for this step. Two corrections come with the placement. The step number is dropped from the title and the body: it was 239 at `96376e9a`, it is `certification-gates.yml:244` at HEAD `2599623e` after `13080aa0` and `7ec2a732` shifted the file, and the notes above keep the number they were read at. And the gate's state is re-measured: `git merge-base --is-ancestor 0f1e1198 HEAD` exits 0 and `git diff --name-only` over `certifiedSuiteCoveredPathspecs` lists **2577** files, so the currency rule fails for the honest reason and the step blocks. Nothing here clears it - the pin needs a fresh full certified run, which is #578 at S0-e - so what is owed before that pin is the `r2-guards/r2-guards-1` widening and the `r2-guards/r2-guards-2` test, or the pin is recorded under a rule that cannot see the runner, the merger or the pinned oracle",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the covered-path set now fails closed, which answers round-2 finding `r2-guards-1`. `certifiedSuiteCoveredPathspecs` was component source and fixtures; it is now the whole tree (`:(top,glob)**`) minus five reviewed lines, each carrying why it cannot decide - the postcard file itself (the witness, unchanged), `**/*.md` (no step of the run reads markdown, and every ticket, receipt, playbook, changeset, ADR and README here is md), `.claude/**` and `.agents/**` (board and receipts, written after a run and never read by one), and `apps/web/**` (the run builds `packages/*` and `apps/comparison` and serves the comparison preview; it never builds web). Everything the finding named is inside the set by default now - `apps/comparison/scripts/**`, `playwright.config.ts`, `astro.config.mjs`, `apps/comparison/package.json`, `pnpm-lock.yaml`, `packages/*/package.json` and their vite configs, `apps/comparison/vendor/**`, `scripts/check-certified-case-floor.mjs`, `.github/workflows/certification-gates.yml` - and so is any directory added later. Two corrections the tree made to the brief. The waiver list `apps/comparison/e2e/certified-waivers.json` was already covered by `apps/comparison/e2e/**`, so it is the one decisive row that was green before the widening: 9 of 10, not 10. And `:(top,glob)**` is explicitness, not behaviour - measured in a scratch repo, git implies all paths when a pathspec list is exclusions only, so dropping that line changes nothing. Tests, all in the real-git temp repo of `certified-postcard-git.test.ts`: a decisive table of 10 (merger, shard check, waiver list, case floor, playwright config, astro config, the oracle pin, the lockfile, a package build config, the workflow), each asserting its file is named in the stale reason, and an exclusion table of 5. `vp test run apps/comparison/src/data/certified-postcard-git.test.ts --maxWorkers=2` on the old list EXIT=1, 9 failed / 9 passed; on the new one EXIT=0, 19 passed, and 30 passed with `acceptance-schema.test.ts` beside it. Mutation, restoring from a scratchpad copy each time: drop the postcard exclusion and only the record-the-run case fails; drop `**/*.md` and only the two prose rows fail; drop `.claude/**`, `.agents/**` or `apps/web/**` and only that row fails. Real history: `git diff --name-only 9e0df73c^ 9e0df73c` over the new list names `apps/comparison/scripts/merge-certified-reports.ts` where the old list gave 0 - the finding's own example - and 9 of the last 20 commits still change 0 covered paths (`56c0751c`, `f8c59204`, `503e50a0`), so the rule stays satisfiable. Not re-pinned, deliberately: `vp run comparison:report:parity:strict` EXIT=1 today with the postcard the sole always-blocking gap, 3197 covered paths changed since `0f1e1198`, the sample now naming `.github/workflows/certification-gates.yml` rather than a `.gitkeep`. The pin needs a real full certified run, which is #578 at S0-e, so this stays in-progress and step `certification-gates.yml:244` stays red",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the review of the widening found two problems and both are real, checked against the tree before anything moved. The high one: the `**/*.md` and `.claude/**` exclusions were justified by comment lines claiming no step of a run reads them, and the merged verdict read `.claude/tickets/**/<id>-*.md` on every run - `merge-certified-reports.ts` passed `ticketStatus: (id) => readTicketStatus(repoRoot, id).status` into `evaluateCertifiedWaivers`, which failed the job on a verified/merged/closed ticket and dropped the waiver from `active`. So one commit editing `status:` in a ticket file could flip the merger's exit code while the postcard's covered-path diff listed nothing. The review named the merger; the reporter `apps/comparison/e2e/reporters/certified-summary.ts:120` did the same read per shard, found here, and both are fixed. Correction to the brief, which offered widening or decoupling: widening is the one that cannot be taken. Measured at HEAD now, 13 of the last 20 commits touch `.claude/tickets`, so covering the board would make the postcard stale on about every ticket-execution commit - the unsatisfiable gate this ticket exists to remove, in a new spelling. Decoupled instead. `CertifiedWaiver` carries `ticketStatus`, a required non-empty string in the covered `apps/comparison/e2e/certified-waivers.json`; `evaluateCertifiedWaivers` takes no board callback and reads only that field; new `reconcileWaiverTickets` holds the recorded field to the board and runs in the new `comparison:guard:certified-waiver-tickets` (`apps/comparison/scripts/check-certified-waiver-tickets.ts`), wired into the `comparison-build` job beside the waiver unit tests, outside the certified job on purpose. The `.claude/**` exclusion comment now records that its claim was false when written and what made it true. One deliberate loss, recorded rather than hidden: a waiver naming a ticket that is not on the board used to be inactive inside the run (`status != null`), and now waives there and fails `guard:certified-waiver-tickets` instead - the board cannot be both outside the verdict and inside it. Second correction to the brief: the review asked for `.claude/tickets/tasks/999-x.md` as a decisive row in `certified-postcard-git.test.ts`, which belongs to the widening; under the decoupling it is an exclusion row (now 6), and what binds the fix is the new source-text case `keeps the board out of the certified verdict`, which fails if `readTicketStatus` or `.claude/` comes back in either consumer. The medium one: `changedCoveredPaths` is commit-to-commit, so the rule passed a working tree the recorded run never saw - the local answer that decides a re-pin. `PostcardGitProbe` gained `dirtyCoveredPaths()`, answered by `git status --porcelain -uall -- <pathspecs>` (`-uall` so a new directory is named by file, not collapsed to `dir/`; rename lines take the right side), and the rule fails with `N certified path(s) are uncommitted: ...` after the changed check. Proof, every number run in this session. Pre-fix: `vp test run apps/comparison/src/data/certified-postcard-git.test.ts --maxWorkers=2` EXIT=1, 3 failed / 21 passed; `...certified-waivers.test.ts` EXIT=1, 8 failed / 6 passed. Post-fix, the three files together EXIT=0, 49 passed. Nine single-branch mutations in the working tree, each restored from a scratchpad copy, each failing exactly the case that names it: drop the dirty check (3 dirty rows fail, the excluded-path-dirty row does not), drop `-uall` (only the untracked row), drop the pathspecs from `git status` (only `stays current while only an excluded path is uncommitted`), drop the `ticketStatus` field check, drop the closed-state problem, let a closed waiver keep waiving, drop each reconciler branch, and put a `readTicketStatus` mention back in the merger. That sixth mutation survived the suite as written and is a gap this note closes: the closed-ticket case now also asserts the failure lands unwaived, like the expired case. Guard, end to end: `vp run comparison:guard:certified-waiver-tickets` EXIT=0 on the tracked `[]`; against a temp waiver file EXIT=1 printing `ticket-stale: waiver ticket #574 records open; the board says in-progress` and `ticket-missing: waiver ticket #9999 is not on the board`. Merger, end to end with a fabricated one-shard summary: the same waived failure exits 0 with the ticket recorded `in-progress` and 1 with it recorded `closed` (`ticket-closed: ... remove the waiver`), so the verdict turns on the covered file alone. `vp lint` and `vp check` over the touched files EXIT=0; `tsc --noEmit --ignoreConfig --strict` over the five scripts and the four test/reporter files EXIT=0. The waiver file is `[]` again, verified. Two documents the tree falsified are fixed in this commit: #544's path said an open board ticket is enforced by the merger, and #194's Landed said the waiver record is `{ pattern, ticket, expires }`. Still in-progress and still red: the pin needs #578's full certified run",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the ladder now reaches this ticket's step, recorded so the next session starts where the frontier is. Certification Gates 35646778662 at `d1c5f4b3`, job 106489054009: steps 1 through 37 `success`, step 38 `comparison parity (strict)` `failure` with `STALE certified-suite postcard (3199 certified path(s) changed since it ...; ticket #574)`. The pin is still revision `0f1e1198`, run 32485238975 of 2026-08-21, 2170 passed / 0 failed / 4 skipped, and the step says plainly it does not speak for HEAD. Nothing moved here. The owner's soft-launch cut on #544 keeps a postcard re-pinned from a real full certified run inside the RC",
    }
  - {
      state: in-progress,
      at: 2026-09-21,
      note: "the retro review of the landed #574/#589 work found four problems. All four were checked against the tree before anything moved and all four are real; none is refuted. Together they say the same thing twice - the decoupling put the whole waiver rule into files and a step that no active job exercised. The high one, and the proof of that sentence: `apps/comparison/src/data/certified-shard-gate.test.ts:71` still built a `CertifiedWaiver` literal `{ pattern, ticket, expires }`, without the `ticketStatus` field the note above made required, so the repo's own typecheck leg was red at HEAD - `vp run comparison:typecheck` EXIT=1 over 440 files with `src/data/certified-shard-gate.test.ts:71:13 - error ts(2741): Property 'ticketStatus' is missing in type ... but required in type 'CertifiedWaiver'`, and EXIT=0, 440 files, 0 errors / 0 warnings / 35 hints with the field recorded. A grep for `expires:` over `apps`, `packages`, `scripts` and `.github` finds no second stale literal, so that was the only one. Third problem, the reason it survived: `certified-shard-gate.test.ts` and `certified-postcard-git.test.ts` ran in no active workflow. `comparison:test:certified-waivers` named one file, `certified-waivers.test.ts`, and the `comparison-build` step ran only that; the other two were reachable only through root `test:run`, which is in `ci:release-readiness` and so in `Release Readiness`, which `gh workflow list --all` reports `disabled_manually` today, with `Site Gate` - `Certification Gates`, `Changesets Check`, `Journey Fuzz Nightly` and `Release` are active. So the shard verdict of #589 and this ticket's own postcard currency rule were held by nobody. The root script now names all three files and the step is `certified verdict unit tests`; nothing in the tree referenced the old step name. `vp run comparison:test:certified-waivers` EXIT=0, 3 files, 52 passed. Second problem: nothing pinned the step that is now the only detector this ticket left. `evaluateCertifiedWaivers` takes no board callback and the merger emits no `ticket-missing` or `ticket-stale` - that was the trade - so `guard certified waiver tickets` is the whole of it, and deleting or renaming it restores the pre-#574 hole with every gate green. `scripts/test-ci-guard-contracts.mjs` now asserts that step exists in `comparison-build`, runs `comparison:guard:certified-waiver-tickets`, runs before `pnpm run build`, that `certified` declares `needs: comparison-build` so an off-board waiver reds the run and not one job, and that the `apps/comparison` script grades the tracked file with no `--waivers` override; it asserts the unit-test step and its three files the same way. New `jobNeeds()` reads all three legal `needs:` spellings and the certified-report block now calls it instead of keeping its own copy. Proof in a mutant root, the repo symlinked with `.github` and `scripts` as real copies: pristine, the new script EXIT=0 / 58 PASS and the `58f33185` script EXIT=0 / 56 PASS. Six mutations - the step deleted, the guard moved after `pnpm run build`, `needs: comparison-build` dropped from `certified`, `--waivers e2e/nothing.json` added to the package script, the shard-gate file dropped from the root script, the unit-test step deleted - and on every one the new script EXIT=1 with its own message while the `58f33185` script EXIT=0. That comparison was run twice: the first copied the HEAD script into the scratchpad, where its relative import of `package-attribution-banner.mjs` could not resolve, so all six read EXIT=1 for the wrong reason and would have said the old contract already caught them. The numbers above are the re-run from inside the mutant root, beside that sibling. Fourth problem: `check-certified-waiver-tickets.ts` had only ever been run over the tracked `[]`, so no CI run reaches any branch of `reconcileWaiverTickets` and the green line says only that the list was empty - a wrong path or a swallowed exit code reads the same. The script now takes `--waivers <path>` or `--waivers=<path>` and exits 2 on an argument it does not understand, and `certified-waivers.test.ts` spawns it over fixtures: exits 1 naming both a stale recorded state and a ticket the board never had, exits 0 over a non-empty list that agrees, fails closed on a file it cannot read, refuses an unknown argument rather than quietly grading the default list, and grades the tracked list when CI passes no arguments. `vp test run apps/comparison/src/data/certified-waivers.test.ts --maxWorkers=2` EXIT=1, 4 failed / 15 passed before the script took argv; EXIT=0, 19 passed after. `vp check` over the five touched source files EXIT=0, after one `--fix` on the contract script. No changeset: the root and `apps/comparison` are `private: true` and no `packages/*` source changed. #568's Scope row is unaffected - it names this gate by script key and the key did not change. Still in-progress and step `comparison parity (strict)` still red: the pin needs #578's full certified run",
    }
  - {
      state: in-progress,
      at: 2026-09-22,
      note: "the amendment-B second review of `b22a44eb` drew no finding. Its five problems are all in `5fcf3d35` (#599) and `58f33185` (#598) and are answered there; nothing in this ticket moved",
    }
---

## Scope

The `comparison parity (strict)` step of
`.github/workflows/certification-gates.yml` runs
`comparison:report:parity:strict`. It is red, and it will stay red on every
commit that can ever exist, because the currency rule is self-defeating:

1. `certifiedSuitePostcardIsCurrent(evidence, headSha)` returns
   `headSha === evidence.revision` — exact equality, nothing weaker
   (`apps/comparison/src/data/certified-suite-evidence.ts:36`).
2. `evidence.revision` is a literal in committed TypeScript
   (`:22`, `"0f1e1198963c46eb3294744475e269a7c0041eb6"`).
3. Writing the current SHA into that literal **is a commit**, so the moment it
   lands, HEAD is the commit that wrote it and the literal names its parent.
4. Nothing regenerates it. No workflow mentions the file; the only script that
   touches it is the report that blocks on it.

So the gate demands that a committed file name a SHA it cannot name. This is not
"the postcard is old" — the postcard being old is a true and useful thing to
say. It is that the gate's pass condition has no witness.

## Where this came from

#194 asked for exactly this, in good faith: "a certified record older than HEAD
fails it too." _Older_ is satisfiable — it is an ancestry question. _Not equal_
is not. The implementation took the stricter reading, and the acceptance
criterion never got re-tested against "can a commit exist that passes this?"

The source comment above the constant still describes the world before #194:

> `validateCertifiedSuiteEvidence` checks arithmetic and skipped-count against
> the registered `knownDivergences` inventory; **it does not check
> `revision === HEAD`**.

Something does check it now, six lines below, and blocks on it. The comment is
the document disagreeing with the tree, in the same file.

## Work

Decide what "the certified evidence is current" should mean, such that a commit
can satisfy it. Three shapes, in the order I would try them:

1. **Ancestry plus coverage.** The postcard's revision must be an ancestor of
   HEAD, and no path the certified suite covers may have changed since. That is
   the honest reading of "older than HEAD fails": it fails when the code under
   test moved, not when any commit happened. It is satisfiable — the postcard
   commit itself touches no covered path.
2. **Take it out of committed source.** The postcard becomes a CI artifact the
   report reads, written by the certified job at the revision it ran on. Then
   equality is naturally true in CI and the gate is honest about being a CI
   fact. Locally it degrades to "no artifact, report it as unknown".
3. **Keep equality, drop it from the blocking set.** The postcard stays a
   printed, labelled, stale fact and stops gating. Weakest, but it is what the
   gate does today in effect, only without pretending.

Whichever lands, fix the comment at `:13-20` in the same commit, and re-check
#194's "Done when" against it — that criterion is what produced this.

## Done when

`vp run comparison:report:parity:strict` exits 0 on a commit, and the ticket
records which shape was taken and why. The bar is specific: name the commit that
passes, and show that a commit which _should_ fail — one touching a covered path
with a postcard from before it — still does.

## The decision, taken by the conductor on 2026-09-20

Shape 1, ancestry plus coverage. The ticket left three open; this is the one to
implement, and the other two are recorded here as rejected so nobody re-opens
the question at implementation time.

The postcard is current when both hold:

1. `evidence.revision` is HEAD or an ancestor of it, and
2. no path the certified suite covers changed in `evidence.revision..HEAD`.

Covered, because these are what the suite exercises: `packages/*/src/**`,
`apps/comparison/src/**` and `apps/comparison/e2e/**`. Not covered, because a
change there cannot alter a certified result: `.claude/**`, `.agents/**`,
`docs/**`, `scripts/**`, `.github/**`, and every `README`.

> **Superseded 2026-09-21 by the round-2 finding `r2-guards-1`, for this
> paragraph only; shape 1 itself stands.** That list held only what the suite
> _exercises_, and left out everything that turns a run into a verdict — the
> merger, the shard check, the waivers, the runner's config, the pinned oracle,
> the lockfile and the workflow that shards the job, three of which sit under
> the `scripts/**` and `.github/**` this paragraph calls harmless. The rule now
> fails closed: the whole tree is covered, and a path leaves only on a reviewed
> line in `certifiedSuiteCoveredPathspecs`. See the history note of that date.

**And one exclusion that is the whole reason the first attempt failed:**
`apps/comparison/src/data/certified-suite-evidence.ts` is itself not a covered
path. Without that line the rule is unsatisfiable exactly as equality was — the
commit that records a run would invalidate the run it records. That is the
witness this gate has been missing, and it is one line.

Degrade loudly, not quietly. `actions/checkout` in this workflow sets no
`fetch-depth`, so CI clones at depth 1 and neither the ancestry test nor the
path diff can run there. Add `fetch-depth: 0` to the job that runs that step,
and when the recorded revision is not in the object graph (`git cat-file -e`),
**fail** with a message naming `fetch-depth` — do not pass. A gate that goes
quiet in a shallow clone is a gate that is off in CI and green in review, which
is worse than the bug this ticket is about.

Why not the other two. Shape 2, the CI artifact, was the closest fit to the
owner's #547 decision, but it moves the record out of review: nobody sees the
postcard change in a diff, and locally the report can only say "unknown", which
is the quiet degradation above made permanent. Shape 3, dropping it from the
blocking set, is the honest description of today's behaviour and is exactly
what should not be written down as an intention.

What this buys, and it is the point rather than a side effect: any commit that
touches a package source turns that step red until the certified suite is re-run
and its postcard committed. That is the recertification bar doing its job. The
current postcard names `0f1e1198` from 2026-08-21, so the first run of the new
rule will be red, and closing it needs a full certified run — that run is #547's
obligation and #194's, not an extra cost this ticket invents.

## Relationship

Child of #544, stage S0-d, and a blocker for it: that step is on the RC ladder,
so the ladder cannot walk to the end until this is answered. It is the reason the release path
gained a stage-3 entry rather than leaving #194 as background work.

Bears directly on #194, which is in-progress and owns the certified ratchet;
slices 1-3 there are sound and are not in question. This is its acceptance
criterion, not its implementation.

Also bears on the owner's 2026-09-20 decision that #547's certified evidence is
to be recorded by re-enabling Certification Gates and running it in CI. That
decision cannot be carried out while the recording mechanism rejects every
recording. Shape 2 is the one that serves it most directly.

Logged as a rules-and-harness challenge under #552 as well: a gate whose pass
condition has no witness is the class, and "can a commit exist that passes
this?" is the question that would have caught it at review.
