# Button Validation Notes

Button is the first component run through the restructured playbook as a real
validation pass. This file records the sources consulted, layer-by-layer audit,
code changes, tests, and remaining acceptance blockers.

## Target

- Component: Button
- Slug: `button`
- Family or direct subcomponents: Button, plus Button-owned support in
  `LinkButton` where S2 shares `pressScale` and context exports.
- Related but out of direct acceptance scope: `ActionButton`, `ButtonGroup`,
  `ToggleButton`, and `ToggleButtonGroup`.
- Pass goal: validate Button across ARIA hooks, headless RAC parity, styled S2
  parity, runtime state transitions, comparison harness evidence, and docs.
- Date: 2026-05-13

## Task Status

| Task                   | Status | Evidence                                                                                                                                             | Blocker or next action                                                |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 0 Research             | done   | React Aria Button docs, S2 Button docs, APG Button pattern, Button blog series                                                                       | None for this pass                                                    |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, `guard:rac-export-gap`                                                                        | Before/after export counts recorded below                             |
| 2 Route harness        | done   | Manifest, controls, React fixture, Solid fixture, visual-state matrix, Button visual/family specs                                                    | None                                                                  |
| 3 Source map/API       | done   | Source map below                                                                                                                                     | None                                                                  |
| 4 Cross-layer audit    | done   | ARIA hook, headless RAC, S2 styled, comparison route, and Solid idiom risks audited file by file                                                     | None                                                                  |
| 5 Transitions          | done   | Transition inventory below                                                                                                                           | Add narrower visual rows only if later bugs need them                 |
| 6 State                | n/a    | No dedicated React Stately state layer for plain Button                                                                                              | None                                                                  |
| 7 ARIA hooks           | done   | `createButton`, `createPress`, `createFocusable`, `mergeProps`, `createProgressBar` fixes and tests                                                  | Broader getter-preserving `mergeProps` behavior should remain watched |
| 8 Headless             | done   | Pending focusability, suppression, announcement, progress context, and ProgressBar ID parity improved                                                | None                                                                  |
| 9 Styled S2            | done   | `ButtonContext`, `LinkButtonContext`, `pressScale` added/exported/consumed; context unit test added                                                  | None for Button-owned S2 support                                      |
| 10 Runtime lifecycle   | done   | Dynamic pending lifecycle, activation ordering, focus, form, custom render, non-native, ID, reduced-motion, forced-colors, and RTL parity tests pass | None                                                                  |
| 11 Harness integrity   | done   | Screenshot helper now waits for fonts, captures React/Solid sequentially, and prepares pointer hover/press captures in their final position          | Pre-change focused suite was not captured                             |
| 12 Comparison evidence | done   | Button visual spec now uses exact current React/Solid pair checks; obsolete committed PNG baselines removed                                          | Broad Button-family visual run passes                                 |
| 13 Acceptance          | done   | Build, lint/typecheck, export reports, gap reports, runtime tests, Button visual chunks, and Button-family strict follow-up passed                   | Support components remain separate component passes                   |

## Research

- React Aria docs:
  - `Button`
  - `usePress`
  - `useHover`
  - `useFocusVisible`
  - `mergeProps`
- React Aria blog and related pages:
  - <https://react-spectrum.adobe.com/blog/building-a-button-part-1.html>
  - <https://react-spectrum.adobe.com/blog/building-a-button-part-2.html>
  - <https://react-spectrum.adobe.com/blog/building-a-button-part-3.html>
  - No dedicated `Testing Button` page found in the MCP page list.
- S2 docs:
  - `Button`
- APG patterns/examples:
  - <https://www.w3.org/WAI/ARIA/apg/patterns/button/>
- Other standards from Source Index:
  - HTML button/form behavior.
  - Accessible name and description computation.
  - UI Events and Pointer Events for activation ordering.
  - Media Queries and Color Adjust for hover, reduced motion, and forced colors.
