---
id: 271
type: task
title: "Open the ComboBox menu on ArrowDown when menuTrigger is manual"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 combobox functional pass: with menuTrigger=manual, typing stays closed on both stacks, but ArrowDown opens React and leaves Solid closed",
    }
---

RAC `menuTrigger="manual"` suppresses open-on-type and still opens on
ArrowDown / ArrowUp (`open('first'|'last', 'manual')`) and on the chevron.
Solid matches the type-suppression and the chevron, then ignores ArrowDown.

Default `menuTrigger=input` ArrowDown opens on both stacks (D13
keyboard-only). The miss is specific to `manual`.

## Evidence

`http://127.0.0.1:4341/components/combobox/?menuTrigger=manual` — one panel
at a time.

Type `S` while focused: both stay `aria-expanded=false`, overlay absent
(prop is wired).

Click the input, press ArrowDown:

- React: overlay present, opacity 1, 3 options, activedescendant Pro.
- Solid: input focused, `aria-expanded=false`, overlay absent.

`createComboBox.ts` ArrowDown already calls `state.open("first", "manual")`
when closed (`packages/solidaria/src/combobox/createComboBox.ts`). Headless
`should open on ArrowDown` covers the default trigger only.

## Done when

ArrowDown on a focused comparison ComboBox with `menuTrigger=manual` opens
the full list to match React. Typing still does not open. A regression test
fails if ArrowDown leaves `aria-expanded=false`.

## Relationship

Child of #24. Found by #260. Distinct from #270 (`menuTrigger=focus` does
not open on Tab/click).
