# Meter Validation Notes

## Target

- Component: Meter
- Slug: meter
- Family or direct subcomponents: MeterContext, Solidaria meter semantics,
  FieldLabel/value Text, SkeletonWrapper
- Pass goal: S2 styled Meter parity, route controls, value/range semantics,
  static color coverage, label position coverage, skeleton wrapper behavior,
  forced-colors parity, and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                    | Blocker or next action |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Meter docs, S2 source, shared `bar-utils`, and Field label source                                        | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                           | None                   |
| 2 Route harness        | done   | Meter controls, route defaults, React/Solid fixtures, visible control assertions                            | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                        | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers value math, ARIA, wrapper grid, label/value, track/fill, context, skeleton, aliases    | None                   |
| 5 Transitions          | done   | Static component; range, value label, static color, label position, skeleton, and forced-colors recorded    | None                   |
| 6 State                | n/a    | No state package owner                                                                                      | None                   |
| 7 ARIA hooks           | done   | Meter behavior is owned by Solidaria `createMeter`                                                          | None                   |
| 8 Headless             | done   | Meter role, ARIA values, labels, formatted value text, and defensive invalid-range behavior are unit-tested | None                   |
| 9 Styled S2            | done   | `Meter`, `MeterContext`, S2 bar style branches, unit tests, computed browser matrix                         | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus provider contexts; no timers, overlays, portals, or global listeners                     | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, computed matrix, forced-colors contract               | None                   |
| 12 Comparison evidence | done   | Meter Playwright suite `4 passed`; current reports and guards refreshed                                     | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                                   | None                   |

## Source Packet

| Source                   | Files or docs                                                   | Finding                                                                                                                                             |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Meter` page                                                    | Public API includes `label`, `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`, `variant`, `size`, `staticColor`, and `labelPosition`. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Meter.tsx`, `bar-utils.ts`, `Field.tsx` | Meter uses RAC Meter, shared bar grid, FieldLabel/value text, variant fill, static color overlay, `MeterContext`, and `SkeletonWrapper`.            |
| Solid source before pass | `packages/solid-spectrum/src/meter/index.tsx`                   | Solid already used the S2 structure from the support sweep; route-control and forced-colors evidence were incomplete.                               |
| Solid source after pass  | `packages/solid-spectrum/src/meter/index.tsx`                   | Solid matches the S2 grid, label/value text, track/fill style branches, context merge, skeleton wrapper, fallback role, and legacy aliases.         |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `meter-visual` e2e | Meter is live on both stacks with strict default visual evidence, route-control checks, computed contracts, and forced-colors evidence.             |

## Official Docs And Viewer Parity

| Docs item       | Official setting/example                        | Route/control                                     | Status  | Evidence                                |
| --------------- | ----------------------------------------------- | ------------------------------------------------- | ------- | --------------------------------------- |
| `label`         | visible Meter label                             | text input, default `Storage`                     | matched | e2e asserts default and changed values  |
| `value`         | controlled current value; default `0`           | text input, default `72` for the viewer           | matched | unit and e2e tests                      |
| `minValue`      | default `0`                                     | text input, default `0`                           | matched | unit and e2e tests                      |
| `maxValue`      | default `100`                                   | text input, default `100`                         | matched | unit and e2e tests                      |
| `valueLabel`    | explicit value text                             | text input, default empty                         | matched | unit and e2e tests                      |
| `formatOptions` | value formatter, default percent                | component API                                     | matched | unit test                               |
| `variant`       | `informative`, `positive`, `notice`, `negative` | radio options in S2 order                         | matched | e2e asserts option labels/order/default |
| `size`          | `S`, `M`, `L`, `XL`; default `M`                | radio options in S2 order                         | matched | e2e asserts option labels/order/default |
| `staticColor`   | `auto`, `black`, `white`, or undefined          | radio options `default`, `white`, `black`, `auto` | matched | e2e asserts labels/order/default/matrix |
| `labelPosition` | `top`, `side`; default `top`                    | radio options in S2 order                         | matched | e2e asserts option labels/order/default |
| `slot`          | named slot or `null`                            | component API and context merge                   | matched | unit context test                       |
| `styles`        | S2 style macro override                         | component API                                     | matched | style macro accepts allowed overrides   |
| unsafe props    | `UNSAFE_className`, `UNSAFE_style`              | component API                                     | matched | unit test                               |
| ARIA labels     | labels and descriptions                         | component API                                     | matched | unit tests                              |

