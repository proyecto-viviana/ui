---
id: 342
type: task
title: "Select the focused CardView card when selectionStyle is highlight"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 cardview functional pass: highlight+replace Tab then End moves React focus+selection to Zephyr; Solid focuses Zephyr and leaves selectedKeys=apollo. ArrowDown on the stacked/XS grid same pattern. Space/Enter/Escape after Home still match. createGridList setFocusedKey does not selectOnFocus; CardView already sets selectionBehavior replace for highlight",
    }
---

RAC GridList with `selectionBehavior="replace"` (S2 CardView
`selectionStyle="highlight"`) selects the focused key on keyboard
move (`selectOnFocus`). Solid CardView already passes
`selectionBehavior="replace"` for highlight, but `createGridList`
only calls `setFocusedKey` on arrows / Home / End and never
`replaceSelection`.

Pointer click, Space, Enter, and Escape still match. This is
keyboard move, not #296 (GridList default toggle) and not #238
(autoFocus-only `selectOnFocus` on `createSelectableCollection`;
GridList does not go through that helper).

## Evidence

`http://127.0.0.1:4341/components/cardview/`, islands mounted, one
panel at a time. Injected Before, Tab onto Apollo (selected,
`data-focus-visible`). Then End:

|              | React      | Solid      |
| ------------ | ---------- | ---------- |
| focus        | row Zephyr | row Zephyr |
| selectedKeys | `zephyr`   | `apollo`   |

Same split after ArrowDown from Apollo (Solid 1-col default or XS
two-up). Home / Space / Enter / Escape after Home still match
(Space and Escape clear, Enter reselects Apollo).

`?size=XS` packing is already two-up on both; End still selects on
React only. That isolates this from #340.

## Done when

Tab then End on the default highlight CardView selects Zephyr on
Solid, matching React. A comparison-route keyboard walk fails if
Solid focuses Zephyr and leaves `selectedKeys=apollo`.

## Relationship

Child of #24. Found by #260. Distinct from #238 (autoFocus branch)
and #296 (multiple click toggle). Adjacent to #343 (which key
arrows move to) — even when the focused key already matches, it
must also become selected. Do not start #254.
