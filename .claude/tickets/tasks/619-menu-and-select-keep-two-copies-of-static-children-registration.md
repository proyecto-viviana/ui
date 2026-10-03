---
id: 619
type: task
title: "Menu and Select keep two copies of static-children registration"
created: 2026-10-02
parent: 33
status: open
history:
  - {
      state: open,
      at: 2026-10-02,
      note: "Follow-up to #43. Board parent is initiative #33, the parent of #43, because a task cannot parent a task. f5b391e7 added staticSelectCollection.tsx beside Menu's StaticMenuCollectionItem.",
    }
---

`f5b391e7` added
`packages/solidaria-components/src/staticSelectCollection.tsx` (probe
context plus `registerItem` / `unregisterItem`). That is a second copy of
Menu's static descriptor registration (`Menu.tsx`
`StaticMenuCollectionItem`, near 330 and 765).

Upstream builds both from children with one `CollectionBuilder` (RAC
`Collection.tsx`). Ours wraps that builder at `Collection.tsx:299`. Menu
and Select do not call the wrapper.

## Done when

One shared mechanism, ideally the CollectionBuilder path, serves both.
Menu and Select tests stay green.

## Relationship

Follow-up to #43. The board parent is initiative #33, which parents #43,
because a task cannot parent a task.
