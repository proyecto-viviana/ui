---
id: 320
type: task
title: "Clear TagGroup selection on Escape"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 taggroup functional pass: isolated Escape from a focused tag clears React selectedKeys and leaves Solid on landscape",
    }
---

S2 TagGroup Escape clears the selection and keeps focus on the current
tag. Solid `createTag` has no Escape handler, so selectedKeys stay.

## Evidence

`http://127.0.0.1:4341/components/taggroup/`, islands mounted, one panel
at a time. Tab onto Landscape, ArrowRight to Portrait, Space (both
`landscape,portrait`), then Escape:

|              | React               | Solid               |
| ------------ | ------------------- | ------------------- |
| selectedKeys | empty               | `landscape`         |
| focus        | Portrait `role=row` | Portrait `role=row` |

First-pass default walk (Space on Night then Enter then Escape) is the
same class: React empty, Solid still `landscape`. Ctrl+A then Escape
on React also clears; Solid never selected-all (#321) so Escape is
still a no-op.

## Done when

Escape from a focused tag clears selectedKeys and leaves focus on that
tag, matching React. A comparison-route keyboard walk fails if Solid
stays on `landscape` after Escape.

## Relationship

Child of #24. Found by #260. Distinct from #54. Do not start #254.
