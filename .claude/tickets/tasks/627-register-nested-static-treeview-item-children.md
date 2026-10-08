---
id: 627
type: task
title: "Register nested static TreeViewItem children"
created: 2026-10-08
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "visualmode T6. Source-confirmed on local main and in 0.8.0-rc.0. No red test. Static TreeItem returns null before nested children mount, and treeItemFromStatic copies no children. The data form keeps hierarchy, so visualmode is not blocked. Do not close as unreproduced.",
    }
  - {
      state: verified,
      at: 2026-10-08,
      note: "A static TreeViewItem nested inside another static TreeViewItem mounts as a child row. The two-sibling static test still passes, and the dynamic items path is unchanged.",
    }
---

Nested static `TreeViewItem` children never become rows. A `TreeView` with
no `items` takes the static path (`usesStaticChildren`). Each `TreeItem`
registers itself and then `return null` while `StaticTreeCollectionContext`
is set (`packages/viviana-ui/src/tree/index.tsx` around line 962, and the
solid-spectrum copy). The nested item never mounts, so it never registers.
`treeItemFromStatic` copies id, key, value, textValue, isDisabled, and
hasChildItems, and does not copy children.

The dynamic path is a different code path. `items` plus a render function
walks `item.children`, so hierarchy survives. Visualmode uses that data form
and is not blocked. There is no failing test: `supports static TreeViewItem
children` in `packages/solid-spectrum/test/Tree.test.tsx` renders two sibling
rows only.

Seen on visualmode mock-up pages with `0.8.0-rc.0`. The same early return is
on local main. Do not close this as unreproduced, and do not claim a red
test that does not exist.

## Done when

A static `TreeViewItem` nested inside another static `TreeViewItem` mounts as
a child row, and the existing two-sibling static test still passes. The
dynamic `items` path stays the one visualmode already uses.

## Relationship

Child of #24. From visualmode T6. Nothing in visualmode waits on it. Lower
than #624, #329, #84, #625, and #626.
