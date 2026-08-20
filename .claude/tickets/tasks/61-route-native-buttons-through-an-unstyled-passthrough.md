---
id: 61
type: task
title: "Route native buttons through an unstyled passthrough"
created: 2026-08-20
parent: 32
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task viviana-ui-button-passthrough" }
---

Add the upstream-aligned unstyled Button passthrough in `solid-spectrum`, then
route the four native button implementations through it.

## Done when

The four paths share the passthrough behavior and preserve their public and
accessibility contracts.

## Relationship

Replaces `viviana-ui-button-passthrough` from
`.claude/current/tech-debt.md`.
