---
"@proyecto-viviana/solid-spectrum": patch
---

TableView: render the S2 expand/collapse chevron and tree-column indentation

The headless tree-grid stack already shipped; this closes the last gap by
porting upstream `@react-spectrum/s2` TableView's `ExpandableRowChevron` and
`treeColumnStyles` into our styled `TableView`, so a tree-grid table looks like
S2 rather than relying on the consumer to draw the chevron themselves.

- The styled `TableCell` now auto-renders the expand/collapse chevron in the
  tree column of rows that have children (`hasChildItems && isTreeColumn`),
  matching the gating S2's `Cell` uses. It is the **headless** Button on the
  row's `chevron` slot (so it picks up the press-to-toggle/`Expand`/`Collapse`
  props), wrapped in a flex container *inside* the real `<td>` — making the td
  itself a flex container would break our fixed table-layout column widths.
- The chevron draws the ui-icon `Chevron` glyph and rotates 90° when expanded.
  Upstream rotates the button via `transform`; we use the `rotate` shorthand to
  match our `TreeView` chevron idiom and, as elsewhere in our codebase, omit the
  RTL branch.
- Tree-column cells indent by nesting depth: a leaf reserves the chevron's
  footprint (`--treeColumnPadding` 36 vs 16) so its content lines up with
  sibling rows that show a chevron, and each level adds `--indent` (16) via the
  cell's `paddingStart` calc, reading the `--table-row-level` the headless row
  already sets.

Flat (non-tree) tables are unchanged: the chevron and the indentation calc only
engage for `isTreeColumn` cells, so `paddingStart` stays at the existing 16.
