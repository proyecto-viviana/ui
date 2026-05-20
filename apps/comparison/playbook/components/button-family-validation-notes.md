# Button Family Validation Notes

Date: 2026-05-20
Status: accepted

Button family has now been normalized against the current acceptance gates. The
original 2026-05-14 family pass remains below as historical evidence; this
closeout records the current root API/DOM-contract parity fixes, refreshed
viewer API ledgers, and focused Button-family gates.

## Current-Gate Closeout

- Scope: `ActionButton`, `ActionButtonGroup`, `ButtonGroup`, `LinkButton`,
  `ToggleButton`, and `ToggleButtonGroup`. The direct `Button` root is closed in
  `button-validation-notes.md`; this note keeps the family-level composition and
  grouped-control contracts.
- Sources rechecked: React Spectrum S2 docs/API for every Button-family member,
  installed S2 source for the same components, React Aria Button/Link/
  ToggleButton/ToggleButtonGroup/Toolbar behavior, Solidaria headless sources,
  Solid Spectrum family wrappers, comparison controls, and focused package/e2e
  specs.
- Result: accepted for the Button-family-owned surface. Solid now keeps visual
  props class-driven like React S2, removes Solid-only root visual markers,
  preserves React Aria state/group markers where upstream emits them, and
  tracks the current documented prop ledgers in the comparison viewer.

## Acceptance Gate Checklist

- [x] Public API: comparison API ledgers match current S2 docs for
      ActionButton, LinkButton, ToggleButton, ActionButtonGroup, ButtonGroup,
      and ToggleButtonGroup, including missing ARIA/details/slot/id/form/link/
      press/focus props where documented.
- [x] Styled public types: ActionButton, LinkButton, and ToggleButton no longer
      expose styled-layer internals such as custom `render`, raw `onClick`, or
      hidden non-S2 headless props.
- [x] DOM contract: visual props remain class/computed-style inputs and do not
      leak Solid-only `data-size`, `data-static-color`, `data-quiet`,
      `data-emphasized`, `data-variant`, `data-style`, `data-density`,
      `data-requested-orientation`, or group disabled markers where React S2
      does not emit them.
- [x] React Aria state contract: valid upstream state markers remain intact,
      including press/hover/focus/disabled/selected attributes on controls and
      React Aria group orientation/disabled attributes where applicable.
- [x] Harness contract: focused Playwright gates compare root DOM attributes,
      viewer controls, computed/icon geometry, screenshot pairs, and interaction
      behavior against the React Spectrum stack.
- [x] Evidence handoff: visual-state matrix, component README normalization
      status, this note, focused unit tests, comparison build, e2e specs,
      reports, guards, check, and commit are refreshed for this pass.

## Agent Workflow

| Step                    | Status | Evidence                                                                                               |
| ----------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Research                | done   | Current S2 docs/API, installed S2 source, React Aria source/docs, Solid wrappers and headless sources  |
| Baseline and source map | done   | Existing family note, Button closeout, root-marker audit, comparison route/control audit               |
| Implementation          | done   | Family root attr cleanup, type narrowing, comparison API ledger refresh, matrix root-DOM rows          |
| Harness                 | done   | Unit attr assertions plus e2e root data attribute parity for single and grouped family components      |
| Verification            | done   | Focused package tests, comparison build, 125 focused Playwright tests, reports, guards, `vp run check` |
| Handoff                 | done   | README current-gate status, closeout note, clean worktree verification before commit                   |

## Behavior State Machine

- Stable states: default, disabled, pending where supported, selected where
  supported, icon-leading/icon-only content, documented size/staticColor/quiet/
  emphasized/fill/variant/density/orientation/justified options, and ButtonGroup
  overflow wrapping.
- Transient states: hover, pressed, focus-visible, ActionButton pending spinner,
  ToggleButton selected toggles, ToggleButtonGroup selection movement, and
  ActionButtonGroup toolbar keyboard navigation remain covered by focused unit
  and e2e specs.
- DOM cleanup contract: changing visual props must affect generated classes,
  computed styles, geometry, and screenshots, not Solid-only root marker
  attributes.
- Group contract: ActionButtonGroup mirrors React Aria Toolbar orientation
  output; ButtonGroup mirrors React S2's plain root with no group state data
  markers; ToggleButtonGroup mirrors React Aria group orientation/disabled
  output without S2-only density leakage.

## Accessibility And I18n

