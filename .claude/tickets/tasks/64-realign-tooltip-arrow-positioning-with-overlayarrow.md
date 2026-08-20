---
id: 64
type: task
title: "Realign Tooltip arrow positioning with OverlayArrow"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task tooltip-arrow-overlayarrow" }
---

Use the real RAC `OverlayArrow` and computed `arrowProps` for Tooltip.

## Current gap

The styled layer hand-centers the arrow with percentages and hardcodes
`arrowBoundaryOffset={8}`. Left/right placements have a small vertical pixel
shift. The headless Tooltip positioning rewrite does not expose `arrowProps`,
so the styled layer cannot apply the upstream mechanism.

Popover arrow positioning already uses the real props and is byte-exact on all
four placements. Keep this task limited to Tooltip positioning; Popover motion
is #68.

## Done when

The headless Tooltip uses the upstream overlay-positioning path, the styled
arrow uses `OverlayArrow`, all placements pass strict visual evidence, and the
temporary `tooltip-arrow-overlayarrow-subpixel` waiver is removed.

## Relationship

Replaces `tooltip-arrow-overlayarrow` from `.claude/current/tech-debt.md`.
