---
"@proyecto-viviana/solidaria-components": patch
"@proyecto-viviana/solidaria": patch
---

GridList/Tree sections: emit upstream rowgroup/row/rowheader ARIA

`GridListSection` and `TreeSection` previously rendered a plain `<div>` and
their headers a `role="heading"` element, so assistive technology saw no section
grouping at all. React Aria instead wraps each section in a `role="rowgroup"`
whose label comes from the header: the header renders `role="row"` containing a
`role="rowheader"` whose `id` is wired back to the rowgroup's `aria-labelledby`.

This ports that structure faithfully:

- New `createGridListSection` hook in `@proyecto-viviana/solidaria` (mirroring
  upstream `useGridListSection`) returns the `rowProps`/`rowHeaderProps`/
  `rowGroupProps`, deriving the shared heading id via the also-new `createSlotId`
  (the SSR-safe analogue of upstream `useSlotId`, which only labels the rowgroup
  once the header is actually present in the DOM).
- `GridListSection`/`TreeSection` now render `role="rowgroup"` and provide their
  header the row/rowheader props through context; `TreeSection`/`TreeHeader`
  reuse the GridList section primitives exactly as upstream does. The header
  children are evaluated only inside those providers so their context wiring
  survives Solid's owner-based `useContext` resolution.

Section headers therefore expose `rowheader` semantics (not `heading`), and the
section rowgroup is labelled by that rowheader — matching React Aria's
`GridList` and `Tree` section markup.