- Button-family controls retain React Aria press/focus semantics, disabled and
  pending behavior, link semantics, toggle `aria-pressed`, single-selection radio
  semantics, and group keyboard navigation.
- The API ledgers now include documented `aria-details` and other ARIA props for
  family members where S2 exposes them.
- Existing pending-label localization for Button and ActionButton remains
  covered through S2 intl strings.
- No bidirectional layout behavior changed in this pass; orientation behavior is
  asserted through React Aria/S2 group semantics and computed layout.

## Style Source-To-Computed

- React S2 drives Button-family visual props through generated classes and
  style branches, not public root visual-prop data attributes.
- Solid now follows that source-to-computed path for ActionButton, LinkButton,
  ToggleButton, ActionButtonGroup, ButtonGroup, and ToggleButtonGroup.
- The new `styled.root-dom-contract` matrix rows bind this source contract to
  `e2e/actionbutton-visual.spec.ts`,
  `e2e/single-button-controls-visual.spec.ts`, and
  `e2e/grouped-button-controls-visual.spec.ts`.
- Root data attributes that remain are upstream state or structural attributes,
  not Solid-only shortcuts for styling branches.

## Evidence And Caveats

- Current report refresh:
  - `comparison:report:gaps`: official entries `69`, live on both sides `47`,
    missing/gap `22`, visual states tracked `259`, visual evidence states `76`,
    strict pair-diff states `46`, blocked states `22`.
  - `comparison:report:exports`: React S2 value exports `208`,
    `solid-spectrum` public value exports `157`, missing React S2 value exports
    `57`, extra Solid exports `6`, missing catalogue root exports `0`.
  - `guard:rac-export-gap`: missing Solidaria Components RAC exports `0`.
  - `guard:rac-parity`: missing required/backlog tracked symbols `0`; tracker
    still warns that `TreeHeader` and `TreeSection` are absent from the RAC
    source index.
- Focused package tests:
  - `vp test run packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/ToggleButtonGroup.test.tsx packages/solid-spectrum/test/Link.test.tsx packages/solid-spectrum/test/Wave4Components.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx packages/solid-spectrum/test/Accordion.test.tsx packages/solid-spectrum/test/Disclosure.test.tsx`:
    7 files, 103 tests passed.
- Comparison/build/browser gates:
  - `vp run --filter @proyecto-viviana/comparison build`: passed.
  - `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts e2e/button-family-contract.spec.ts --reporter=line`:
    125 passed.
  - `vp run check`: formatting, lint, and `tsc --noEmit` passed.
- Caveat: standalone support components remain owned by their own component
  notes. This family pass only accepts how Button-family components compose
  Avatar, Image, NotificationBadge, Skeleton, Text, Link, and related support
  surfaces.

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

## Retro-Audit Against Current Playbook

| Gate                             | Status  | Finding                                                                                                                                                 |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 0-1 research/baseline      | matched | Docs, source, official viewer behavior, gap/export reports, and RAC export guard evidence are recorded.                                                 |
| Task 2 route harness             | matched | Family route controls, visible staticColor options/order/defaults, sentinel absence, and viewer backdrop behavior are asserted.                         |
| Tasks 3-4 source branch coverage | matched | The source branch ledger covers Button-family-owned API, context, support-child providers, route controls, and cross-component deferrals.               |
| Tasks 5-10 runtime/lifecycle     | matched | Hover, press, focus-visible, pending, selected, overflow, toolbar keyboard, staticColor, reduced-motion, and support-child context paths have evidence. |
| Tasks 11-13 evidence/sign-off    | matched | Full checks, builds, focused tests, report refreshes, failure taxonomy, and exact current React/Solid pair-diff evidence are recorded.                  |

Current acceptance boundary:

- Button-family-owned behavior is accepted under the current gate as of
  2026-05-20.
- Standalone support components are not accepted by family composition
  evidence. Use each component note as the authority for Avatar, AvatarGroup,
  Image, Skeleton, Text, NotificationBadge, Link, Badge, StatusLight, Meter,
  and Form.

## Remaining Gaps

- Avatar, AvatarGroup, Image, and Skeleton now have standalone focused passes,
  but their notes record release-hardening backfill gaps separately from
  comparison-live evidence.
- Text and NotificationBadge remain pre-pass only and must still receive full
  standalone S2 validation.
- S2 ToggleButton docs mention `Avatar` composition, but installed upstream S2
  source does not provide ToggleButton `AvatarContext`. This is tracked as docs
  drift rather than a Solid port gap.
