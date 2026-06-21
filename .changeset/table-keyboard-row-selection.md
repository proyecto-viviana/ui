---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Table: fix keyboard row selection (subtree recreation + double-toggle)

Pressing Space on a focused Table row never updated the selection. Two stacked
bugs:

- The root children were invoked with live render values
  (`props.children(renderValues())`), and `renderValues()` reads the focus-ring
  signals, so every focus change re-ran the children insert and recreated the
  whole `thead`/`tbody` subtree. That detached the DOM-focused row, dropping
  browser focus to `<body>` before Space could reach the row handler. React
  re-invokes the render-prop children on each render and reconciles; Solid has
  no reconciliation, so the root children are now invoked once with an untracked
  snapshot of the render values, and kept out of the reactive `<table>`
  attribute spread.

- With focus retained on the row, Space then toggled selection twice — once in
  the row handler and once in the grid handler — netting no change. Upstream
  `useSelectableCollection` has no Space/Enter case (selection is owned by the
  row via `useSelectableItem`), so the grid-level Space/Enter selection block is
  removed. Space/Enter fall through to type-ahead, which now carries the
  upstream `useTypeSelect` leading-Space guard so a bare Space no longer seeds
  the search buffer.
