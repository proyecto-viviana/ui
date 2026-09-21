---
id: 597
type: task
title: "The parity ratchet absorbed thirty facts its own receipt had refused, and only fourteen of them were ever classified"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `ratchets/parity-rebless-outruns-receipt` (high, confirmed) and `test-integrity/parity-baseline-re-blessed-against-own-finding` (low, partly). `2b444a89` moved `scripts/upstream-test-parity-baseline.json` by +30 under `--allow-growth 573`, and its message says all thirty were classified. Receipt `34064bae`, written just before it, concluded the opposite: the baseline is untouched, nothing re-blessed, no test file edited, because bucket 3 proved none of them wrong. Of the thirty, **14 were classified** - 7 literally, 7 more by the `role|form` group - and 16 were never examined. The 'wrong-shape bug' line in the message is about roles only, `check-upstream-test-parity.ts:25`",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "the skeptic narrowed the second finding and the narrowed version is what this ticket owns. Nothing is buried: the baseline's `growthLog` records ticket 573, the date and all thirty facts verbatim, `2b444a89`'s message names the nine artifacts, and #579 files the filename mis-pairing. The same commit also shrank `coverageGaps` and `upstreamOnly`. The receipt's stated condition was 'stop and tell me', not 'never absorb'. So the survivor is narrow and real: the oracle was made green by widening the allowlist rather than by fixing the mis-pairing, and sixteen facts entered a ratchet without anybody looking at them. Also carries `components-src/stale-pin-in-audit-brief` and `solidaria-src/upstream-pin-baseline`, which are the same subject from the other side: the brief handed to the audit fleet named S2 1.5.1 / RAC 1.19.0, the tree pins **1.7.0 / 1.21.0 / react-aria 3.52.0 / react-stately 3.50.0**, and the range was in fact graded against the tree's pin, so no verdict in the receipt is invalid",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "deferred to the release after the RC by the owner's soft-launch cut, see #544; the ticket keeps its owner and nothing here is waived or closed",
    }
---

## Scope

1. Examine the sixteen facts nobody looked at, and record the classification
   for each — the same shape `34064bae` used for the fourteen. A ratchet row
   that nobody has read is not a ratchet.
2. Fix the pairing rule in `check-upstream-test-parity.ts` so it pairs by the
   component a test renders rather than by the file's basename (#579 is the
   ticket for the rule; this is its first consumer). Then re-measure. The nine
   artifact facts should disappear rather than stay allowlisted.
3. Revert the growth that the re-measurement makes unnecessary, and leave in
   the `growthLog` only what survives with a reason attached.
4. Correct the pin wherever the campaign quotes it. The tree is right; the
   brief and the `installed-comparison-deps-lag-pin` memory entry are behind.
   No live document in `.claude/current/` carries the stale pin —
   `upstream-sync.md:13` already says 1.7.0 / 1.21.0 — so this is a brief-level
   fix, checked here and recorded in the audit receipt.

## Done when

`vp run guard:upstream-test-parity` is green at a baseline where every row has
a recorded classification, the oracle pairs by rendered component, and the nine
known-bogus pairs are gone rather than allowed.

## Proof

The re-measurement's output before and after the pairing fix, with the row
counts; the sixteen classifications; the diff of the `growthLog`.

## Relationship

Child of #544, stage S3. Blocks nothing and is blocked by nothing, which is
exactly why it has been easy to defer — and why it is written down with a stage
number. #579 owns the oracle's attribution rule; #573 is the commit this is
residue of; #577 is the general shape.
