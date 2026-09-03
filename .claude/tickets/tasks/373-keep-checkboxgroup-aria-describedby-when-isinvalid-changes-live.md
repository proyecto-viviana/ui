---
id: 373
type: task
title: "Keep CheckboxGroup aria-describedby when isInvalid changes live"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 checkboxgroup functional pass: URL ?isInvalid=true threads errorMessage onto group and every child input on both; live isInvalid after mount swaps the visible HelpText slot on both (not #345) and drops Solid aria-describedby to null on the group and all three inputs. Live off from invalid leaves Solid description visible with describedby still null. React retargets description id ↔ error id",
    }
---

S2 CheckboxGroup retargets `aria-describedby` on the group and every
child input when `isInvalid` changes after mount: description id
while valid, error id while invalid.

Solid Spectrum CheckboxGroup swaps the visible HelpText slot on a
live `comparison:controls-change` (description unmounts, error
mounts, and back), but the group and all three inputs lose
`aria-describedby` entirely. URL remount of the same invalid or
valid props already matches.

`createCheckboxGroup` already keeps `createField` getters (a
destructure freeze was the previous hole). The live drop is the
group `fieldProps` / `checkboxGroupData` ids not being reapplied
onto the group node and items after the HelpText `<Show>` remounts
the slot.

## Evidence

`http://127.0.0.1:4341/components/checkboxgroup/`, islands mounted.

Default rest: both `aria-describedby` → `slot=description`
`Select notification channels.` on the group and Email/SMS/Push.

Live `{isInvalid:true}`:

| | React | Solid |
|---|---|---|
| visible slot | errorMessage `Select at least one channel.` | same |
| field | 69×201 | 69×201 |
| group `aria-describedby` | error id | null |
| each input `aria-describedby` | error id | null |
| `aria-invalid` | true on all three | true on all three |

Live `{isInvalid:false}` after that: React describedby returns to
the description id. Solid keeps describedby null with the
description visible.

`?isInvalid=true` remount already threads the error id on both.

## Done when

A live `isInvalid` switch retargets Solid `aria-describedby` on the
group and every child input to the error slot (and back to
description), matching S2. A walk fails if that live switch leaves
Solid describedby null while the HelpText slot is on screen.

## Relationship

Child of #24. Found by #260. Distinct from #345 (visible HelpText
slot already swaps here) and from #70 (empty-error FieldError icon
row). Wiring is `packages/solidaria/src/checkbox/createCheckboxGroup.ts`
plus `packages/solid-spectrum/src/checkbox/index.tsx` HelpText
`<Show>`. Do not start #254.
