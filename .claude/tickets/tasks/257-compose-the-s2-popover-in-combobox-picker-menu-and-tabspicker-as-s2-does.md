---
id: 257
type: task
title: "Compose the S2 Popover in ComboBox, Picker, Menu and TabsPicker as S2 does"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by #251's live check: the ComboBox overlay has transitionDuration 0s because its popover style is a hand-copied fork of popoverStyles without the motion keys",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "compose solid-spectrum Popover in ComboBox, Picker, Menu, ActionMenu, TabsPicker; delete comboBoxPopover/pickerPopover/menuPopover/tabsPickerPopover; twins + tests + changeset",
    }
---

## Cause

S2 composes its own `Popover` inside every overlay-bearing component:
`s2/ComboBox.tsx:754`, `s2/Picker.tsx:84,465`, `s2/Menu.tsx:66` (only
`TableView.tsx:104` reaches for the RAC popover, for column menus). The S2
`Popover` (`s2/Popover.tsx:80-157,194`) is the single owner of the surface —
background, outline, radius, shadow — **and** the motion: `opacity`,
`translate ±4`, `transitionDuration 200ms`, keyed off `isEntering` /
`isExiting` / `placement`.

The port re-implements that surface per component on the headless popover:

- `solid-spectrum/src/combobox/index.tsx:348-372` `comboBoxPopover` +
  `:752-781` `<HeadlessPopover class={comboBoxPopover(...)}>` — no motion
  keys. #251's live check: settled list is opaque and placed, but computed
  `transitionDuration: 0s`, `getAnimations() === []`, so it pops and vanishes
  with no fade while S2 fades. This is one of the two ways the owner-reported
  "list appears somewhere else / transparent" symptom can show (#248).
- `picker/index.tsx:399` `pickerPopover` + `:649-678` — same fork.
- `menu/index.tsx:84,514` `menuPopover` — carries the motion tokens (copied),
  still a second source of the S2 popover surface.
- `tabs/TabsPicker.tsx` — three `HeadlessPopover` uses; S2 `Tabs` reaches the
  popover through `Picker`.
- `table/index.tsx` — matches S2's RAC-popover exception; leave as is after
  confirming against `TableView.tsx:104`.

Each copy has to be kept in sync with `popover/index.tsx:71-155`
`popoverStyles` by hand, which is exactly the ADR 0001 "one source" boundary
these components are crossing.

## Work

- ComboBox, Picker, Menu, TabsPicker render the `solid-spectrum` `Popover`
  (`popover/index.tsx`) with the same props S2 passes (`hideArrow`, `offset`,
  `placement`, `shouldFlip`, `UNSAFE_style` `--trigger-width`, `styles` for
  the component-specific additions such as `s2/ComboBox.tsx:759-770`'s
  min-width), and delete `comboBoxPopover`, `pickerPopover`, `menuPopover`
  and the per-component `HeadlessPopover` wiring. Whatever the S2 component
  adds on top goes through the same `styles` prop S2 uses, not a parallel
  surface style.
- Mirror into the `@proyecto-viviana/ui` twins (layer-boundary: NEW forks 0).
- Tests: the ComboBox/Picker/Menu popover element carries the same generated
  surface class prefix as a bare `Popover`, and its computed style contract
  has the S2 `transitionDuration` and `translate` while `data-entering` is
  set; `rg -n "HeadlessPopover" packages/solid-spectrum/src` returns only
  `popover/index.tsx` and `table/index.tsx`.

## Done when

`rg -n "comboBoxPopover|pickerPopover|menuPopover" packages` returns nothing;
the ComboBox and Picker D13 `motion`-class steps (CB-OV-05, PK-OV-04) pass
against React with the same phase sequence; certified ComboBox/Picker/Menu
D5/D6 counts unchanged or better.

## Relationship

Child of #136. Follows #251 (headless machinery) and the #248 step-0 lane
(which owns `combobox/index.tsx` / `picker/index.tsx` first). Decides one of
the two #248 hypotheses in the styled layer.

## Landed

Did not commit or stage. Changeset: `.changeset/s2-compose-popover-in-overlays.md`.
No Popover prop additions — `PopoverProps` already extends headless props
minus `class`/`style`/`children`; `hideArrow`, `padding`, `styles`,
`UNSAFE_style`, `trigger`, `triggerRef`, `isNonModal`, `autoFocus`, `offset`,
`crossOffset`, `placement`, `shouldFlip` already pass through. Pin
`scripts/upstream-pin.json` `@react-spectrum/s2@1.7.0` / `f56660b`.

- `react-spectrum/packages/@react-spectrum/s2/src/ComboBox.tsx:754-770` →
  `packages/solid-spectrum/src/combobox/index.tsx:651-672` (viviana-ui twin
  `:676`). `hideArrow`, `offset={menuOffset}`, `placement`, `shouldFlip`,
  `UNSAFE_style={{'--trigger-width': menuWidth ? …}}`, `padding="none"`,
  `styles={comboBoxMenuWidth}` (`:339`, S2 `:765-768` minWidth/width
  `--trigger-width`). Solid wiring: `trigger="ComboBox"`, `triggerRef`,
  `isOpen`/`onOpenChange`, `isNonModal`, `autoFocus={false}`.
- `react-spectrum/packages/@react-spectrum/s2/src/Picker.tsx:84,465-484` →
  `packages/solid-spectrum/src/picker/index.tsx:568-588`. Same hideArrow /
  padding none / offset / placement / shouldFlip; `crossOffset={isQuiet ? -12
: undefined}` (existing; no `RTLFlipOffset` added); `UNSAFE_style.width`
  when `menuWidth && !isQuiet`; `styles={pickerMenuWidth({isQuiet})}`
  (`:374`, S2 `:475-484`). Solid wiring: `trigger="Select"`.
- `react-spectrum/packages/@react-spectrum/s2/src/Menu.tsx:66,467-475` →
  `packages/solid-spectrum/src/menu/index.tsx:566` (MenuTrigger) and `:545`
  (submenu). `padding="none" hideArrow` + wrapping `menuFrame` (S2
  `wrappingDiv`). Submenu S2 `PopoverContext` `:795-798` (`hideArrow`,
  `offset:-2`, `crossOffset:-8`, `placement:'end top'`) passed on the
  Popover (`:545-554`). MenuTrigger S2 context `:765-771` (`offset` 0|8,
  `placement`, `shouldFlip`) passed at `:566-574`. ActionMenu
  `:439-447` same MenuTrigger props (`offset={8}`).
- `react-spectrum/packages/@react-spectrum/s2/src/TabsPicker.tsx:261-270` →
  `packages/solid-spectrum/src/tabs/TabsPicker.tsx:225-240`. `hideArrow`,
  `offset={6}`, `crossOffset={-12}`, `placement`, `shouldFlip`,
  `styles={tabsPickerMenuWidth}` (`:170`, S2 `:267-270`). Does **not** pass
  `padding="none"` (S2 default `'default'`).
- S2 exported `Popover` (`Popover.tsx:338-360`) strips `styles` /
  `UNSAFE_style` onto the inner div; `PopoverBase` (`:194-260`) paints
  `popover()` on the RAC surface and `zIndex: undefined`. Port already
  matched (`popover/index.tsx:238-309`). Component additions stay on
  `styles`/`UNSAFE_style`, never a parallel surface.
- `react-spectrum/packages/@react-spectrum/s2/src/TableView.tsx:104,1769`
  RAC `Popover` exception — `packages/solid-spectrum/src/table/index.tsx:46,1890`
  left alone. `rg -n "HeadlessPopover" packages/solid-spectrum/src` is only
  `popover/index.tsx` and `table/index.tsx`.

Deleted surface forks (HEAD line): `comboBoxPopover` combobox `:347`;
`pickerPopover` picker `:48`; `menuPopover` `menu/s2-menu-styles.ts:59-130`
(motion copy); `tabsPickerPopover` TabsPicker `:184` (viviana-ui twin had
glasselated `backdropFilter`/`borderRadius: panel` — now inherited from
viviana-ui `Popover`). `menu/s2-menu-styles.ts` keeps `menu` / `menuFrame` /
items.

Tests: `composes the S2 Popover surface, including entering motion, matching a
bare Popover` (ComboBox, Picker, Menu, ActionMenu);
`composes the S2 Popover surface on TabsPicker, including entering motion,
matching a bare Popover`. Assert overlay class tokens equal a sequential bare
`Popover hideArrow` (same `popoverStyles` call site) and contain
`popoverMotion({isEntering:true, placement:'bottom'})` tokens minus the
per-`style()` `-macro-dynamic-*` bag, as `Popover.test.tsx` does.
Red (motion keys stripped from `popoverStyles`): all five failed
`expected [ '-ICUGx-_pb17', …(23) ] to deeply equal ArrayContaining{…}`
missing `_Ia17`, `-_8PloMd-l17`, `__Ya17`, `YmenWad17`, `Xc17`.
Green: `vp test run` those five files — 5 passed, 112 passed.

Regression snapshots (`regression.test.tsx.snap`): Menu and ActionMenu only.
Diff: overlay `z-index: 100000` dropped (`Popover.tsx:243-247` /
`popover/index.tsx:285`); extra inner generated div (exported Popover
`innerDivStyle` + `menuFrame`). Classes stay `[generated]`. ComboBox/Picker
closed; Tabs snapshot is the tablist, not TabsPicker.

- `vp test run packages/solid-spectrum packages/viviana-ui`: Test Files 86
  passed (86); Tests 1092 passed | 1 expected fail (1093). No failure caused
  by this ticket.
- `vp run typecheck`: fail, not this ticket —
  `packages/solidaria-components/src/{GridList,Table,Tree}.tsx` `CollectionRoot`
  generic vs `unknown` (concurrent #256 virtualizer).
- `vp run guard:layer-boundary`: NEW forks: 0. `tabs/TabsPicker.tsx`
  re-synced diverged → identical (only divergence was the popover-surface
  fork). combobox/picker/menu remain frozen diverged; ActionMenu identical.
- `vp run guard:attribution-headers`: fail `[mismatch] packages/solidaria/src/index.ts`
  — concurrent solidaria, not a reviewed-local file this ticket edited.
  Orchestrator re-records.
- `vp run guard:upstream-test-parity`: suspects 154 → 155 (Δ+1). NEW
  `tabs|role|listbox` — `s2/TabsPicker.tsx:298` `<ListBox items={items}>`
  (RAC Select listbox). Did not write the baseline.
  - Orchestrator: the fact is backed by S2 source but asserted by no pinned S2
    Tabs test, so it is a Solid-only assertion by construction; absorbed with
    `--write-baseline --allow-growth 257` (growthLog entry dated 2026-09-02).
- `vp run test:ssr`: 12 files, 26 passed. `vp run test:hydrate`: 12 files,
  28 passed | 1 expected fail.
- Playwright not run (headless Chromium `requestAnimationFrame` never fires
  on this machine).
- `vp check --fix` owned files: pass. `git diff --check`: pass.

### Wave-3 regression — Picker `--trigger-width` (2026-09-02)

21 certified D1/D3/D8/D9/D10 failures: Solid list `186.172px` vs React
`192px` (size-s) and `202.156px` vs `208px` (size-m). Delta is a constant
~5.84px, not a wrong trigger element.

`HeadlessSelectContext.triggerRef()` is the `<button>` (`Select.tsx:817-820`,
Picker `HeadlessSelectTrigger ref={setTriggerEl}`). The querySelector
fallback is unused on the happy path.

Root cause: S2 `pressScale` applies `perspective(Npx) translate3d(0,0,-2px)`
while the trigger is pressed. `getBoundingClientRect().width` shrinks by
`N/(N+2)`: size-s `192 * 64/66 = 186.18`; size-m `208 * 69.33/71.33 =
202.18`. RAC measures in `useLayoutEffect` after pointer-up, so the
transform is gone. Solid `createEffect` can run on the pressed frame, and
`ResizeObserver` does not fire for CSS transforms.

Fix in headless Popover `updateTriggerWidth`: publish `offsetWidth` (layout
box), not the transformed rect. Unit tests: `--trigger-width` stays `192px`
when `getBoundingClientRect().width` is `186.172`; Picker overlay equals the
trigger button's `offsetWidth`. Changeset
`.changeset/popover-trigger-width-layout.md`.

Certified `picker` (Build/Preview 2, 2026-09-02 19:54): D1/D3/D8/D9/D10 list
and trigger cases **green** (the 21 `--trigger-width` checks). Remaining
picker red is D13 journeys (2) — step-0 `data-focus-visible` wrapper /
`aria-hidden` Dismiss / form-vs-template, owned by #209 / #248 / #254, not
this width fix.
