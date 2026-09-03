---
id: 312
type: task
title: "Move TableView focus with typeahead letters"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tableview functional pass: isolated Tab then q/b moves React to Quarterly/Budget; Solid stays on Project brief. createTable runTypeahead setFocusedKey without moving DOM focus",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Same focusedKey DOM lookup as #302; typeahead setFocusedKey now focuses the matching row.",
    }
---

S2 TableView typeahead moves roving focus to the first enabled row
whose text starts with the typed buffer. Solid `createTable`
`runTypeahead` calls `setFocusedKey(match.key)` and never focuses the
row element, so the letter is a no-op on the comparison route.

## Evidence

`http://127.0.0.1:4341/components/tableview/`, islands mounted, one
panel at a time. Tab from Before lands on Project brief on both. Then
type:

|     | React                          | Solid               |
| --- | ------------------------------ | ------------------- |
| `q` | focus Quarterly (`tabIndex=0`) | stays Project brief |
| `b` | focus Budget (`tabIndex=0`)    | stays Project brief |

`selectedKeys` stays `project-brief` on both (typeahead is focus, not
selection). Distinct from #295 (GridList/ListView `createGridList`
has no typeahead at all) and #128 (typeahead Space capture phase).
TableView already has a typeahead buffer; it does not move DOM focus.

## Done when

Typing `q` from the focused Project brief row moves DOM focus to
Quarterly, and `b` moves it to Budget, matching React. A
comparison-route keyboard walk fails if Solid stays on Project brief.

## Relationship

Child of #24. Found by #260. Same `setFocusedKey`-without-DOM-focus
root as #302, but the user-visible failure is typeahead. Not #128 or
#295. Do not start #254.