- Source conclusions:
  - React Aria `Button` activation should flow through `onPress`, not raw
    pointer or click assumptions.
  - Native `button` semantics are the default authority for plain Button.
  - Pending Button remains focusable by default, exposes disabled semantics,
    suppresses press, announces the pending change while focused, and keeps the
    progressbar in the accessibility tree.
  - S2 pending spinner visibility is delayed; hidden pending content should not
    be removed from the accessibility tree.
  - Link semantics belong to `Link`/`LinkButton`, not plain Button.

## Baseline

- Before this pass, `comparison:report:exports` reported:
  - S2 value exports: 208.
  - `solid-spectrum` public value exports: 104.
  - Missing non-root/support S2 exports: 104.
  - `ButtonContext`, `LinkButtonContext`, and `pressScale` were missing
    Button-related support exports.
- After this pass, `comparison:report:exports` reported:
  - S2 value exports: 208.
  - `solid-spectrum` public value exports: 107.
  - Missing React S2 value exports: 101.
  - Missing non-root/support S2 exports: 101.
  - Extra exports: 0.
- `comparison:report:gaps` after this pass:
  - Official entries in comparison app: 69.
  - Official styled entries live on both sides: 23.
  - Official entries still missing/gap: 46.
  - Button remains live and only appears in the non-strict default-state report
    line.
- `guard:rac-export-gap` after this pass:
  - Missing in `solidaria-components`: 0.

## Source Map And Public Contract

| Layer               | Upstream files                                                                                                            | Solid files                                                                                                                                                                                                                                                                             | Status                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| State               | none identified for plain Button                                                                                          | none identified for plain Button                                                                                                                                                                                                                                                        | not applicable             |
| ARIA hooks          | `apps/comparison/node_modules/@react-aria/button/src/useButton.ts`                                                        | `packages/solidaria/src/button/createButton.ts`, `packages/solidaria/src/interactions/createFocusable.ts`, `packages/solidaria/src/utils/mergeProps.ts`, `packages/solidaria/src/progress/createProgressBar.ts`, `packages/solidaria/src/button/types.ts`                               | audited and updated        |
| Headless components | `apps/comparison/node_modules/react-aria-components/src/Button.tsx`                                                       | `packages/solidaria-components/src/Button.tsx`, `packages/solidaria-components/src/ProgressBar.tsx`, `packages/solidaria-components/src/Link.tsx`                                                                                                                                       | audited and mostly updated |
| Styled S2           | `apps/comparison/node_modules/@react-spectrum/s2/src/Button.tsx`                                                          | `packages/solid-spectrum/src/button/Button.tsx`, `packages/solid-spectrum/src/button/LinkButton.tsx`, `packages/solid-spectrum/src/button/context.ts`, `packages/solid-spectrum/src/pressScale.ts`, `packages/solid-spectrum/src/button/s2-button-styles.ts`, package root export files | audited and updated        |
| Comparison route    | `apps/comparison/src/components/react/fixtures/styled.jsx`, `apps/comparison/src/data/button-demo.ts`, visual/e2e sources | `apps/comparison/src/components/solid/fixtures/styled.tsx`, `apps/comparison/src/data/button-demo.ts`, visual/e2e sources                                                                                                                                                               | live, focused suite rerun  |

- Public props/defaults:
  - S2 Button: `variant` default `primary`; `fillStyle` default `fill`; `size`
    default `M`; `type` default `button`.
  - S2 Button exposes `staticColor`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, form props, ARIA props, focus props, and press handlers.
  - RAC Button exposes `isPending`, `preventFocusOnPress`, `render`, `slot`,
    form props, ARIA props, focus props, press handlers, and `type` default
    `button`.
- Slots/subcomponents:
  - S2 docs show `<Button><Icon /><Text /></Button>`.
  - Solid styled Button provides `IconContext` and wraps string content in a text
    slot.
- Contexts/providers:
  - `ButtonContext` and `LinkButtonContext` now exist in `solid-spectrum`,
    are consumed by Button/LinkButton, and are exported from package roots.
  - Headless Button now provides `ProgressBarContext` during pending rendering.
