---
id: 257
type: task
title: "Compose the S2 Popover in ComboBox, Picker, Menu and TabsPicker as S2 does"
created: 2026-09-02
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "found by #251's live check: the ComboBox overlay has transitionDuration 0s because its popover style is a hand-copied fork of popoverStyles without the motion keys",
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
