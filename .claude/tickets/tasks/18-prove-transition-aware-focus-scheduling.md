---
id: 18
type: task
title: "Prove transition-aware focus scheduling"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work review of focusSafely and runAfterPaint",
    }
---

The latest focus work ports `runAfterTransition` and adds `runAfterPaint`.
Focused tests prove immediate keyboard and pointer focus, one-frame virtual
focus, and the no-focus-steal guard. They do not prove the scheduling branches
that now control overlay and menu focus.

## Evidence

- The vendored upstream tree includes direct `runAfterTransition` tests.
- The local port has no direct test file for `runAfterTransition`.
- No local test starts a real transition before calling `focusSafely`.
- `runAfterPaint` has animation-frame, timer-only, cancellation, and no-window
  branches. No direct tests name these failure modes.
- Dialog, Menu, and FocusScope use `runAfterPaint`. A scheduling drift can alter
  initial focus or restore focus across several components.
- FocusScope restore-on-unmount still calls raw `.focus()`. Pinned RAC uses
  `focusSafely`, so this branch can scroll or focus at the wrong time.
- DatePicker and DateRangePicker still record a one-frame Escape teardown
  difference. Solid restores focus during `keydown`; RAC restores it after the
  event dispatch, so `keyup` reaches a different element.

## Scope

- Port each applicable upstream `runAfterTransition` regression.
- Prove immediate execution when no transition runs.
- Prove deferral until all transition properties finish or cancel.
- Prove that multiple queued callbacks run once.
- Prove that detached transitioning elements do not block callbacks.
- Prove the fallback when animation frames are unavailable.
- Prove `runAfterPaint` frame-to-timer order and cancellation.
- Add integration regressions for Dialog, Menu, and FocusScope focus timing.
- Route FocusScope restore-on-unmount through `focusSafely` and prove its scroll
  and timing behavior.
- Remove the DatePicker and DateRangePicker D4 known divergences after their
  Escape teardown and focus-return order matches upstream.
- Keep the tests deterministic. Do not silently skip missing browser behavior.

## Done when

Every scheduling branch has a named failure-mode test. Integration tests fail
if an opening overlay moves focus at the wrong phase.

## Relationship

Completes the evidence for the latest overlay-focus fix, owns upstream Train 8
item T-93 for #82, and contributes component evidence to ticket #11.
