# TreeView Validation Notes

Date: 2026-05-26
Status: accepted for the current S2 docs/API-modeled TreeView pass

## Current-Gate Closeout

- Scope: styled S2 `TreeView`, `TreeViewItem`, `TreeViewItemContent`,
  `TreeViewLoadMoreItem`, dynamic recursive collections, selected/expanded
  state, item disabled state, links, empty state, ActionBar integration,
  comparison controls, and visual/runtime evidence.
- Sources rechecked: React Spectrum S2 TreeView docs/API via MCP, installed
  `@react-spectrum/s2/src/TreeView.tsx`, Solid styled TreeView source,
  headless Solid tree state, comparison fixtures, controls, visual matrix, and
  focused e2e specs.
- Result: accepted for the documented S2 TreeView surface. The comparison route
  now follows React Spectrum's single content slot model: text, optional icon,
  action menu/group, links, load-more, and empty state. The previous
  description fixture branch was removed because neither the S2 docs/API nor
  installed TreeView source exposes a TreeView description slot.

## Acceptance Gate Checklist

- [x] Official docs and viewer parity: S2 docs/API sections were checked. The
      comparison route covers dynamic recursive collections, selection,
      controlled/default expanded keys, text/icon/action slot composition,
      links, load-more/progress, empty state, disabled keys/items, and
      ActionBar. No official TreeView page-level options viewer or description
      slot was found.
- [x] External authority and standards: S2 docs/source behavior and React Aria
      collection semantics are the authorities for tree/grid roles, recursive
      collections, selection, expansion, disabled state, and load-more rows.
- [x] Upstream React source parity: Solid was checked against installed
      `@react-spectrum/s2/src/TreeView.tsx`. Important source findings:
      `TreeViewItemContent` renders a one-row `content` grid area, disabled row
      text comes from the React cell color branch, and `TreeViewLoadMoreItem`
      uses the current loading-progress row.
- [x] Solid idiomatic implementation: dynamic item props remain reactive,
      recursive collection registration avoids static/dynamic duplication,
      item-level disabled props flow through headless state, and load-more
      items do not register as normal static rows.
- [x] Accessibility and i18n: route/package tests cover labelled tree/grid
      semantics, rows, levels, expanded state, selection, disabled rows,
      item-action callbacks, load-more progress labels, and empty state.
- [x] Behavior state machine: default and controlled selection, controlled
      expansion, disabled keys/items, empty collections, item actions,
      link rows, ActionBar clear-selection, and load-more loading state are
      covered.
- [x] Style source-to-computed parity: browser evidence compares row text,
      selected/disabled colors, background layers, row heights, load-more
      height, border radius, icon/action/link/progress counts, and screenshots.
- [x] React-vs-Solid comparison harness parity: React and Solid fixtures share
      `treeview-demo.ts`, route props, event markers, side-panel controls, and
      visual-state rows. The React fixture imports current S2 TreeView
      subpath exports.
- [x] Known defects and regression protection: fixed the duplicate/overlapped
      React label issue by removing unsupported TreeView descriptions from the
      fixture model and controls, and by keeping row item actions icon-only so
      action text cannot duplicate row labels; added TreeView
      visual/interaction e2e coverage so the docs-modeled slot set stays
      locked.
- [x] Evidence and handoff: focused package tests, comparison build, focused
      Playwright, visual-state matrix rows, and this note were refreshed.

## Source Packet

| Source             | Files or docs                                                                    | Finding                                                                                                                          |
| ------------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP        | `TreeView` Content/API                                                           | Public examples cover dynamic/static collections, text/icon/actions, async load-more, links, selection/actions, and empty state. |
| Installed React S2 | `apps/comparison/node_modules/@react-spectrum/s2/src/TreeView.tsx`               | `TreeViewItemContent` uses one `content` grid slot and no description row; disabled/load-more styling comes from React source.   |
| Solid styled       | `packages/solid-spectrum/src/tree/index.tsx`                                     | Solid TreeView exposes the S2 subpath, styled rows, recursive collections, item disabled state, links, load-more, and ActionBar. |
| Headless/state     | `packages/solidaria-components/src/Tree.tsx`, `packages/solid-stately/src/tree`  | Item disabled props now flow through tree node/state calculations and remain reactive for dynamic collections.                   |
| Comparison harness | fixtures, `treeview-demo.ts`, controls, visual matrix, `treeview-visual.spec.ts` | Both stacks receive identical normalized props and have DOM, ARIA, style, visual, single-label, and interaction assertions.      |

## Behavior State Machine

- Stable states: default checkbox tree, highlight tree, truncated/wrapped
  labels, icon slots, action menu/group slots, link rows, disabled rows,
  load-more rows, empty collection, and ActionBar.
- Selection states: uncontrolled defaults initialize both stacks; controlled
  selected keys update after row activation; stale keys normalize when the
  visible collection is empty or shortened.
- Expansion states: controlled and default expanded keys initialize rows and
  update serialized markers after expand/collapse button activation.
- Action states: `selectionMode="none"` row activation dispatches `onAction`
  keys; `renderActionBar` receives selected keys and clear-selection resets
  controlled markers.
- Async/empty states: `TreeViewLoadMoreItem` is rendered under a parent row and
  exposes progress during loading; `renderEmptyState` renders author-supplied
  empty content.

## Accessibility And I18n

- Roots expose labelled tree/grid semantics and rows expose level, expanded,
  selected, and disabled state.
- Checkbox selection mode renders selection checkboxes; highlight selection
  mode preserves selected row semantics without checkbox controls.
- Expand/collapse buttons remain separate row controls and are disabled when
  React disables expansion.
- Link rows preserve link semantics and target metadata.
- Route strings are author-supplied labels/messages; no TreeView-owned locale
  formatting was found beyond React Spectrum's localized loading message.

## Style Source-To-Computed

- S2 macro branches covered by browser evidence: default row chrome,
  checkbox/highlight selection style, wrap/truncate overflow, selected rows,
  disabled rows, icon slots, action slots, link rows, empty state, load-more
  row, and ActionBar wrapper.
- React source uses a single `content` grid area in `TreeViewItemContent`.
  Description content was removed from the TreeView comparison model because it
  is not a documented/source-backed TreeView slot and caused duplicate-looking
  React labels.
- Item `ActionButtonGroup` actions use icon-only buttons with accessible names,
  matching the docs-modeled action slot without adding a second visible label in
  the row.
- Solid disabled row text and load-more height were adjusted to match the
  current React reference observed in the comparison route.

## Evidence

```bash
vp test run packages/solid-stately/test/createTreeState.test.ts packages/solidaria-components/test/Tree.test.tsx packages/solid-spectrum/test/Tree.test.tsx
vp run comparison:build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/treeview-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep TreeView --reporter=line
```

Results:

- Focused tree package tests: passed, 3 files and 103 tests.
- Comparison build: passed and generated `/components/treeview/`.
- TreeView Playwright visual/interaction suite plus modeled-controls contract:
  passed, 5 tests.

## Handoff

- Current-gate status: TreeView is accepted for the S2 docs/API-modeled
  component surface as of 2026-05-26.
- Closed user-visible defect: React TreeView no longer renders duplicate or
  overlapped labels in the comparison route because unsupported description
  rows were removed from the shared TreeView fixture model, item action buttons
  no longer render visible duplicate action text, and e2e asserts one visible
  row label text node per labelled row.
- Legacy cleanup note: older package/docs compatibility still references
  description helpers in Tree-related code. Those helpers are not surfaced in
  the S2 comparison model and should be handled by the broader legacy API/docs
  cleanup pass rather than counted as TreeView docs parity.
