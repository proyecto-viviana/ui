---
id: 341
type: task
title: "Honor Card isDisabled inside CardView"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 cardview functional pass: ?disabledItem=zephyr React aria-disabled click ignored; Solid stays enabled and click selects zephyr. ?disabledItem=apollo React deselects+disables and Tab lands on the grid; Solid keeps apollo selected+enabled. disabledKeys=zephyr matches on both. S2 Card spreads props onto GridListItem; Solid splits isDisabled and only forwards it on the standalone HeadlessLink path",
    }
---

S2 Card inside CardView spreads `props` (including `isDisabled`) onto
RAC `GridListItem`. Solid `Card` splits `isDisabled` into `local` and
forwards it only on the standalone `HeadlessLink` path
(`packages/solid-spectrum/src/card/index.tsx`). The CardView
`HeadlessGridListItem` branch never receives it.

`disabledKeys` on the CardView still work on both stacks. This ticket
is the per-card `isDisabled` prop the comparison `disabledItem`
control sets on `Card`.

## Evidence

`http://127.0.0.1:4341/components/cardview/`, islands mounted, one
panel at a time.

`?disabledItem=zephyr` (Apollo stays selected):

| | React | Solid |
|---|---|---|
| Zephyr `aria-disabled` | `true` | omitted |
| click Zephyr | selectedKeys stay `apollo` | selectedKeys become `zephyr` |

`?disabledItem=apollo`:

| | React | Solid |
|---|---|---|
| Apollo | `[disabled]`, no `aria-selected` | enabled, `[selected]` |
| selectedKeys | `apollo` (controlled) | `apollo` |
| Tab from Before | focus grid "Projects" | focus row Apollo |

`?disabledKeys=zephyr`: both mark Zephyr disabled and ignore click
(not this ticket).

Live `disabledItem=zephyr` also leaves Solid enabled.

## Done when

`?disabledItem=zephyr` matches S2: Zephyr is `aria-disabled`, click
does not select it. `?disabledItem=apollo` disables Apollo. A
comparison-route walk fails if Solid selects a `disabledItem` card.

## Relationship

Child of #24. Found by #260. Distinct from standalone href+isDisabled
(#337) — that path is HeadlessLink; this is GridListItem. After this
lands, Tab onto a disabled-and-selected first card may be #306; do
not fold CardView into #306 until `isDisabled` actually disables.
Do not start #254.
