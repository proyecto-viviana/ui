---
id: 2
type: task
title: "Make the parity gates fail"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
---
The parity gates that compare the two design-system packages **log their findings and exit 0**.
They have been reporting the divergence in #1 the entire time it was growing.

This is pattern P4 in the audit, and this repo is its clearest instance: the check was written,
it works, it detects the real problem, and it cannot stop anything.

## Scope

Exit non-zero. Expect the first run to be red — that is the 533-file backlog (#1), not a bug in
the gate. If the backlog is too large to fix before the gate is useful, **baseline it**: record
the current divergence set and fail on anything new. A frozen backlog with a hard edge beats an
advisory check.

## Done when

Introducing a new divergence between the packages fails a command that runs before commit.

## Relationship

Findings `L1-broken-parity-gates`, pattern P4. Gates the sequencing of #1. Related:
viviana-projects#45 (the CI question), cloud #105.

