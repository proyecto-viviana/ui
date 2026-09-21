---
id: 574
type: task
title: "The certified-postcard gate cannot be satisfied by any commit, so step 239 is red forever"
created: 2026-09-20
parent: 544
status: open
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
---

## Scope

Step 239 of `.github/workflows/certification-gates.yml` runs
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
path diff can run there. Add `fetch-depth: 0` to the job that runs step 239,
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
touches a package source turns step 239 red until the certified suite is re-run
and its postcard committed. That is the recertification bar doing its job. The
current postcard names `0f1e1198` from 2026-08-21, so the first run of the new
rule will be red, and closing it needs a full certified run — that run is #547's
obligation and #194's, not an extra cost this ticket invents.

## Relationship

Child of #544, and a blocker for it: step 239 is on the RC ladder, so the ladder
cannot walk to the end until this is answered. It is the reason the release path
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
