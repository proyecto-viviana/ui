# Button Family Validation Notes

This pass covers the complete Button family, including the standalone Button
backfill plus the family entries: `ActionButton`, `ActionButtonGroup`,
`ButtonGroup`, `LinkButton`, `ToggleButton`, and `ToggleButtonGroup`.

## Target

- Component family: Button family
- Slugs: `button`, `actionbutton`, `actionbuttongroup`, `buttongroup`,
  `linkbutton`, `togglebutton`, `togglebuttongroup`
- Date: 2026-05-14
- Goal: close family-level source/API gaps that were hidden by route existence
  and non-strict visual assertions.

## Task Status

| Task                   | Status | Evidence                                                                                                                                                                                                                                                                     | Remaining                                                           |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 0 Research             | done   | React Aria `Button`, `ToggleButton`, `ToggleButtonGroup`; S2 `Button`, `ActionButton`, `ActionButtonGroup`, `ButtonGroup`, `LinkButton`, `ToggleButton`, `ToggleButtonGroup`; APG Button pattern; upstream source; route controls; live viewer `staticColor` canvas behavior | None for Button-family docs/viewer/source scope                     |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, `guard:rac-export-gap`                                                                                                                                                                                                | None for this pass                                                  |
| 2 Route harness        | done   | Family slugs and visual specs found; contract gate fixed for ActionButton `iconPlacement`; `staticColor` black/white viewer backdrop represented for both stacks                                                                                                             | Keep direct pair-diff checks as the visual gate                     |
| 3 Source map/API       | done   | Source files listed below                                                                                                                                                                                                                                                    | None found for Button-family-owned API                              |
| 4 Cross-layer audit    | done   | Upstream S2 files compared against Solid family wrappers, support contexts, lower headless primitives, and route controls. Source Branch Coverage ledger added below                                                                                                         | Standalone support components still need their own component passes |
| 5 Transitions          | done   | Hover, pressed, focus-visible, pending, selection, group orientation, overflow visual/control specs ran with exact current pair checks                                                                                                                                       | None for this pass                                                  |
| 6 State                | done   | ToggleButtonGroup lower state path is headless Solidaria `ToggleButtonGroup`                                                                                                                                                                                                 | None found in this pass                                             |
| 7 ARIA hooks           | done   | ActionButtonGroup now uses headless `Toolbar`; ToggleButtonGroup remains headless group-backed                                                                                                                                                                               | No family-specific ARIA hook change beyond Toolbar                  |
| 8 Headless             | done   | Context inheritance, context/local ref merging, and Toolbar keyboard behavior covered in unit tests                                                                                                                                                                          | None found in this pass                                             |
| 9 Styled S2            | done   | Missing family contexts and Button-owned support child contexts added/exported/consumed                                                                                                                                                                                      | Standalone support-component parity is outside this family pass     |
| 10 Runtime lifecycle   | done   | Focused family context tests, family contract, build, typecheck                                                                                                                                                                                                              | None for this pass                                                  |
| 11 Harness integrity   | done   | Per-side committed snapshot assertions removed from focused visual helpers/specs; obsolete PNG baselines deleted and report wording moved to current visual evidence                                                                                                         | None                                                                |
| 12 Comparison evidence | done   | Contract green, including `staticColor` viewer backdrop; focused Button plus family visual/control specs now cover 141 tests with exact current React/Solid pair checks                                                                                                      | None for this pass                                                  |
| 13 Acceptance          | done   | API/context, behavior, official docs/viewer surface, source branch coverage, current pair-diff evidence, and report matrix are strict for Button-family-owned rows                                                                                                           | Support components keep separate component passes                   |

## Sources

