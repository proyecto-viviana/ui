---
id: 270
type: task
title: "Open the ComboBox menu on focus when menuTrigger is focus"
created: 2026-09-03
parent: 24
status: in-progress
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
  - {
      state: in-progress,
      at: 2026-09-15,
      note: "S2 ComboBoxListBoxPopover keeps the overlay open on input focus when menuTrigger=focus. Solid createOverlay's extra document focusin closer dismissed the list while the input stayed focused; RAC useOverlay has no such listener. Named-path workaround: shouldCloseOnInteractOutside returns false for the trigger/input/button. Package tests cover pointer, Tab, and controlled selectedKey+inputValue. playwright: not run (Chromium missing). Comparison route not claimed green.",
    }
  - {
      state: in-progress,
      at: 2026-09-15,
      note: "Comparison walk on :4322 /components/combobox/?menuTrigger=focus: Tab and pointer click both open React and Solid with aria-expanded=true, input focused, 3 options. Package tests already cover pointer, Tab, and controlled selectedKey+inputValue. Not verified.",
    }
  - {
      state: in-progress,
      at: "2026-09-16",
      note: "Owner-gated morning stop. menuTrigger=focus walked locally, not verified. Do not land combobox-menu-trigger.spec.ts. Successor work is #245, not remainder closeout.",
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
