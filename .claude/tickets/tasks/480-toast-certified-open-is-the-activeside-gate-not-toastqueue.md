---
id: 480
type: task
title: "Toast certified open is the activeSide gate, not ToastQueue"
created: 2026-09-05
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-05,
      note: "HEAD subset D6 Toast › neutral failed. openToast dispatches comparison:controls-change then focusLocator+Enter. Solid triggerToast no-ops unless activeSide===solid; the trigger sits in a hidden div until that signal flushes. Playwright getByRole skips hidden. Do not change ToastQueue to match a missed Enter. Comparison owns the beforePanel. #194 stays open.",
    }
---

Certified Toast D6 failed because the toast never opened. The
beforePanel is keyboard Enter on the variant trigger after a
`comparison:controls-change` that sets `activeSide`.

Solid's comparison fixture keeps the triggers in a `hidden` div
until `activeSide === "solid"`, and `triggerToast` returns if the
side is not solid. React renders `null` when inactive. That gate is
the demo, not `ToastQueue`. Package Toast already exposes
`role="alertdialog"`.

A same-tick Enter after the CustomEvent can miss the Solid flush, or
`getByRole` can miss a still-hidden trigger. Neither is a Solid
state-machine miss.

## Done when

A comparison-owned beforePanel that has already unhidden the Solid
trigger and flushed `activeSide` opens a toast on Enter the way S2
does. Do not patch ToastQueue for a missed press. Do not start #254.

## Relationship

Child of #24. Found on the HEAD subset under #194. Distinct from
#432 (Show all Text slot), #433 (list markup), #434 (Show all focus),
#435 (region aria-label). Comparison owns `apps/comparison/**`.
