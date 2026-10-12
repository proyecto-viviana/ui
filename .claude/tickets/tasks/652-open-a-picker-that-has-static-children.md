---
id: 652
type: task
title: "Open a Picker that has static children"
created: 2026-10-12
parent: 33
priority: high
status: open
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Found while proving Picker onOpenChange for #641: a closed Picker with static PickerItem children never opens.",
    }
---

## Cause

A Picker given static `PickerItem` children and no `items` cannot be opened
from closed, in either styled package:

```tsx
render(() => (
  <Picker aria-label="Blend mode" onOpenChange={onOpenChange}>
    <PickerItem id="normal">Normal</PickerItem>
    <PickerItem id="multiply">Multiply</PickerItem>
  </Picker>
));
await user.click(screen.getByRole("button", { name: /Blend mode/ }));
// aria-expanded stays "false"; no listbox; onOpenChange is never called.
// Enter on the focused trigger does the same.
```

The same Picker with `items` and a render function opens on the click and
calls `onOpenChange(true)` once. With `defaultOpen` the static children render
their options, which is the only shape the #43 tests cover.

While the Picker is closed its hidden `<select>` holds one option, the
placeholder: the collection is empty. #43 defers evaluating static children
until the listbox renders, and the select state, like upstream's
`useSelectState`, refuses to open an empty collection. So the collection is
empty because the Picker is closed, and the Picker stays closed because the
collection is empty.

VisualMode passes `items` to every Picker today, so it does not hit this.

## Scope

Build the collection from static children while the Picker is closed, in the
owner #43 chose (`packages/solidaria-components/src/Select.tsx`), without
breaking the slot contexts that made #43 defer. Both styled Pickers consume
the repair; ComboBox is checked for the same shape. No new public name, no
dependency.

## Done when

A closed Picker with static `PickerItem` children, and one with static
`PickerSection` children, opens on click and on Enter, reports
`onOpenChange(true)` once, shows its options, and reports a choice once. The
trigger shows the selected item's text while closed, including for
`defaultSelectedKey`. The hidden `<select>` holds one option per item while
closed. The #43 `defaultOpen` cases still pass.

## Proof

The reproduction above as a test in `packages/solid-spectrum/test/Picker.test.tsx`
and `packages/viviana-ui/test/Picker.test.tsx`, failing before the repair, plus
the headless Select case. Patch Changesets for the repaired packages.

## Relationship

Child of #33. Follows #43 (verified with `defaultOpen` only). Found by #641.
Related: #635 (one report per choice), #246 (Picker journeys).
