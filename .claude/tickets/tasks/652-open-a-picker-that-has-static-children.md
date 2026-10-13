---
id: 652
type: task
title: "Open a Picker that has static children"
created: 2026-10-12
parent: 33
priority: high
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Found while proving Picker onOpenChange for #641: a closed Picker with static PickerItem children never opens.",
    }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Both styled Pickers register static items beside the popover while closed; the reproduction passes in both skins.",
    }
  - {
      state: merged,
      at: 2026-10-13,
      note: "The registration copy painted a static section's styled Header beside the closed trigger; the styled Header now renders nothing there.",
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
placeholder: the collection is empty. The headless `SelectListBox` keeps a
registration copy of static children mounted while its list is closed, but
both styled Pickers render that component inside their Popover, which mounts
only while open. The select state, like upstream's `useSelectState`, refuses
to open an empty collection. So the collection is empty because the Picker is
closed, and the Picker stays closed because the collection is empty.

VisualMode passes `items` to every Picker today, so it does not hit this.

## Scope

Register static items while the Picker is closed, in the two styled Pickers
(`packages/solid-spectrum/src/picker/index.tsx`,
`packages/viviana-ui/src/picker/index.tsx`); the headless Select already does
it for its own list. No new public name, no dependency.

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

## Repair and proof — 2026-10-12

Each styled Picker now renders a registration copy of its static children
beside the Popover, under the probe context, whenever it has no `items`. The
copy inside the Popover registers through a context whose `unregisterItem`
does nothing, so closing the Popover does not withdraw the items the outer
copy holds.

Two cases in each of `packages/solid-spectrum/test/Picker.test.tsx` and
`packages/viviana-ui/test/Picker.test.tsx`:

- "opens from closed with static PickerItem children and reports the choice
  once": the closed trigger shows the default selection, the hidden select
  holds both items, a click opens the list with `onOpenChange(true)` once, a
  choice reports `multiply` once and updates the trigger, and Enter opens it
  again.
- "opens from closed with static PickerSection children": two groups, three
  options.

```bash
vp test run packages/solid-spectrum/test/Picker.test.tsx packages/viviana-ui/test/Picker.test.tsx
```

42 cases pass, the #43 `defaultOpen` cases among them. Before the repair the
first new case stops at the click: no listbox appears.

ComboBox with static children is #656.

## Section headers while closed — 2026-10-13

The registration copy this repair added sits beside the Popover, in the page.
The headless `Header` renders nothing in a registration copy, but the styled
`Header` (`src/text/index.tsx` in both styled packages) did not know about it:
a closed Picker with `<PickerSection><Header>Personal</Header>…` painted
"Personal" next to its trigger, in rc.2. The styled `Header` now returns
nothing under the registration context, as the headless one does.

The static-section case in both Picker test files now also asserts that no
section heading is in the document while the Picker is closed and exactly one
while it is open. It fails on the source before this change.
