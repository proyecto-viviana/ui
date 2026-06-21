---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

GridList: stop Space/Enter from double-toggling the focused row

The grid container and the row both handled Space (toggle selection) and Enter
(onAction). Solid delegates keydown at the document and replays it up the
composed path, so a keypress on the focused row fired both handlers — toggling
selection twice (a net no-op) and double-invoking onAction.

Upstream's `useSelectableCollection` has no Space/Enter case: the focused item
owns both, via `useSelectableItem`. The port now follows that split — Space and
Enter are dropped from `createGridList` and owned by `createGridListItem`. For
the row's handlers to receive the keypress, browser focus follows the roving
tabindex onto the focused row from a post-commit effect (mirroring Table),
located by a stable `data-key` now rendered on each `GridListItem`.

`createGridListItem` gains an `"all"`-gated interaction guard so rows that are
focusable-but-not-selectable (`disabledBehavior: "selection"`) stay actionable
via keyboard, matching the grid hook's existing navigation gate.
