---
id: 83
type: task
title: "Make local gate preconditions deterministic"
created: 2026-08-20
parent: 27
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task local-gate-preconditions" }
---

Make each local gate behave deterministically from a clean checkout.

`typecheck:apps` currently reports missing workspace packages when build
artifacts do not exist, while the canonical aggregate builds first and passes.
Encode the dependency order or stop immediately with an exact remediation.

## Done when

Standalone and aggregate invocations either prepare the same prerequisites or
report a clear, actionable precondition without misleading type errors.

## Relationship

Replaces `local-gate-preconditions` from `.claude/current/tech-debt.md`.
GitHub issue #28 holds the original external scope.
