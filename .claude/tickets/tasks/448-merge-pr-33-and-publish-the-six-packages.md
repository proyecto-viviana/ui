---
id: 448
type: task
title: "Merge PR #33 and publish the six packages"
created: 2026-09-03
parent: 443
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed as the merge → same-SHA gates → regenerated #32 → publish slice of the 2026-09 train",
    }
---

Push the branch, land three PR checks green, owner-gate merge #33,
same-SHA `Certification Gates` + `Release Readiness` + `Site Gate` on
main, Release workflow regenerates #32, owner-gate merge #32, verify
`npm view` for the six packages.

## Evidence

PR #33 `audit-2026-09-round-2` head `87da0f75`. Pending 83 changesets
for the six public packages. Publish and merge are owner-gated.

## Done when

The Release run is green and the versions are visible on the registry.

## Relationship

Child of #443. Depends on #444–#447 landing first where they block
gates.
