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
