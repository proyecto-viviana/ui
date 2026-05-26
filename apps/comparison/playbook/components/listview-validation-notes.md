# ListView Validation Notes

Date: 2026-05-25
Status: accepted

## Current-Gate Closeout

- Scope: styled S2 `ListView`, `ListViewItem`, collection slots,
  selection/action behavior, empty state, ActionBar integration, comparison
  route controls, visual-state evidence, and focused package/browser tests.
- Sources rechecked: React Spectrum S2 ListView docs/API via MCP, installed S2
  behavior through the React comparison reference, Solid styled GridList/ListView
  source, comparison fixtures, controls, visual matrix, and focused e2e specs.
- Result: accepted for this component pass. Solid exposes the S2 ListView public
  surface through the ListView subpath, preserves dynamic collections, grid/row
  semantics, selected and disabled keys, label/description/icon/action slots,
  link/child trailing indicators, empty state, item actions, and
  `renderActionBar` behavior against the live React Spectrum reference.

## Acceptance Gate Checklist

- [x] Official docs and viewer parity: S2 docs/API examples were checked. The
      comparison route covers the documented collection, selection,
      label/description, icon, ActionButtonGroup/ActionMenu, empty-state,
      link/trailing, navigation, and ActionBar branches. ListView does not
      expose a separate official page-level options viewer in the docs packet,
      so the side-panel controls are classified as API/docs/regression controls.
- [x] External authority and standards: S2 docs/source behavior and React Aria
      collection semantics are the authorities for grid roles, keyboard
      navigation, selection, disabled state, row actions, and empty state.
- [x] Upstream React source parity: Solid matches the live React reference for
      `grid`/`row` structure, selected/disabled ARIA, checkbox/highlight
      selection styles, quiet and overflow styling, link-out hiding, child-item
      chevrons, row background/focus-ring layers, empty rendering, and
      ActionBar selection state.
- [x] Solid idiomatic implementation: dynamic props remain accessors, selected
      keys derive from normalized visible items, render props stay lazy, item
      action slots receive live route props, and control-event listeners clean
      up.
- [x] Accessibility and i18n: browser tests cover labelled `grid` semantics,
      row selection and disabled state, checkbox affordances, empty-state text,
      clear-selection action, item action callback keys, and author-supplied
      labels/descriptions. No locale-specific formatting applies to ListView.
- [x] Behavior state machine: default and controlled selection, single/multiple
      modes, checkbox/highlight styles, disabled keys/items, `onAction`,
      empty-state normalization, and `renderActionBar` clear-selection behavior
      are covered.
- [x] Style source-to-computed parity: browser evidence compares React/Solid
      screenshots and computed row colors, border radii, heights, icon/button
      counts, link counts, and quiet/highlight/wrap slot geometry.
- [x] React-vs-Solid comparison harness parity: React and Solid fixtures share
      `listview-demo.ts` defaults, route props, item data, event channel,
      serialized markers, side-panel controls, and visual-state rows.
- [x] Known defects and regression protection: fixed the missing
      visual/asserted evidence gap, expanded route controls for docs/API
      branches, prevented stale selections when the visible collection is empty,
      and added ListView-specific modeled-controls text values.
- [x] Evidence and handoff: focused package tests, comparison build, focused
      Playwright, visual-state matrix rows, this note, and parity-report
      evidence are refreshed.

## Source Packet

| Source             | Files or docs                                                                    | Finding                                                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP        | `ListView` page/API                                                              | Public docs cover dynamic/static collections, slots, async loading, links, empty state, selection/actions, and navigation.               |
| React/S2 behavior  | Live comparison reference                                                        | ListView renders a labelled grid with rows, selection state, optional empty content, and ActionBar outside the grid.                     |
| Solid styled       | `packages/solid-spectrum/src/gridlist/index.tsx`, `src/list/index.tsx`           | ListView reuses GridList, preserving selection style, overflow, quiet style, trailing metadata, empty state, loading API, and ActionBar. |
| Comparison harness | fixtures, `listview-demo.ts`, controls, visual matrix, `listview-visual.spec.ts` | Both stacks receive identical normalized props and have DOM, ARIA, style, visual, and interaction assertions.                            |

## Behavior State Machine

- Stable states: default checkbox collection, quiet highlight collection,
  truncated/wrapped content, icon slots, item actions, link-out rows,
  child-navigation indicators, disabled rows, and empty collections.
- Selection states: uncontrolled default keys initialize both stacks; controlled
  keys update when rows are clicked; visible item count changes normalize stale
  keys out of serialized route state.
- Action states: `selectionMode="none"` row activation dispatches `onAction`
  keys; `renderActionBar` receives selected keys and the clear-selection button
  clears controlled markers.
- Empty/loading states: route evidence covers `renderEmptyState`; the async
  `loadingState`/`onLoadMore` API remains mapped through source/package surface
  and is not given a synthetic network fixture in the comparison app.
- Cleanup states: comparison event listeners clean up on unmount; no overlay or
  global listener lifecycle is owned by ListView itself.

## Accessibility And I18n

- Roots expose labelled `grid` collections and rows expose selection/disabled
  state.
- Checkbox selection mode renders checkbox affordances; highlight selection mode
  preserves row selection semantics without visible checkboxes.
- ListViewItem text uses label and description slots; empty text is
  author-supplied through `renderEmptyState`.
- Link rows preserve `href`/`target` and link-out icon hiding; child rows expose
  navigation affordances through `hasChildItems`.
- All route strings are author-supplied labels/messages; no ListView-owned
  locale formatting was found.

## Style Source-To-Computed

- S2 macro branches covered by browser evidence: default row chrome,
  checkbox/highlight selection style, quiet chrome, wrap/truncate overflow,
  disabled rows, icon slots, action slots, link/child trailing indicators, and
  ActionBar wrapper spacing.
- Screenshot pairs cover the default checkbox collection and a quiet highlight
  slot-heavy state. DOM assertions cover empty state, ActionBar, controlled
  selection, item action callbacks, computed row colors, border radii, heights,
  selected row background-layer colors, icon counts, button counts, and link
  counts.
- Comparison fixtures only set shared collection canvas dimensions; visible row
  styling comes from React Spectrum or the Solid package.

## Evidence

```bash
vp test run packages/solid-spectrum/test/ListView.test.tsx
vp run comparison:build
COMPARISON_BASE_URL=http://127.0.0.1:4327 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/listview-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ListView --reporter=line
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run check
git diff --check
```

Results:

- Focused ListView package tests: passed.
- Comparison build: passed and generated `/components/listview/`.
- ListView Playwright visual/interaction suite plus modeled-controls contract:
  passed.
- Component parity report: ListView is no longer listed in missing validation
  notes or missing current visual/asserted evidence.
- Strict parity report: failed only on the existing non-ListView backlog:
  missing modeled controls for Provider, TableView, and TreeView; missing notes
  for DropZone, NumberField, Picker, Provider, RadioGroup, SearchField, Switch,
  TableView, TextArea, TextField, and TreeView; missing current visual/asserted
  evidence for TableView and TreeView.
- Repo-wide check: passed.
- Diff whitespace check: passed.

## Handoff

- Current-gate status: ListView is accepted as of 2026-05-25.
- Closed comparison audit gaps: validation note and current visual/asserted
  evidence. Modeled controls were already present and are now expanded for the
  newly covered docs/API branches.
- Remaining catalogue work should continue with Provider, TableView, TreeView,
  and the remaining validation-note backlog listed in the parity report.
