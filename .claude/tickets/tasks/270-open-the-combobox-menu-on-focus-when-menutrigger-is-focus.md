---
id: 270
type: task
title: "Open the ComboBox menu on focus when menuTrigger is focus"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 combobox functional pass: Tab and pointer click both open the React overlay and leave the Solid input focused with aria-expanded=false",
    }
  - {
      state: open,
      at: 2026-09-03,
      note: "createComboBoxState.setFocused already opens on menuTrigger=focus; headless ComboBox.test.tsx covers click-to-open. Comparison route still needs a preview walk before close.",
    }
---

S2 ComboBox `menuTrigger="focus"` must open the list on input focus (Tab or
pointer), the same as RAC `useComboBoxState.setFocused`. Solid focuses the
input and leaves the overlay closed.

Headless `ComboBox.test.tsx` already expects this (`should open on input
focus with menuTrigger=focus`). The comparison S2 route does not.

## Evidence

`http://127.0.0.1:4341/components/combobox/?menuTrigger=focus` — one panel
at a time, `data-islands-mounted`, hide the other panel.

Tab from the canvas into the input, and a direct click on the input:

- React: `aria-expanded=true`, overlay present, opacity 1, 3 options,
  `aria-activedescendant` Pro, `data-placement=bottom`.
- Solid: input focused, `aria-expanded=false`, overlay absent.

`createComboBoxState.setFocused` already calls `open(null, "focus")` when
`menuTrigger() === "focus"` and not read-only
(`packages/solid-stately/src/combobox/createComboBoxState.ts`). The S2
wrapper forwards `menuTrigger` through rest `headlessProps`
(`packages/solid-spectrum/src/combobox/index.tsx`). The miss is on the S2
comparison path, not the documented state branch.

## Done when

Tab or click into the comparison ComboBox with `menuTrigger=focus` opens
the same 3-option overlay as React. A package or comparison test fails if
the Solid input is focused and `aria-expanded` stays false.

## Relationship

Child of #24. Found by #260. Distinct from #271 (ArrowDown under
`menuTrigger=manual`) and from default `menuTrigger=input`, which does not
open on focus on either stack. Do not start #254.