## Baseline

- Before the support sweep, Meter was a catalogue gap with no live Solid styled
  route and no Meter-specific strict visual evidence.
- Before Divider, `comparison:report:gaps` reported:
  - Official entries in comparison app: `69`.
  - Official styled entries live on both sides: `32`.
  - Official entries still missing/gap: `37`.
  - Official visual states tracked: `169`.
  - Official visual states with current React/Solid visual evidence: `48`.
  - Official visual states with strict pair-diff tests: `31`.
- Before Divider, `comparison:report:exports` reported:
  - React Spectrum S2 value exports: `208`.
  - `solid-spectrum` public value exports: `130`.
  - Missing React S2 value exports: `81`.
  - Extra Solid value exports: `3`.
- Current reports list Meter live and strict:
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `176`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`.
- Improvement target: close Meter retro-audit gaps without changing its accepted
  behavior for documented valid value ranges.

## Source Map And Public Contract

| Layer               | Upstream files                           | Solid files                                       | Status  |
| ------------------- | ---------------------------------------- | ------------------------------------------------- | ------- |
| State               | none                                     | none                                              | n/a     |
| ARIA hooks          | RAC Meter internals                      | `@proyecto-viviana/solidaria/createMeter`         | matched |
| Headless components | `react-aria-components/Meter`            | native root plus Solidaria meter props            | matched |
| Styled S2           | `Meter.tsx`, `bar-utils.ts`, `Field.tsx` | `packages/solid-spectrum/src/meter/index.tsx`     | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture      | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `value`: default `0`; route default is `72`.
  - `minValue`: default `0`.
  - `maxValue`: default `100`.
  - `variant`: default `informative`, supports `positive`, `notice`, and
    `negative`.
  - `size`: default `M`, supports `S`, `L`, and `XL`.
  - `staticColor`: no default, supports `white`, `black`, and `auto`.
  - `labelPosition`: default `top`, supports `side`.
  - `label`, `valueLabel`, `formatOptions`, ARIA label props, DOM props,
    `slot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref` are
    preserved.
- Contexts/providers:
  - `MeterContext` is exported and consumed through the shared S2 slotted
    context helper.
  - `SkeletonWrapper` wraps the track/fill subtree; value text also follows the
    shared text/skeleton path.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.
- Unsupported or intentionally different branches:
  - Legacy variants map to S2 equivalents:
    `primary`/`accent`/`info -> informative`, `success -> positive`,
    `warning -> notice`, and `danger -> negative`.
  - Legacy `sm`, `md`, and `lg` sizes map to `S`, `M`, and `L`.
  - Solid keeps defensive handling for invalid equal ranges
    (`minValue === maxValue`) so it does not emit `NaN%`. React Spectrum S2
    currently emits `NaN%` for that invalid range, so browser parity assertions
    are limited to documented valid ranges while the defensive Solid behavior is
    unit-tested.

## Source Branch Coverage

| Layer    | Upstream branch                    | Solid owner              | Class           | Observable                                      | Status  | Evidence                         |
| -------- | ---------------------------------- | ------------------------ | --------------- | ----------------------------------------------- | ------- | -------------------------------- |
| Headless | meter role and fallback role token | Solidaria meter props    | semantics       | `role="meter progressbar"` and ARIA values      | matched | unit and e2e tests               |
| Headless | value/min/max ARIA                 | Solidaria meter props    | semantics       | `aria-valuenow/min/max`                         | matched | unit and e2e tests               |
| Headless | explicit valueLabel                | Solidaria meter props    | semantics/text  | value text and `aria-valuetext`                 | matched | unit and e2e tests               |
| Headless | formatOptions value text           | Solidaria meter props    | semantics/text  | generated formatted value text                  | matched | unit test                        |
| Headless | invalid equal range guard          | Solid percentage helper  | robustness      | no `NaN%` for invalid equal min/max             | local   | unit test                        |
| Styled   | wrapper bar grid                   | S2 `Meter` style macro   | visual/layout   | grid columns/areas, gap, min/max width          | matched | e2e computed contract            |
| Styled   | FieldLabel label branch            | label wrapper/styles     | visual/text     | label typography and grid placement             | matched | unit and e2e tests               |
| Styled   | value Text branch                  | `Text` with value styles | visual/text     | value typography and grid placement             | matched | unit and e2e tests               |
| Styled   | track branch                       | S2 `trackStyles`         | visual          | height, radius, overflow, background, outline   | matched | e2e computed/forced-colors tests |
| Styled   | fill width branch                  | S2 `fillStyles`          | visual/value    | clamped percentage width                        | matched | unit and e2e tests               |
| Styled   | variant fill map                   | S2 `fillStyles`          | visual          | informative/positive/notice/negative fills      | matched | e2e full variant matrix          |
| Styled   | size track map                     | S2 `trackStyles`         | visual          | S/M/L/XL track heights                          | matched | e2e full size matrix             |
| Styled   | staticColor overlay branches       | S2 static-color styles   | visual          | undefined/white/black/auto overlay treatment    | matched | e2e full staticColor matrix      |
| Styled   | labelPosition top/side branches    | S2 bar styles            | visual/layout   | grid template changes                           | matched | e2e label-position matrix        |
| Styled   | forced-colors track/fill branches  | generated S2 CSS         | visual/a11y     | ButtonFace/ButtonText computed contract         | matched | e2e forced-colors test           |
| Styled   | `MeterContext` merge               | S2 `Meter`               | context         | context props apply, local props/classes merge  | matched | unit test                        |
| Styled   | `SkeletonWrapper` branch           | `SkeletonWrapper`        | loading/visual  | inert skeleton wrapper around track/value text  | matched | unit test                        |
| Compat   | legacy variant/size aliases        | S2 `Meter`               | compatibility   | aliases map to equivalent S2 output             | matched | unit tests                       |
| Harness  | route control surface              | comparison route         | route integrity | visible labels/order/defaults and changed props | matched | e2e route-control test           |

## Transition Plan

- Static states:
  - default informative/M/top label with value text;
  - all semantic variants;
  - S/M/L/XL track sizes;
  - undefined/white/black/auto static colors;
  - top and side label positions;
  - explicit value labels and formatted value text;
  - valid custom min/max ranges;
  - forced-colors active;
  - skeleton wrapper branch.
- Interaction timelines:
  - not applicable. Meter has no press, hover, focus, keyboard, or live value
    transition behavior.
- Overlay/loading/async timelines:
  - skeleton loading is covered by unit tests; Meter owns no async lifecycle.
- Cleanup assertions:
  - not applicable. Meter owns no timers, portals, observers, subscriptions, or
    global event listeners.
- Visual-state rows changed:
  - Meter has strict default evidence plus asserted route-control,
    variant/size/staticColor/label-position/range, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders a native `div` with React Spectrum's meter role plus the
    `progressbar` fallback token.
- Accessible name/description assertions:
  - labels produce an internal `aria-labelledby`; explicit ARIA label props are
    preserved.
- ID stability and collision checks:
  - label IDs are generated once per component instance and scoped to the
    associated meter root.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - DOM event props remain available through DOM prop pass-through, but Meter
    owns no interaction behavior.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - percentage, label, and value text derive from memos/accessors without eager
    child evaluation.
- Announcements:
  - meter value semantics are exposed through ARIA value attributes and
    `aria-valuetext`.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - no client-only lifecycle side effects; generated label IDs are stable within
    Solid's SSR/hydration model.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Meter.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/meter-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Meter" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid Meter tests: `9 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/meter/`.
- Meter Playwright suite: `4 passed`.
- Meter regression snapshot slice: `1 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `176`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Legacy status: Meter was accepted for owned behavior over documented valid
  ranges under the prior playbook; current-gate normalization is pending.
- The invalid equal-range behavior remains a documented defensive Solid
  improvement rather than React-bug parity.
- No prior-playbook in-scope Meter gates remained open at the time of this pass.
- Use `components/README.md` for the current-gate normalization queue.
