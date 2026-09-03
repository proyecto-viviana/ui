---
id: 427
type: task
title: "Select a completed StepList step on click and Enter"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 steplist functional pass: progress URL remount AX/Tab 1→2→3→After match; click Details or Enter on Select offers moves React aria-current and leaves Solid on Fallback offer. Solid Spectrum DefaultStep preventDefault-only click, no Enter handler; Headless Step already has both. Space is a no-op on both (upstream link). Did not start #254",
    }
---

Clicking or pressing Enter on a selectable completed StepList step
selects it on the react-aria `useStepListItem` oracle and is a no-op
on Solid Spectrum `StepList`.

`useStepListItem` spreads `useSelectableItem` press onto the
`role="link"` and `useStepListState.setSelectedKey` completes the
predecessor when advancing. Solidaria-components `Step` already
`preventDefault`s click/Enter/Space and calls `state.setSelectedKey`
when `isSelectable`. The styled DefaultStep in
`packages/solid-spectrum/src/steplist/index.tsx` reimplements the
`<a>` with `onClick` `preventDefault` only and no keydown, and does
not render `HeadlessStep` / `createStep`.

URL rest, native-Tab order, disabled/readonly skip, and unreached
clicks already match. Space does not select on either stack.

## Evidence

`http://127.0.0.1:4341/components/steplist/?defaultSelectedKey=fallback-offer&defaultLastCompletedStep=select-offers`
— islands mounted. Other `.s2-framework-panel` `visibility:hidden`
+ `inert`.

Rest AX equal: Details/Select offers completed, Fallback offer
current, Summary disabled. Tab Before → Details → Select offers →
Fallback offer → After on both.

| action | React | Solid |
|---|---|---|
| click Details | `1 Current: Details`, step 3 Not completed, focus Details | **stays `3 Current: Fallback offer`**, Details stays Completed, focus Details |
| Tab to Select offers, Enter | `2 Current: Select offers`, step 3 Not completed | **stays `3 Current: Fallback offer`** |
| Tab to Select offers, Space | no-op, still Fallback offer | same |
| click Summary (unreached, force) | selection unchanged | same |

Default (only step 1 selectable) click/Enter/Space on Details is a
no-op both (already current). No overlay. No form `name`.

## Done when

A comparison walk on the progress URL selects the clicked or
Enter-activated completed step the way the hook oracle does, and
`aria-current="step"` plus the Current/Completed names move with it.
A walk fails if Solid stays on Fallback offer after click Details.
Do not start #254.

## Relationship

Child of #24. Found by #260. Distinct from #99 (container ArrowDown /
Home / End / typeahead; Tab already matches). Distinct from #428
(live `isDisabled` / `isReadOnly` / `disabledKeys`). Headless `Step`
already wires click/Enter; the styled DefaultStep does not use it.
Do not start #254.
