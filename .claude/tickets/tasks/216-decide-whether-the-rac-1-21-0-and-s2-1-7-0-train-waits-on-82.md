---
id: 216
type: task
title: "Decide whether the RAC 1.21.0 and S2 1.7.0 train waits on #82"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner decided: train completion redefined; #82 closed under it; #220 opened; #118 re-aimed; upstream-sync.md step 11 updated",
    }
---

## Cause

`guard:upstream-freshness` is red: react-aria-components 1.20.0 → 1.21.0,
`@react-spectrum/s2` 1.6.0 → 1.7.0 (`gates/upstream_freshness.log`). The
playbook says a new Adobe release starts a ticketed absorption train. #82 is
still in-progress on the 1.6.0 / 1.20.0 train and nothing owns the next one.
CI marks freshness advisory, so main stays green on a pin Adobe has left.

## Work

Owner decision: open the next train now (parallel with #82), or record on
#82 that it must finish first and when the next one starts.

## Decision (owner, 2026-09-01)

Train completion is redefined: a train is complete when the pin has moved,
the release inventory is mapped to tickets, and the certified suite is green
against the new oracle. Behavior tickets carry across trains. Under that
definition #82's train is complete (its 20 remaining items each have a
ticket). Open the 2026-09 train (RAC 1.21.0 / S2 1.7.0, tag `f56660b`) now;
the pin move is its first task and lands before the functional pass so the
pass compares against current React. Re-aim #118 at the 1.21 TokenField
selection API (`selectedRange`, `withSelectedRange`) immediately. Record the
completion definition in `.claude/current/upstream-sync.md`.

## Done when

The decision is recorded on #82 or a new train ticket exists.

## Relationship

F-UP-001, F-GATE-002. Owner-decision (Rule #3).
