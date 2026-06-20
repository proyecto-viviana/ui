---
"@proyecto-viviana/solid-spectrum": patch
---

Table: hide the highlight-mode row divider under a selected row

In highlight selection style the gray row divider is drawn as the row's
box-shadow (a real `<tr>` border is ignored under `border-collapse: separate`,
so the upstream row `borderBottom` has no real-DOM equivalent). It was only
suppressed when the _next_ row was selected, so a lone selected row — or the
bottom row of a selected block — still painted a stray gray line underneath its
rounded blue highlight-block border.

The divider now also collapses when the row itself is selected, mirroring
upstream `TableView`'s divider `borderColor` going `transparent` on both
`isSelected` and `isNextSelected`. In every selected case the blue block border
paints that edge instead, so the gray line no longer doubles up.
