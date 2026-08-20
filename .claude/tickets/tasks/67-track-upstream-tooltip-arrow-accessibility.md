---
id: 67
type: task
title: "Track upstream Tooltip arrow accessibility"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task tooltip-arrow-aria-exposed" }
---

Keep the Tooltip arrow accessibility surface synchronized with upstream.

S2 currently leaves the arrow SVG without `aria-hidden`, so it appears as an
unlabeled image in the tooltip subtree. The port previously hid it, but removed
that local improvement to restore parity. Do not reintroduce the hide locally.

## Done when

If upstream hides the decorative arrow, mirror that change and add regression
evidence. Until then, retain and document the upstream behavior.

## Relationship

Replaces `tooltip-arrow-aria-exposed` from `.claude/current/tech-debt.md`.
