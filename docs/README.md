# Docs

This directory holds tracked project documentation. Keep current steering short
and backed by local commands; move old plans to `_archive/` instead of letting
multiple status docs compete.

## Start Here

- [`../README.md`](../README.md): repo overview, current report snapshot, and
  daily commands.
- [`../AGENTS.md`](../AGENTS.md): repo-wide instructions for AI agents.
- [`../CLAUDE.md`](../CLAUDE.md): Claude Code-specific notes that defer to
  `AGENTS.md`.
- [`CURRENT_STATUS.md`](CURRENT_STATUS.md): current parity and export snapshot.
- [`tooling.md`](tooling.md): command layer, checks, and local tooling policy.
- [`release-policy.md`](release-policy.md): Changesets, CI gates, and npm
  publishing rules.
- [`adr/0001-s2-styling-source-of-truth.md`](adr/0001-s2-styling-source-of-truth.md):
  S2 styling source-of-truth decision.

## Comparison Work

- [`../apps/comparison/README.md`](../apps/comparison/README.md): comparison app
  boundary and commands.
- [`../apps/comparison/COMPONENT_PLAYBOOK.md`](../apps/comparison/COMPONENT_PLAYBOOK.md):
  component validation process.
- [`../apps/comparison/playbook/`](../apps/comparison/playbook/): detailed
  gates, source hierarchy, and component validation notes.

For component parity, the comparison playbook wins over older notes in this
directory or `.claude/`.

## Claude Working Docs

`.claude/` contains Claude-specific working docs and notes for this repo. Use
them when they are relevant, but verify status claims against current source,
tests, generated reports, and the comparison playbook. As the docs are cleaned
up, migrate durable decisions into tracked docs and avoid competing status
sources.

## Investigation Notes

These are useful context, but refresh assumptions against current source and
reports before acting:

- [`s2-styling-and-package-plan.md`](s2-styling-and-package-plan.md)
- [`dev-hydration-investigation.md`](dev-hydration-investigation.md)
- [`comparison-docs-overhaul/`](comparison-docs-overhaul/)

## Historical Material

- [`_archive/`](_archive/) contains superseded docs retained for context.

## Refresh Commands

```bash
vp run guard:rac-export-gap
vp run comparison:report:parity:strict
vp run comparison:report:gaps
vp run comparison:report:exports
vp run comparison:test:a11y
```
