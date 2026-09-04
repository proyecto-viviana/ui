---
id: 272
type: task
title: "Close the ComboBox menu on Enter with a custom value"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 combobox functional pass: with allowsCustomValue, typing Zebra then Enter commits the text on both stacks but Solid leaves the overlay open",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "Enter always calls state.commit() while matching RAC useComboBox. Custom value with no focused key closes the menu.",
    }
---

With `allowsCustomValue`, a custom string that matches no option must
commit on Enter and close the menu (RAC `commitCustomValue`, journey
SEL013). Solid keeps the typed text and the form value, then leaves the
list open because Enter only calls `commit()` when a focused key exists.

Typing a custom value clears `focusedKey` (input-change effect in
`createComboBoxState`). Enter then no-ops.

## Evidence

`http://127.0.0.1:4341/components/combobox/?allowsCustomValue=true&inputValue=&selectionSource=defaultSelectedKey&inputSource=defaultInputValue&selectedKey=starter`
— one panel at a time. Clear the input, type `Zebra`, press Enter:

- React: `aria-expanded=false`, overlay absent, input `Zebra`.
- Solid: `aria-expanded=true`, overlay present opacity 1, 3 options, input
  `Zebra`. Both form `plan=Zebra` (`formValue` forced to text).

Blur of a custom value (`CustomPlan` then body click) closes both overlays
and keeps the text; that path is not this ticket.

`packages/solidaria/src/combobox/createComboBox.ts` Enter:

```
if (state.isOpen() && focusedKey != null) {
  state.commit();
}
```

RAC `useComboBox` calls `state.commit()` on Enter whenever the menu is
open (preventDefault only while open; closed Enter still commits and may
submit). `createComboBoxState.commit()` already routes a null focused key
to `commitValue()` → `commitCustomValue()`.

## Done when

Enter on a custom string closes the comparison ComboBox overlay, keeps the
typed text, and matches React. A test fails if the list stays open after
Enter with `focusedKey == null` and `allowsCustomValue`.

## Relationship

Child of #24. Found by #260. Distinct from #245 (fixture `items` so typing
does not filter on either stack).