- Refs/imperative behavior:
  - Headless Button keeps `ref` support.
  - Headless Link now accepts and forwards `ref` so `LinkButton` can share the
    exported S2 `pressScale` behavior.
- Intentional differences:
  - Solid headless Button still supports `isPendingFocusable={false}` as a local
    extension, but the default is now focusable to match RAC.

## Cross-Layer Audit

| Layer               | Matched                                                                                                                                              | Ported differently                                                                                            | Not applicable                         | Gaps                                                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------- |
| State               | None                                                                                                                                                 | None                                                                                                          | Dedicated state layer is not used      | None                                                                |
| ARIA hooks          | Native button defaults, non-native role branch, dynamic disabled path, form attrs, explicit `aria-disabled`, press/focus merge, press/click ordering | Getter-preserving `mergeProps` is Solid-specific; accessors replace React rerendered props                    | React refs and JSX spread mechanics    | Watch broader `mergeProps` behavior in future shared utility passes |
| Headless components | Pending default focusability, disabled semantics, press suppression, pending announcement, static and render-function progress ID/name behavior      | None for this pass                                                                                            | React render-prop object identity      | None                                                                |
| Styled S2           | Context exports, context consumption, `pressScale`, icon/text slot behavior, Button-owned support exports                                            | Solid `pressScale` accepts element accessors/refs rather than React ref objects only                          | React-specific ref timing              | None for this pass                                                  |
| Comparison route    | Button controls and functional contracts remain live                                                                                                 | Old per-side PNG baselines drifted from current React output; current pair checks are the acceptance evidence | Component routes outside Button family | Button-owned snapshot baseline cleanup is complete                  |

## Transition Plan

- Static states:
  - default;
  - visual prop matrix;
  - disabled;
  - pending immediate;
  - delayed pending spinner;
  - icon start;
  - icon only;
  - size variants;
  - fill/outline variants;
  - static colors.
- Interaction timelines:
  - hover enter -> hover exit;
  - pointer down -> pressed frame -> pointer up -> action count;
  - keyboard focus-visible -> Enter/Space activation -> focus remains;
  - touch press without sticky hover;
  - screen-reader virtual click path through `onPress` and compatibility
    `onClick`.
- Pending timelines:
  - `isPending=false -> true`: Button remains focusable, exposes
    `aria-disabled="true"`, suppresses press lifecycle, announces pending while
    focused, and exposes a progressbar.
  - `isPending=true -> false`: pending announcement stops, progressbar clears,
    visible label/icon treatment restores, and press behavior resumes.
  - submit Button while pending uses `type="button"` to avoid form submission.
- Cleanup assertions:
  - no stale pressed, hovered, pending, focus-visible, timers, or event listeners
    after release, blur, pending false, unmount, or route change.
- Visual-state rows changed:
  - none in this pass; existing focused Button suite was reused.

## Runtime Semantics

- Native element/role decision:
  - Button renders native `button` by default.
  - `elementType="input"` follows the upstream non-button branch: role button,
    type/disabled preserved, no computed `aria-disabled` when natively disabled.
  - Non-native elements get `role="button"` and computed disabled semantics.
  - Anchor button roots update `href` and `aria-disabled` dynamically when the
    disabled accessor changes.
- Accessible name/description assertions:
  - text button name comes from visible text;
  - icon-only button requires an explicit label;
  - pending progressbar remains in the accessibility tree;
  - pending progressbar ID can augment Button `aria-labelledby`.
- Event pipeline and consumer handler assertions:
  - pending suppresses `onPressStart`, `onPressEnd`, `onPressChange`,
    `onPressUp`, and `onPress`;
  - pointer and virtual activation now assert the upstream order:
    `pressstart`, `presschange(true)`, `pressup`, `pressend`,
    `presschange(false)`, `press`, then `click`;
  - keyboard activation now asserts that compatibility `onClick` fires once
    after `onPress`;
  - keyboard link activation now follows the shared `createPress` parity suite;
  - `preventFocusOnPress` preserves focus on the previously focused element
    across hook, headless, and styled Button layers;
  - dynamic disabled state updates focusability and press behavior through
    accessors;
  - explicit `aria-disabled` can override computed non-native disabled state.
