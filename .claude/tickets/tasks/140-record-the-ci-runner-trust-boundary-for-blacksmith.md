---
id: 140
type: task
title: "Record the CI runner trust boundary for Blacksmith"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: merged,
      at: 2026-09-01,
      note: "recorded in release-policy.md: Blacksmith accepted for evidence jobs; GitHub-hosted required for provenance publish",
    }
  - { state: verified, at: 2026-09-01, note: "owner 2026-09-01" }
  - {
      state: verified,
      at: 2026-09-17,
      note: "superseded: owner 2026-09-17 removed the third-party runner on cost; every workflow is ubuntu-latest",
    }
---

## Cause

Certification Gates, Site Gate, Release Readiness, and Changesets Check run on
`blacksmith-4vcpu-ubuntu-2404`. Release uses `ubuntu-latest` because npm
provenance rejects Blacksmith as self-hosted. The third-party runner is on
every blocking evidence job except publish. That choice is not written down.

## Decision

Owner 2026-09-01: Blacksmith is an accepted CI trust boundary for evidence
jobs. Provenance publish stays on a GitHub-hosted runner. Recorded in
`release-policy.md`.

Superseded. Owner 2026-09-17: remove the third-party runner. The trade was
speed against cost, and the runs it was buying speed for were failing. Every
workflow now runs on `ubuntu-latest`; this repository is public, so those
runners are free. The provenance rule is unchanged because it never depended
on the trade.

## Done when

A current doc or this ticket history states the decision.

## Relationship

F-SEC-007. Owner decision (Rule #3).
