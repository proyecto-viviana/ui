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
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Behavior slice. Package tests name hover/safe-area, keyboard delay, Tab-through-before-delay, Tab into preview, Escape restore, and live aria-expanded/controls. SSR writes closed-trigger markup without the popover. Hydrate over that markup still mismatches (ElementTag key). No comparison-browser evidence. Do not close.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Hydrate/long-press slice. Long press (touch) opens and focuses the popover; long-press hint is live with modality; Dismiss restore does not reopen. Overlay portal resets FocusableContext (RAC Overlay.tsx:87) so Action does not pick up trigger ARIA. Hydrate test lands as it.fails: ElementTag looks up 00100, SSR registered 0040000000. No comparison-browser evidence. Do not close.",
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
must not be overloaded.

Behavior slice: hover/safe-area, keyboard delay, Tab-through-before-delay,
Tab into preview, Escape restore, live `aria-expanded`/`aria-controls`. SSR
emits a closed trigger without the popover. Long-press (touch) opens and
focuses the popover; the hint tracks modality; Dismiss restore does not
reopen. Overlay portal resets FocusableContext so preview actions do not
inherit trigger ARIA. Remaining: hydrate over SSR markup (ElementTag key
`00100` vs `0040000000`, test is `it.fails`) and comparison-browser evidence.

## Proof

```bash
vp test run packages/solidaria-components/test/PreviewTrigger.test.tsx
# 11 passed (context + hover/safe-area + delay + Tab + Escape + Dismiss +
# long-press open/focus + long-press hint + live ARIA + no trigger ARIA on Action)

vp test run --config vitest.ssr.config.ts packages/solidaria-components/test/PreviewTrigger.ssr.test.tsx
# 2 passed (closed trigger, no popover in SSR HTML)

vp test run --config vitest.hydrate.config.ts packages/solidaria-components/test/PreviewTrigger.hydrate.test.tsx
# 1 expected fail (ElementTag hydration key 00100 vs 0040000000)
```
