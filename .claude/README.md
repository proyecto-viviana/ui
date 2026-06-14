# `.claude/` Index

Local working surface for this repo. Only a curated, current slice is tracked;
everything else is local scratch.

## Tracked (the current surface)

- [`current/`](current/) — the canonical deep current-docs spine. Start at
  [`current/README.md`](current/README.md) for the read order. Repo-root
  [`../README.md`](../README.md) and [`../AGENTS.md`](../AGENTS.md) are the
  entry points; [`../CLAUDE.md`](../CLAUDE.md) adds Claude Code-specific notes.
- [`reference/`](reference/) — language-level reference that outlives any one
  plan: [`reference/patterns.md`](reference/patterns.md) (SolidJS idioms — ref
  accessors, `MaybeAccessor`, `createMemo`, `splitProps`) and
  [`reference/commands.md`](reference/commands.md) (command cheatsheet; the
  authoritative command policy lives in [`current/tooling.md`](current/tooling.md)).

## Local only (git-ignored)

- `docs/` and `journal/` — superseded historical notes, audits, gap reviews,
  and session logs. Kept on disk for local recall, not tracked: current truth
  is distilled into `current/`, and git history is the archive for anything
  that was ever tracked.
- `skills/` and `settings.local.json` — local tool state.

Verify any status claim here against current source, tests, generated reports,
and the tracked docs before acting.