- Upstream S2 source:
  - `@react-spectrum/s2/src/ActionButton.tsx`
  - `@react-spectrum/s2/src/ActionButtonGroup.tsx`
  - `@react-spectrum/s2/src/Button.tsx`
  - `@react-spectrum/s2/src/ButtonGroup.tsx`
  - `@react-spectrum/s2/src/ToggleButton.tsx`
  - `@react-spectrum/s2/src/ToggleButtonGroup.tsx`
  - `@react-spectrum/s2/src/pressScale.ts`
  - `@react-spectrum/s2/src/useSpectrumContextProps.ts`
  - `@react-spectrum/s2/src/Avatar.tsx`
  - `@react-spectrum/s2/src/Image.tsx`
  - `@react-spectrum/s2/src/NotificationBadge.tsx`
  - `@react-spectrum/s2/src/Skeleton.tsx`
  - `@react-spectrum/s2/src/Content.tsx`
- Solid source:
  - `packages/solid-spectrum/src/button/ActionButton.tsx`
  - `packages/solid-spectrum/src/actionbuttongroup/index.tsx`
  - `packages/solid-spectrum/src/buttongroup/index.tsx`
  - `packages/solid-spectrum/src/button/Button.tsx`
  - `packages/solid-spectrum/src/button/LinkButton.tsx`
  - `packages/solid-spectrum/src/button/ToggleButton.tsx`
  - `packages/solid-spectrum/src/togglebuttongroup/index.tsx`
  - `packages/solid-spectrum/src/button/context.ts`
  - `packages/solid-spectrum/src/button/group-context.ts`
  - `packages/solid-spectrum/src/button/spectrum-context.ts`
  - `packages/solid-spectrum/src/avatar/index.tsx`
  - `packages/solid-spectrum/src/image/index.tsx`
  - `packages/solid-spectrum/src/intl/index.ts`
  - `packages/solid-spectrum/src/notificationbadge/index.tsx`
  - `packages/solid-spectrum/src/skeleton/index.tsx`
  - `packages/solid-spectrum/src/text/index.tsx`
  - `packages/solidaria-components/src/Toolbar.tsx`
- Documentation consulted:
  - React Aria `Button`, `ToggleButton`, `ToggleButtonGroup`
  - S2 `ActionButton`, `ActionButtonGroup`, `Button`, `ButtonGroup`,
    `LinkButton`, `ToggleButton`, `ToggleButtonGroup`
  - APG Button pattern

## Official Docs And Viewer Parity

| Component                          | Official surface checked                                                                                                                                                                                   | Comparison/control evidence                                                                                                                                      | Status                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Button                             | React Aria events, pending, link-button guidance, and API. S2 events, pending, API, and viewer props: `variant`, `fillStyle`, `size`, `staticColor`, `isDisabled`, `isPending`, icon/text composition      | `button` route controls, Button runtime tests, Button visual rows, pending progressbar tests, export reports, `staticColor` viewer backdrop contract             | covered                           |
| ActionButton                       | S2 events, pending, API, `Icon`/`Text`/`Avatar`/`Image`/`NotificationBadge` composition, and viewer props: `size`, `staticColor`, `isQuiet`, `isDisabled`, `isPending`, icon placement                     | `actionbutton` route controls, ActionButton visual rows, `staticColor` viewer backdrop contract, `ButtonFamilyContext.test.tsx` support-child context assertions | covered for family-owned behavior |
| LinkButton                         | React Aria link-button guidance. S2 API and viewer props: `href`, link attributes, `variant`, `fillStyle`, `size`, `staticColor`, `isDisabled`, icon/text composition                                      | `linkbutton` route controls, exact default visual case, `staticColor` viewer backdrop contract, shared Button/LinkButton context and `pressScale` source audit   | covered                           |
| ActionButtonGroup                  | S2 API and viewer props: `density`, `orientation`, `size`, `staticColor`, `isQuiet`, `isJustified`, `isDisabled`                                                                                           | `actionbuttongroup` route controls, group visual rows, `staticColor` viewer backdrop contract, headless `Toolbar` keyboard test                                  | covered                           |
| ButtonGroup                        | S2 overflow behavior, API, Button/LinkButton child composition, and viewer props: `orientation`, `align`, `size`, `isDisabled`                                                                             | `buttongroup` route controls, harness-only `wrapWidth` overflow case, exact overflow visual evidence                                                             | covered                           |
| ToggleButton                       | React Aria selection/API. S2 selection/API and viewer props: `size`, `staticColor`, `isQuiet`, `isEmphasized`, `isSelected`, `isDisabled`, icon placement                                                  | `togglebutton` route controls, exact default/selected visual rows, `staticColor` viewer backdrop contract, headless selected semantics tests                     | covered                           |
| ToggleButton docs `Avatar` mention | S2 docs list `Avatar` in ToggleButton composition                                                                                                                                                          | Upstream installed S2 source provides `SkeletonContext`, `TextContext`, and `IconContext`, but not `AvatarContext`; Solid follows source authority               | docs drift                        |
| ToggleButtonGroup                  | React Aria and S2 selection/API, `selectionMode`, controlled/default selected keys, disabled keys, `density`, `orientation`, `size`, `staticColor`, `isQuiet`, `isEmphasized`, `isJustified`, `isDisabled` | `togglebuttongroup` route controls, grouped visual rows, `staticColor` viewer backdrop contract, selection-mode tests through headless group                     | covered                           |

