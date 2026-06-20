---
"@proyecto-viviana/solid-spectrum": patch
---

TableView: draw the highlight-selection block border + grouped row dividers

Completes the virtualizer-only polish that `table-selection-style-highlight.md`
left as a tracked follow-up. In `selectionStyle="highlight"`, a contiguous run of
selected rows now renders as a single rounded blue "block": the 1px blue border
and 5px corner radii only appear on the group's outer edges, and the gray divider
between two selected rows is suppressed.

This mirrors upstream S2's `TableView` faithfully:

- The block border is a `::before` overlay, because the `style()` macro can't
  express a pseudo-element. The macro sets per-row custom properties
  (`--borderColor`, `--borderTopWidth`/`--borderBottomWidth`,
  `--borderTopRadius`/`--borderBottomRadius`, …) and a shared stylesheet —
  injected once on first highlight render, like upstream's `highlightSelectionBorder`
  raw css — reads them. Inner edges/corners are zeroed via two new
  `isNextSelected` / `isPrevSelected` row conditions, computed from the headless
  table state's `selectedKeys` and `collection.getKeyAfter`/`getKeyBefore`.
- The gray row divider moves from the cell's bottom border to the row's
  `box-shadow` in highlight mode (suppressed within a selected block by
  `isNextSelected`). Upstream draws this divider as a row `borderBottom`, which a
  real `<table>` can't use — `border-collapse: separate` makes CSS ignore borders
  set on `<tr>` — so the box-shadow is its faithful real-DOM realization. Checkbox
  mode keeps the divider on the cell, so it stays byte-for-byte unchanged.

The one upstream detail intentionally dropped is `z-index: 3` on the overlay — it
exists only to paint above the S2 virtualizer's sticky cells, which our real-DOM
`<table>` doesn't have. The default `selectionStyle="checkbox"` is unaffected.
