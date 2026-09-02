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

## Relationship

Child of #243. Feeds #245 / #246. Related: #135 / #184 (post-hydration
state classes), #234 (iOS 26 visualViewport positioning in RAC 1.21).
