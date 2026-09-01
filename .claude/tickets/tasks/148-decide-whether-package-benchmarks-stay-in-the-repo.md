---
id: 148
type: task
title: "Decide whether package benchmarks stay in the repo"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "owner 2026-09-01: delete rotting results, the missing-package vitals script, and CI-looking wrappers that never run; live size evidence stays on guard:jsx-deopt-size",
    }
  - { state: merged, at: 2026-09-01, note: "removed benchmarks/ and the root bench:* scripts" }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
---

## Cause

`bench:bundle`, `bench:runtime`, and `bench:all` are root scripts only. No
workflow runs them. `bench:vitals` targets a workspace package that does not
exist. Saved bundle results are dated 2026-02-08 with unknown versions. The
live size gate is `guard:jsx-deopt-size`.

## Decision

Owner 2026-09-01: delete the rotting artifacts and dead scripts. Do not put
benches on the evidence ladder until they pin versions and compare to S2.
That would be a new initiative, not a rescue of the February JSON.

## Work

Remove `benchmarks/` and the root `bench:*` scripts.

## Done when

The rotting scripts and results are gone. Live size evidence remains
`guard:jsx-deopt-size`.

## Relationship

F-PACKAGING-005. Owner decision.
