---
"@proyecto-viviana/solidaria-components": patch
---

Table columns and cells hydrate over SSR markup again. `TableColumn` and `TableCell` render their children as JSX children of the `<th>`/`<td>` (or the virtualized `<div>`) instead of an eagerly evaluated `children` entry in the spread props object, which keyed the children ahead of the element on the server and made the client claim the wrong nodes — an S2 TableView with `selectionMode="multiple"` threw "Cannot read properties of null (reading 'nextSibling')" while hydrating.
