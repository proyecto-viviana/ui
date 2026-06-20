---
"@proyecto-viviana/solid-spectrum": patch
---

ButtonGroup: cap the group at its container width so overflow can trigger

`ButtonGroup`'s overflow detection (switch to a vertical stack when the buttons
don't fit) could never fire: the `inline-flex` group had no width constraint, so
it simply grew to fit its buttons and no child ever extended past the group's
own edge. Added `maxWidth: 'full'` to the group style — matching upstream S2's
`ButtonGroup` — so the group is bounded by its container and the existing
overflow measurement (and the `orientation` switch to `'vertical'`) becomes
effective.
