---
"@proyecto-viviana/solidaria-components": patch
---

Table: stop `TableRow` recreating its cell subtree on render-prop churn, and let
`Popover` accept `AriaLabelingProps`

Both changes support hosting a modal editor inside a table cell (the styled
`EditableCell` in `solid-spectrum`), but the `TableRow` fix is a general
correctness improvement.

`TableRow` previously bound every reactive value (including `children`) through a
single reactive `tableRowProps()` call, so any signal flip — e.g. an editor
popover toggling — disposed and recreated the whole `<tr>` subtree. It now builds
the row's children **exactly once**, inside both `TableRowContext.Provider` and
`ButtonContext.Provider`, and binds the `<tr>`'s attributes individually on a
stable element. `buttonContextValue` is now a stable object whose `drag` / `chevron`
slots are getters, so the provider value keeps a constant identity (no
provider-driven recreation) while the slot props stay reactive. This fixes
slotted `<Button slot="drag">` / `<Button slot="chevron">` losing their
`ButtonContext` (they must be instantiated under the provider), which the
recreation path had been breaking.

`PopoverProps` now extends `AriaLabelingProps`, so a popover accepts `aria-label`
(already forwarded at runtime via `filterDOMProps(rest, {global: true})`),
mirroring React Aria's `Popover`.
