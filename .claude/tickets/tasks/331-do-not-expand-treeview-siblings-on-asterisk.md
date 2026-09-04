---
id: 331
type: task
title: "Do not expand TreeView siblings on * (match S2)"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: * from Documents is a no-op on S2 (expandedKeys stay documents,project); Solid expands photos and archive so image-1 and invoice mount. createTree case * expands every expandable sibling at the current level. S2 is the oracle",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Removed createTree * sibling-expand so S2 TreeView * is a no-op, matching React.",
    }
---

S2 TreeView does not expand sibling folders on `*`. Solid `createTree`
handles `*` by expanding every expandable sibling at the focused row's
level (`createTree.ts` "Expand all siblings at current level"), so
Photos and Archive open from Documents and child rows (Image 1,
Invoice) mount.

RAC/S2 is the oracle. Extra expansion is a port bug, not missing
upstream behavior.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, one panel
at a time. Home lands on Documents on both (`expandedKeys=
documents,project`). Then `*`:

|                | React                 | Solid                              |
| -------------- | --------------------- | ---------------------------------- |
| `expandedKeys` | `documents,project`   | `documents,project,photos,archive` |
| row keys       | 7 (documents…archive) | 9 (adds `image-1`, `invoice`)      |
| focus          | Documents row         | BODY (also #317 once rows remount) |

## Done when

`*` from Documents leaves `expandedKeys` at `documents,project` and
does not mount Photos/Archive children, matching React. A
comparison-route keyboard walk fails if Solid expands siblings.

## Relationship

Child of #24. Found by #260. The `*` handler is
`packages/solidaria/src/tree/createTree.ts`. Focus loss after the extra
expand is #325. Do not start #254.
