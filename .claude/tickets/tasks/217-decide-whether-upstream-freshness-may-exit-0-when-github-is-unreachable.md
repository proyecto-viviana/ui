---
id: 217
type: task
title: "Decide whether upstream-freshness may exit 0 when GitHub is unreachable"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner decided: advisory stays, unknown must be visible; script exits 2 on unreachable/unresolved and the workflow publishes a state output rendered as current/behind/unknown",
    }
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

## Decision (owner, 2026-09-01)

Freshness stays advisory (a new Adobe release must not break `main`), but
the guard must never report "up to date" when it did not check. Unreachable
remote → distinct non-zero exit code (not the "behind" code) and an `unknown`
row in the Certification Gates summary, so current / behind / unknown are
three visible states. The workflow keeps `continue-on-error` for this job.

## Done when

The decision is recorded and the script matches it.

## Relationship

F-UP-002. Owner-decision.