Route/viewer result: no Button-family-owned route control is missing for the
official docs surface checked in this pass. The official viewer also changes
the preview canvas for explicit `staticColor` values: `black` uses a lavender to
pink gradient and `white` uses a slate gradient. The live Button viewer exposes
`white`, `black`, and `auto` controls in that order, with no visible `none`
choice and no `staticColor` control selected by default. The comparison fixtures
now match that control surface and apply the backdrops to both React and Solid
panels when an explicit static color is selected. Support components exposed
through ActionButton composition are recorded as related-component follow-ups so
their standalone routes are validated in their own passes.

## Source Branch Coverage

| Layer               | Branches checked                                                                                                                                                                                                                                             | Result                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| State               | Plain Button, LinkButton, ActionButton, ActionButtonGroup, and ButtonGroup have no dedicated Stately branch. ToggleButton and ToggleButtonGroup selection state routes through headless Solidaria group/button primitives                                    | matched or not applicable                       |
| ARIA hooks          | Press lifecycle, keyboard and pointer activation, disabled/pending suppression, focus-visible, link activation, `aria-pressed`, group selection, toolbar arrow navigation                                                                                    | matched with focused unit and contract evidence |
| Headless components | RAC Button pending context, render-prop liveness, custom render, ProgressBar ID/name association, Link ref forwarding, ToggleButton selected state, ToggleButtonGroup selection, Toolbar behavior                                                            | matched                                         |
| Styled S2           | Public props/defaults, context consumption, `useSpectrumContextProps` equivalent, `UNSAFE_style`/`styles`, `pressScale`, pending spinner delay, overlay-open hover retention, group contexts, ButtonGroup resize/overflow, icon/text/support-child providers | matched for Button-family-owned behavior        |
| Comparison routes   | Official route presence, viewer controls, defaults, exact current React/Solid pair diffs, reports, export guards                                                                                                                                             | matched                                         |
| Support children    | `Avatar`, `Image`, `NotificationBadge`, `Skeleton`, and `Text` only audited as Button-family children                                                                                                                                                        | deferred to standalone component passes         |

## Interaction Dependency Map

