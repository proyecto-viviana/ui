---
id: 48
type: task
title: "Move the remaining packages off tsup"
created: 2026-08-20
parent: 27
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from legacy task pkg-build-remaining" }
---

Complete the native Vite Plus build migration for every remaining public
package after #47 establishes the `solid-spectrum` declaration path.

## Done when

No remaining package build depends on `tsup`, and the repository build and
artifact checks pass for all public packages.

## Relationship

Replaces `pkg-build-remaining` from `.claude/current/tech-debt.md`. Depends on
#47.
