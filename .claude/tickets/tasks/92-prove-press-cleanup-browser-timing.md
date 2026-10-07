---
id: 92
type: task
title: "Prove press-cleanup browser timing"
created: 2026-08-20
parent: 24
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-027" }
  - {
      state: verified,
      at: 2026-10-07,
      note: "Paired Chromium traces on the checkbox and switch comparison routes dispatch a real-size pointer (width and height 1) on the label and the native input, both stacks stay pressed across pointerup, then clear press, restore user-select, and toggle once, on the click or on the 80ms fallback, and package press regressions stay in place.",
    }
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
