---
id: 577
type: task
title: "Ratchets report their own staleness as a defect in the tree, and three did it in two days"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "raised by the close-gates writer under #572 as 'noticed, not done', and filed here rather than widened inside a ticket opened to make a gate green - which was the right call. The immediate case: `scripts/check-jsx-ref-dead-code.ts` asserts each marker against the **bundle** only, so 'this regex matches nothing anywhere' and 'the build dropped this code' produce the same message, `package transform dropped …`. It blamed a build that had done nothing, for a line `70a8d478` deleted four days earlier. Not blocking the RC: every ladder step this class touched is green as of `40ac9573`",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Six findings land here, all the same shape this ticket already names. `ratchets/rebless-refusal-gap` and `guards-a/layer-boundary-reason-bypass`: the `--write-baseline` reason requirement covers only identical to diverged, and lives only in the path the harness refuses, so a fork born diverged still needs no reason. `guards-b/layer-boundary-vanish-hole` and `board-truth/layer-boundary-nine-left-the-ratchet`: a baselined path that leaves the shared set vanishes silently, nine did so in one commit, and a diverged path's drift is never re-checked. `guards-b/570-behaviour-claim-false`: #570 re-blessed nine paths under a blanket `none of them touches behaviour` the diff contradicts. `ratchets/layer-boundary-blind-7-days`, and the skeptic refuted its headline - `check-layer-boundary.ts:59-91` does sha256-walk both trees every run and does fail on baselined-identical drift, so it is not a hand-maintained record; what is true is that `packages/viviana-ui/src/color/ColorSwatchPicker.tsx` silently lost a live-size fix for seven days because **viviana-ui has no ColorSwatchPicker test**, and `37973fa5` re-synced it. The general fix this ticket already argues for - recompute the classification from hashes on every run and fail on any row that disagrees with the tree - answers four of the six.",
    }
---

## Scope

Three separate ratchets failed the same way inside two days, and each cost a
red gate for no defect:

| ticket | ratchet                                      | what it still described                         |
| ------ | -------------------------------------------- | ----------------------------------------------- |
| #571   | `idiomatic-solid-children-baseline.json`     | a `const resolved =` binding `92ddc52b` deleted |
| #571   | `check-idiomatic-solid.ts` allowlist snippet | a destructure `163f4377` dissolved              |
| #572   | `check-jsx-ref-dead-code.ts` marker          | a `setAttribute` call `70a8d478` deleted        |

#573 is a fourth of the same family, arrived at from the other end: a ratchet
that moved with no recorded reason, so nobody can now say what it meant.

The shape is one thing, not three. A record names a piece of source; a refactor
moves the source and leaves the record; the record then either **fails**,
blaming the tree for its own staleness, or **silently stops covering anything**,
which is worse because it looks green. `#571`'s allowlist did the second for
however long it sat there, and then the first.

## What makes this fixable rather than a lament

Every one of these ratchets already knows the file it points at. None of them
checks that its own pointer still resolves. The cheapest correct form:

- **Assert the record against the source first.** A marker present in source and
  absent from the bundle is the defect the guard exists to find. A marker absent
  from source is a stale record, and the guard should say _that_, by name, with
  the ticket to fix it — not `package transform dropped`.
- **A record that resolves to nothing is an error, not a pass.** The baseline
  entry and the allowlist snippet both degraded quietly. Whatever the message,
  an unresolvable pointer must exit non-zero on its own terms.

`guard:layer-boundary` already went the rest of the way under #570 — it refuses
to re-bless an unexplained move, and it fails a reason that names a path which
is no longer diverged, so a reason cannot outlive its cause. That is the shape
worth copying, and it was built in this repository this week.

## Work

1. Inventory the ratchets: every script under `scripts/` that holds a
   hand-written list of source positions, snippets, markers or counts. Name
   them; the four above are the ones already known and are unlikely to be all.
2. For each, add the source-resolution check, with a message that says "this
   record no longer matches the tree" rather than naming the build or the code.
3. Where a record can move, require the reason, the way `#570` did.

Do the inventory before the fixes and say what it found, including any ratchet
deliberately left alone and why.

## Done when

Each inventoried ratchet fails with a message that distinguishes a stale record
from a real regression, and the inventory is recorded with a line per ratchet.

## Relationship

Child of #544 but **not on the RC path** — all four gates are green at
`40ac9573`, so this blocks nothing and should not be taken before the reds that
do. Downstream of #570, whose refusal mechanism is the model, and of #571, #572
and #573, which are the evidence. Bears on #568, which owns the fact that most
of these gates never run outside `certification-gates.yml`: a ratchet that only
runs in a workflow nobody triggers has longer to rot before anyone notices.
