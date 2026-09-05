---
id: 481
type: task
title: "Overlay Escape after a synthetic press is a focus delivery miss"
created: 2026-09-05
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "HEAD subset: Overlay Escape after clickLocator leaves the dialog open. RAC useOverlay listens on the overlay element; a keydown on the still-focused trigger does not dismiss. clickLocator focuses the trigger between pointerdown and pointerup. #111 makes that synthetic press mouse, not virtual; it does not move focus into the overlay. Do not add a document Escape listener to match a missed overlay keydown. Comparison owns dismissOverlay. #194 stays open.",
    }
---

Certified overlay afterPanels still press Escape while focus is on
the trigger. RAC `useOverlay` puts `onKeyDown` on the overlay. If
the synthetic press never moves focus into the dialog or listbox,
Escape is a no-op on both stacks.

`clickLocator` focuses the trigger between `pointerdown` and
`pointerup`. Modal open then aria-hides that trigger. Bare
`keyboard.press("Escape")` does not hit the overlay listener.

#111 fixes the press `pointerType` (1-by-1 was virtual off Android).
Picker / DatePicker / DateRangePicker / Dialog D5–D6 that open
through `clickLocator` may clear once that press matches RAC. The
remaining Escape-close is still a delivered-focus problem, not a
Solid dismiss state machine.

Do not invent a document-level Escape path to pass this box.

## Done when

A comparison-owned dismiss that focuses the open overlay (or uses a
trusted press that RAC itself focuses into the overlay) closes both
stacks. A Solid-only document listener is not acceptance. Do not
start #254.

## Relationship

Child of #24. Found on the HEAD subset under #194. Distinct from
#166 (page-global dialog locator). Distinct from #111 (virtual
pointer). Comparison owns `apps/comparison/**`.
