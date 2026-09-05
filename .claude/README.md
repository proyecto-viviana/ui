# `.claude/` Index

Local working surface for this repo. Only a curated, current slice is tracked;
everything else is local scratch.

## Tracked (the current surface)

- [`current/`](current/) — the canonical deep current-docs spine. Start at
  [`current/README.md`](current/README.md) for the read order. Repo-root
  [`../README.md`](../README.md) and [`../AGENTS.md`](../AGENTS.md) are the
  entry points; [`../CLAUDE.md`](../CLAUDE.md) adds Claude Code-specific notes.
- [`reference/`](reference/) — language-level reference that outlives any one
  plan: [`reference/patterns.md`](reference/patterns.md) (SolidJS idioms) and
  [`reference/commands.md`](reference/commands.md) (short pointer; the
  command policy is [`current/tooling.md`](current/tooling.md)).
- [`tickets/`](tickets/) — the only writable task-state store.

## Local only (git-ignored)

- `docs/` and `journal/` — do not recreate these as a second truth. Git history
  is the archive. Current truth lives in `current/`.
- `skills/` and `settings.local.json` — local tool state. Do not commit them.

Verify any status claim here against current source, tests, generated reports,
and the tracked docs before acting.
