---
id: 329
type: task
title: "Open ActionMenu from a TreeView item"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: isolated click, dispatchEvent(click), and Enter on the TreeView item ActionMenu open React Copy at opacity 1; Solid stays closed (focus row or BODY, menus []). After the failed click, Solid Escape clears selection. Worse than #308 (ListView dispatch+Enter did open)",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "row nested-focusable pointer/click stop is not enough; jsdom click still never mounts role=menu. Leave open.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "ActionMenu inside TreeView still does not open from pointer, dispatch, or Enter. Nested row stopPropagation is landed; the press path is not.",
    }
---

TreeView item `ActionMenu` opens from pointer press, a dispatched
click, and Enter on S2. Solid paints the trigger but none of those
paths set `aria-expanded` or mount a `role=menu`. After a failed
pointer click, Escape on Solid clears the row selection, so the press
is landing on the row, not the menu trigger.

ActionMenu on its own comparison route opens from click. This is the
TreeView item slot.

## Evidence

`http://127.0.0.1:4341/components/treeview/?itemActionSlot=actionMenu`,
islands mounted, one panel at a time. Click the item ActionMenu
trigger, wait 400ms; then `dispatchEvent(click)`; then focus the
trigger and Enter:

|                | React                                   | Solid                                                                  |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| click          | menu Copy, opacity 1, focus `role=menu` | menus `[]`, focus Weekly Report                                        |
| dispatch click | same open                               | menus `[]`, focus BODY, `selectedKeys` empty (Esc after click cleared) |
| Enter          | menu Copy, focus menuitem Copy          | menus `[]`, focus BODY                                                 |

`aria-haspopup` true vs menu is accepted upstream drift (menu pass).
No D13 TreeView journeys (#249). Distinct from #308 (ListView pointer
only; keyboard/dispatch opened).

## Done when

A pointer click on a TreeView item ActionMenu opens the Copy overlay
at opacity 1, and dispatch/Enter do the same, matching React. A
comparison-route walk fails if Solid stays closed.

## Relationship

Child of #24. Found by #260. Unrelated to the standalone ActionMenu
route. Not #308. Do not start #254.
