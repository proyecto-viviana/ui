---
id: 251
type: task
title: "Own Popover enter and exit animation in the headless Popover as RAC does"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found while tracing the owner-reported transparent / misplaced list (#248) against the upstream overlay facts",
    }
---

## Cause

RAC owns overlay enter/exit state in four places and nowhere else:
`Popover.tsx` (`useExitAnimation(ref, state.isOpen)` at :173, and the enter
state gated on placement — `useEnterAnimation(ref, !!placement)` — so
`data-entering` holds until the first `calculatePosition` has run), `Modal.tsx`,
`Tooltip.tsx`, `Tabs.tsx`. Every RAC consumer of `Popover` (Select, ComboBox,
Menu, DatePicker, DialogTrigger, ColorPicker…) gets the transition for free,
and S2's `Popover.tsx` styles key `opacity: {isEntering: 0, isExiting: 0}` and
`translate ±4` off those render props (`s2/Popover.tsx:119-157`).

The port inverted this:

- `packages/solidaria-components/src/Popover.tsx` has **no** enter/exit
  machinery. `isEntering` / `isExiting` are pass-through props (`:449-451`,
  `:624-626`) and the mount gate is `isOpen() || local.isExiting` (`:647`).
  Nothing in `solid-spectrum/src/popover/index.tsx` passes them. Result: every
  Popover-based component (ComboBox, Picker, Menu, DialogTrigger popovers)
  appears and disappears instantly — S2's fade/translate never plays, and the
  placement-gated enter state that hides the pre-placement `fixed; top:0;
left:0` frame does not exist.
- `solidaria-components/src/DatePicker.tsx` (:1371, :1484) and the styled
  DatePicker / DateRangePicker in both packages call
  `createEnterAnimation` / `createExitAnimation` themselves — duplicates of what
  `Popover` should own; RAC's DatePicker has none.
- `solid-spectrum/src/menu/ActionMenu.tsx` (and the viviana-ui twin) hand-rolls
  a third mechanism: `ACTION_MENU_POPOVER_TRANSITION_DURATION = 200`,
  `setTimeout` for exit (:544-552), rAF + `setTimeout(…, 0)` for enter
  (:515-524), `wasOpen` / `renderedOpen` flags, and
  `isEnteringForRender = isOpen() && !wasOpen ? true : isEntering()` (:472). A
  stale `wasOpen` renders the menu at `opacity: 0` — a candidate for the
  owner-observed transparent list (#248). It also restores trigger focus by
  hand instead of through `FocusScope`.

Three parallel truths for one upstream mechanism (Rule #5). The shared
primitives in `packages/solidaria/src/utils/animation.ts` are a faithful port
of `react-aria/src/utils/animation.ts` (`getAnimations().finished`, the
`'closed' | 'open' | 'exiting'` machine, reopen-during-exit → `'open'`), so the
structure exists; it is simply not wired where RAC wires it.

## Work

1. `solidaria-components/src/Popover.tsx`: mirror RAC — compute
   `isExiting = props.isExiting || (!shouldSkipAnimation && createExitAnimation(ref, isOpen))`,
   mount gate `isOpen() || isExiting()`, and inside the positioned element
   `isEntering = createEnterAnimation(ref, () => placement() != null) || props.isEntering`.
   Render `data-entering` / `data-exiting` and the render props from these.
   Copy RAC's `shouldSkipAnimation` handling for submenus / warmup.
2. Delete the DatePicker / DateRangePicker duplicates in the headless and both
   styled packages (they now come from Popover). Keep `guard:layer-boundary`
   at `NEW forks: 0` by editing twins together.
3. Replace ActionMenu's bespoke machine with the Popover-owned state: remove
   the timers, flags, `isEnteringForRender`, and the manual focus restore
   (`FocusScope restoreFocus` in Popover owns it upstream). Both packages.
4. Tooltip and Modal already use the shared primitives; verify they match
   RAC's gating (`Tooltip.tsx`, `Modal.tsx`) and leave them.

## Done when

- D2 motion driver: ComboBox, Picker, Menu, ActionMenu, DatePicker popovers
  show the same enter/exit keyframes as React (opacity 0→1, translate 4→0,
  and the exit) — today they show none; the existing certified specs must
  gain the motion trigger where missing.
- D13 journeys (#245 / #246): `open → observe overlay opacity==1 after
settle`, `close → reopen before exit finishes → opacity==1, no second enter`,
  `open → resize → placement recomputed`, all equal React step by step.
- `rg -n 'setTimeout|requestAnimationFrame' packages/*/src/menu/ActionMenu.tsx`
  returns nothing; `rg -n 'createEnterAnimation|createExitAnimation' packages/*/src`
  lists only Popover, Modal, Tooltip, Tabs (the RAC owners).
- Unit tests in `solidaria-components/test/Popover.test.tsx`: `data-entering`
  present before placement and cleared after; reopen during exit returns to
  open without a second enter (mirror RAC `Popover.test.js` cases).

## Journeys that prove it (2026-09-02)

`CB-OV-05` and `PK-OV-04` in `apps/comparison/playbook/journeys/` (phase
`entering` → `settled` → `exiting` → unmounted; reopen during exit returns to
`settled` with no second enter; top placement translates +4 px) plus
`CB-OC-15` (last collection frozen while exiting). The upstream contract is in
`shared-overlay.md` "Geometry contract" and rows anim-src-enter / anim-src-exit
/ anim-src-reopen / anim-s2-keyframes of `journeys/facts/shared-overlay-selection.md`.

## Relationship

Child of #136. Suspected root of #248; #248's journey is the proof. Related:
#192 (OpenTransition sits on the snapshot baseline and is a fourth
transition helper to evaluate for deletion), #234 (1.21 visualViewport
positioning). Blocks nothing in #240.
