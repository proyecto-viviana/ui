---
id: 340
type: task
title: "Pack CardView cards with S2 GridLayout and WaterfallLayout"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 cardview functional pass: default 360px size S compact paints S2 two-up 172×61 via Virtualizer GridLayout minItemSize 150; Solid CSS auto-fit minmax(150px,210px) stacks 210×86. layout=waterfall keeps the same CSS grid. XS already two-up on both; card height still 53 vs 180. Do not patch comparison styling (ADR 0001)",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "CardView wraps Virtualizer GridLayout/WaterfallLayout and packs columns from S2 minItemSize/minSpace.",
    }
---

S2 CardView packs cards with `Virtualizer` + `GridLayout` /
`WaterfallLayout` using `layoutOptions[size][density]` (`minItemSize`,
`maxItemSize`, `minSpace`). Size S compact is min 150 / max 210 / gap 8,
so a 360px fixture fits two columns (~172×61).

Solid CardView paints a CSS grid
`repeat(auto-fit, minmax(150px, 210px))`
(`packages/solid-spectrum/src/cardview/index.tsx`). `auto-fit` prefers
the 210px max, so only one column fits in 360px and the cards stack at
210×86. `layout="waterfall"` only sets `data-layout`; the tracks do not
change. Size reduction (`updateSize`) already drops XL/L/M to S in this
fixture; it does not fix the track max.

Do not retune the comparison fixture or hand-author CSS to make a
screenshot pass (ADR 0001). The layout belongs in `solid-spectrum`
CardView, matching S2.

## Evidence

`http://127.0.0.1:4341/components/cardview/`, islands mounted, fixture
360×180.

Default `size=S` `density=compact` `layout=grid`:

|         | React                   | Solid                   |
| ------- | ----------------------- | ----------------------- |
| packing | two-up, same y          | stacked, same x         |
| card    | 172×61 at x 447 and 624 | 210×86 at y 872 and 966 |
| display | `block` (Virtualizer)   | `grid`                  |
| tracks  | `none`                  | `210px`                 |
| gap     | (layout options 8)      | `8px`                   |

`?size=XS`: both two-up. React 114×53; Solid 140×180 (row stretch to the
180px canvas). Tracks Solid `140px 140px`.

`?layout=waterfall` (and live `layout=waterfall`): React stays two-up
172×61, RAC `data-layout=grid` (GridList `layout="grid"` always). Solid
`data-layout=waterfall` with the same stacked 210px tracks as grid.

URL remount `density=regular|spacious` updates Solid gap 12 / 16.
`size=M|L|XL` stay S on Solid (360px cannot fit two min-200/270/340
columns) — that reduction matches S2.

## Done when

Default 360px size S compact paints two columns at S2 item size, and
`layout=waterfall` uses WaterfallLayout rather than the same CSS
auto-fit tracks. A comparison-route rest dump fails if Solid stacks
the two cards while React sits two-up.

## Relationship

Child of #24. Found by #260. Distinct from #343 (2D arrows still fail
on XS, where packing already matches). Missing `aria-rowcount` follows
Virtualizer once this lands; do not fold into a ListView rowcount
ticket. Do not start #254. Do not patch the comparison app (ADR 0001).
