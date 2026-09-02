---
id: 251
type: task
title: "Own Popover enter and exit animation in the headless Popover as RAC does"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found while tracing the owner-reported transparent / misplaced list (#248) against the upstream overlay facts",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "ported RAC enter/exit onto headless Popover; deleted ActionMenu timers and DatePicker duplicate machines; changeset popover-enter-exit-animation.md; not committed",
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

## Landed

Did not commit or stage. Changeset: `.changeset/popover-enter-exit-animation.md`
(patch `solidaria-components` + `solid-spectrum` + `@proyecto-viviana/ui`).

### Helper reused

`createEnterAnimation` / `createExitAnimation` from
`packages/solidaria/src/utils/animation.ts` — the same primitives Modal already
calls (`Modal.tsx:222-224,436`). Not extracted into a second module; Tooltip
still has its own exit machine (`Tooltip.tsx:440-486`) and was left per the
ticket. Tabs still stubs `isEntering`/`isExiting` as `false`.

### Upstream file:line → Solid file:line

- RAC `Popover.tsx:173` `useExitAnimation(ref, state.isOpen)` →
  `packages/solidaria-components/src/Popover.tsx:481`
- RAC `Popover.tsx:174` `props.isExiting || (!shouldSkipAnimation && exitAnimation)` →
  `Popover.tsx:482-484`
- RAC `Popover.tsx:176-192` `useIsHidden` early children →
  `Popover.tsx:485,707-721`
- RAC `Popover.tsx:194` `!state.isOpen && !isExiting` unmount →
  `Popover.tsx:722` (`isHydrated() && (isOpen() || isExiting())`)
- RAC `Popover.tsx:251` `useEnterAnimation(ref, !!placement)` →
  `Popover.tsx:622-623` (inside `PopoverInner`, remounts per full open)
- RAC `Popover.tsx:253` `props.isEntering || (!shouldSkipAnimation && enterAnimation)` →
  `Popover.tsx:626-629` (Solid also treats `isOpen && placement == null` as
  entering so the pre-placement `fixed; top:0; left:0` frame stays at opacity 0;
  RAC gets that from layout-before-paint)
- RAC `Popover.tsx:261-267` `trigger`/`placement`/`isEntering`/`isExiting` render props →
  `Popover.tsx:631-636`
- RAC `Popover.tsx:350-351` `data-entering` / `data-exiting` →
  `Popover.tsx:685-686`
- RAC `Overlay.tsx:78` `contain && !isExiting` →
  `Popover.tsx:666`
- RAC `Popover.tsx:99-103` `shouldSkipAnimation` →
  `Popover.tsx:185,309,484,628`
- S2 `Popover.tsx:119-157` opacity/translate/duration/easing →
  `packages/solid-spectrum/src/popover/index.tsx:112-150` (already present;
  now fed real render props)
- S2 `ActionMenu.tsx:65-89` MenuTrigger + Menu, no timers →
  `packages/solid-spectrum/src/menu/ActionMenu.tsx:454-461` (twin
  `packages/viviana-ui/src/menu/ActionMenu.tsx`)
- RAC `DatePicker.tsx:227-234` PopoverContext (`trigger: 'DatePicker'`,
  `placement: 'bottom start'`) →
  `packages/solidaria-components/src/DatePicker.tsx:1341-1360` and
  DateRangePickerContent `:1368`

### Deleted hand-rolled code

- `packages/solid-spectrum/src/menu/ActionMenu.tsx` (was `:450-552`):
  `ACTION_MENU_POPOVER_TRANSITION_DURATION`, `setTimeout` exit, rAF enter,
  `wasOpen` / `renderedOpen` / `isEnteringForRender`, manual trigger focus
  restore. Twin: `packages/viviana-ui/src/menu/ActionMenu.tsx`.
- `packages/solidaria-components/src/DatePicker.tsx` (was `:1371` and `:1484`):
  `createEnterAnimation` / `createExitAnimation` plus private `createPopover` /
  Portal / FocusScope. Now a `<Popover>`.

### Tests

- `sets data-entering on first render and removes it after the enter animation resolves`
- `keeps the popover mounted with data-exiting until the exit animation finished promise resolves`
- `unmounts on the next animation frame when getAnimations returns no animations`
- `passes isEntering and isExiting to class and style render props`
- `reopens during exit without a second enter`
- existing `should call onOpenChange when popover closes via Escape` still
  `[true, false]`
- `generates distinct entering, settled, and exiting classes from the S2 motion tokens`
- `marks the popover entering and exiting transition lifecycle` (ActionMenu;
  no `requestAnimationFrame` spy)
- existing DatePicker `keeps the calendar mounted and marks it exiting until its animation settles`

Red-then-green:

1. `vi.spyOn(Element.prototype, "getAnimations")` →
   `Error: The property "getAnimations" is not defined on the object.`
   (JSDOM; switched to `Object.defineProperty` on the prototype, as DatePicker
   does on the instance.)
2. After that mock, enter never cleared:
   `Expected the element not to have attribute: data-entering Received: data-entering=""`
   (resolved the `finished` promise before placement made `createAnimation`
   subscribe). Wait-for-`data-placement` then resolve → green.
3. `packages/solidaria-components/test/Popover.test.tsx` + DatePicker +
   spectrum Popover + ActionMenu: 104 passed.

### Verification

- Listed files 10/10, 223 passed. None missing.
- `vp test run packages/solidaria-components packages/solid-spectrum packages/viviana-ui`
  — 160 files, 3322 passed, 1 expected fail, 6 skipped.
- `vp run typecheck` — pass.
- `vp run guard:layer-boundary` — NEW forks: 0.
- `vp run guard:attribution-headers` — pass (header contracts satisfied).
- `vp run guard:upstream-test-parity` — suspects 151 → 152 (Δ+1). NEW suspect
  `combobox|aria|aria-setsize` is the concurrent #252 Virtualizer lane, not this
  ticket. Did not write the baseline.
- `vp run test:ssr` — 12 files, 26 passed.
- `vp run test:hydrate` — 12 files, 28 passed, 1 expected fail.
- `vp check --fix` on owned files — pass. `git diff --check` on owned files — clean.
- `vp run docs:generate` — blocked: ticket #248 `status must equal the last history state` (concurrent lane). Did not edit #248.
- Certified Playwright: `vp run build` and `apps/comparison` `vp run build` passed (88 pages). Then
  `npx playwright test e2e/certified/{combobox,picker,menu,actionmenu}.certified.spec.ts --workers=2 --reporter=line`
  started 168 tests. First 6 (D1 ActionMenu/ComboBox size-s/m × dark/light) all failed at
  `apps/comparison/e2e/comparison-page.ts:33` `await document.fonts.ready` —
  `Test timeout of 120000ms exceeded` / `Error: page.evaluate: Test timeout of 120000ms exceeded.`
  Page snapshot showed the component shell mounted; this is a font-load hang, not overlay opacity.
  Aborted the remaining 162 so they would not each burn 120s on the same hang.
  MCP overlay proof on the fresh 4322 preview (skips `fonts.ready`):
  - ActionMenu (this ticket's styled popover): open-sync `opacity:0` `translate:0px -4px`
    `transitionDuration:0.2s` with two running `CSSTransition` 200ms (enter flag already
    flipped — RAC CSS-transition model); settled `opacity:1` `translate:0px` at
    `top:468px; left:518px`; close `data-exiting` held through rAF with running
    200ms transitions; unmounted by 250ms.
  - ComboBox list (concurrent #252 styles): settled `data-trigger=ComboBox`
    `data-placement=bottom` `opacity:1` at `top:534px; left:373px`, 3 options.
    Computed `transitionDuration:0s` / `getAnimations=[]`, so exit unmounts next
    rAF (RAC no-animation branch). Motion tokens live on `popoverStyles` /
    `menuPopover`; ComboBox's overlay class is outside this ticket.
