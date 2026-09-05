---
id: 117
type: task
title: "Port PreviewTrigger"
created: 2026-08-20
parent: 25
status: in-progress
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-80" }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "F-UP-011 structural slice. PreviewTrigger now provides OverlayTriggerStateContext with setOpen/point/setPoint and a full PopoverTriggerContext (Solid's trigger-wiring counterpart of RAC PopoverContext). Package test fails if those go missing. Done when is not met: no SSR/hydrate/keyboard/pointer/safe-area/browser evidence yet. Do not close on the barrel name.",
    }
---

Port the pinned RAC `PreviewTrigger` component and public export.

Read the upstream source, tests, and official docs before naming or shaping the
Solid surface. Keep state, ARIA, focus, and composition in their owning layers.

## Done when

Implementation, exports, types, docs, SSR, hydration, keyboard, pointer, focus,
accessibility, and browser evidence match upstream. Part of #82.

## Round-2 note (2026-09-01)

Delta (F-UP-011): the export exists, so `guard:rac-export-gap` is green, but local PreviewTrigger provides `PopoverTriggerContext` only with a thin overlay object (no `setOpen` / `point`) and no `PopoverContext` / `OverlayTriggerStateContext`. Do not close on the barrel name.

## Slice (2026-09-05)

F-UP-011 context adapter is in. RAC `PopoverContext` (trigger wiring) is
`PopoverTriggerContext` here — our `PopoverContext` is placement/arrow and
must not be overloaded. Remaining: RAC PreviewTrigger.test.js behavior
(hover/safe-area, keyboard focus delay, Tab into preview, Escape restore),
SSR/hydrate, and comparison-browser evidence.

## Proof

```bash
vp test run packages/solidaria-components/test/PreviewTrigger.test.tsx
# 2 passed (OverlayTriggerStateContext setOpen/point; aria-haspopup, no underlay)

vp test run packages/solidaria-components/test/Popover.test.tsx packages/solidaria-components/test/Modal.test.tsx packages/solidaria-components/test/Dialog.test.tsx packages/solidaria-components/test/Menu.test.tsx
# 212 passed
```
