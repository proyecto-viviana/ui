---
id: 541
type: task
title: "Sweep stale in-progress tickets so the board shows live work"
created: 2026-09-17
status: verified
history:
  - {
      state: open,
      at: 2026-09-17,
      note: "vivianastack #21: in-progress must be the count of work actually live",
    }
  - {
      state: in-progress,
      at: 2026-09-17,
      note: "classified the 34 tickets idle more than fourteen days; AGENTS.md commands now match vp",
    }
  - {
      state: merged,
      at: 2026-09-17,
      note: "26 advanced, 5 parked, 0 dropped, 3 left for the owner",
    }
  - {
      state: verified,
      at: 2026-09-17,
      note: "in-progress 61 → 30; 15-30 day bucket 34 → 0",
    }
---

<!-- doc-shape: over cap because the proof is real command output -->

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

Working directory: ecosystem root. Command:
`node vivianastack/scripts/audit/ticket-activity.mjs ui --status in-progress`.
ui has one portfolio node; no `subpath:`/`part-of:` double-count.

Before (61; 15-30 = 34):

```
ticket-activity  viviana-ui  in-progress  61 ticket(s)

histogram
  0-7         21
  8-14         6
  15-30       34
  31+          0
```

After (30; 15-30 = 0):

```
ticket-activity  viviana-ui  in-progress  30 ticket(s)

histogram
  0-7         24
  8-14         6
  15-30        0
  31+          0
```

Split of the 34: verified 6, merged 20, parked 5, dropped 0, left for
the owner 3 (#56, #220, #240).

## Relationship

Consumes vivianastack #21 / #22. Does not parent under #136: this is
board hygiene, not audit remainder. vivianastack #24 (board counted
twice) does not apply to this node.
