---
id: 217
type: task
title: "Decide whether upstream-freshness may exit 0 when GitHub is unreachable"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`scripts/check-upstream-freshness.ts:71-74` catches a failed `git ls-remote`,
prints "skipping, treated as up to date", and exits 0. With
`continue-on-error: true` in the workflow, two independent paths let
certification stay green while Adobe is ahead. The comment names the reason
(never cry wolf on a network blip); it is also how a behind pin disappears
from the job table.

## Work

Owner decision: keep skip-on-offline, or fail closed (or mark the job
neutral with a visible warning) when the remote is unreachable.

## Done when

The decision is recorded and the script matches it.

## Relationship

F-UP-002. Owner-decision.
