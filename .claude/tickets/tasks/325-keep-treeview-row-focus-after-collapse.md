---
id: 325
type: task
title: "Keep TreeView row focus after collapse"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: ArrowLeft on Documents collapses the same row set on both (documents,photos,archive) but Solid activeElement is BODY while data-focused stays documents; later ArrowRight and * are no-ops. React keeps Documents row focus and re-expands. Pointer Expand Photos also drops Solid to BODY",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Collapse/expand restores DOM focus onto the focused row after the collection commits so ArrowRight can re-expand.",
    }
---

Collapsing or expanding a TreeView row must leave DOM focus on that
row. S2 does. Solid updates `aria-expanded` / `data-focused` and then
drops `document.activeElement` to `BODY`, so the next keyboard key is
a no-op.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, one panel
at a time. Home lands on Documents (`role=row`, `tabIndex=0`) on both.
ArrowLeft:

|                  | React                      | Solid                  |
| ---------------- | -------------------------- | ---------------------- |
| row set          | documents, photos, archive | same                   |
| `aria-expanded`  | false                      | false                  |
| `data-focused`   | documents                  | documents              |
| `activeElement`  | Documents row              | BODY                   |
| ArrowRight after | re-expands Documents       | no-op, still collapsed |
| `*` after        | stays on Documents         | no-op                  |

Pointer click Expand Photos: React focus stays Photos (`exp` includes
photos, tree 320px). Solid expands Photos (`image-1` mounts) and focus
is BODY.

## Done when

ArrowLeft on Documents keeps DOM focus on the Documents row so
ArrowRight re-expands it, matching React. A comparison-route keyboard
walk fails if Solid `activeElement` is BODY after collapse.

## Relationship

Child of #24. Found by #260. Distinct from #326 (intra-row ArrowRight
while focus is still on the row). Do not start #254.
