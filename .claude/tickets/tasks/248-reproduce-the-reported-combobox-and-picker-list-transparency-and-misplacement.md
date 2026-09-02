---
id: 248
type: task
title: "Reproduce the reported ComboBox and Picker list transparency and misplacement"
created: 2026-09-02
parent: 243
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened for the D13 interaction-journeys certification (owner decision 2026-09-02)",
    }
---

## Cause

Owner report (2026-09-02): on ComboBox or Picker the popover list "gets
transparent, or appears somewhere else". Static open state is pixel-certified,
so the defect is a step-N state: reopen after close, open during or after
page scroll, viewport resize while open, filtering that empties and refills
the list, or an enter transition that never clears (`opacity: 0` while the
`data-entering` state is stuck). Popover color-scheme wiring mirrors S2
(`ColorSchemeContext` → `setColorScheme()` on the popover root), so a static
missing background is unlikely; check the transition and positioning paths
first.

## Work

Drive the D13 seed journeys (#244) and the reopen / scroll / resize / filter
rows of #245 and #246 against the comparison app and the docs routes in
`apps/web`; capture the first divergent step. Root-cause in `solidaria`
(`usePopover` / `useOverlayPosition` port) or `solid-spectrum` Popover
transition state; fix in the lowest layer; the failing journey stays as the
regression test.

## Done when

The journey that reproduces it fails before the fix and passes after, on both
styled packages; ticket names the root cause with file:line.

## Hypotheses and the journeys that decide them (2026-09-02)

From the shared overlay ledger (`apps/comparison/playbook/journeys/shared-overlay.md`,
"Geometry contract"):

1. **Transparent list** = `isEntering` / `isExiting` stuck. Upstream
   `useEnterAnimation` returns `isEntering && isReady` with `isReady = !!placement`,
   and both hooks complete on `element.getAnimations().finished` (no timers).
   S2 styles `opacity: 0` while either flag is set and `pointer-events: none`
   while exiting. The port's `Popover` has no such state and `ActionMenu`
   hand-rolls it with `setTimeout`/rAF (#251) — a stale flag leaves a mounted
   list at opacity 0. Decided by `CB-OV-05` / `PK-OV-04` steps 1–5 and the 20×
   open/close fuzz (never a settled overlay with opacity < 1).
2. **List somewhere else** = the pre-placement frame
   (`position: fixed; top: 0; left: 0`, `useOverlayPosition.ts:400-409`)
   painted, or a stale position after a portal-container change. Decided by
   `CB-OV-05` / `PK-OV-04` step 1 (never observed at the viewport origin),
   `CB-OC-12` / `PK-OC-15` (portal into a dialog container), `CB-OV-02` /
   `PK-OV-02` (resize recompute), `CB-OV-06` / `PK-OV-05` (maxHeight + scroll
   anchor).

Before either can run, step 0 must pass: the #244 seed runs already diverge on
option ARIA (`aria-label` + `aria-describedby="(missing)"` vs `aria-labelledby`

- `aria-posinset`/`aria-setsize`), missing `data-layout`/`data-orientation`,
  Solid input `aria-haspopup`, `data-focused` vs `data-focus-within`, Picker
  overlay `aria-labelledby` missing, an extra nameless hidden `input`. Those are
  the first fixes on this ticket (lowest layer: `solidaria` `useOption` /
  `useListBox` / `useComboBox` / `useSelect`).

## Relationship

Child of #243. Feeds #245 / #246. Related: #135 / #184 (post-hydration
state classes), #234 (iOS 26 visualViewport positioning in RAC 1.21).
