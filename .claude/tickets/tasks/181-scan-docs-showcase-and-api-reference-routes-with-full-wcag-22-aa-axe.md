---
id: 181
type: task
title: "Scan docs showcase and API-reference routes with full WCAG 2.2 AA axe"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
---

## Cause

#8 closed color-contrast on every generated route. Full axe (name, label,
landmark) still runs only on `/solid-spectrum/playground` plus live
comparison panels. Docs, API reference, and showcase never see those rules.

## Work

Expand WCAG 2.2 AA axe across `ALL_ROUTES`, with the same target-size
justification already on the playground.

## Done when

An unlabeled control on a docs route fails `a11y:check`.

## Relationship

F-A11Y-008. Delta on done #8.
