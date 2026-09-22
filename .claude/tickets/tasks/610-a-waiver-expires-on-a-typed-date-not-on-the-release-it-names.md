---
id: 610
type: task
title: "A certified waiver expires on a typed date, not on the release it is supposed to stand until"
created: 2026-09-22
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-22,
      note: 'opened from #578''s review, whose fourth problem was that `expires: "2026-12-31"` did not implement the rule the board records. The rule, delegated on 2026-09-21 and written on #578 as the conductor''s accepted default, is that a waiver is "ticket-backed and expiring at the next release"; the date actually written was a round number three months out, chosen by hand, and nothing in the mechanism connected it to a release. Measured before changing anything: `rg -n ''2026-1[12]|releaseDate|release_date'' apps/comparison/scripts apps/comparison/e2e .changeset package.json` finds no release date anywhere in this tree, and `.changeset/` carries no schedule - so a truly release-bound expiry has nothing on disk to read yet, which is why this is its own ticket and not a line in that fix. What landed instead is the honest half: `MAX_WAIVER_HORIZON_DAYS = 60` in `apps/comparison/scripts/certified-waivers.ts`, a new `expires-too-far` problem kind that fails the certified verdict when an entry stands longer than that, and the five tracked entries re-dated `2026-12-31` -> `2026-10-21`. Proved by mutation: with the tracked dates the loader reports 0 problems, and with all five put back to `2026-12-31` it reports 5 `expires-too-far` problems at a horizon of `2026-11-21` (scratch script over the real module, exit 0, today `2026-09-22`). A horizon is a ceiling, not the rule: it stops a waiver outliving a release cycle, and it still lets one outlive the release if the release ships sooner, which is exactly the gap this ticket closes',
    }
---

## Scope

One owning repository, `ui`, and one behaviour: a certified waiver stops
waiving when the release it was written for has shipped, without anyone
re-typing a date.

Write paths: `apps/comparison/scripts/certified-waivers.ts`,
`apps/comparison/e2e/certified-waivers.json`, the waiver tests under
`apps/comparison/src/data/`, and whatever release fact the fix reads. Mint no
new public name: `apps/comparison` is not published, but a new field on the
waiver entry is a file format other jobs read, so name it in the ticket before
writing it.

Explicit non-goals: do not raise `MAX_WAIVER_HORIZON_DAYS`, do not remove the
`expires-too-far` problem kind before the replacement is proved, and do not
touch the waiver rule itself — behaviour-class only, ticket-backed, never
crash-class — which is the owner-delegated call recorded on #578 and #544.

## The two candidate shapes

Neither is chosen here; the fix picks one and says why.

1. **Read the release.** Bind expiry to the published version rather than to a
   date: an entry names the version it defers past (for example the `rc` the
   soft-launch cut ships), and the verdict expires it once the installed or
   published version has moved beyond it. The fact has to come from something
   on disk or from the job's own environment, not from a hand-typed date.
2. **Mechanise the date.** Keep `expires` but have the release process write
   it: the step that versions the packages re-stamps every entry, so a waiver
   that survives a release is visible as a diff rather than as a silent
   extension. Cheaper, and it still trusts a human step.

## Done when

`certified-waivers.json` carries no hand-typed horizon date, and a waiver whose
release has shipped stops waiving without an edit — proved by a test that fails
on the pre-fix mechanism. `vp run comparison:test:certified-waivers` and
`vp run comparison:guard:certified-waiver-tickets` stay green across the change,
and #578's five entries are migrated in the same commit rather than left
straddling two formats.

## Proof

The mutation both ways: an entry whose release has shipped must fail the
verdict, and one whose release has not must pass, each with its exit code. The
horizon rule this replaces has its own test
(`fails the job when a waiver stands past the horizon a release bounds`) and
that test is either kept or replaced by the new one in the same commit.

## Relationship

Child of #544. Opened from #578, which owns the certified census and the waiver
list, and which carries the five entries this rule will govern: two on #584,
two on #583, one on #609. Bears on #547, whose release is the event the expiry
is meant to track, and on #574, which owns the postcard pin the same job reads.
