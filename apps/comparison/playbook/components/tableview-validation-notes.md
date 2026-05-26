# TableView Validation Notes

Date: 2026-05-25
Status: accepted with tracked S2 API backlog

## Current-Gate Closeout

- Scope: styled S2 `TableView`, `TableHeader`, `Column`, `TableBody`, `Row`,
  `Cell`, selection/action behavior, sorting, resizing, empty state, ActionBar
  integration, comparison route controls, visual-state evidence, and focused
  package/browser tests.
- Sources rechecked: React Spectrum S2 TableView docs/API via MCP, installed S2
  behavior through the React comparison reference, Solid styled TableView
  source, headless Table internals, comparison fixtures, controls, visual
  matrix, and focused e2e specs.
- Result: accepted for the currently implemented TableView surface. Solid now
  exposes the S2 TableView public aliases, preserves dynamic visible columns and
  add-row collection data, grid/header/row/cell semantics, selected and disabled
  keys, empty state, row links, row actions, sorting, root resize callbacks,
  root loading bridge, and `renderActionBar` behavior against the live React
  Spectrum reference.

## Acceptance Gate Checklist

- [x] Official docs and viewer parity: S2 docs/API examples were checked. The
      comparison route covers documented static/dynamic collections, visible
      columns, add-row data, density, quiet chrome, wrap/truncate overflow,
      selection/actions, sorting, column resizing, empty state, links, cell
      alignment/dividers, and ActionBar branches.
- [x] External authority and standards: S2 docs/source behavior and React Aria
      table semantics are the authorities for grid roles, keyboard navigation,
      selection, disabled state, row actions, sorting, loading, resizing, and
      empty state.
- [x] Upstream React source parity: Solid matches the live React reference for
      labelled `grid` structure, headers, body rows, checkbox selection,
      selected/disabled ARIA, quiet and overflow styling, cell alignment,
      dividers, empty rendering, sorting markers, resizer affordances, row
      links, and ActionBar selection state.
- [x] Solid idiomatic implementation: dynamic props remain accessors, selected
      keys derive from normalized visible rows, render props stay lazy,
      selection/action/sort callbacks keep local signals synchronized, and
      control-event listeners clean up.
- [x] Accessibility and i18n: browser tests cover labelled `grid` semantics,
      column headers, row selection and disabled state, checkbox affordances,
      row action callbacks, clear-selection action, empty-state text, and link
      affordances. No locale-specific formatting applies to TableView.
- [x] Behavior state machine: default and controlled selection, single/multiple
      mode switching, empty-state normalization, row actions, row links,
      sorting, resizing affordances, root loading state, and `renderActionBar`
      clear-selection behavior are covered.
- [x] Style source-to-computed parity: browser evidence compares React/Solid
      screenshots and computed grid colors, border radii, row colors, row
      heights, checkbox/link/resizer counts, and quiet/wrap/divider geometry.
- [x] React-vs-Solid comparison harness parity: React and Solid fixtures share
      `tableview-demo.ts` defaults, route props, visible columns, item data,
      event channel, serialized markers, side-panel controls, and visual-state
      rows.
- [x] Known defects and regression protection: fixed missing modeled controls
      and visual evidence, added dynamic collection route coverage, fixed
      select-all indeterminate ARIA, kept table render context live for
      children, wired root resize callbacks, and bridged root loading state into
      `TableBody`.
- [x] Evidence and handoff: focused package tests, comparison build, focused
      Playwright, visual-state matrix rows, this note, and parity-report
      evidence are refreshed.

## Source Packet

| Source             | Files or docs                                                                                                 | Finding                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP        | `TableView` page/API                                                                                          | Public docs cover content, dynamic visible columns/add rows, selection/actions, sorting, column resizing, async loading, links, and empty UI. |
| React/S2 behavior  | Live comparison reference                                                                                     | TableView renders a labelled grid with headers, rows, checkbox selection, optional empty content, sorting, resizers, and ActionBar.           |
| Solid styled       | `packages/solid-spectrum/src/table/index.tsx`                                                                 | TableView now owns the S2 wrapper, style macro classes, aliases, selection cells, ActionBar, sorting, resizing, loading, and empty state.     |
| Headless internals | `packages/solidaria-components/src/Table.tsx`, `packages/solidaria/src/table/createTableSelectAllCheckbox.ts` | Select-all indeterminate ARIA and resize callback propagation match the styled wrapper needs.                                                 |
| Comparison harness | fixtures, `tableview-demo.ts`, controls, visual matrix, `tableview-visual.spec.ts`                            | Both stacks receive identical normalized props and have DOM, ARIA, style, visual, and interaction assertions.                                 |

## Behavior State Machine

- Stable states: default checkbox collection, quiet table chrome,
  truncated/wrapped content, visible column subsets, added row data, cell
  alignment, cell dividers, disabled rows, linked rows, and empty collections.
- Selection states: uncontrolled default keys initialize both stacks; controlled
  keys update when rows are clicked; visible item changes normalize stale keys
  out of serialized route state.
- Action states: `selectionMode="none"` row activation dispatches `onAction`
  keys; `renderActionBar` receives selected keys and the clear-selection button
  clears controlled markers.
- Sorting and resizing states: sortable headers toggle descriptors on both
  stacks; root-level resize callbacks reach the resizer context; explicit
  `ResizableTableContainer` remains wired for compatibility.
- Empty/loading states: route evidence covers `renderEmptyState`; package tests
  cover root `loadingState` and `onLoadMore` bridging into the body loading
  sentinel.
