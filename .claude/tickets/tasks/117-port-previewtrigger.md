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
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Hydrate diagnosis (no code). Link-only SSR+hydrate matches (data-hk 0000). PreviewTrigger+Link does not (SSR 0040000000 vs client 00100). createMemo is not the owner — wrapping each tag in createComponent added one 0 on both sides (00400000000 vs 001000) and was reverted. The 4 vs 1 is getNextContextId count in PreviewTrigger before Provider. Do not retarget ElementTag. Do not close.",
    }
  - {
      state: in-progress,
      at: 2026-09-05,
      note: "Hydrate walk matches. Extra SSR slots were createComponent(Link)+createComponent(Popover) from spreading props (including children) into createPreviewTrigger. Split children like DialogTrigger/PopoverTrigger. SSR key 0020000000; hydrate test is a real pass. No comparison-browser evidence. Do not close.",
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
inherit trigger ARIA. Hydrate over SSR markup now matches (see diagnosis
below). Remaining: comparison-browser evidence.

## Hydrate diagnosis (2026-09-05)

`PreviewTrigger.hydrate.test.tsx` is a real pass. Do not `it.skip`.

Button / TextField / Meter put the host in the component body (`<button>`,
`<input>`, `<div>`). Link goes through `ElementTag`, whose `createMemo`
returns a compiled `<a />`. That looked like the mismatch
(client `00100` vs SSR `0040000000`).

It is not. Isolation:

| Fixture | SSR `data-hk` | Hydrate |
| --- | --- | --- |
| `<Link href>` alone | `0000` | passes |
| Meter + Label (`ElementTag` `<span>`) | `002` / `003000` | passes |
| PreviewTrigger + Link + Popover | `0040000000` | client looks up `00100` |

Replacing ElementTag's memo `<a />` with `createComponent(HostA, rest)`
(host element in a real component body, same walk as Button) added **one**
`0` on **both** sides (`00400000000` vs `001000`). Meter's Label key
moved `003000` → `0030000` and still hydrated. The PreviewTrigger `4` vs
`1` did not move. That scheme was reverted — do not land it.

`004` vs `001` is `getNextContextId` count inside **PreviewTrigger**
(`id "00"`) before `Provider`. SSR burns four slots; the client burns
one. Then both sides nest count-0 children (Provider → FocusableProvider
→ Link → ElementTag → `<a>`). `createUniqueId` (triggerId) + `createId`
(popoverId) are only two of the four SSR slots. The other two are
unaccounted; likely an `isServer`-only increment or children/Popover
running in PreviewTrigger's context on SSR only. Do not invent dummy
`createUniqueId` calls to pad the client.

The two unaccounted SSR slots were `createComponent(Link)` and
`createComponent(Popover)`: `{...props}` into `createPreviewTrigger`
enumerated `children` on SSR and instantiated them in PreviewTrigger's
hydration context. The client walk never did. Split children off the hook
object the way DialogTrigger / PopoverTrigger do. Both sides now burn
`createUniqueId` (triggerId) + `createId` (popoverId) before Provider.
SSR `data-hk` is `0020000000`. Do not pad the client with dummy IDs.

Owner of the next slice: comparison-browser evidence.

## Proof

```bash
vp test run packages/solidaria-components/test/PreviewTrigger.test.tsx
# 11 passed (context + hover/safe-area + delay + Tab + Escape + Dismiss +
# long-press open/focus + long-press hint + live ARIA + no trigger ARIA on Action)

vp test run --config vitest.ssr.config.ts packages/solidaria-components/test/PreviewTrigger.ssr.test.tsx
# 2 passed (closed trigger, no popover in SSR HTML)

vp test run --config vitest.hydrate.config.ts packages/solidaria-components/test/PreviewTrigger.hydrate.test.tsx
# 1 passed (closed trigger, data-hk 0020000000)
```
