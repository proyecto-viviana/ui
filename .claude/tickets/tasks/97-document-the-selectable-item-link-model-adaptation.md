---
id: 97
type: task
title: "Document the selectable-item link-model adaptation"
created: 2026-08-20
parent: 31
status: open
history:
  - {
      state: open,
      at: 2026-08-20,
      note: "migrated from press-path gap 4 before the legacy debt ledger was retired",
    }
---

The shared selection state does not expose the complete upstream item-prop
surface. Viviana threads `isLink`, `href`, `routerOptions`, and link actions
through item options instead. `createSelectableItem` adapts upstream link
behavior to this prop-threaded model.

The same boundary omits `manager.getItemProps(key)`. Upstream uses that method
to chain collection-provided press and click handlers. Viviana collection nodes
do not carry those handlers.

This is a deliberate local adaptation. It must not look like an unnoticed port
gap.

## Scope

- Compare the current item-link path with the applicable upstream source.
- Compare the omitted `getItemProps` handler chain with every local collection
  consumer.
- Record the structural manager adapters used by list, grid, tree, and table
  state.
- Record the exact behavioral boundary in stable certification documentation.
- Decide with the owner whether to keep the explicit local adaptation or
  converge on the upstream manager surface.
- Add regression evidence for every user-observable branch in the selected
  boundary.

Do not add a public API name or manager surface without an owner decision.

## Done when

The stable evidence record names the link, item-prop, and manager adaptations.
It also names their test coverage. Future parity work can distinguish an
approved boundary from an unported branch.