- Native form behavior assertions:
  - full form prop forwarding is covered at the headless and styled Button
    layers: `form`, `formAction`, `formEncType`, `formMethod`,
    `formNoValidate`, `formTarget`, `name`, and `value`;
  - pending submit buttons keep the previously validated `type="button"`
    behavior to avoid implicit or explicit form submission.
- Custom render assertions:
  - headless Button custom render receives a live root prop object, so stateful
    props such as `class`, `data-pressed`, and render-state values update during
    press transitions;
  - headless Button custom render can opt into `createButton` non-native anchor
    behavior via `elementType="a"` and preserve `href`, `target`, `rel`,
    `role`, focusability, and press behavior.
- SSR/hydration ID assertions:
  - pending Button preserves an explicit caller-provided button ID;
  - generated pending progress IDs inherit `SSRProvider` prefixes;
  - pending `aria-labelledby` points only to IDs present in the DOM.
- Motion preferences:
  - S2 `pressScale` behavior is pinned against upstream behavior under
    `prefers-reduced-motion: reduce`; upstream still applies the press transform
    and `will-change`, so Solid preserves that behavior rather than introducing
    a Solid-only divergence.
- Forced colors:
  - Button default, outline, disabled, pending, and premium computed styles
    match React Spectrum under Playwright `forced-colors: active`.
- RTL:
  - Button providers can be rendered with `locale=ar-SA` in the comparison
    route;
  - React and Solid both inherit `dir="rtl"` and matching computed direction;
  - icon/text order, size, centerline, and gap match React Spectrum in RTL.
- Announcements:
  - focused pending transitions call the React Aria announcement utility parity
    path.
- Portal/provider/global cleanup:
  - no portal for Button.
  - provider inheritance applies through S2 Button contexts and RAC progress
    context.
  - global modality/listener cleanup is covered indirectly by press/focus tests.
- SSR/hydration note:
  - generated IDs are used for pending progress association; no Button-specific
    SSR failure was identified in this pass.

## Harness Integrity

- Pre-change focused-suite status:
  - not captured before Button implementation changes. This is now a playbook
    requirement for future component passes.
- Evidence authority for this pass:
  - source-backed semantics and API behavior;
  - focused unit tests and runtime contracts;
  - computed styles and current React-vs-Solid pair diffs.
- Font/theme/viewport/animation stabilization:
  - `apps/comparison/e2e/visual-diff.ts` now waits for `document.fonts.ready`
    and two animation frames before normalized screenshots;
  - normalized screenshots continue to disable animations and freeze progress
    circle animation;
  - Button tests pin the comparison theme to dark for route setup.
- Pointer-state capture:
  - hover and press screenshots now prepare the target in its final capture
    position before applying pointer state, so the harness does not invalidate
    live hover or press state;
  - focus-visible and static states still use normalized capture where moving
    the target does not invalidate the state.
- React/Solid capture isolation:
  - `expectScreenshotPair` now captures React and Solid sequentially instead of
    mutating both targets at the same fixed coordinates in parallel;
  - `diffLocatorScreenshots` also captures sequentially.
- Failure taxonomy after harness hardening:
  - Button-specific failures were `baseline drift`: exact current pair checks
    and functional/computed contracts passed, but old committed per-side PNG
    baselines differed by 1-25 pixels;
  - obsolete committed PNG baselines were removed after exact current
    React/Solid pair parity passed;
  - broad Button-family visual rows are tracked by the Button family pass and
    now use exact current pair checks where they are Button-family owned;
  - ActionButton prop-controls failure is `unrelated family failure`;
  - no Button `port bug` was identified by the rerun.
- Browser/device coverage:
  - Chromium only for this pass. Cross-browser and mobile remain acceptance
    broadening, not current evidence.

