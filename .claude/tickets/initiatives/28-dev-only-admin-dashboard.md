---
id: 28
type: initiative
title: "Dev-only admin dashboard"
created: 2026-08-20
status: verified
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from roadmap item admin-dashboard" }
  - {
      state: merged,
      at: 2026-09-01,
      note: "done-when is met: /admin projects .claude/tickets with no second writable store; generated views use that board; children #12, #14, and #36 are verified",
    }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner 2026-09-01; leftover admin production-graph work is #137, not remaining #28 scope",
    }
---

Project and edit the repository work board through the development-only dashboard.

## Done when

`/admin` projects `.claude/tickets` without a second writable task-state store. Generated status and roadmap views use the same source.

## Relationship

Replaces roadmap item `admin-dashboard`. Ticket #12 controls the task-state cutover.
Further admin production-graph work is #137, a child of #136, not leftover #28 scope.
