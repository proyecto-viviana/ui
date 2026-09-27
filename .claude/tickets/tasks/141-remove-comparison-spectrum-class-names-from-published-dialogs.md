---
id: 141
type: task
title: "Remove comparison-spectrum class names from published Dialogs"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit" }
  - {
      state: in-progress,
      at: 2026-09-26,
      note: "removed comparison-spectrum-* classes from Dialog, FullscreenDialog, and CustomDialog in both styled packages and retired global.css overrides",
    }
  - {
      state: verified,
      at: 2026-09-26,
      note: "verified Dialog DOM no longer stamps comparison-spectrum-* classes and comparison builds cleanly",
    }
---

## Cause

Published `Dialog`, `FullscreenDialog`, and `CustomDialog` join
`comparison-spectrum-*` into the root class list in both styled packages.
Package and e2e tests lock that identity. Comparison CSS still patches
overlay geometry with `!important` and keeps leftover Dialog-surface rules.

## Work

Stop stamping harness class names on the published components. Retire harness
CSS that implements S2 overlay/dialog visuals. Update tests that assert the
harness class.

## Done when

Installed Dialog DOM has no `comparison-spectrum-*` class. Comparison overlay
CSS is harness layout only (ADR 0001).

## Relationship

F-ARCH-001. Not #46 or #59.
