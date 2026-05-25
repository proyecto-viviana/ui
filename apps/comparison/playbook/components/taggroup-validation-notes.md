# TagGroup Validation Notes

Date: 2026-05-25
Status: accepted

## Current-Gate Closeout

- Scope: styled S2 `TagGroup`, `Tag`, root exports, headless tag semantics,
  comparison route controls, visual-state matrix evidence, package tests, and
  browser parity checks.
- Sources rechecked: React Spectrum S2 TagGroup docs/API via MCP, installed S2
  TagGroup behavior, React Aria tag semantics, Solid headless/component/styled
  sources, comparison fixtures, controls, visual matrix, and focused e2e specs.
- Result: accepted for this component pass. Solid now exposes the S2 public
  TagGroup surface, matches React's non-empty `grid`/`row`/`gridcell` structure
  and empty `group` structure, preserves explicit `Tag` composition, and covers
  selection, disabled keys, removal, tag action, empty state, group action, label
  layout, help/error text, and styled S2 visual states.

## Acceptance Gate Checklist

- [x] Official docs and viewer parity: S2 docs/API examples were checked. The
      comparison route exposes the official viewer-style controls first
      (`label`, `size`, label layout, selection mode/behavior, selected keys,
      disabled keys, content mode, emphasized/invalid/disabled state, empty
      collection, removal, and group action), with API/source extras captured in
      the modeled-control note.
- [x] External authority and standards: S2 docs/source behavior and React Aria
      tag semantics are the authorities for the collection roles, selection
      model, accessible names, remove affordances, and empty state behavior.
- [x] Upstream React source parity: Solid matches React's rendered role split:
      non-empty collections render as a labelled `grid` with `row` tags and
      `gridcell` content, while empty collections render as a labelled `group`.
      Group action is rendered only when tags exist, matching the live React
      stack and the docs wording that the action appears at the end of the tags.
- [x] Solid idiomatic implementation: dynamic props remain accessors, context
      values expose getters, children are resolved lazily, control-event
      listeners clean up, and shared remove/action data is registered before
      child tags compute aria state.
- [x] Accessibility and i18n: package and browser tests cover labels,
      descriptions/errors via `aria-describedby`, row selection/disabled state,
      keyboard row focus, empty-state naming, remove button names such as
      `Remove Landscape`, and author-supplied strings. No locale formatting
      applies to this component.
- [x] Behavior state machine: default and controlled selection, `selectionMode`,
      `selectionBehavior`, disabled keys, `onAction`, `onRemove`, selected-key
      cleanup after removal, empty state, and non-empty `onGroupAction` are
      covered.
- [x] Style source-to-computed parity: the styled package uses the S2 macro path
      for field layout, labels, tag list, tags, remove buttons, focus/selection
      state, help text, and error text. Browser evidence compares React/Solid
      screenshots plus computed colors, border radii, heights, icon counts, and
      help text.
- [x] React-vs-Solid comparison harness parity: React and Solid fixtures use
      the same `taggroup-demo.ts` defaults, route props, event channel,
      serialized markers, item data, and side-panel controls.
- [x] Known defects and regression protection: fixed missing public exports,
      stale remove-handler timing, explicit `Tag` composition detection after
      row role parity, missing `onAction`, callback preservation for
      `renderEmptyState`, initial pointer-click removal suppression, and the
      prior missing modeled-controls/validation/evidence audit gaps.
- [x] Evidence and handoff: focused package tests, comparison build, focused
      Playwright, visual-state matrix rows, this note, and parity-report evidence
      are refreshed.

## Source Packet

