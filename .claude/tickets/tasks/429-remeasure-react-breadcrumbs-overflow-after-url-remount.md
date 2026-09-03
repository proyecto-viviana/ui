---
id: 429
type: task
title: "Remeasure React breadcrumbs overflow after URL remount"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 breadcrumbs functional pass: ?itemSet=overflow remounts React at stale tail=0 (Home + More items, menu Files/Projects/Reports/Annual report 120×144) against Solid tail=2 (Home + More + Reports + Annual report, menu Files/Projects 88×80). Live comparison:controls-change overflow and overflow-narrow-100 already match. Certified D6 knownDivergence: S2 ResizeObserver on a fixed-width container never re-fires after the initial narrow measure",
    }
---

The comparison route `?itemSet=overflow` remounts both Breadcrumbs
fixtures with the five-item set (Home / Files / Projects / Reports /
Annual report). Solid settles to the S2 collapse algorithm's
`tail = 2`. React stays at a stale `tail = 0` from the first
narrow layout pass.

Certified D6 already records this as an oracle-side measurement
artifact, not a port miss: hidden-item widths, gap, folder button,
and container width are byte-identical, and the same S2 algorithm
computes `tail = 2` on either stack's settled DOM. The React
fixture's `ResizeObserver` is bound to a fixed-width panel that
never resizes after URL remount, so it never corrects the first
measure. Live `comparison:controls-change` `{itemSet: "overflow"}`
re-measures both stacks to `tail = 2`. Shrinking the canvas to
100px also matches (Home + More + Annual report).

Byte-parity on the URL remount must not regress Solid to React's
stale tail. Force a post-layout remeasure (or a one-frame resize)
on the React fixture so the oracle catches up.

## Evidence

`http://127.0.0.1:4341/components/breadcrumbs/?itemSet=overflow`,
islands mounted. Same split on `?itemSet=overflow&isDisabled=true`
and `?size=L&itemSet=overflow`.

| | React | Solid |
|---|---|---|
| URL overflow items | Home, More | Home, More, Reports, Annual report |
| URL overflow menu | Files, Projects, Reports, Annual report (120×144) | Files, Projects (88×80) |
| live `{itemSet: overflow}` | Home, More, Reports, Annual report | same |
| overflow-narrow-100 | Home, More, Annual report | same |

AX (URL remount):

```
React: list "Project location" → Home + button "More items"
Solid: list "Project location" → Home + button "More items" + Reports + Annual report
```

Menu select of Files / Projects still truncates both stacks once
the item is in the menu. Overlay enter/settle geometry (opacity,
dx, dy, gap) matches for the items each stack actually collapsed.

## Repro

1. Open `http://127.0.0.1:4341/components/breadcrumbs/?itemSet=overflow`.
2. Wait for `data-islands-mounted="true"`.
3. Diff the visible `listitem`s and the open "More items" menu
   against the Solid panel.
4. Dispatch `comparison:controls-change` `{itemSet: "overflow"}`
   from the default route and confirm both tails become 2.

## Done when

A URL remount of overflow on the comparison route paints the same
visible tail as Solid (Home + More items + Reports + Annual report)
and the same two-item menu. A walk of `?itemSet=overflow` fails if
React still shows only Home + More. Do not "fix" this by collapsing
Solid to `tail = 0`.

## Relationship

Child of #26. Found by #260. Fixture-only; Solid already re-measures.
Closes the D6 `overflow` knownDivergence in
`breadcrumbs.certified.spec.ts` once the oracle catches up. Distinct
from #267 / #269 (menu Tab / wrap). Do not start #254.
