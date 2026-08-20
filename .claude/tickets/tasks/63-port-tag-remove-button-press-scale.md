---
id: 63
type: task
title: "Port Tag remove-button press scale"
created: 2026-08-20
parent: 33
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task taggroup-remove-pressscale" }
---

Match the S2 ClearButton press behavior for the styled Tag remove button.

The port currently emits only the resting `will-change: transform` hint through
`pressScale(undefined)({isPressed:false})`. Thread the headless remove button's
DOM ref and real press state through `pressScale` so the press-down transform
also runs.

## Done when

Pointer and keyboard press evidence proves the same resting and pressed states
as upstream.

## Relationship

Replaces `taggroup-remove-pressscale` from `.claude/current/tech-debt.md`.
