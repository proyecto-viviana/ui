---
id: 322
type: task
title: "Apply TagGroup live allowsRemoving and selectionMode without remount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: live comparison:controls-change drops React Remove buttons and none-mode selection on remount-via-renderKey and leaves Solid first-paint Removes plus Landscape selected; URL remount of the same props already matches",
    }
---

TagGroup `allowsRemoving`, `selectionMode`, and `itemCount` update on
URL remount. A live `comparison:controls-change` after mount updates
React (fixture remounts via `renderKey`) and leaves Solid on the
first-paint slots.

The Solid fixture already exposes those props as getters off
`demoProps()`. The live listener calls `setDemoProps`. React still
paints the new chrome; Solid does not.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted.

URL remount already matches: `?allowsRemoving=false` drops Removes on
both (grid 294×15, tags 85×32); `?selectionMode=none` omits
`aria-selected` on both; `?itemCount=2` is two tags; empty `group`
"No categories" on both.

Live from the default route:

`comparison:controls-change` `{allowsRemoving:false, selectionMode:"single"}`:

|                | React  | Solid  |
| -------------- | ------ | ------ |
| Remove buttons | 0      | 4      |
| grid           | 294×15 | 310×55 |

Then `{selectionMode:"none", itemCount:2, withGroupAction:true}`:

|         | React                               | Solid                              |
| ------- | ----------------------------------- | ---------------------------------- |
| tags    | 2, `aria-selected` omitted, rest bg | 2, Landscape still selected + dark |
| Removes | 0                                   | 2                                  |
| Add tag | present                             | present                            |

Live `{isDisabled:true}` is mixed on Solid (Landscape/Portrait stay
enabled `tabIndex=0`, Travel/Night `aria-disabled`) while React
remounts four unselected interactive tags. URL `?isDisabled=true` is
a separate S2 no-op (React stays interactive; Solid disables the
whole grid) — record it here, do not treat S2's no-op as Solid
parity until the owner picks the oracle.

Live empty `itemCount=0` already matches (`group` "No categories").
Live back to default + `disabledItem=night` matches.

## Done when

A live `allowsRemoving` / `selectionMode` / `itemCount` change on an
already mounted TagGroup drops Remove buttons and none-mode
selection without remounting, matching the URL path. A
comparison-route live control walk fails if Solid keeps 4 Removes
after `allowsRemoving:false`.

## Relationship

Child of #24. Found by #260. Distinct from #309 (ListView ActionBar
slots) and #303 (TableView density/quiet). Not a harness-only remount
— a Solid consumer changing those props in place hits the same gap.
Do not start #254.
