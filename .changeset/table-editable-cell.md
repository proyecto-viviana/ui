---
"@proyecto-viviana/solid-spectrum": patch
---

Table: add `EditableCell` (port of `@react-spectrum/s2`'s editable TableView cell)

S2's `TableView` lets a cell host an inline editor: an `edit` action button opens
a form, and on a fine pointer the form lives in a popover anchored to the cell,
while on touch it opens as a full-screen dialog. This ports that cell to our
styled Table as `EditableCell` (exported as `EditableCell` / `EditableCellProps`),
mirroring upstream's two-path behaviour in one component.

The path is chosen by a new `createMediaQuery` primitive
(`src/utils/createMediaQuery.ts`, a Solid port of `@react-spectrum/utils`'
`useMediaQuery`): it returns `false` during SSR and before mount so server and
first client render agree, then resolves `(hover: hover) and (pointer: fine)` on
the client. Desktop renders the editor in a `Popover`; like upstream RAC a modal
popover is exposed as `role="dialog"`, labelled from the new `table.editCell`
string, with icon-only save/cancel `ActionButton`s (`Checkmark`/`Cross`, labelled
`table.save` / `table.cancel`). Touch renders a `DialogContainer` > `CustomDialog`
with a text-button `ButtonGroup`. Both submit the form on dismiss-by-interacting-
outside and cancel on Escape, matching `EditableTableView`.

Adds the `table.editCell` / `table.save` / `table.cancel` strings (en-US, es-ES).
