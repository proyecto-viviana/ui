---
id: 17
type: task
title: "Complete menu-trigger behavior parity"
created: 2026-08-20
parent: 31
status: next
history:
  - { state: open, at: 2026-08-20, note: "opened from the latest-work review of createMenuTrigger" }
  - {
      state: next,
      at: 2026-08-21,
      note: "selected after ticket #11 completed the acceptance evidence model",
    }
---

The latest menu-focus change stores a first-or-last focus strategy in
`createMenuTriggerState`. The public `createMenuTrigger` contract still accepts
`OverlayTriggerState` and casts it to a larger private shape. A direct consumer
can therefore pass the documented state type and lose the requested strategy.

The current primitive also implements only part of the pinned upstream
`useMenuTrigger` behavior. This is a parity task, not a type-only correction.

## Evidence

- Upstream `useMenuTrigger` requires `MenuTriggerState`.
- Local `createMenuTrigger` accepts `OverlayTriggerState`.
- Local tests construct `createOverlayTriggerState`.
- ArrowDown and ArrowUp pass `first` and `last` to methods that ignore them on
  the documented local state type.
- The local tests prove that keys open the overlay. They do not prove which menu
  item receives focus.
- The pinned upstream primitive also branches on `trigger`, handled events,
  Alt-modified keys, pointer type, press phase, long press, and virtual input.
  The local primitive does not expose or prove these branches.
- RAC 1.20 adds `trigger="contextMenu"`. The local packages have no
  `createContextMenu` path, context-menu modality, or virtual target rectangle.

## Scope

- Compare the public type and each observable branch with the pinned upstream
  source and tests.
- Ask the owner to steer any public type or property-name change.
- Make the state type express the focus-strategy contract without a private
  cast that accepts a weaker state.
- Match press, keyboard, long-press, disabled, handled-event, and virtual-input
  behavior.
- Port context-menu activation, virtual positioning, keyboard invocation, and
  dismissal from the pinned RAC source.
- Prove ArrowDown focuses the first item.
- Prove ArrowUp focuses the last item.
- Prove pointer and virtual activation use the correct focus target and timing.
- Add component-level browser evidence for focus entry and focus restoration.
- Add a Changeset for each affected public package.

Do not accept an overlay-open assertion as evidence for menu focus. Use tests
that inspect the active element and observable menu behavior.

## Done when

The public Solid primitive matches every applicable pinned upstream branch. A
regression test fails if ArrowUp opens the menu without focusing the last item.

## Relationship

Extends the latest menu-focus work, owns upstream Train 8 item T-83 for #82, and
contributes evidence to ticket #11.