| Subpart                          | Upstream input                               | Observable output                                | Minimal proof                                                                                     | Status   |
| -------------------------------- | -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- | -------- |
| Button pending spinner           | `isPending` plus `staticColor`               | nested `ProgressCircle` track/fill stroke colors | computed circle-stroke contract across default, white, black, auto, variant, and fillStyle deltas | matched  |
| ActionButton pending spinner     | `isPending` plus `staticColor` and `isQuiet` | nested `ProgressCircle` track/fill stroke colors | computed circle-stroke contract across default, white, black, auto, quiet and non-quiet deltas    | matched  |
| Button-family staticColor viewer | explicit `staticColor` route value           | comparison canvas backdrop and static color CSS  | route/control contract plus exact pair evidence                                                   | matched  |
| ActionButton support children    | `staticColor`, `isDisabled`, size, pending   | Badge/Image/Avatar/Text/Skeleton child contexts  | Button-family context unit tests; standalone support-component passes remain separate             | deferred |

## Changes

- Added missing S2 family contexts and root exports:
  - `ActionButtonContext`
  - `ActionButtonGroupContext`
  - `ButtonGroupContext`
  - `ToggleButtonContext`
  - `ToggleButtonGroupContext`
- Added shared Solid context helpers for:
  - slotted context lookup;
  - `styles` merging through the S2 runtime;
  - `UNSAFE_style` merging;
  - context/local ref merging.
- Updated family wrappers to consume context props instead of only exporting
  context objects.
- Updated `ButtonGroup` to provide `ButtonContext` and `LinkButtonContext` to
  children, matching upstream S2 composition more closely than the previous
  private group context.
- Updated `ActionButtonGroup` to render through the headless `Toolbar`, adding
  arrow-key focus movement rather than relying on a plain `div role="toolbar"`.
- Updated `ToggleButton` to read `ToggleButtonGroupContext` rather than the
  ActionButton group context.
- Added Button-family support contexts and public exports that upstream S2 uses
  inside Button/LinkButton/ActionButton/ToggleButton:
  - `TextContext`
  - `AvatarContext`
  - `ImageContext`
  - `NotificationBadgeContext`
- Added internal `SkeletonContext` consumption/reset for Button-family
  composition. Upstream does not export `SkeletonContext` from the root package,
  so Solid keeps it internal as well.
- Added a minimal `NotificationBadge` implementation and S2 intl message bundle
  so ActionButton badge composition and pending labels use localized S2 strings.
- Added overlay-open hover retention for Button, LinkButton, and ActionButton
  when they own a Dialog or Popover trigger.
- Aligned `ActionButton` pressed-state styling with the shared S2 `pressScale`
  helper used by Button and LinkButton.
- Aligned `ToggleButton` pressed-state styling with the same shared S2
  `pressScale` helper so all Button-family press transforms use one
  implementation.
- Added exact default visual cases for LinkButton, ToggleButton,
  ActionButtonGroup, ButtonGroup, and ToggleButtonGroup.
- Added pointer-state screenshot helpers so hover/press captures prepare the
  target in its final capture position. ActionButton uses in-place capture; the
  standalone Button row uses fixed-before-prepare capture.
- Added comparison-route `staticColor` viewer backdrops for Button,
  ActionButton, LinkButton, ToggleButton, ActionButtonGroup, and
  ToggleButtonGroup, matching the official S2 viewer canvas for explicit
  `black` and `white` values.
- Removed the leaked `staticColor=none` route-control option. The Button-family
  static color control now exposes `white`, `black`, and `auto` only, and the
  default route omits `staticColor` just like the live official viewer.
- Added Button-family contract assertions that the visible `staticColor`
  controls match the official options, that no `none` option is exposed, and
  that explicit static colors update both component styles and the comparison
  viewer backdrop.
- Replaced Button and ActionButton inline pending spinner SVGs with a shared
  S2 pending ProgressCircle equivalent, so `staticColor` reaches the spinner
  stroke styles the same way it does upstream.
- Backfilled pre-pass findings into the support-component notes for Avatar,
  Image, NotificationBadge, Skeleton, and Text.
- Fixed the comparison contract's ActionButton expected props to include
  `iconPlacement: "none"`, matching both fixture implementations.

## Evidence

