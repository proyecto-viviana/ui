---
id: 17
type: task
title: "Complete menu-trigger behavior parity"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "opened from the latest-work review of createMenuTrigger" }
  - {
      state: next,
      at: 2026-08-21,
      note: "selected after ticket #11 completed the acceptance evidence model",
    }
  - {
      state: in-progress,
      at: 2026-08-21,
      note: "auditing the pinned menu-trigger branches and replacing the weak overlay-state contract",
    }
  - {
      state: verified,
      at: 2026-08-21,
      note: "matched the pinned press, long-press, context-menu, focus-entry, positioning, dismissal, styling, and localization branches and proved them in unit and browser tests",
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

- [x] Compare the public type and each observable branch with the pinned upstream
      source and tests.
- [x] Ask the owner to steer any public type or property-name change.
      The owner did not steer a separate context-menu export. Keep
      `createContextMenu` private. Use the exact upstream trigger names in the
      existing public menu-trigger contract.
- [x] Make the state type express the focus-strategy contract without a private
      cast that accepts a weaker state.
- [x] Match press, keyboard, long-press, disabled, handled-event, and virtual-input
      behavior.
- [x] Port context-menu activation, virtual positioning, keyboard invocation, and
      dismissal from the pinned RAC source.
- [x] Prove ArrowDown focuses the first item.
- [x] Prove ArrowUp focuses the last item.
- [x] Prove pointer and virtual activation use the correct focus target and timing.
- [x] Add component-level browser evidence for focus entry and focus restoration.
- [x] Add a Changeset for each affected public package.

Do not accept an overlay-open assertion as evidence for menu focus. Use tests
that inspect the active element and observable menu behavior.

## Checkpoint

The menu-trigger state now owns the focus strategy and the context-menu point.
The ARIA primitive matches the pinned press, keyboard, long-press, and
context-menu branches. This includes iOS long press, macOS Control+Enter,
outside dismissal, and localized long-press instructions.

The headless component layer now carries the trigger ref, menu ID, focus
strategy, and virtual position through the full composition. The S2 wrappers
use that behavior. Long-press ActionButton and ToggleButton triggers show the
pinned corner affordance. Context-menu triggers open only from context-menu
input and use a zero popover offset.

Verification on 2026-08-21:

- `vp test packages/solidaria/test/createMenu.test.tsx packages/solidaria-components/test/Menu.test.tsx packages/solid-spectrum/test/Menu.test.tsx` — 206 passed.
- `vp run typecheck` — passed.
- `vp run lint` — passed.
- `vp run guard:layer-boundary` — passed with no new forks.
- `vp run comparison:build` — built all 100 comparison pages. The existing
  source-map warning remains tracked by ticket #22.
- `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/menu-contract.spec.ts --reporter=line` — 5 passed.
- `vp exec --filter @proyecto-viviana/web -- playwright test e2e/menu-focus.spec.ts --reporter=line` — 2 passed.
- `git diff --check` — passed.

## Done when

The public Solid primitive matches every applicable pinned upstream branch. A
regression test fails if ArrowUp opens the menu without focusing the last item.

## Relationship

Extends the latest menu-focus work, owns upstream Train 8 item T-83 for #82, and
contributes evidence to ticket #11.