## Implementation Changes

- `packages/solidaria/src/button/createButton.ts`
  - aligned native/non-native/input branches with upstream `useButton`;
  - preserved falsey form attribute values;
  - made disabled behavior dynamic through accessors;
  - preserved explicit `aria-disabled` overrides;
  - adjusted prop merge order.
- `packages/solidaria/src/interactions/createPress.ts`
  - aligned pointer and virtual click callback ordering with upstream
    `usePress`;
  - propagated `onPress` event `continuePropagation()` into the returned
    stop-propagation decision;
  - aligned disabled/no-start stop-propagation return values;
  - restored keyboard and touch compatibility `onClick` synthesis, including
    link keyboard activation.
- `packages/solidaria/src/interactions/createFocusable.ts`
  - made `tabIndex` dynamic.
- `packages/solidaria/src/utils/mergeProps.ts`
  - preserved getter descriptors so merged dynamic props remain live.
- `packages/solidaria/src/progress/createProgressBar.ts`
  - accepted and forwarded explicit IDs.
- `packages/solidaria-components/src/Button.tsx`
  - changed pending default to focusable;
  - added pending press suppression, announcement, generated IDs,
    progress-context provision, and pending ARIA labeling;
  - prevented pending submit buttons from submitting;
  - preserved static child laziness when passing children into render-prop
    helpers so static `<ProgressBar />` receives Button-injected context;
  - changed custom render props/render values from static snapshots to live
    getter-backed objects so custom roots update through interaction state.
- `packages/solidaria-components/src/ProgressBar.tsx`
  - consumed `ProgressBarContext` and accepted explicit IDs.
- `packages/solidaria-components/src/Link.tsx`
  - forwarded `ref` for styled LinkButton press scaling.
- `packages/solid-spectrum/src/button/context.ts`
  - added `ButtonContext` and `LinkButtonContext`.
- `packages/solid-spectrum/src/pressScale.ts`
  - added Solid S2 `pressScale` support.
- `packages/solid-spectrum/src/button/Button.tsx`
  - consumed Button context and shared `pressScale`.
- `packages/solid-spectrum/src/button/LinkButton.tsx`
  - consumed LinkButton context and shared `pressScale`.
- `packages/solid-spectrum/src/button/index.ts`
  - exported Button contexts.
- `packages/solid-spectrum/src/index.ts`
  - exported Button contexts and `pressScale`.
- `apps/comparison/e2e/visual-diff.ts`
  - hardened visual capture by waiting for fonts and isolating React/Solid
    screenshots sequentially;
  - added pointer-state capture helpers that prepare the final capture position
    before applying live hover/press state;
  - split current pair parity from committed snapshot baselines, then removed
    committed-baseline acceptance from the focused visual path.
- `apps/comparison/e2e/button-visual.spec.ts`
  - switched Button screenshot states to exact current React-vs-Solid pair
    checks;
  - added forced-colors and RTL computed/geometry parity checks.
- `apps/comparison/src/data/button-demo.ts`
  - added query-only Button locale parsing for comparison environment coverage.
- `apps/comparison/src/components/react/fixtures/styled.jsx`
  - passes the query-only Button locale to React Spectrum Provider.
- `apps/comparison/src/components/solid/fixtures/styled.tsx`
  - passes the query-only Button locale to Solid Spectrum Provider.
- `apps/comparison/e2e/*-snapshots/*.png`
  - removed obsolete committed screenshot baselines; focused acceptance now
    relies on current React-vs-Solid visual evidence.

## Evidence

- Formatting/lint/typecheck:
  - `vp run check`: passed.
  - `vp check --fix`: passed; formatter cleanup was applied before the final
    check rerun.
