---
id: 428
type: task
title: "Apply live StepList isDisabled, isReadOnly, and disabledKeys without remount"
created: 2026-09-03
parent: 24
status: verified
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 steplist functional pass: URL remount of isDisabled/isReadOnly/disabledKeys matches AX and Tab skip; live comparison:controls-change updates data-comparison-control-props on both and leaves Solid aria-disabled/tabIndex on the mount snapshot so Tab still lands on Details. createStepListState(stateProps()) is a one-shot snapshot. Live defaultSelectedKey ignored on both (uncontrolled). Did not start #254",
    }
  - {
      state: in-progress,
      at: 2026-09-04,
      note: "SAC createStepListState(stateProps()) is a one-shot snapshot. Pass staying-mounted getters; splitProps local.isDisabled is live only if re-read inside those getters. Do not start #99, #177, or #254.",
    }
  - {
      state: merged,
      at: 2026-09-04,
      note: "createStepListState receives staying-mounted getters. Package tests fail if live isDisabled leaves Details without aria-disabled or Tab lands on Details, if live isReadOnly leaves a progress step enabled, or if live disabledKeys=details moves selection.",
    }
  - {
      state: verified,
      at: 2026-09-04,
      note: "independent review APPROVE at 1a02e886; staying-mounted getters into createStepListState. Tester SAC live its pass.",
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

Local (2026-09-04), cwd `/home/emoporemilio/projects/viviana-hub/ui`,
parent `507411a3`. Source: SAC `StepList` passes a staying-mounted
object with getters into `createStepListState`. Fixture stays
mounted with `createSignal` accessors set after mount.

Named tests failed on the `stateProps()` unwrap (Details
`aria-disabled` stayed omitted). After the getters:

`vp test run packages/solidaria-components/test/StepList.test.tsx`
PASS (27): live `isDisabled` sets Details `aria-disabled` and drops
tabindex so Tab Before→After; live `isReadOnly` on progress disables
all four and keeps Select offers current; live `disabledKeys=details`
disables Details in place (still current). Mount disabled / read-only
/ disabledKeys stayed green.

Owned-file `vp check` PASS. `git diff --check` PASS on named paths.
Repo-wide `vp run check` not run. Comparison walk not run. #99 / #177
/ #254 not started.

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
