# AGENTS.md

Operational rules for AI agents working on Proyecto Viviana.

## Repo

- Work in `/home/emoporemilio/projects/viviana-ui`.
- Default to `main`.
- Check `git status --short --branch` before edits and before handoff.
- Preserve user work. Do not reset, restore, or overwrite unrelated changes.
- Leave no stray temp files, untracked cleanup artifacts, or dev servers.
- Use `rg` for search and `vp` for repo commands.

## Docs

- Start with `README.md`, `docs/CURRENT_STATUS.md`, `docs/tooling.md`, and
  `CLAUDE.md`.
- Use `.claude/` for Claude working docs, but verify stale claims against
  current source, tests, reports, and tracked docs.
- For component parity, use `apps/comparison/COMPONENT_PLAYBOOK.md` and
  `apps/comparison/playbook/`.
- Archive docs and old plans are context, not current direction.

## Architecture

`solid-stately` -> `solidaria` -> `solidaria-components` ->
`solid-spectrum` -> `@proyecto-viviana/ui`

Put behavior in the lowest applicable layer. Put S2 styling in
`solid-spectrum`. The comparison app verifies component styling; it does not
patch it.

## Component Work

- Compare against upstream React Aria, React Spectrum S2, installed source, and
  official docs.
- Do not treat exports, routes, screenshots, or axe passes as acceptance by
  themselves.
- Evidence needs API, behavior, accessibility, styling, visual parity, and i18n
  where relevant.
- Axe is smoke coverage. Use Playwright for keyboard, focus, forms, names,
  descriptions, values, validation, and announcements.

## Handoff

- Docs-only changes do not need a Changeset.
- Releasable package code usually does.
- Run relevant checks and `git diff --check`.
- Report what changed, what passed, and what was not run.