- Unit tests:
  - `vp test run packages/solid-spectrum/test/Button.test.tsx`: passed, 34
    tests.
  - `vp test run packages/solidaria-components/test/Button.test.tsx`: passed,
    68 tests.
  - `vp test run packages/solidaria/test/createPress.test.tsx packages/solidaria/test/createButton.test.tsx packages/solidaria-components/test/Button.test.tsx packages/solid-spectrum/test/Button.test.tsx`: passed, 248 tests.
  - `vp test run packages/solidaria/test/createButton.test.tsx packages/solidaria-components/test/Button.test.tsx packages/solid-spectrum/test/Button.test.tsx`: passed, 166 tests.
- Package builds:
  - `vp run --filter @proyecto-viviana/solidaria build`: passed.
  - `vp run --filter @proyecto-viviana/solidaria-components build`: passed.
  - `vp run --filter @proyecto-viviana/solid-spectrum build`: passed.
  - `vp run --filter @proyecto-viviana/comparison build`: passed.
- Reports:
  - `vp run comparison:report:exports`: passed.
  - `vp run comparison:report:gaps`: passed.
  - `vp run guard:rac-export-gap`: passed.
- Focused comparison suite:
  - before harness hardening,
    `vp run --filter @proyecto-viviana/comparison test:button`: failed.
  - Result: 109 passed, 41 failed.
  - after harness hardening,
    `vp run --filter @proyecto-viviana/comparison test:button`: failed.
  - Result: 108 passed, 42 failed.
  - Button-specific functional contracts passed for press action, pending focus
    and suppression, prop controls, color scheme controls, light theme variants,
    hover styles, premium/genai gradients, outline text centering, staticColor
    styles, pending style normalization, icon geometry, and pending indicator
    centering.
  - No current React-vs-Solid pair-diff assertion failed in the reported Button
    rows; failures were old committed per-side screenshot baselines.
  - Button-specific committed-baseline failures: 21 rows, all classified as
    `baseline drift` and superseded by current pair-diff evidence.
  - Non-Button committed-baseline failures in the broad Button-family run: 20
    rows, all classified as `unrelated family failure` for this Button pass.
  - One non-Button contract failure came from ActionButton fixture drift:
    React-side actual props included `iconPlacement: "none"` where the expected
    fixture did not. Classified as `unrelated family failure`.
  - after switching Button states to exact current pair checks,
    `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts --reporter=line`
    was attempted twice, but the host killed the single-file run mid-file after
    the heavier first section.
  - The original Button visual matrix passed in focused chunks covering 44
    tests:
    interaction screenshots, prop/theme/light-theme behavior, premium/genai,
    outline/staticColor/pending computed behavior, icon geometry, pending
    indicator geometry, variant matrix, size/staticColor matrix, and
    disabled/pending/icon matrix.
  - Button visual chunks used exact current React/Solid pair checks; obsolete
    committed baselines are no longer part of the acceptance gate.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts --grep "RTL" --reporter=line`:
    passed, 1 test.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts --grep "forced-colors" --reporter=line`:
    passed, 1 test.
  - `vp exec --filter @proyecto-viviana/comparison playwright test e2e/button-visual.spec.ts e2e/actionbutton-visual.spec.ts e2e/single-button-controls-visual.spec.ts e2e/grouped-button-controls-visual.spec.ts --reporter=line`:
    passed, 141 tests.

## Handoff

- Status after this pass:
  - Button is materially closer to React Aria/RAC/S2 parity across all four
    layers.
  - Source, unit, package build, export, and gap-report evidence is green.
  - The visual harness is less ambiguous: fonts are awaited, React/Solid
    screenshots no longer overlap during capture, and pointer states are
    prepared in the final capture position.
  - Button visual evidence is accepted by the broad Chromium Button-family run
    plus the focused RTL and forced-colors environment checks.
- Remaining gaps:
  - Button-specific runtime/API gaps found in this pass are closed.
  - Visual strictness for Button-family-owned rows was closed in the
    Button-family follow-up.
  - The mandatory source-coverage and docs/viewer backfill for Button now lives
    in `button-family-validation-notes.md`, which treats Button as part of the
    complete family pass.
- Next ordered task:
  - Move to the next component pass or one of the standalone support-component
    passes documented from the Button-family sweep.