- Cleanup states: comparison event listeners clean up on unmount; no overlay or
  global listener lifecycle is owned by TableView itself.

## Accessibility And I18n

- Roots expose labelled `grid` collections and rows expose selection/disabled
  state.
- Checkbox selection mode renders row checkboxes and a select-all checkbox with
  `aria-checked="mixed"` when partially selected.
- Sortable headers expose sort state and dispatch descriptor changes through
  header activation.
- Resizable headers keep the visible handle presentational and expose the
  accessible resize control as a hidden horizontal range input labelled
  `Resizer`, matching React Aria Components and S2 source behavior.
- Empty text, header text, cell text, and ActionBar labels are author-supplied;
  no TableView-owned locale formatting was found.

## Style Source-To-Computed

- S2 macro branches covered by browser evidence: density, quiet chrome,
  wrap/truncate overflow, selected rows, disabled rows, column/header/cell
  divider styling, alignment, table container border radius, ActionBar wrapper,
  and resizer affordances.
- Screenshot pairs cover the default collection and a quiet wrap state with
  sorting, dynamic columns, added row data, resizing, dividers, and disabled
  rows. DOM assertions cover empty state, ActionBar, controlled selection, row
  action callbacks, sort descriptor updates, computed colors, border radii, row
  heights, checkbox counts, link counts, and resizer counts.
- Comparison fixtures only set shared collection canvas dimensions; visible
  row/header/cell styling comes from React Spectrum or the Solid package.

## Tracked S2 API Backlog

- Expandable tree rows are not implemented yet: `treeColumn`, `expandedKeys`,
  `defaultExpandedKeys`, `onExpandedChange`, and recursive child-row collection
  rendering remain pending.
- `Column.menuItems` header menu integration remains pending.
- `EditableCell` is not implemented/exported yet.
- Full async network/infinite loading is not modeled in the comparison route.
  The package root loading bridge is covered, but no synthetic network route is
  present.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Table.test.tsx
vp test run packages/solidaria-components/test/Table.test.tsx
vp test run packages/solid-stately/test/createTableState.test.ts
vp run --filter @proyecto-viviana/solidaria-components build
vp run --filter @proyecto-viviana/solid-spectrum build
vp run comparison:build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/tableview-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep TableView --reporter=line
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp check packages/solid-spectrum/src/table/index.tsx packages/solid-spectrum/test/Table.test.tsx packages/solid-spectrum/vite.config.ts packages/solidaria-components/src/Table.tsx packages/solidaria-components/test/Table.test.tsx packages/solid-stately/src/table/TableCollection.ts packages/solid-stately/test/createTableState.test.ts packages/solidaria/src/table/createTableColumnHeader.ts packages/solidaria/src/table/createTableSelectAllCheckbox.ts packages/solidaria/src/table/createTableRow.ts packages/solidaria/src/table/createTableColumnResize.ts apps/comparison/src/data/tableview-demo.ts apps/comparison/src/data/component-controls.ts apps/comparison/e2e/tableview-visual.spec.ts apps/comparison/e2e/modeled-controls-contract.spec.ts apps/comparison/src/components/react/fixtures/styled.jsx apps/comparison/src/components/solid/fixtures/styled.tsx apps/comparison/src/data/visual-state-matrix.ts apps/comparison/playbook/components/tableview-validation-notes.md
git diff --check
rg -n "macro-[a-f0-9]+\\.css|@import \"\\./macro-|import \"macro-" packages/solid-spectrum/dist -g '*.{js,css,mjs,cjs}'
find packages/solid-spectrum/dist -maxdepth 1 -type f -name 'macro-*.css'
rg -l "webkit-search-cancel-button" packages/solid-spectrum/dist -g '*.css'
```

Results:

- `vp test run packages/solid-spectrum/test/Table.test.tsx`: 1 file passed,
  14 tests passed.
- `vp test run packages/solidaria-components/test/Table.test.tsx`: 1 file
  passed, 125 tests passed, 4 skipped.
- `vp test run packages/solid-stately/test/createTableState.test.ts`: 1 file
  passed, 33 tests passed.
- `vp run comparison:build`: passed; rebuilt the package chain and generated 70
  comparison pages.
- Focused TableView Playwright: 5 tests passed for default parity, modeled
  controls, quiet/wrap/sort/resize/cell options, empty state/ActionBar, and
  controlled selection/actions/sorting/links.
- `vp run comparison:report:parity`: passed structural catalogue/sidebar
  checks. Remaining global gaps are Provider and TreeView modeled controls, ten
  validation notes outside TableView, and TreeView current visual/asserted
  evidence.
- `vp run comparison:report:parity:strict`: failed only on the same tracked
  global backlog; TableView is no longer reported as a parity gap.
- `vp check` on the 19 touched TableView/comparison files: all files formatted;
  no lint warnings or errors.
- `git diff --check`: passed.
- Macro packaging checks after `vp run comparison:build`: no `macro-*.css`
  imports or root files were emitted, and `dist/style.css` still contains the
  expected `webkit-search-cancel-button` reset selector.

## Handoff

- Current-gate status: TableView is accepted for the implemented public surface
  as of 2026-05-25.
- Closed comparison audit gaps: modeled controls, validation note, current
  visual/asserted evidence, dynamic collection coverage, resize callback
  bridge, root loading bridge, select-all indeterminate ARIA, and render
  context wiring.
- Remaining catalogue work should continue with TreeView and the remaining
  validation-note backlog listed in the parity report, plus the tracked
  TableView S2 API backlog above.
