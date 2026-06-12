# CLAUDE.md

Read `AGENTS.md` first. This file only adds Claude Code-specific guidance.

## Project Docs

Project steering lives at the repo root, under `docs/`, under
`apps/comparison/playbook/`, and in the Claude working docs under `.claude/`.
The `.claude/` directory is currently ignored in this checkout, so verify its
claims against current source, tests, generated reports, and the comparison
playbook before acting.

When a lasting decision, checklist, or handoff matters to the project, put it in
tracked docs:

- repo-wide instructions: `AGENTS.md`
- Claude-specific notes: `CLAUDE.md`
- current status: `docs/CURRENT_STATUS.md`
- tooling and commands: `docs/tooling.md`
- comparison process: `apps/comparison/COMPONENT_PLAYBOOK.md`
- detailed comparison gates: `apps/comparison/playbook/`

## Claude Workflow

- Use `vp` commands from `AGENTS.md` and `docs/tooling.md`.
- Prefer configured React Aria and React Spectrum S2 MCP servers when they are
  available for parity research. If they are unavailable, use installed
  source, tracked docs, and relevant `.claude/` notes.
- Keep evidence in component validation notes or tracked docs, not only in chat
  transcripts.
- When a `.claude/` note captures active workflow, keep it consistent with the
  tracked docs or flag it for migration during the docs cleanup.

## Local Notes

`.claude/skills/`, `.claude/settings.local.json`, and screenshots are tool
state. Treat them differently from written project notes.
