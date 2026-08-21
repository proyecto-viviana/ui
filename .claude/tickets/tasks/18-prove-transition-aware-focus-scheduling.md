---
id: 18
type: task
title: "Prove transition-aware focus scheduling"
created: 2026-08-20
parent: 31
status: verified
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "opened from the latest-work review of focusSafely and runAfterPaint",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "selected after ticket #17; auditing the pinned scheduler branches before changing shared focus timing",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "proved each transition and paint scheduler branch, routed FocusScope restoration through focusSafely, and removed both picker Escape-order waivers after browser parity passed",
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

- [x] Port each applicable upstream `runAfterTransition` regression.
- [x] Prove immediate execution when no transition runs.
- [x] Prove deferral until all transition properties finish or cancel.
- [x] Prove that multiple queued callbacks run once.
- [x] Prove that detached transitioning elements do not block callbacks.
- [x] Prove the fallback when animation frames are unavailable.
- [x] Prove `runAfterPaint` frame-to-timer order and cancellation.
- [x] Add integration regressions for Dialog, Menu, and FocusScope focus timing.
- [x] Route FocusScope restore-on-unmount through `focusSafely` and prove its
      scroll and timing behavior.
- [x] Remove the DatePicker and DateRangePicker D4 known divergences after their
      Escape teardown and focus-return order matches upstream.
- [x] Keep the tests deterministic. Do not silently skip missing browser behavior.

## Checkpoint

`runAfterTransition` now has direct regressions for the pinned upstream cases.
The tests also cover transition cancellation, duplicate completion events, and
the no-animation-frame fallback. `runAfterPaint` has direct tests for its frame,
timer, cancellation, timer-only, and no-window paths.

Dialog, Menu, and FocusScope tests now name the paint phase that owns focus.
FocusScope restores through `focusSafely`, so it waits for active transitions
and uses `preventScroll`. DatePicker and DateRangePicker keep their popovers
mounted while they exit and disable focus containment during that exit. Their
Escape keyup and focus-return order now matches the pinned React implementation.

Verification on 2026-08-21:

- `vp test run packages/solidaria/test/runAfterTransition.test.ts packages/solidaria/test/runAfterPaint.test.ts packages/solidaria/test/focusSafely.test.tsx packages/solidaria/test/FocusScope.test.tsx packages/solidaria/test/createDialog.test.tsx packages/solidaria/test/createMenu.test.tsx packages/solidaria-components/test/DatePicker.test.tsx` — 171 passed.
- `vp run typecheck` — passed.
- `vp run lint` — passed.
- `vp run guard:layer-boundary` — passed with no new forks.
- `vp run comparison:build` — built all 100 comparison pages. The existing
  source-map warning remains tracked by ticket #22.
- `vp exec playwright test e2e/certified/datepicker.certified.spec.ts e2e/certified/daterangepicker.certified.spec.ts --grep 'D4' --reporter=line` from `apps/comparison` — 6 passed with no known-divergence waiver.

## Done when

Every scheduling branch has a named failure-mode test. Integration tests fail
if an opening overlay moves focus at the wrong phase.

## Relationship

Completes the evidence for the latest overlay-focus fix, owns upstream Train 8
item T-93 for #82, and contributes component evidence to ticket #11.
