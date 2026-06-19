---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
---

DragTypes: match `*/*` and `type/*` wildcards and accept arrays

`DragTypes.has` now mirrors `@react-aria/dnd`: it accepts a `DragType` or an array
of them, matches the `*/*` wildcard against any present type, and matches a
`type/*` wildcard against the type prefix (e.g. `image/*` accepts `image/png`).
Previously only an exact MIME string matched, so `acceptedDragTypes: ['image/*']`
never matched a dragged `image/png` over the DataTransfer-backed path. The
directory check is also tightened to the directory drag type specifically rather
than any symbol. The public `DragTypes` interface gains the upstream `DragType`
alias and the `has(type: DragType | DragType[])` signature.
