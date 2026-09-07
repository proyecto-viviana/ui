---
id: 488
type: task
title: "Extend the reduced motion budget past the button family"
created: 2026-09-07
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-07,
      note: "enumerated out of #484, which deliberately closed only Button and ActionButton",
    }
---

#484 ruled that Viviana owns a stricter reduced-motion budget than pinned React
Spectrum, and applied it to Button and ActionButton. The token it corrects is
not unique to those two.

## Inventory

`transition: "default"` appears **120** times across the two public styled
packages — 61 in `@proyecto-viviana/ui`, 59 in `@proyecto-viviana/solid-spectrum`
— and none of them carries a reduced-motion condition. Nearest siblings, both
packages unless noted:

- `src/button/LogicButton.tsx:55`
- `src/button/ClearButton.tsx:65`
- `src/button/FieldButton.tsx:53`
- `src/button/s2-button-styles.ts:260` — `s2ButtonGradient`, solid-spectrum
  only; the packages have diverged here and the gradient layer still fades
  behind a Button whose foreground now snaps.

The rest spread across calendar, combobox, picker, menu, listbox, gridlist,
checkbox, radio, switch, link, card, dialog, breadcrumbs, steplist, and more.

## Why this is not a find-and-replace

Each site needs its own measurement before its contract can be pinned:

- The certified D2d gate falls back to React-equals-Solid pair equality for any
  trigger without an `expectedMotion` block. Suppressing a transition on the
  Solid side without pinning that component's contract turns its D2d test red —
  exactly what happened to ActionButton in #484 and had to be measured, not
  guessed.
- The exact property list differs per component and per case. `primary-outline`
  Button reports six properties; ActionButton reports two. Both at 150 ms, but
  the lists are not interchangeable.
- Only components that already carry certified motion coverage can be pinned at
  all. The others need a D2 trigger first, or they ship the fix unproven.

## Naming note

Most of these transitions are color-only, so "reduced motion" is a misnomer for
what the budget actually removes. #484 ruled deliberately on that point: the
budget is absolute — no nonessential transition and no nonzero-duration
animation under the media query — rather than a motion-property filter, because
the properties users actually observe changing on these components are colors.
A per-property filter would have closed #484 while changing nothing observable.

## Work

- Order the 120 sites by whether the component has certified motion coverage.
- For the covered set: measure, pin `expectedMotion`, apply the condition.
- For the uncovered set: decide whether a D2 trigger is warranted per component
  or whether the fix ships against a package-level unit assertion instead.
- Resolve the `s2ButtonGradient` package divergence separately; it is a
  `background-image` custom-property fade, not an interaction transition.

## Out of scope

- Re-litigating the #484 ruling. The policy and threshold are settled there.
- Publishing. That is #448 under #443.

## Relationship

Child of #24. Follow-up to #484, which enumerated this rather than widening
itself.
