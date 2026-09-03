---
id: 377
type: task
title: "Keep Radio disabled styles reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 radiogroup functional pass: live isDisabled sets native input.disabled and group aria-disabled/data-disabled on both and Tab skips both, but Solid radio labels omit data-disabled and keep circle border rgb(41,41,41) (React gray-400 rgb(198,198,198) + data-disabled on every label). URL remount of the same prop already matches. createRadio returns isDisabled as a one-shot boolean; Radio label data-* and style render props read radioAria.isDisabled while inputProps still re-reads",
    }
---

S2 RadioGroup restyles every radio circle and label when
`isDisabled` changes after mount. Native `disabled` already follows
the live prop on Solid. The painted radios do not.

`createRadio` returns `isDisabled: isDisabled()` as a boolean
captured when the hook object is created.
`packages/solidaria-components/src/RadioGroup.tsx` then sets
`data-disabled` and the style-macro render props from
`radioAria.isDisabled`. `inputProps` is a getter, so the hidden
`<input>` updates. The group node already re-reads
`state.isDisabled` and does not show this live-paint hole.

URL remount `?isDisabled=true` already matches.

## Evidence

`http://127.0.0.1:4341/components/radiogroup/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`. Live
`comparison:controls-change` from the default route.

Live `{isDisabled:true}`:

|                                         | React                | Solid             |
| --------------------------------------- | -------------------- | ----------------- |
| `input.disabled`                        | true                 | true              |
| group `aria-disabled` / `data-disabled` | true                 | true              |
| each label `data-disabled`              | true                 | omitted           |
| circle border                           | `rgb(198, 198, 198)` | `rgb(41, 41, 41)` |
| Tab from Before                         | After (skip)         | After (skip)      |
| force-click                             | stays starter        | stays starter     |

`?isDisabled=true` remount: both gray-400, label
`data-disabled=true`. Live `isReadOnly` already matches.

`packages/solidaria/src/radio/createRadio.ts` return boolean.
`packages/solidaria-components/src/RadioGroup.tsx` Radio
`data-disabled={radioAria.isDisabled || undefined}` and
`renderValues.isDisabled`.

## Done when

A live `isDisabled` RadioGroup on the comparison route paints
gray-400 circles and sets `data-disabled` on every radio label like
S2. URL remount stays matched. A walk fails if Solid looks enabled
while `input.disabled` is true.

## Relationship

Child of #24. Found by #260. Distinct from Switch #371
(`createToggle` one-shot booleans on SwitchField) and from URL
disabled (already equivalent). Do not start #254.
