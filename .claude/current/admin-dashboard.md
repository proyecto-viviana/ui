---
kind: reference
status: current
tasks:
  - id: admin-port
    title: Port the visualmode admin dashboard into apps/web
    state: in-progress
    roadmap: admin-dashboard
    planned: { start: 2026-06-13, target: 2026-06-20 }
  - id: admin-mock-data
    title: Seed validator-clean mock roadmap and tasks
    state: done
    finished: 2026-06-14
    roadmap: admin-dashboard
    planned: { start: 2026-06-13, target: 2026-06-14 }
---

# Admin Dashboard

Status: live admin spec.
Update when: the dashboard panels, the tracking schema, or the docs:check gate change.

A dev-only dashboard for steering the project from the `.claude/current` docs.
It ships nowhere: the route renders only under `import.meta.env.DEV`, and its
data API is a Vite dev-server middleware (`apply: "serve"`) that reads and writes
repo files from the Node process. The production worker (workerd) has no
filesystem and never sees any of it.

## Where it lives

- Route: `apps/web/src/routes/admin.tsx` (`/admin`, dev-gated, lazy-loads the
  panel and its CSS).
- UI: `apps/web/src/app/admin/` — `AdminPage.tsx` plus one component per panel
  (Home, Roadmap, Tasks, Docs, Architecture, Glossary) and a shared
  `GanttChart`. Self-contained `admin.css`; a hand-rolled `Markdown` renderer (no
  runtime markdown dependency).
- Server: `apps/web/src/app/admin/server/` — `plugin.ts` (the `/api/admin/*`
  middleware), `data.ts` (repo walk: docs, git, workspace packages), and the two
  pure modules below.
- Client fetch helpers: `apps/web/src/app/admin/api.ts`.

## The tracking model

Two linked axes, both stored as markdown frontmatter so they travel with the
docs and diff in git:

- **Roadmap items** — high-level initiatives in this folder's `roadmap.md`
  (`items:`). Each has a `status` (`open` / `in-progress` / `blocked` / `done`),
  an optional `window`, and `docs:` refs into `.claude/current`.
- **Tasks** — low-level work in the `tasks:` frontmatter of any current doc.
  Each has a `state` (`open` / `next` / `in-progress` / `done` / `blocked`),
  optional `planned` window and `depends`, and a `roadmap:` id linking it up to
  an item.

`frontmatter.ts` parses and rewrites these without touching the doc body
(`setTaskState` stamps or clears `finished`; `setRoadmapItemStatus`,
`markReviewed`). `validate.ts` (`validateTracking`) is the single source of
integrity rules and runs in two places: the `docs:check` gate
(`scripts/check-docs-current.ts`) and the Home panel's problems strip.

## Invariants `docs:check` enforces

- Every current doc carries the status header and baseline frontmatter
  (`kind` + `status`).
- Every task points at a real roadmap item; every `depends` resolves to a real
  task id; ids are unique across docs.
- `done` ⇔ a well-formed `finished` date; non-done tasks carry none; windows are
  not inverted.
- Every in-progress item has at least one task; a done item's tasks are all done;
  item `docs:` refs resolve inside `.claude/current`; the roadmap is non-empty.

## Mock data

The seeded items and tasks (here and in `roadmap.md`, `work-queue.md`,
`tech-debt.md`) are validator-clean placeholders so the panels render against
real structure. Replace them with live initiatives as work is scheduled.
