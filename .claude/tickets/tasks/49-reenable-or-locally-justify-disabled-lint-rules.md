---
id: 49
type: task
title: "Re-enable or locally justify disabled lint rules"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task lint-rules-reenable" }
---

Re-enable the 13 disabled lint rules. If a rule cannot apply to a specific
line, keep the exception local and state why it is required.

`no-floating-promises` would currently flag `document.fonts?.ready.then(...)`
in Breadcrumbs and Tabs (both styled copies). Type-aware lint is advertised
(`typeAware: true`) with every `typescript/*` rule off.

## Done when

The repository has no unexplained global disable for these rules, and the lint
gate passes.

## Relationship

Replaces `lint-rules-reenable` from `.claude/current/tech-debt.md`.
