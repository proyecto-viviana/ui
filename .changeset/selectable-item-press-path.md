---
"@proyecto-viviana/solidaria": patch
---

Selection: add `createSelectableItem`, the shared press-path item hook

Adds `createSelectableItem` (plus `ITEM_ACTION_EVENT` and its option/return
types) — a faithful Solid port of React Aria's `useSelectableItem`. It produces
`itemProps` for a selectable row/option and owns the full activation contract:
the action model (`allowsSelection` / `hasAction` derived from
`hasPrimaryAction` + `hasSecondaryAction`), select-on-press-down for rows vs.
select-on-press-up for menus, the keyboard Space-selects / Enter-acts split,
double-click secondary actions under `replace`, touch toggle, and touch
long-press → `setSelectionBehavior('toggle')`. Selection routes through the
Phase 0 aria-layer `selectItem`, so modifier resolution stays platform-aware.

To carry the keyboard distinction the contract needs, `PressEvent` now exposes
the originating `key` (present only on keyboard interactions, `undefined` for
pointer events) — matching upstream's `PressEvent.key`, used here to tell Space
(`isSelectionKey`) from Enter (`isActionKey`).

This is the de-risked foundation for migrating the grid/tree/table item hooks;
no existing component consumes it yet, so there is no user-visible change.

Local adaptations from upstream, since our `ListState` is thinner than
`SelectionManager`: `canSelectItem` is computed in the hook from
`selectionMode`/`isDisabled` rather than read off the manager; the link model is
prop-threaded (`isLink`/`href`/`routerOptions`/`linkBehavior`) instead of read
from `manager.isLink`/`getItemProps`; there is no virtual-focus move helper or
`data-collection` id; and `onDragStart` bubbles (no capture phase). The
uncontrolled-`replace` `selectionBehavior` default does not exist in our state,
so a consumer that wants long-press toggle must leave `selectionBehavior`
uncontrolled.
