---
id: 36
type: task
title: "Port the visualmode admin dashboard into apps/web"
created: 2026-08-20
parent: 28
status: verified
history:
  - { state: in-progress, at: 2026-08-20, note: "migrated from legacy task admin-port" }
  - {
      state: merged,
      at: 2026-08-20,
      note: "ported the admin dashboard to apps/web and connected it to the ticket board",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "admin tests prove ticket projection, edits, validation, and read-only generated views",
    }
---

Complete the development-only dashboard in `apps/web`.

The original plan used a 2026-06-13 to 2026-06-20 window. The target is stale.

## Done when

The dashboard projects and edits the adopted ticket board. It does not create a second task-state store.

## Verified evidence

- `/admin` reads and updates `.claude/tickets`.
- Generated status and roadmap views are read-only.
- Admin tests prove valid edits and reject invalid state.
- The complete web test suite passes.

## Relationship

Replaces `admin-port` from `.claude/current/admin-dashboard.md`. Ticket #12 owns the task-state cutover.
