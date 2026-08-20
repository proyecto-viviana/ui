---
id: 16
type: task
title: "Enforce the live documentation contract"
created: 2026-08-20
status: in-progress
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened because docs:check does not enforce the current organization policy",
    }
  - {
      state: open,
      at: 2026-08-20,
      note: "added ticket-board conformance checks found during the authority audit",
    }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "enforced board validity, single task authority, read-only generated views, and generated revision freshness",
    }
---

`docs:check` currently validates status headers and roadmap-task links. It can
pass while current documents contain stale facts, duplicate authority, broken
local links, and completed historical records.

## Scope

- Reject completed, archived, superseded, or done documents under the live
  documentation surface.
- Validate local Markdown links and indexed files.
- Detect duplicate task identifiers and conflicting task state.
- Validate required ticket-board directories and supported record types.
- Validate ticket identifiers, filenames, lifecycle state, and history.
- Accept legacy `done` records during migration. Normalize them when touched.
- Require each generated status view to identify its source and evidence
  revision.
- Reject manual copies of generated facts where a stable marker can identify
  them.
- Enforce the owner-directed live-document set and reading path.
- Reject active internal plans under public `docs/` paths after migration.
- Distinguish stable public docs, colocated evidence, and generated reports from
  writable work state.
- Add discriminating tests for each rule.

The current `docs:check` command does not inspect `.claude/tickets`. Add the
board checks only after #12 confirms the task authority. Do not create an empty
directory tree as a substitute for a working projection.

Do not use arbitrary prose length as proof of quality. A size budget can detect
growth, but the checks must enforce authority and structure first.

## Done when

Each documented organization rule has a regression test that fails on a real
drift case. `docs:check` remains fast enough for normal repository checks.

## Progress checkpoint

The current checks validate the ticket scheme, lifecycle history, hierarchy,
duplicate identifiers, and generated-view freshness. They reject `tasks:` and
roadmap `items:` under `.claude/current`. `/admin` treats generated views as
read-only.

Local Markdown-link validation, completed-document retirement, the live-set
contract, and active internal plans under public `docs/` still need checks.
A one-time local-link scan passed for all 13 current documents. This does not
replace the missing regression check.

## Relationship

Implements the structure chosen in #12 and #13. Uses generated-source contracts
from #14.
