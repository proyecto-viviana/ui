---
id: 197
type: task
title: "Photograph ActionButton hover and pressed live and scope checkControl to the form"
created: 2026-09-01
parent: 136
status: open
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
---

## Cause

`9af12739` ("stabilize button comparison evidence") switched the ActionButton
hover and pressed helpers from `expectExactPreparedInPlaceScreenshotPair` to
`expectExactPreparedClonedScreenshotPair`
(`apps/comparison/e2e/actionbutton-visual.spec.ts:432-488`). In-place waits
220 ms after the gesture and photographs the live node under the pointer
(`visual-diff.ts:416-432`); the clone helper's own comment says styles keyed
on real `:hover` / `:focus-visible` pseudo-classes do not apply to the clone
(`visual-diff.ts:438-451`). #182's body claims the clone "preserv[es] exact
zero-delta comparison while the live user-like gesture is active". A green
pair can now miss a React-vs-Solid `:hover` / `:active` fork the previous
shot held. No thresholds, retries, or snapshots changed.

`2b560c42` replaced form-scoped `form.locator('input[name=…]').check()` with
`checkControl(page, …)`, which resolves `input[name]` against the whole
document (`apps/comparison/e2e/comparison-page.ts:75-84`). The label-click
repair is right; the scope widened.

## Work

Restore live-element capture for hover/pressed (or make the clone path carry
the gesture state through data attributes and assert that it did), and give
`checkControl` a form root parameter used by every call site.

## Done when

Hover and pressed pairs photograph the element under the pointer; a colliding
control name in another panel cannot be matched by `checkControl`; #182's
body reflects what the clone does.

## Relationship

F-LAND-001/002. Deltas on #182.
