---
id: 304
type: task
title: "Honor TableView Column minWidth and maxWidth"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: allowsResizing Name Column minWidth 180 maxWidth 320; React resizer is 180/180/320 and ArrowRight is a no-op; Solid is 124/75/9999 and ArrowRight steps to 125",
    }
---

S2 `Column` `minWidth` / `maxWidth` bound the column resizer.
Solid falls through to `createTableColumnResizeState` defaults
(`DEFAULT_MIN_WIDTH` 75, `DEFAULT_MAX_WIDTH` Infinity rendered as
9999) even when the Column passes 180 / 320.

## Evidence

`http://127.0.0.1:4341/components/tableview/?allowsResizing=true`,
islands mounted, one panel at a time. Both stacks show 4 Resizer
range inputs. Name resizer (first):

| | React | Solid |
|---|---|---|
| value / min / max | 180 / 180 / 320 | 124 / 75 / 9999 |
| ArrowRight | stays 180 (already min) | 125 |

The comparison fixture sets `minWidth={180}` `maxWidth={320}` on
Name and fixed `width` on Type/Status. Pointer sort and checkbox
counts still match. `createTableColumnResize` maps Infinity max to
9999.

## Done when

The Name resizer exposes min 180, max 320, and a value inside that
range, and ArrowRight at min is a no-op, matching React. A
comparison-route resize walk fails if Solid stays on 75 / 9999.

## Relationship

Child of #24. Found by #260. Not #110 (`availableWidth` floor before
column sizing) or #112 (resize end through `onMoveEnd`). Do not
start #254.
