# StatusLight Validation Notes

## Target

- Component: StatusLight
- Slug: statuslight
- Family or direct subcomponents: StatusLightContext
- Pass goal: S2 styled StatusLight parity, route controls, semantic role
  coverage, skeleton consumer behavior, and strict default visual evidence
- Date: 2026-05-15

## Source Packet

| Source                   | Files or docs                                                                | Finding                                                                                                                    |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `StatusLight` page                                                           | Public API includes `children`, `variant`, `size`, optional `role="status"`, label ARIA props, styles, and unsafe escapes. |
| React Spectrum S2 source | `@react-spectrum/s2/src/StatusLight.tsx`                                     | StatusLight uses a flex wrapper, `CenterBaseline`, SVG circle fill, `Text`, `StatusLightContext`, and `useIsSkeleton`.     |
| Solid source before pass | `packages/solid-spectrum/src/statuslight/index.tsx`                          | Solid used handwritten Tailwind-style classes, span markup, legacy size names, and did not expose S2 context.              |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix, `statuslight-visual` e2e | StatusLight was an official catalogue gap with no live React/Solid route or StatusLight-specific strict visual assertion.  |

## Four-Layer Audit

| Layer      | React owner                      | Solid owner                                    | Status                                                                                   |
| ---------- | -------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/StatusLight` | `@proyecto-viviana/solid-spectrum/StatusLight` | Matched for wrapper layout, text styling, SVG light color/size, role, and skeleton fill. |
| Components | native div/svg/text composition  | native div/svg/text composition                | N/A beyond DOM semantics and labelable status role handling.                             |
| Headless   | none                             | none                                           | N/A. StatusLight has no React Aria hook owner.                                           |
| State      | none                             | none                                           | N/A. StatusLight has no separate state package owner.                                    |

## Interaction Dependency Map

| Dependency                 | Upstream branch                                              | Solid validation                                                                         | Status  |
| -------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------- |
| `variant`                  | Semantic and categorical variants drive SVG `fill`           | Unit tests cover aliases; e2e computed styles compare representative variants.           | matched |
| `size`                     | `S/M/L/XL` drive SVG size and wrapper typography             | Unit tests cover aliases; e2e computed styles compare representative sizes.              | matched |
| `role`                     | Optional `role="status"` marks live status text              | Unit and e2e control tests assert role propagation.                                      | matched |
| `StatusLightContext`       | Context provides defaults, refs, styles, and unsafe props    | Exported from barrel and covered by focused unit context test.                           | matched |
| `SkeletonContext` consumer | Skeleton mode changes SVG fill and text placeholder behavior | Unit test covers text inert/skeleton wrapper; visual route is ready for skeleton states. | matched |

## Changes Made

- Reworked Solid StatusLight around the S2 style macro instead of handwritten
  utility classes.
- Added `StatusLightContext`, S2 variant and size unions, optional
  `role="status"`, context/class/style merging, skeleton fill integration, and
  Text/CenterBaseline composition.
- Kept legacy aliases: `info` maps to `informative`; `sm/md/lg` map to
  `S/M/L`; `class` and `indicatorClass` remain compatibility escape hatches.
- Exported `StatusLightContext` from the public barrel.
- Added StatusLight S2 CSS generation to
  `scripts/generate-solid-spectrum-s2-css.ts`.
- Added focused Solid unit tests for S2 structure, variants/sizes, legacy
  aliases, role/context/unsafe props, and skeleton behavior.
- Wired StatusLight into the comparison manifest, route defaults, controls,
  React and Solid fixtures, visual state matrix, and strict Playwright visual
  suite.

## Evidence

```bash
vp test run packages/solid-spectrum/test/StatusLight.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/statuslight-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: StatusLight" -u
vp run comparison:report:gaps
vp run comparison:report:exports
```

Results:

- Focused Solid StatusLight tests: `5 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- StatusLight visual suite: `3 passed`.
- Regression snapshot update: `1 passed`, `1 updated`.
- Current gap report after the Form follow-up lists official styled entries
  live on both sides at `32`, missing/gap entries at `37`, visual evidence
  states at `48`, and strict pair-diff states at `31`.
- Current export report lists missing React S2 value exports at `81` of `208`
  and extra Solid value exports at `3`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                          |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tasks 0-1 research/baseline      | partial | Sources and API were captured, but before-report lines and official viewer option/default/reset inventory were not recorded.                     |
| Task 2 route harness             | partial | Route controls and serialized props are covered; visible control labels/order/defaults are not asserted.                                         |
| Tasks 3-4 source branch coverage | gap     | The dependency map is not a complete branch ledger for wrapper, text, SVG light, role, context, legacy aliases, and skeleton branches.           |
| Task 5 transition plan           | partial | StatusLight has no pointer transition surface, but skeleton and role/status visual obligations were not written as a formal visual-state plan.   |
| Task 9 styled branches           | partial | Variant/size/role branches are covered; forced-colors/high-contrast branches are not browser-tested.                                             |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; failure taxonomy, full `vp run check`, and full guard refresh were not recorded for this component. |

Retro-audit gaps to backfill before release hardening:

- Add branch ledger rows for S2 wrapper styles, SVG light fill/size, Text slot,
  StatusLightContext, skeleton fill/text behavior, and legacy aliases.
- Add route-control UI assertions for visible options and selected defaults.
- Decide whether skeleton StatusLight needs strict route visual coverage.
- Add forced-colors coverage or document the generated-token acceptance
  boundary.

## Handoff

- StatusLight is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- The recent support-component sweep is comparison-live through Form, with
  broader FormContext consumer inheritance carried forward as a separate gap.
