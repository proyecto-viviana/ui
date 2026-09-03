---
id: 336
type: task
title: "Drive ActionBar collection mode through ListView renderActionBar"
created: 2026-09-03
parent: 26
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 actionbar functional pass: ?useCollection=true paints S2 ListView renderActionBar at 402×56 over the grid, while Solid uses a controlled ListView plus a sibling ActionBar with scrollRef in a 420×220 shell (370×60, insetInlineEnd 25px). Count, keys, clear, and pointer select match; the bar chrome does not. Solid ListView already has renderActionBar (listview route / package tests)",
    }
---

The ActionBar route's `useCollection` control is supposed to be the
docs-style ListView `renderActionBar` integration. React mounts
`ListView` with `renderActionBar`. Solid mounts a ListView and a
separate `ActionBar` with `scrollRef` in
`.comparison-actionbar-collection-shell`.

Solid ListView already owns `renderActionBar` (listview comparison
route, `packages/solid-spectrum/test/ListView.test.tsx`). The adapter
is leftover harness, not a missing API.

## Evidence

`http://127.0.0.1:4341/components/actionbar/?useCollection=true`,
islands mounted.

|                      | React                                 | Solid                                          |
| -------------------- | ------------------------------------- | ---------------------------------------------- |
| selectedKeys         | `reports,roadmap,research`            | same                                           |
| count text           | `3 selected`                          | same                                           |
| bar                  | 402×56, `position:absolute`           | 370×60, `position:absolute`                    |
| shell                | ListView (no comparison shell)        | 420×220, scrollbar 17px, `insetInlineEnd 25px` |
| row click Q4 reports | keys `roadmap,research`, `2 selected` | same                                           |
| Clear / Escape       | bar gone, keys empty                  | same                                           |

Direct (no collection) bars match at 432×56. `useScrollRef` bars
match at 330×60. The collection-mode size split is the fixture
container, not ActionBar layout. Collection checkbox/row names stay
on **#307**.

## Done when

`?useCollection=true` renders Solid ListView `renderActionBar` the
same way React does, so the bar geometry matches the grid (≈402×56)
instead of a sibling scrollRef shell. A comparison-route walk fails
if Solid collection still paints a 370×60 in-container bar.

## Relationship

Child of #26. Found by #260. Distinct from #309 / #330 (live
`showActionBar` stale on ListView/TreeView). Row AX names stay #307.
Do not start #254.
