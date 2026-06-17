---
"@proyecto-viviana/solid-spectrum": patch
---

SearchField a11y: expose the field shell as a `role="group"`

Mirror S2's `SearchField`, whose field shell is a `FieldGroup` — a RAC
`<Group>` that defaults to `role="group"` — wrapping the search icon, input,
and clear button. Our solid-spectrum `SearchField` rendered that shell as a
plain `<div>` (with the focus-within and click-to-focus behavior) but omitted
the role, so the grouping was invisible to assistive technology. The group is
intentionally unnamed; the searchbox continues to carry the field label.
