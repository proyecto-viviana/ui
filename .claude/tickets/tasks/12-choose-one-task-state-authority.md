---
id: 12
type: task
title: "Choose one task-state authority"
created: 2026-08-20
parent: 28
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened because two tracked task systems currently overlap",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "confirmed that the portfolio and execution playbook assign durable work state to the ticket board",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "owner confirmed the ticket board as the only writable task-state store and /admin as its editor and projection",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "cut over /admin, migrated unique active records, and removed task and roadmap state from current-doc frontmatter",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "landed the ticket-backed admin projection, generated work views, and duplicate-authority checks",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "admin tests and docs:check prove one writable task-state authority",
    }
---

Task state currently exists in the `tasks:` frontmatter under
`.claude/current` and in `.claude/tickets/tasks`. The `/admin` dashboard reads
the first source. The ecosystem ticket scheme governs the second source.

The owner confirmed the intended authority on 2026-08-20. This ticket records
that decision and its implementation.

## Research before the decision

- [x] Map open current-document tasks to local tickets and roadmap items.
- [x] Identify state that exists in only one source.
- [x] Verify the authority declared by the portfolio and execution playbook.
- [x] Verify which source `/admin` edits.
- [x] Verify why the ecosystem source allowlist omits the UI board source.
- Bring the map and conflicts to the owner without inventing a third model.

## Evidence

- The portfolio node for `viviana-ui` declares `.claude/tickets` as its board.
- The adopted ticket execution playbook makes the product ticket the sole
  dispatch and durable work record.
- The local board contains only `SCHEME.md` and `tasks/`. The shared scheme
  also requires `initiatives/` and `milestones/`. It classifies a board with
  missing directories as legacy or unmigrated.
- The local `SCHEME.md` refers to `viviana-projects/spec/ticket-scheme.md`.
  That path does not resolve inside this repository. The actual specification
  is in the sibling `viviana-projects` checkout.
- The ecosystem source allowlist contains `source:git:viviana-ui`. It does not
  contain `source:board:viviana-ui`. The generated portfolio can therefore
  show the declared board while omitting its current task state.
- `/admin` reads and writes task frontmatter under `.claude/current`. It also
  reads `.claude/current/roadmap.md` directly.
- The current-document store contains 101 task records. It has 43 open, 3
  next, 9 in progress, and 46 done records.
- The ticket store contains focused work that does not exist in the current
  store. Current documents also contain unique tasks that do not exist as
  tickets.

## Initial overlap map

| Ticket          | Related current task           | Finding                                   |
| --------------- | ------------------------------ | ----------------------------------------- |
| #1              | `upper-layer-convergence`      | Overlapping scope                         |
| #3              | `ts-nocheck-components`        | Ticket has broader scope                  |
| #6              | Consumer-delivery task cluster | Several current records map to one ticket |
| #4, #5, #9      | No exact match                 | Ticket-only work                          |
| #10 through #16 | No exact match                 | New ticket-only work                      |

Ticket #2 records the completed strict gate. The current task
`labeledvalue-strict-parity` remains open and has different scope.

## Confirmed architecture

Use `.claude/tickets` as the only writable work-state store. Make `/admin` a
projection and editor for that store. Keep stable references under
`.claude/current`, but do not store task state there. Generate roadmap and
status views from tickets and repository reports. Use Git history for retired
plans and completed operational records.

The owner confirmed this architecture on 2026-08-20.

The first implementation slice must preserve the existing current-document
task records. Remove them only after `/admin` projects the board, all unique
open work is migrated, and the documentation checks pass.

## Scope after the decision

- Record the owner-directed authority and update path.
- Make `/admin` project that authority without a second writable state store.
- Migrate unique open state without changing its meaning.
- Remove duplicate completed task records from the non-authoritative source.
- Make the documentation check reject duplicate task identifiers or state.
- Make the local board conform to the adopted directory and metadata scheme.
- Make the ecosystem source allowlist consume the UI board when applicable.

## Done when

Each task has one writable state record. All other surfaces link to or generate
their view from that record.

## Verified evidence

- `.claude/tickets` now contains the required task, initiative, and milestone
  directories.
- `/admin` reads and updates ticket status and blocked state.
- The parser accepts legacy `done` state and normalizes it to `merged`.
- The parser preserves unknown frontmatter fields.
- All 45 unique active records from `tech-debt.md` have ticket coverage.
- Active records from the Kumo plan, work queue, upstream audit, and comparison
  docs plan have ticket coverage.
- `.claude/current` contains no writable task or roadmap-item state.
- `status.md` and `roadmap.md` are generated from the ticket board.
- Board, admin, generated-view, and duplicate-authority checks pass.

The ecosystem source allowlist remains outside this repository. This repository
cannot change that allowlist. The local cutover does not depend on it.

## Relationship

Blocks structural task cleanup in #13. The `admin-dashboard` roadmap item
remains the product boundary for `/admin`.
