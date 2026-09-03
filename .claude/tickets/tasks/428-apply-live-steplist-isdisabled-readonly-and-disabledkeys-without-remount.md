---
id: 428
type: task
title: "Apply live StepList isDisabled, isReadOnly, and disabledKeys without remount"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 steplist functional pass: URL remount of isDisabled/isReadOnly/disabledKeys matches AX and Tab skip; live comparison:controls-change updates data-comparison-control-props on both and leaves Solid aria-disabled/tabIndex on the mount snapshot so Tab still lands on Details. createStepListState(stateProps()) is a one-shot snapshot. Live defaultSelectedKey ignored on both (uncontrolled). Did not start #254",
    }
---

StepList `isDisabled`, `isReadOnly`, and `disabledKeys` update on URL
remount. A live `comparison:controls-change` after mount updates the
react-aria hook oracle and leaves Solid on the first-paint
selectability.

The Solid fixture already exposes those props as getters off
`demoProps()` and stamps the new values on
`data-comparison-control-props`. Headless `StepList` builds
`stateProps` as a memo then calls `createStepListState(stateProps())`
once, so `isDisabled` / `isReadOnly` / `disabledKeys` stay the
mount snapshot. `createStepListState` reads `props.isDisabled` off
that object.

URL remount of the same props already matches. Live
`defaultSelectedKey` / `defaultLastCompletedStep` stay at rest on
both (uncontrolled defaults).

## Evidence

`http://127.0.0.1:4341/components/steplist/`, islands mounted.
Other `.s2-framework-panel` `visibility:hidden` + `inert`.

URL remount already matches: `?isDisabled=true` (with
`defaultSelectedKey=select-offers`) AX all four links `[disabled]`,
Tab Before → After; `?isReadOnly=true` same skip; `?disabledKeys=details`
selects Select offers, Details `[disabled]`, Tab lands on Select
offers.

From a fresh default route, live `{isDisabled:true}`:

|                         | React                                  | Solid                           |
| ----------------------- | -------------------------------------- | ------------------------------- |
| props `isDisabled`      | true                                   | true                            |
| Details `aria-disabled` | true, no tabindex                      | **omitted, tabindex 0**         |
| AX Details              | `link "1 Current: Details" [disabled]` | **`link "1 Current: Details"`** |
| Tab from Before         | After                                  | **Details**                     |

Live `{isReadOnly:true}` on the progress-like URL (selected Select
offers, lastCompleted Details): React disables all four; Solid
leaves Details and Select offers enabled.

Live `{disabledKeys:"details"}` from default: React disables Details
in place (still current; does not move selection the way a remount
does). Solid leaves Details enabled.

## Done when

Live `isDisabled` / `isReadOnly` / `disabledKeys` after mount set
`aria-disabled` and drop tabindex the way the hook oracle does, so
AX `[disabled]` and Tab skip match without a remount. URL remount
stays matched. A comparison walk fails if Solid Tab from Before
lands on Details after live `isDisabled`. Do not start #254.

## Relationship

Child of #24. Found by #260. Same one-shot `stateProps()` snapshot as
other live-stale collection props; distinct from #386 (ActionGroup
native `disabled` on items) and #420 (Tabs fixture `hc` unwrap).
Distinct from #427 (click/Enter selection). Distinct from #85 (no
modeled control form; this pass dispatched the event). Do not start
#254.