- StaticColor viewer backdrop backfill:
  - Official S2 viewer behavior checked on 2026-05-14 for Button,
    ActionButton, LinkButton, and ToggleButton pages. Explicit `staticColor`
    values are viewer-environment states, not only component props: `black`
    uses `rgb(221, 214, 254)` to `rgb(251, 207, 232)`, and `white` uses
    `rgb(15, 23, 42)` to `rgb(51, 65, 85)`. The live Button viewer exposes
    `white`, `black`, `auto` with no `none` control and no selected staticColor
    by default.
  - `vp run check`: passed.
  - `vp run comparison:build`: passed.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-family-contract.spec.ts --reporter=line`:
    14 passed.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts --reporter=line`:
    141 passed.
- Current backfill rerun after the docs/viewer and source-coverage audit:
  - `vp run check`: formatting, lint, and `tsc --noEmit` passed.
  - `vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/Button.test.tsx`:
    2 files, 45 tests passed.
  - `vp run comparison:report:gaps`: no Button-family-owned entries appear in
    the missing/gap or non-strict pair-diff lists.
  - `vp run comparison:report:exports`: `solid-spectrum` value exports are 122;
    Button-family contexts and Button-owned support contexts targeted by this
    pass remain absent from the missing export list.
  - `vp run guard:rac-export-gap`: missing in `solidaria-components`: none.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-family-contract.spec.ts --reporter=line`:
    14 passed.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/single-button-controls-visual.spec.ts --grep "LinkButton primary fill colors" --repeat-each=10 --reporter=line`:
    10 passed. This was rerun after a one-off 2-channel LinkButton color guard
    mismatch in the first full visual run.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts --reporter=line`:
    141 passed.
- `vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/Button.test.tsx`
  - 2 files, 45 tests passed.
- `vp run check`
  - format, lint, and `tsc --noEmit` passed.
- `vp run comparison:report:exports`
  - `solid-spectrum` value exports were 123 at the time of the earlier family
    pass; the current backfill rerun reports 122.
  - Button-family contexts and the Button-owned support contexts targeted in
    this pass no longer appear in the missing export list.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-family-contract.spec.ts --reporter=line`
  - 14 passed.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts --reporter=line`
  - Before snapshot-gate removal: 63 passed, 19 failed; all failures were
    committed React-side snapshot mismatches after pair diff checks had already
    run.
  - After route-ready waits, pending-indicator waits, default family cases, and
    exact pair checks across all focused family visual rows: 95 passed.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts --reporter=line`
  - 141 passed.
- Pending spinner static-color backfill:
  - `vp run --filter @proyecto-viviana/solid-spectrum build`: passed.
  - `vp run --filter @proyecto-viviana/comparison build`: passed.
  - `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts -g "pending ProgressCircle colors" --reporter=line`:
    2 passed.
  - `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts --reporter=line`:
    103 passed.
- Snapshot hygiene:
  - no comparison acceptance spec/helper still calls Playwright committed
    screenshot APIs;
  - obsolete `apps/comparison/e2e/*-snapshots/*.png` baselines were deleted;
  - catalogue/report wording now counts current React/Solid visual evidence
    rather than committed per-side screenshot files.
- Harness diagnostic:
  - exact forced comparison initially exposed only ActionButton pending and
    pressed-state gaps;
  - pending was a delayed-spinner capture race;
  - pressed was a harness invalidation: normalized capture moved the canvas
    during pointer press, causing React to drop `data-pressed` while Solid kept
    it. Pointer-state captures now prepare the target in its final capture
    position and are exact.

## Remaining Gaps

- Avatar, Image, NotificationBadge, Text, and Skeleton were touched only enough
  to satisfy Button-family composition. Their standalone S2 component routes and
  visual/API parity remain separate component passes.
- S2 ToggleButton docs mention `Avatar` composition, but installed upstream S2
  source does not provide ToggleButton `AvatarContext`. This is tracked as docs
  drift rather than a Solid port gap.
