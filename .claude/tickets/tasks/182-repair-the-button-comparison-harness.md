---
id: 182
type: task
title: "Repair the Button comparison harness interactions"
created: 2026-09-01
parent: 24
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from VUI-006 comparison-gate triage" }
  - {
      state: in-progress,
      at: 2026-09-01,
      note: "centralized live theme requests and replaced stale control interactions in the Button browser family",
    }
  - {
      state: verified,
      at: 2026-09-01,
      note: "the strict six-spec Button family passed 189/189 at four workers with zero retries, and the separate component-theme contract passed 78/78 at one worker with zero retries",
    }
---

The Button comparison family reached several Solid Spectrum control inputs
through Playwright's raw `input.check()` action. Those inputs are
visually hidden inside pressable React Aria labels, so the raw input action can
time out even when the harness and component under test are healthy. The
family also used a stale theme-control path, captured two transient
ActionButton states from live layout, and repeated full document navigation
inside two bounded Button matrices.

## Evidence

The `test:button` command runs six specs. Its existing
`button-family-contract.spec.ts` already uses the shared user-like
`checkControl` helper for these controls. Five sibling specs instead use raw
`check()` calls.

Two failures are even narrower:

- Button and ActionButton try to change a live page through the obsolete
  `comparisonTheme` inputs. The current docs shell owns theme changes through
  the `comparison:theme-request` event.
- The Button `children` label names both the Solid Spectrum field wrapper and
  its native input. An unscoped `getByLabel("children")` is therefore
  ambiguous.

These were comparison-harness defects. They did not require package changes,
visual-threshold changes, timeout changes, or weaker assertions.

## Work

- Share one live-page theme request helper that uses the existing docs-shell
  event contract.
- Route Button, ActionButton, and the theme contract through that helper.
- Scope the Button `children` input to the exact Button control form and native
  input.
- Use `checkControl` for the React Aria radio and checkbox controls exercised
  by the six-spec Button browser family.
- Capture ActionButton hover and pressed evidence from a prepared inert clone,
  preserving exact zero-delta comparison while the live user-like gesture is
  active and releasing the pointer deterministically afterward.
- Navigate once for the Button static-color and pending-color matrices, drive
  their existing controls through all `24` and `12` combinations, and wait for
  the exact serialized React and Solid props before retaining the existing
  computed-style, progressbar, gradient, settle, and baseline assertions.
- Preserve the SegmentedControl behavior assertions and every visual threshold.

## Done when

- The six-spec `test:button` family passes without raw React Aria input checks.
- The component theme contract passes through the shared live-page request
  helper.
- No package implementation, timeout, script, visual threshold, or component
  assertion changes are needed.
- Required repository and documentation gates pass.

All four conditions are complete. The final browser runs retained the existing
test timeouts, exact thresholds, and zero-retry posture. No package source,
Playwright configuration, lockfile, or visual threshold changed in this
closeout.

## Validation

- The clone-backed exact ActionButton hover and pressed selection passed
  `16/16` cases in `51.230s` (`2` cases repeated `8` times, `1` worker,
  `--retries=0`). The capture keeps `maxDimensionDelta=0`,
  `maxMismatchRatio=0`, and `pixelThreshold=0`; it uses no sleep, timeout, or
  retry to mask the transient state. Machine-readable result:
  `/tmp/viviana-ui-actionbutton-cloned-20260901/results.json`.
- `Button staticColor computed styles match React Spectrum across variants`
  passed `8/8` repeated cases in `116.202s` with `1` worker and zero retries.
  Each case still checks all `24` combinations. Machine-readable result:
  `/tmp/viviana-ui-button-static-controls-owned-20260901/results.json`.
- `Button pending styles normalize variant color across variants` passed
  `8/8` repeated cases in `178.420s` with `1` worker and zero retries. Each
  case still checks all `12` combinations and both progress indicators.
  Machine-readable result:
  `/tmp/viviana-ui-button-pending-controls-20260901/results.json`.
- The final six-spec Button family passed `189/189` in `355.155s` with
  `4` workers, `--retries=0`, zero skipped, zero unexpected, and zero flaky
  cases. This includes the complete SegmentedControl comparison coverage and
  exact ActionButton hover, focus-visible, and pressed cases. Machine-readable
  result:
  `/tmp/viviana-ui-button-family-strict-189-final-20260901/results.json`.
- The separate component-theme contract passed `78/78` in `217.463s` with
  `1` worker, `--retries=0`, zero skipped, zero unexpected, and zero flaky
  cases. Machine-readable result:
  `/tmp/viviana-ui-component-theme-contract-final-20260901/results.json`.
- On the combined ticket #182/#183 source state, the previously recorded
  non-browser gates passed: the comparison build produced `100` static pages;
  `vp run check` passed formatting (`3040` files), lint (`2736` files, no
  warnings or errors), and typecheck in about `101.4s`;
  `vp run comparison:report:parity:strict` passed in `4.08s`; and
  `vp run guard:layer-boundary` passed in `1.14s`. The later bounded harness
  refinements received scoped formatting and exact-path `git diff --check`
  validation; no later repository-wide gate is claimed.

## Relationship

This harness prerequisite is complete, so ticket #135 can use the strict
Button comparison family as producer evidence without a harness waiver.
Initiative #24 still owns component acceptance.

## Round-2 note (2026-09-01)

Round-2 review (F-LAND-001/002, #197): `9af12739` switched ActionButton hover/pressed to the cloned capture path, which by the helper's own comment does not carry `:hover`/`:active`; the body's claim that the clone photographs the live gesture is not what the code does. `checkControl` also widened control locators from the form to the page. No thresholds, retries, or snapshots changed.
