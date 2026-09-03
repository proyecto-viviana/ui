---
id: 343
type: task
title: "Move CardView focus with two-dimensional arrows"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 cardview functional pass: S2 CardView always passes RAC layout=grid so ArrowRight moves Apollo→Zephyr on a two-up row; Solid createGridList ArrowRight/Left are a no-op unless orientation=horizontal and keyboardNavigationBehavior=tab. Clean evidence on ?size=XS (already two-up on both): React ArrowRight focuses+selects Zephyr; Solid ArrowRight stays Apollo, ArrowDown focuses Zephyr",
    }
---

S2 CardView always sets RAC GridList `layout="grid"`, so keyboard
uses a 2D delegate: ArrowRight/Left move between columns,
ArrowDown/Up between rows.

Solid CardView never passes `layout="grid"`. `createGridList`
treats ArrowRight/Left as a no-op unless `orientation` is
horizontal and `keyboardNavigationBehavior` is `tab`
(`packages/solidaria/src/gridlist/createGridList.ts`). ArrowDown
walks the collection in document order.

Default size S packing also differs (#340). `?size=XS` is already
two-up on both, so ArrowRight is a clean 2D miss.

## Evidence

`http://127.0.0.1:4341/components/cardview/?size=XS`, islands
mounted, one panel at a time. Both pack Apollo | Zephyr on one
row. Tab onto Apollo, then:

| | React | Solid |
|---|---|---|
| ArrowRight | focus+select Zephyr | stays Apollo, selectedKeys `apollo` |
| ArrowDown (after that Right) | stays Zephyr | focuses Zephyr, selectedKeys stay `apollo` |

Default `size=S` (React two-up, Solid stacked): React ArrowRight
moves to Zephyr; Solid ArrowRight is a no-op and ArrowDown focuses
Zephyr. Waterfall XS: React ArrowRight also stays (WaterfallLayout
delegate); Solid ArrowDown still walks the collection.

Selection-on-move stays #342. This ticket is which key the arrows
land on.

## Done when

On a two-up CardView (`?size=XS` or default S once #340 lands),
ArrowRight moves focus from Apollo to Zephyr and ArrowDown does
not. A comparison-route keyboard walk fails if Solid ArrowRight is
a no-op while React moves to the adjacent card.

## Relationship

Child of #24. Found by #260. Distinct from #340 (packing) and #305
(ListView intra-row arrows). The 2D delegate belongs in
`createGridList` / CardView `layout="grid"`, not in comparison CSS.
Do not start #254.
