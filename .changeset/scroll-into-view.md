---
"@proyecto-viviana/solidaria": patch
---

Port the `@react-aria/utils` scroll-into-view family (T-10). Adds `scrollIntoView(scrollView, element, opts)` and `scrollIntoViewport(target, opts)` — a faithful port including the 1.16 `scrollMargin` + inline/block alignment refinements (PR #9146) and the scrollbar-width + RTL handling (PR #9634) — plus a `getScrollParents` helper. `scrollIntoViewport` is wired into the three hooks that move real DOM focus, so keyboard navigation reveals an off-screen focused item: the date segment (`createDateSegment`), the calendar cell (`createCalendarCell`), and the table's selectable-collection focus effect (`createTable`).

Follow-ups (tracked in the upstream-release audit): the `aria-activedescendant` collections (ListBox / Menu / Select) and the in-cell walker navigation (grid / gridlist) are not wired yet — the former manage their own virtualizer scroll and the latter don't port upstream's `useGridCell` focus-mode walker, so there is no equivalent attachment point.
