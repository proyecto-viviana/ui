---
id: 4
type: task
title: "Delete the orphaned agent worktrees"
created: 2026-08-01
status: open
history:
  - { state: open, at: 2026-08-01, note: "opened from the 2026-08-01 ecosystem audit" }
---

Orphaned agent worktrees are left in this repo. They inflate every hub-wide duplication and size
census — the audit had to correct for them repeatedly — and they are the mechanism behind audit
critical C3 in `akade.dev`, where three worktrees shared one live database.

## Scope

Check each for unique commits, then `git worktree remove`. Add worktree cleanup to whatever
the agent driver does on completion, so this does not recur.

## Done when

`git worktree list` shows only intended worktrees.

## Relationship

Findings `L1-orphaned-agent-worktrees`,
`L8M-worktrees-are-the-hidden-duplication-and-they-poison-every-metric`. Related: akade #46.
