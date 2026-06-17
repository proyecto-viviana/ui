---
"@proyecto-viviana/solidaria": patch
---

Table: move browser focus during keyboard navigation when focus is on a row

`createTable`'s roving-tabindex → DOM-focus bridge only moved browser focus
while the grid's logical `isFocused` signal was set. That signal is wired to the
grid element's own non-bubbling `focus`/`blur` handlers, so it never became true
when focus landed directly on a row (a pointer click, or programmatic row
focus) — unlike upstream React Aria, whose focusin-based `onFocus` fires for
descendant focus too. As a result, ArrowDown/End/PageDown updated the focused
*key* (and the roving tabindex) without ever moving the browser's focus to the
target row.

The bridge now gates on the physical position of focus
(`el.contains(document.activeElement)`) instead of the logical `isFocused`
signal. That `contains()` check already prevented the bridge from pulling focus
back from elsewhere on the page, so the behavior is unchanged when focus is
outside the table, and keyboard navigation now correctly follows the focused row
whether focus entered via the grid or directly onto a row.
