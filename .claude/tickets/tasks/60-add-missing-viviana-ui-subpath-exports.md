---
id: 60
type: task
title: "Add missing viviana-ui subpath exports"
created: 2026-08-20
parent: 32
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task viviana-ui-subpath-exports" }
---

Add the 19 `solid-spectrum` subpath exports that are missing from
`@proyecto-viviana/ui` where the derivative-layer contract requires them.

## Done when

The export inventory closes and packed-consumer tests prove each public path.

## Relationship

Replaces `viviana-ui-subpath-exports` from `.claude/current/tech-debt.md`.