| Source             | Files or docs                                                                             | Finding                                                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP        | `TagGroup` page/API                                                                       | Public examples cover dynamic and static tags, icons/text content, selection, disabled keys, empty state, and group actions. |
| React/S2 behavior  | Live comparison reference                                                                 | Non-empty TagGroup uses `grid`/`row`/`gridcell`; empty TagGroup uses `group`; group action does not render for empty data.   |
| Solid headless     | `packages/solidaria/src/tag/createTagGroup.ts`, `packages/solidaria/src/tag/createTag.ts` | Roles, focus queries, shared remove data, and selection state now match the React Aria structure.                            |
| Solid components   | `packages/solidaria-components/src/TagGroup.tsx`                                          | `TagRemoveButton` stops pointer-down propagation so the row press state does not swallow the first remove click.             |
| Solid styled       | `packages/solid-spectrum/src/tag-group/index.tsx`, exports                                | Styled TagGroup/Tag mirror S2 size, label, selection, remove, action, empty, group-action, and visual branches.              |
| Comparison harness | fixtures, `taggroup-demo.ts`, controls, visual matrix, `taggroup-visual.spec.ts`          | Both stacks receive identical normalized props and have DOM, ARIA, style, visual, and interaction assertions.                |

## Behavior State Machine

- Stable states: default collection, empty collection, disabled group, disabled
  item, text tags, icon tags, top/side labels, start/end label alignment,
  selected/unselected tags, invalid/error text, and description text.
- Selection states: uncontrolled default keys initialize both stacks; controlled
  keys update when rows are clicked; removed selected keys are cleared.
- Action states: row `onAction` dispatches for tag activation, remove dispatches
  with the removed keys, and non-empty group action dispatches once per button
  press.
- Empty states: `renderEmptyState` is preserved as a callback through the Solid
  comparison helper; empty groups expose no rows, no remove buttons, and no group
  action, matching React Spectrum.
- Cleanup states: comparison event listeners clean up on unmount; shared
  tag-group data cleans up with the component lifecycle.

## Accessibility And I18n

- Non-empty roots are labelled `grid` collections; empty roots are labelled
  `group` containers.
- Tags expose row selection/disabled state and gridcell content.
- Description and error text are generated per instance and wired through
  `aria-describedby`; invalid error text replaces description text.
- Remove buttons include the action and tag text in the accessible name.
- Disabled group/item states suppress selection and remove/action affordances.
- All user-facing strings are author-supplied labels/messages; there is no
  locale-specific formatting surface in TagGroup.

## Style Source-To-Computed

- S2 macro branches covered by browser evidence: field layout, field label,
  collection wrapper, tag sizing, selected/emphasized/default colors, disabled
  colors, remove-button sizing, icon current color, error icon, and help text.
- Screenshot pairs cover default removable collection and invalid side-label icon
  state. DOM assertions cover empty state, group action, controlled selection,
  removal, label/help text, computed tag colors, border radii, and heights.
- Comparison fixtures only set a shared max width so both stacks render in the
  same canvas; visible tag styling comes from package styles.

## Evidence

```bash
vp test run packages/solid-spectrum/test/TagGroup.test.tsx packages/solidaria-components/test/TagGroup.test.tsx
vp run comparison:build
COMPARISON_BASE_URL=http://127.0.0.1:4327 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/taggroup-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep TagGroup --reporter=line
vp run comparison:report:parity
vp run comparison:report:parity:strict
vp run check
git diff --check
```

Results:

- Focused TagGroup package/component tests: `41` tests passed.
- Comparison build: passed and generated `/components/taggroup/`.
- TagGroup Playwright visual/interaction suite plus modeled-controls contract:
  `6` tests passed.
- Component parity report: TagGroup is no longer listed in missing controls,
  missing validation notes, or missing current visual/asserted evidence.
- Strict parity report: failed only on the existing non-TagGroup backlog:
  missing modeled controls for Provider, TableView, and TreeView; missing notes
  for DropZone, ListView, NumberField, Picker, Provider, RadioGroup,
  SearchField, Switch, TableView, TextArea, TextField, and TreeView; missing
  current visual/asserted evidence for ListView, TableView, and TreeView.
- Repo-wide check: passed.
- Diff whitespace check: passed.

## Handoff

- Current-gate status: TagGroup is accepted as of 2026-05-25.
- Closed comparison audit gaps: modeled controls, validation note, and current
  visual/asserted evidence.
- Remaining catalogue work should continue with the next component listed in
  the parity report gaps.
