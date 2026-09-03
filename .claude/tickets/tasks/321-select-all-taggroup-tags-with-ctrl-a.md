---
id: 321
type: task
title: "Select all TagGroup tags with Ctrl+A"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: isolated Ctrl+A from the focused tag selects all four on React and is a no-op on Solid",
    }
---

Multiple TagGroup Ctrl+A must select every enabled tag. React does.
Solid `createTag` / `createTagGroup` have no `selectAll` key binding.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted, one panel
at a time. Tab onto Landscape, then Control+A:

| | React | Solid |
|---|---|---|
| selectedKeys | `landscape,portrait,travel,night` | `landscape` |
| focus | stays Landscape | stays Landscape |

Same after Space on Portrait then Ctrl+A (isolated enter-space walk):
React all four, Solid still `landscape`. GridList Ctrl+A already
matches (not this bug). TableView Ctrl+A is #311.

## Done when

Ctrl+A from a focused tag selects all enabled tags, matching React. A
comparison-route keyboard walk fails if Solid stays on `landscape`.

## Relationship

Child of #24. Found by #260. Distinct from #311 (TableView Ctrl+A) and
from GridList (Ctrl+A matched there). Do not start #254.
