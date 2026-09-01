---
id: 215
type: task
title: "Stop ticket relationship lines from citing deleted current-doc paths"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

Round 1's fix-now retargeted three tickets (#47, #56, #81) off deleted
`.claude/current/tech-debt.md`, and #136 recorded "relationship lines no
longer point at deleted `tech-debt.md`". `rg` finds the path in 42 ticket
files today, including #1 and #62 (edited in the same audit commit). Most
are provenance lines ("Replaces `x` from `tech-debt.md`"), which is history,
not a live instruction; some are Relationship pointers. `docs:check` walks
`.claude/current/*.md` only, so ticket-body paths can stay broken.

## Work

Add a ticket-body local-path check to `docs:check` (paths under `.claude/`
must exist) and annotate or strip the 42 references in one pass.

## Done when

`docs:check` fails on a ticket body path that does not exist; no ticket
cites `tech-debt.md` as if it existed.

## Relationship

F-DOCS-006. Delta on #13 and #151.
