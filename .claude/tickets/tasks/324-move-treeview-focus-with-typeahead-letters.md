---
id: 324
type: task
title: "Move TreeView focus with typeahead letters"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 treeview functional pass: isolated Tab then b/p/c moves React to Budget/Photos/Client Notes; Solid stays on Weekly Report. createTree onKeyDown has arrows/Home/End/Ctrl+A/Escape/* and no typeahead",
    }
---

S2 TreeView typeahead moves roving focus to the first visible row whose
text starts with the typed buffer. Solid `createTree` implements the
arrow/Home/End trampoline itself and never consumes printable keys, so
typeahead is a no-op.

## Evidence

`http://127.0.0.1:4341/components/treeview/`, islands mounted, one panel
at a time. Tab from Before lands on Weekly Report on both (`role=row`,
`tabIndex=0`, `data-focus-visible`). Then type:

|     | React              | Solid               |
| --- | ------------------ | ------------------- |
| `b` | focus Budget       | stays Weekly Report |
| `p` | focus Photos       | stays Weekly Report |
| `c` | focus Client Notes | stays Weekly Report |

`selectedKeys` stays `weekly-report` on both (typeahead is focus, not
selection). Distinct from #295 (GridList/ListView `createGridList`) and
#312 (TableView `runTypeahead` sets focusedKey without moving DOM
focus). TreeView has no typeahead buffer at all.

## Done when

Typing `b` from the focused Weekly Report row moves DOM focus to
Budget, `p` to Photos, and `c` to Client Notes, matching React. A
comparison-route keyboard walk fails if Solid stays on Weekly Report.

## Relationship

Child of #24. Found by #260. Not #128, #295, or #312. Do not start
#254.
