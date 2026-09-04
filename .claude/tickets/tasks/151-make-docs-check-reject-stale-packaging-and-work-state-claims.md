---
id: 151
type: task
title: "Make docs check reject stale packaging and work-state claims"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

`docs:check` passed while architecture said `solid` points at `src`, the
README said mappings remain under audit, and the current index assigned
remaining work to verified #15 and #16.

## Work

Keep a small claim inventory (export conditions, ticket status mentioned in
stable prose) beside the existing organization rules. The four stale sentences
were corrected in the audit pass; the hole is the checker.

## Done when

A live doc that names a verified ticket as remaining work, or a `solid` →
`src` claim, fails `docs:check`.

## Relationship

F-DOCS-001. Residual hole after verified #16.
