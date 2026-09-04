---
id: 265
type: task
title: "Disable the Picker trigger with the native disabled attribute"
created: 2026-09-03
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 picker functional pass: React trigger.disabled=true, Solid trigger is aria-disabled only and remains focusable",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "SelectTrigger uses native disabled like RAC useButton on a button. Package tests cover the trigger element.",
    }
---

With `isDisabled` on, S2 Picker's trigger is a native disabled `<button>`
(`disabled`, not in the tab order). Solid Picker sets `aria-disabled="true"`
on the trigger and leaves `disabled` unset, so the button stays focusable.
The hidden `<select>` is disabled on both stacks, and neither overlay opens
on click/Enter, but keyboard users can still land on the Solid trigger.

## Evidence

`http://127.0.0.1:4341/components/picker/?isDisabled=true`

- React trigger: `disabled === true`, `aria-disabled === null`.
- Solid trigger: `disabled === false`, `aria-disabled === "true"`.
- Both hidden `select[name=plan]` are `disabled`.
- Force-click / Enter: both stay `aria-expanded="false"`, no listbox.

`packages/solidaria-components/src/Select.tsx` `SelectTrigger` (~876–882):
`tabIndex={state.isDisabled ? undefined : 0}` and
`aria-disabled={state.isDisabled || undefined}` — no `disabled={...}`.
`createSelect.ts` triggerProps does the same (`aria-disabled`, no native
`disabled`). RAC `useButton` on a native `<button>` sets `disabled`.

## Done when

A disabled Picker trigger on the comparison route matches React: native
`disabled`, not in the tab order, overlay stays closed. Package test covers
the trigger element, not only the hidden select.

## Relationship

Child of #24. Found by #260.
