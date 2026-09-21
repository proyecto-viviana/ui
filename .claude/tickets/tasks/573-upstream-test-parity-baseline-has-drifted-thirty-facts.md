---
id: 573
type: task
title: "The upstream-test-parity baseline has drifted 30 facts behind the pin, and its last move was labelled fmt"
created: 2026-09-20
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor walking the post-build half of the ladder on 2026-09-20 evening. `vp run guard:upstream-test-parity` EXIT=1: `count delta vs baseline: suspects 157 → 187 (Δ+30), coverageGaps 47 → 43 (Δ-4), upstreamOnly 18 → 16 (Δ-2)`; against the pin at s2 1.7.0 / rac 1.21.0 it matches 49, has 145 of ours with no upstream pair and 16 upstream with no pair of ours, and ranks 37 suspects of which 18 are ROLE divergences. Step 227 of certification-gates.yml. Two things make it more than a re-bless: seven of the thirty new facts are the identical `role|form` fact on checkbox, combobox, numberfield, radiogroup, searchfield, select and textfield - one cause, not seven - and the baseline's last content change, `a741273a`, is `5 insertions, 17 deletions` even under `git show -w` inside a commit whose subject calls it `fmt drift in tickets and the parity baseline`. Evidence `.agents/chain-walk-2026-09-20/ladder-upstream-test-parity.out.txt`",
    }
---

## Scope

`scripts/check-upstream-test-parity.ts` diffs the ARIA vocabulary our tests
assert against the vocabulary the pinned upstream tests assert, and ratchets on
a committed baseline (`BASELINE_PATH`, line 38). Growth is allowed only
deliberately: `--allow-growth <ticket>` (lines 47-56) records the ticket in
`growthLog`, and `--write-baseline` (line 39) re-blesses wholesale.

At HEAD the guard is red by +30 suspects. That is expected in shape — the pin
moved to s2 1.7.0 / rac 1.21.0 and 973 test-file changes have landed since the
baseline last moved — but it is **not** a re-bless, for two reasons.

### The thirty are not thirty

Seven of the new facts are the same fact:

```
checkbox|role|form   combobox|role|form   numberfield|role|form
radiogroup|role|form searchfield|role|form  select|role|form
textfield|role|form
```

One cause produced seven rows. Re-blessing writes seven independent-looking
entries into the baseline and buries it. And some of the rest do not look like
drift at all — `tabs|role|textbox` and `searchfield|role|dialog` are the wrong
shape for the component that asserts them, which is exactly the class this guard
exists to catch.

### The baseline's last move was mislabelled

`a741273a` (2026-09-02) is the last **content** change to
`scripts/upstream-test-parity-baseline.json`. Its subject calls it "fmt drift in
tickets and the parity baseline", but `git show -w --stat` on that path is
`5 insertions, 17 deletions` — a net loss of twelve entries, with whitespace
already discounted. It also landed _after_ the pin bump `0847c615` the same day,
and #220's record says the guard failed before a baseline regen and passed after
`--write-baseline`. So the ratchet has been moved by a regen once already,
under a label that hides it. Until the current delta is classified, a second
`--write-baseline` makes the file mean nothing at all.

## Work

Classify all 30 added facts before touching the baseline. Three buckets, and
each row lands in exactly one:

1. **Upstream moved** — the pinned tests really do assert this now. Legitimate;
   it belongs in the baseline.
2. **One cause, N rows** — the seven `role|form` rows, and any other family.
   Find the single change that produced them and name it once. If it is ours,
   it may be a defect; if it is upstream's, it is one fact, not seven.
3. **Wrong shape** — `tabs|role|textbox`, `searchfield|role|dialog`, and the
   rest of the 18 ROLE divergences. A component asserting another component's
   role is a finding, not drift. Each of these owes a yes/no on whether our test
   is asserting the wrong thing.

Start at bucket 3: role divergence is the signal the guard was built for, and
the 18 are already ranked in the receipt.

Only then re-baseline, and prefer `--allow-growth 573` over `--write-baseline`
so the growth is recorded against this ticket rather than erasing the history of
the ratchet. Whatever lands, the commit message says what moved and why — the
thing `a741273a` did not do.

## Done when

`vp run build && vp run guard:upstream-test-parity` exits 0; every one of the 30
added facts is accounted for in one of the three buckets in this ticket; any row
in bucket 3 that turns out to be a real mis-assertion is either fixed or has its
own ticket; and the baseline moved through `--allow-growth 573` with a commit
message that names the change.

## Relationship

Child of #544, and stage 2 of `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`.
Step 227 of `.github/workflows/certification-gates.yml` — the last red on the
ladder, behind #570 (160), #571 (169, 185) and #572 (219).

Not owned elsewhere, checked before filing: #220 is in-progress but closed its
own regen; #23 is verified; #204 is parked. #568 owns the reason this went
unseen — `ci:release-readiness` never reaches step 227.

The two heavy post-build gates, comparison parity strict (239) and axe full
(251), are still unrun at the time of filing and may add reds behind this one.
