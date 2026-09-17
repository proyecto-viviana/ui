---
id: 541
type: task
title: "Sweep stale in-progress tickets so the board shows live work"
created: 2026-09-17
status: open
history:
  - {
      state: open,
      at: 2026-09-17,
      note: "vivianastack #21: in-progress must be the count of work actually live",
    }
---

Make `in-progress` mean active work on this board. On 2026-09-17
`ticket-activity.mjs` reported 61 in-progress tickets; 34 had no Git,
history, or activity-log signal for more than fourteen days.

## Scope

This repository's board. Status changes and history notes only. One
AGENTS.md command-table correction (`vp`, not `pnpm`) when the tree
disagrees.

## Non-goals

Feature work, component changes, dependencies, pruning the store,
editing another repository.

## Done when

Tickets idle more than fourteen days are merged, verified, parked,
dropped, or listed for the owner. The regenerated activity report's
in-progress count is the live work.

## Proof

Before and after `ticket-activity.mjs ui --status in-progress` output.

## Relationship

Consumes vivianastack #21 / #22. Does not parent under #136: this is
board hygiene, not audit remainder.
