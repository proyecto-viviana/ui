---
id: 92
type: task
title: "Prove press-cleanup browser timing"
created: 2026-08-20
parent: 24
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-027" }
---

Checkbox and Switch package regressions now observe transient native-click
press state and cleanup. Package tests do not prove every React-versus-Solid
browser timing branch.

## Scope

- Identify user-observable press and cleanup transitions for Checkbox and
  Switch.
- Run matched React and Solid interactions in a real browser.
- Assert the transient state, callback order, and final cleanup.
- Keep the package regressions that name the original failure modes.

## Done when

Paired browser tests fail if press state or cleanup timing drifts from upstream.
