# Meter Validation Notes

## Target

- Component: Meter
- Slug: meter
- Family or direct subcomponents: MeterContext
- Pass goal: S2 styled Meter parity, route controls, value/range semantics,
  static color coverage, skeleton wrapper behavior, and strict default visual
  evidence
- Date: 2026-05-15

## Source Packet

| Source                   | Files or docs                                                          | Finding                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Meter` page                                                           | Public API includes `label`, `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`, `variant`, `size`, `staticColor`, and `labelPosition`. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Meter.tsx`, `bar-utils.ts`, `Field.tsx`        | Meter uses the shared bar grid, FieldLabel/value text, variant fill, static color overlay, `MeterContext`, and `SkeletonWrapper`.                   |
| Solid source before pass | `packages/solid-spectrum/src/meter/index.tsx`                          | Solid used handwritten classes, legacy aliases, no S2 context export, and no comparison route parity.                                               |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix, `meter-visual` e2e | Meter was an official catalogue gap with no live React/Solid route or Meter-specific strict visual assertion.                                       |

## Four-Layer Audit

| Layer      | React owner                   | Solid owner                                | Status                                                                                                       |
| ---------- | ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Styled     | `@react-spectrum/s2/Meter`    | `@proyecto-viviana/solid-spectrum/Meter`   | Matched for label/value grid, range fill, variants, static color, size, fallback role, and skeleton wrapper. |
| Components | React Aria Components `Meter` | `solidaria` `createMeter` plus native divs | Matched for meter value attributes, value text, aria labeling, and fallback `progressbar` role token.        |
| Headless   | React Aria meter behavior     | `solidaria` meter behavior                 | Existing Solidaria behavior covers value range, labeling, and formatted value text.                          |
| State      | none                          | none                                       | N/A. Meter has no separate state package owner.                                                              |

## Interaction Dependency Map

| Dependency                    | Upstream branch                                                | Solid validation                                                                                        | Status  |
| ----------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| `value`/`minValue`/`maxValue` | Percent fill and ARIA value attributes                         | Unit tests and e2e contracts cover normal and equal min/max ranges.                                     | matched |
| `valueLabel`/`formatOptions`  | Value text and `aria-valuetext`                                | Unit tests cover explicit value labels; e2e controls compare serialized range props.                    | matched |
| `variant`                     | `informative`, `positive`, `notice`, `negative` fill colors    | Unit tests assert class divergence; e2e computed styles compare representative variants.                | matched |
| `size`                        | S2 `S/M/L/XL` track heights                                    | Unit tests cover aliases; e2e computed styles compare representative sizes.                             | matched |
| `staticColor`                 | Static color overlays use transparent overlay tokens           | Route controls and e2e contracts cover `white` and `black` static color backdrops.                      | matched |
| `labelPosition`               | `top` and `side` alter grid template areas and columns         | Route controls and e2e contracts cover side placement.                                                  | matched |
| `MeterContext`                | Context provides default/slot props                            | Exported from barrel and covered by focused unit context test.                                          | matched |
| `SkeletonContext` consumer    | Track and value text use the shared skeleton wrapper/text path | Unit test covers inherited skeleton wrapper; visual route is ready for future skeleton state expansion. | matched |

## Changes Made

- Reworked Solid Meter around the upstream S2 bar, field label, value text,
  track, and fill style macro patterns.
- Added `MeterContext`, S2 props, fallback role parity, context/class/style
  merging, static color handling, value clamping, and `SkeletonWrapper`
  integration.
- Kept legacy aliases: `primary`/`accent`/`info` map to `informative`,
  `success` maps to `positive`, `warning` maps to `notice`, `danger` maps to
  `negative`, and `sm/md/lg` map to `S/M/L`.
- Exported `MeterContext` and S2 Meter types from the public barrel.
- Added Meter S2 CSS generation to `scripts/generate-solid-spectrum-s2-css.ts`.
- Added focused Solid unit tests for ARIA values, equal range handling,
  label/value text, variants/sizes/static color, legacy aliases, context/unsafe
  props, and skeleton behavior.
- Wired Meter into the comparison manifest, route defaults, controls, React and
  Solid fixtures, visual state matrix, and strict Playwright visual suite.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Meter.test.tsx
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Meter" -u
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test apps/comparison/e2e/meter-visual.spec.ts
vp run comparison:report:gaps
vp run comparison:report:exports
```

Results:

- Focused Solid Meter tests: `7 passed`.
- Meter regression snapshot: `1 passed`, `1 updated`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Meter visual suite: `3 passed`.
- Current gap report after the Form follow-up lists official styled entries
  live on both sides at `32`, missing/gap entries at `37`, visual evidence
  states at `48`, and strict pair-diff states at `31`.
- Current export report lists missing React S2 value exports at `81` of `208`
  and extra Solid value exports at `3`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                       |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 0-1 research/baseline      | partial | Source/API findings are strong, but before-report lines, official viewer option/default/reset inventory, and `guard:rac-export-gap` were not recorded.        |
| Task 2 route harness             | partial | Route controls and serialized props are covered; visible control labels/order/defaults and sentinel-value absence are not explicitly asserted.                |
| Tasks 3-4 source branch coverage | gap     | The interaction map is not a complete branch ledger for `Meter.tsx`, `bar-utils.ts`, `Field.tsx`, static color overlays, context, and skeleton branches.      |
| Task 5 transition plan           | partial | Meter has no interactive transition surface, but range/value-label/static-color visual obligations were not written as a formal transition/visual-state plan. |
| Task 9 styled branches           | partial | Range, size, variant, label placement, and static color are covered; forced-colors/high-contrast branches are not browser-tested.                             |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; failure taxonomy, full `vp run check`, and full guard refresh were not recorded for this component.              |

Retro-audit gaps to backfill before release hardening:

- Add source branch ledger rows for value math, equal min/max, value text,
  label placement, static color overlay, context, fallback role, and skeleton.
- Add route-control UI assertions for visible options, selected defaults, and
  omitted/default semantics.
- Decide whether skeleton Meter needs strict route visual coverage.
- Add forced-colors coverage or document the generated-token acceptance
  boundary.

## Handoff

- Meter is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- The recent support-component sweep is comparison-live through Form, with
  broader FormContext consumer inheritance carried forward as a separate gap.
