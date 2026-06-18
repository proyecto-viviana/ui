---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Table: add expandable rows / tree grid (port of react-aria-components 1.17 `UNSTABLE_` tree grid)

React Aria 1.17 added expandable Table rows — a `treeColumn` whose cells carry a
chevron button that expands/collapses nested `childItems`, giving a
macOS-Finder-style tree inside a TableView. This ports the headless stack through
all three RAC-equivalent layers, keeping upstream's `UNSTABLE_` prefix on the
public expansion API.

**solid-stately** — a new `createTreeGridState` (port of
`@react-stately/table`'s `useTreeGridState`) owns the expanded-keys signal,
controlled via `UNSTABLE_expandedKeys` or uncontrolled from
`UNSTABLE_defaultExpandedKeys`, and notifies `UNSTABLE_onExpandedChange`. It
rebuilds the `TableCollection` whenever the expanded keys (or data) change and
layers a `toggleKey` plus `expandedKeys` / `treeColumn` getters onto the base
table state via `defineProperty` (spreading would eagerly evaluate the state's
reactive getters and break reactivity). Collapsing from `'all'` first
materialises every expandable row, matching upstream's `toggleKey`.
`TableCollection` gains a tree-grid mode (selected by passing an `expandedKeys`
option, even an empty set): `buildTreeRows` walks `childRows`, stamping each
`GridNode` with its `level`, `isExpandable`, and sibling position so the row hook
can read `aria-level` / `aria-posinset` / `aria-setsize` directly, and resolves a
`treeColumn` (the explicit option or the first row-header column). `createTableState`
exposes inert `expandedKeys` / `treeColumn` / `toggleKey` members for flat tables
so the row hook has one shape to read from in both modes.

**solidaria** — `createTableRow` now emits the tree-grid row ARIA
(`aria-expanded` only when the row has children, plus `aria-level`,
`aria-posinset`, `aria-setsize`) and an `expandButtonProps` for the chevron.
Following `useTableRow`'s `expandButtonProps`, the chevron is **press-based**
(`onPress` toggles the row and moves focus to it) so it flows through our Button's
`createPress` rather than a raw DOM `onClick`; it is `excludeFromTabOrder` +
`preventFocusOnPress` and carries `data-react-aria-prevent-focus`, with an
`aria-label` of `Expand`/`Collapse`. The row's `onKeyDown` handles tree
expand/collapse on ArrowRight/ArrowLeft (flipped under RTL): expand a focused
collapsed parent, collapse an expanded one, or move focus to the parent from a
leaf — stopping propagation so the grid's arrow navigation doesn't also fire.

**solidaria-components** — `Table` wires `expandButtonProps` to a `chevron`
Button slot and threads the tree-grid render-prop values
(`isExpanded` on rows; `hasChildItems` / `isTreeColumn` on cells) so a consumer
renders the chevron only in the tree column of rows that have children — the same
gating S2's `TableView` uses. (The chevron registry is reset per render pass so
cells recreated when a row toggles re-claim their column key instead of stranding
past the column list.)

The `UNSTABLE_` prefix is intentionally retained to match upstream's
still-unstable status. The S2-styled `ExpandableRowChevron` and tree-column
indentation in the styled `solid-spectrum` TableView are a tracked follow-up and
are **not** part of this change — this is the headless React-Aria-parity port.
