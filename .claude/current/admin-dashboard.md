---
kind: reference
status: current
---

# Admin dashboard

Status: live admin reference.
Update when: the dashboard, ticket scheme, or documentation check changes.

`/admin` is a development tool. It reads repository files and shows project
state. It does not ship in the production worker.

The route loads only when `import.meta.env.DEV` is true. A Vite development
server middleware provides the API. The production worker has no access to the
repository file system.

## Source of truth

`.claude/tickets` is the only writable task-state store. The dashboard reads
and edits this board.

The board follows the shared ticket scheme v1. It has one file for each task,
initiative, and milestone. The lifecycle is:

`open → next → in-progress → merged → verified`

The `blocked` field is a separate flag. It is not a lifecycle state.

Stable references remain in `.claude/current`. They can describe policy,
architecture, and procedures. They must not own task state. Generated roadmap
and status views can project the ticket board.

## Code locations

- `apps/web/src/routes/admin.tsx` defines the development-only route.
- `apps/web/src/app/admin/` contains the panels and client API.
- `apps/web/src/app/admin/server/plugin.ts` defines the development API.
- `apps/web/src/app/admin/server/data.ts` reads docs, tickets, Git, and packages.
- `apps/web/src/app/admin/server/tickets.ts` parses and updates ticket files.
- `apps/web/src/app/admin/server/validate.ts` checks stable document metadata.
- `scripts/check-docs-current.ts` runs the same checks from `docs:check`.

## Write rules

The ticket status controls append a lifecycle history entry when the status
changes. They preserve unknown frontmatter fields and the ticket body. The
blocked control writes `blocked: true` or removes the field.

The Docs panel can edit current documents and ticket files. Research and
archive documents are read-only. The review queue applies only to current
documents.

## Checks

`docs:check` checks these conditions:

- Each current document has `kind` and `status` frontmatter.
- Each live current document has the visible status and update lines.
- The ticket board contains the `tasks`, `initiatives`, and `milestones`
  directories.
- Each ticket path, numeric ID, type, date, lifecycle status, history, and
  parent relationship follows the shared scheme.
- Ticket IDs are unique across the complete board.

The Home panel shows the same ticket and document problems.
