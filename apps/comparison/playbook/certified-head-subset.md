# Certified-suite subset — 2026-09-05

This is **not** a postcard. Ticket #194. Do not copy these counts into
`lastFullCertifiedSuiteRun`. Certification Gates cannot treat this as a pass.

## Why there is no new postcard

The last complete certified suite is still `0f1e1198` (2026-08-21, 2170 passed /
0 failed / 4 skipped). WSL Chromium 151 / SwiftShader never issues a compositor
frame. Playwright `locator.screenshot` waits for two compositor-stable frames
after scroll-into-view (`waiting for element to be stable`) and was dying in
~15s. CDP `Page.captureScreenshot` also hangs; the harness now bounds that at
`screenshotTimeoutMs` (2s) and fail-closes D3 with a compositor-paint error.
D3 is not skipped, not fixme'd, and not a pair-pass.

`lastFullCertifiedSuiteRun` stays `0f1e1198`. The parity report prints
`STALE certified-suite postcard` whenever HEAD differs.

## What did run against this SHA

Revision: `d15a86fff09308728aa67887654aa57f7eb1ec8a` (dirty harness on that
HEAD; product packages unchanged).

Two Playwright invocations, disjoint greps:

1. D5 focus trail + D6 AX tree + D8 target size + D14 native validity
   (303 tests, 2 workers, 30.3m): **285 passed / 14 failed / 4 skipped**.
   JSON: `playbook/evidence/certified-head-json-gates.json`. The four skipped
   are registered `knownDivergences`, not D3.
2. Button D1 state matrix + D3 pixel + D4 events + D7 contrast
   (34 tests, 13.9m): **23 passed / 11 failed / 0 skipped**.
   JSON: `playbook/evidence/certified-head-button-d1-d3-d4-d7.json`.
   D1 10/10, D7 6/6, D4 7/8, D3 0/10 fail-closed.

Combined subset record: **308 passed / 25 failed / 4 skipped / 337 total**,
`complete: false`.

D14 cells from the first run still include TextField, SearchField, Checkbox,
RadioGroup, NumberField, ComboBox, Form native-validity walks.

## D3

Button D3 (10 cases × themes) failed with: _Compositor never produced a
screenshot (CDP Page.captureScreenshot timed out or returned a uniform fill).
D3 does not skip; this is a pixel-gate failure, not a postcard._ After the
first timeout, later D3 tests fail immediately via a cross-test latch. A
machine that paints can run `vp run comparison:test:certified` and, if that
full suite is green with `skipped === 4` registered fixmes, replace the
postcard SHA with that HEAD.

## Harness

- `waitForPaintSettle` races `fonts.ready` + two rAFs against a budget; certified
  walks use `paintBudgetMs: 0`.
- `scrollLocatorIntoView` / `layoutBox` / `clickLocator` / `hoverLocator` /
  `focusLocator` / `tapLocator` replace Playwright actions that wait for two
  compositor-stable frames.
- `tapLocator` dispatches element pointer events. CDP `Input.dispatchTouchEvent`
  closed the page and took the preview down.
- D3 captures via CDP `Page.captureScreenshot`, not `locator.screenshot`.
  Stuck CDP is bounded; `session.detach` is bounded; a latch fail-closes the
  rest of the pixel gate.
- Overlay Escape-close after a synthetic press still leaves the dialog open on
  this box. Isolation is the per-panel `goto`. Toast open and some overlay
  afterPanels remain leftover.

A painting CI machine is the recertification bar. This box proved JSON oracles
(D1 computed styles, D5/D6/D8/D14, D7 contrast, D4 keyboard/touch) can finish
without compositor frames. It cannot recertify pixels.
