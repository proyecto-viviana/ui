# Proyecto Viviana

`AGENTS.md` is the canonical entry — rules first, then the repo facts `ls` won't
tell you, then the playbook pointer. Read it first and follow it exactly. This
file adds only Claude Code-specific notes.

- The deep current-docs surface is `.claude/current/`; start at
  `.claude/current/README.md` for the read order. This directory is tracked —
  keep it consistent with the code (Rule #6), and prefer distilling current truth
  into it over leaving stale claims.
- For parity research, prefer the configured React Aria and React Spectrum S2 MCP
  servers when available (`.claude/current/tooling.md`); otherwise fall back to
  installed source, the vendored reference, and the comparison playbook.
- Keep evidence in component validation notes or tracked docs, not only in chat.
- `.claude/settings.local.json`, `.claude/skills/`, and screenshots are local
  tool state, not project notes — they stay untracked.
