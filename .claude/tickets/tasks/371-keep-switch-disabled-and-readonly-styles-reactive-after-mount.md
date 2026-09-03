---
id: 371
type: task
title: "Keep Switch disabled and read-only styles reactive after mount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 switch functional pass: live isDisabled sets native input.disabled on both and Tab skips both, but Solid keeps enabled colors rgb(41,41,41) and omits data-disabled (React gray-400 rgb(198,198,198) + data-disabled). Live isReadOnly sets aria-readonly on both and click/Space are no-ops, but Solid omits data-readonly and still paints hover rgb(19,19,19). URL remount of the same props already matches. createToggle returns isDisabled/isReadOnly as one-shot booleans; SwitchField/SwitchButton read those for data-* and style render props while inputProps still re-reads",
    }
---

S2 Switch restyles the track, handle, and label when `isDisabled`
changes after mount, and it drops hover when `isReadOnly` becomes
true. Native `disabled` / `aria-readonly` already follow the live
prop on Solid. The painted control does not.

`createToggle` returns `isDisabled: isDisabled()`,
`isReadOnly: isReadOnly()`, and `isInvalid: isInvalid()` as booleans
captured when the hook object is created. `SwitchField` /
`SwitchButton` then set `data-disabled` / `data-readonly` and the
style-macro render props from `switchAria.isDisabled` /
`switchAria.isReadOnly`. `inputProps` is a getter, so the hidden
`<input>` updates. CheckboxField already re-reads
`inputProps().disabled` / `aria-readonly` and does not show this
live-paint hole.

URL remount `?isDisabled=true` and `?isReadOnly=true` already match.

## Evidence

`http://127.0.0.1:4341/components/switch/`, islands mounted. Other
`.s2-framework-panel` `visibility:hidden` + `inert`. Live
`comparison:controls-change` from the default route. Still stale at
800ms.

Live `{isDisabled:true}`:

|                               | React                | Solid             |
| ----------------------------- | -------------------- | ----------------- |
| `input.disabled`              | true                 | true              |
| `data-disabled`               | true                 | omitted           |
| track border / handle / label | `rgb(198, 198, 198)` | `rgb(41, 41, 41)` |
| Tab from Before               | After (skip)         | After (skip)      |
| force-click                   | stays unchecked      | stays unchecked   |

Live `{isReadOnly:true}`:

|                            | React                   | Solid                        |
| -------------------------- | ----------------------- | ---------------------------- |
| `aria-readonly`            | true                    | true                         |
| `data-readonly`            | true                    | omitted                      |
| click / Space              | no-op                   | no-op                        |
| pointer over / click hover | stays `rgb(41, 41, 41)` | darkens to `rgb(19, 19, 19)` |

`?isDisabled=true` remount: both gray-400, `data-disabled=true`.
`?isReadOnly=true` remount: both `data-readonly=true`, no hover
darken after click.

`packages/solidaria/src/toggle/createToggle.ts` return booleans.
`packages/solidaria-components/src/Switch.tsx` `SwitchField` /
`SwitchButton` `data-disabled` / `data-readonly` and render props.

## Done when

A live `isDisabled` switch on the comparison route paints gray-400
and sets `data-disabled` like S2. A live `isReadOnly` switch omits
hover darken and sets `data-readonly`. URL remount stays matched. A
walk fails if Solid looks enabled while `input.disabled` is true.

## Relationship

Child of #24. Found by #260. Distinct from #354 (Enter toggle on the
same hook) and from #121 (field `position: relative`). Checkbox live
disabled already matches via `inputProps().disabled`. RadioGroup
live disabled paint is #377 (`createRadio` one-shot `isDisabled`).
Do not start #254.
