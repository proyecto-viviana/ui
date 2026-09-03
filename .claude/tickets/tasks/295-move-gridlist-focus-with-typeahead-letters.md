---
id: 295
type: task
title: "Move GridList focus with typeahead letters"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 gridlist functional pass: RAC typeahead moves Read→Write on w and Read→Admin on a; Solid stays on Read. createGridList onKeyDown has arrows/Home/End/Ctrl+A/Escape and no useTypeSelect",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 listview: same createGridList miss. Isolated Tab then b moves React to Budget; Solid stays on Project brief. After 1100ms q moves React to Quarterly; Solid stays. Not #128.",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "#260 cardview: same miss. Isolated Tab then z moves React focus to Zephyr (selectedKeys stay apollo); Solid stays on Apollo. Not selectOnFocus (#342).",
    }
---

RAC GridList typeahead (useSelectableCollection → useTypeSelect) moves
roving focus to the first row whose text starts with the typed buffer.
Solid `createGridList` implements the arrow/Home/End trampoline itself and
never consumes printable keys, so typeahead is a no-op.

## Evidence

`http://127.0.0.1:4341/components/gridlist/`, islands mounted, one panel
at a time. Tab from Before lands on Read on both (`role=row`,
`tabIndex=0`, `data-focus-visible`). Then type:

| | React | Solid |
|---|---|---|
| `w` | focus Write | stays Read |
| `w`, wait 1200ms, `a` | Write then Admin | stays Read |
| `a` | focus Admin | stays Read |

No `aria-activedescendant` on either stack. ArrowDown/Up, Home/End, and
Ctrl+A still match. Distinct from #128 (typeahead Space capture phase).

## Done when

Typing `w` from the focused Read row moves DOM focus to Write, and `a`
after the typeahead timeout moves it to Admin, matching React. A
comparison-route keyboard walk fails if Solid stays on Read.

## Relationship

Child of #24. Found by #260. GridList does not go through
`createSelectableCollection` (#238). Not #128. Do not start #254.
