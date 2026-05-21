# Meter Validation Notes

Date: 2026-05-20
Status: accepted

Meter has now been normalized against the current acceptance gates. Historical
evidence from the original 2026-05-15 pass is superseded by this closeout,
which records the corrected S2 API boundary, comparison viewer parity, browser
contract coverage, and refreshed report/guard evidence.

## Current-Gate Closeout

- Scope: styled S2 `Meter`, `MeterContext`, public package root exports,
  comparison route controls, docs/playground examples, visual-state matrix
  coverage, and focused styled/headless Meter tests.
- Sources rechecked: React Spectrum S2 Meter API, React Aria Meter API, S2
  Meter source, S2 package root exports, Solid Meter/Solidaria sources,
  comparison route controls, Meter visual spec, and existing Meter unit tests.
- Result: accepted for Meter. Solid now exposes the documented S2 Meter surface:
  `variant` is `informative | positive | notice | negative`, `size` is
  `S | M | L | XL`, `staticColor` is `white | black | auto`,
  `labelPosition` is `top | side`, `valueLabel` accepts renderable content for
  displayed value text, and unsafe props remain escape hatches. The styled
  component no longer exposes legacy variant aliases, legacy size aliases,
  `class`, `showValueLabel`, raw `style`, arbitrary DOM event props, or exported
  root type aliases beyond `MeterProps`.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and docs examples match the S2 surface for
      `label`, `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`,
      `variant`, `size`, `staticColor`, `labelPosition`, ARIA label props,
      `slot`, `styles`, unsafe props, and `ref`.
- [x] Styled public type: `MeterProps` omits S2-excluded compatibility props:
      legacy variants, legacy sizes, `class`, raw `style`, `showValueLabel`,
      render children, and arbitrary DOM event handlers; package root type
      exports only `MeterProps`.
- [x] Headless parity: Solidaria and Solidaria Components still cover RAC-level
      Meter semantics, value formatting, render children, class support, and
      defensive invalid equal-range behavior outside the styled S2 wrapper.
- [x] DOM/accessibility contract: styled Meter renders a root meter with
      fallback `progressbar` role token, ARIA value attributes, internal label
      association, `aria-valuetext`, route harness `data-*` passthrough, and no
      unsupported styled event/class/style branches.
- [x] Style source-to-computed: S2 style macro output covers wrapper grid,
      FieldLabel/value Text typography, track/fill geometry, all variants, all
      sizes, all static colors, label positions, Skeleton loading, and
      forced-colors branches.
- [x] Harness contract: route controls match the docs-style option surface, the
      visual-state matrix includes Meter root DOM contract coverage, and browser
      computed contracts compare root DOM, style branches, custom ranges, and
      forced-colors behavior against React Spectrum.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      Meter Playwright, regression slice, reports, guards, README status, and
      this note are refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                                 |
| ----------------------- | ------ | ------------------------------------------------------------------------ |
| Research                | done   | S2 Meter API/source, RAC Meter API, current Solid source/tests           |
| Baseline and source map | done   | Existing note plus current source/API/export recheck                     |
| Implementation          | done   | Styled API narrowing, root export cleanup, runtime prop boundary cleanup |
| Harness                 | done   | Docs/playground cleanup, root DOM matrix row, visual contract expansion  |
| Verification            | done   | Focused unit tests, package builds, comparison build, Meter visual e2e   |
| Handoff                 | done   | README normalization status, current-gate closeout note, commit          |

## Behavior State Machine

- Stable states: no visible label with ARIA label; visible label plus generated
  value text; explicit string/number value labels; renderable displayed value
  labels; default range; custom valid min/max range; clamped over-range and
  under-range values.
- Visual states: informative, positive, notice, and negative variants; S, M, L,
  and XL sizes; default, white, black, and auto static color branches; top and
  side label positions; Skeleton loading branch.
- Context states: `MeterContext` can provide slotted style, unsafe style/class,
  visual props, refs, and other documented props; local unsafe class/style props
  override context unsafe values through the shared S2 context helpers.
- Environment states: forced-colors active resolves to the same computed
  track/fill/outline contract as React Spectrum.
- Cleanup contract: Meter owns no timers, portals, observers, subscriptions, or
  global listeners; Skeleton only contributes inert wrapping while loading.

## Accessibility And I18n

- The root uses `role="meter progressbar"` to match the React Spectrum/Solid
  compatibility contract while preserving meter semantics for queries.
- Visible labels produce an internal stable ID and `aria-labelledby`; explicit
  ARIA label props and descriptions flow through to the root.
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and generated or explicit
  string `aria-valuetext` are owned by Solidaria `createMeter`.
- Renderable `valueLabel` content is displayed in the value text slot; only
  string/number value labels are forwarded to `aria-valuetext`, avoiding invalid
  object-valued ARIA text.
- Locale-sensitive value formatting remains delegated to the shared number
  formatting path through `formatOptions`.
- Invalid equal ranges follow the RAC/S2 styled percentage path at the styled
  layer; the headless Solidaria layer keeps its existing defensive tests for
  callers that use RAC-style render children directly.

## Style Source-To-Computed

- React S2 Meter source wraps RAC Meter with S2 bar grid, FieldLabel/value Text,
  shared track/fill styles, semantic variant fills, static-color overlays,
  forced-colors branches, `MeterContext`, and `SkeletonWrapper`.
- Solid S2 Meter follows that contract without the prior compatibility aliases
  for variant, size, `class`, `showValueLabel`, raw DOM style, or root event
  props.
- Browser contracts compare root tag/role/harness data attributes, ARIA values,
  grid columns/areas, label/value typography, track dimensions/background,
  fill dimensions/background, custom ranges, and forced-colors output against
  React Spectrum.

## Source Packet

| Source                   | Files or docs                                                   | Finding                                                                                                                                            |
| ------------------------ | --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Meter` API                                                     | Public API includes labels, value/range props, `valueLabel`, `formatOptions`, variants, sizes, static color, label position, styles, unsafe props. |
| React Aria docs MCP      | `Meter` API                                                     | RAC Meter still owns render children, class/style/render customization, and broader DOM props at the headless layer.                               |
| React Spectrum S2 source | `@react-spectrum/s2/src/Meter.tsx`                              | S2 omits children/class/style/render/global DOM attrs from the styled surface and uses RAC percentage/valueText internally.                        |
| Solid source after pass  | `packages/solid-spectrum/src/meter/index.tsx`                   | Solid matches the S2 styled prop boundary and strips the prior legacy aliases/event/style/class compatibility branches.                            |
| Solidaria source/tests   | Solidaria Meter and Solidaria Components Meter                  | Headless behavior remains covered for RAC semantics, render children, class support, value formatting, and defensive invalid equal ranges.         |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `meter-visual` e2e | Meter is live on both stacks with strict default evidence, route-control checks, root DOM contract, computed style matrix, and forced-colors.      |

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
| `styles`        | S2 style macro override                         | component API                                     | matched | source audit and browser contract       |
| unsafe props    | `UNSAFE_className`, `UNSAFE_style`              | component API                                     | matched | unit tests                              |
| ARIA labels     | labels and descriptions                         | component API                                     | matched | unit tests                              |

## Baseline

- Before the support sweep, Meter was a catalogue gap with no live Solid styled
  route and no Meter-specific strict visual evidence.
- The initial Meter pass made the component live and visually covered, but kept
  compatibility branches that S2 does not expose: legacy variants, legacy sizes,
  `class`, `showValueLabel`, and generic DOM prop pass-through.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `264`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `155`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `4`.

## Source Map And Public Contract

| Layer               | Upstream files                      | Solid files                                       | Status  |
| ------------------- | ----------------------------------- | ------------------------------------------------- | ------- |
| State               | none                                | none                                              | n/a     |
| ARIA hooks          | RAC Meter internals                 | `@proyecto-viviana/solidaria/createMeter`         | matched |
| Headless components | `react-aria-components/Meter`       | `@proyecto-viviana/solidaria-components/Meter`    | matched |
| Styled S2           | `@react-spectrum/s2/src/Meter.tsx`  | `packages/solid-spectrum/src/meter/index.tsx`     | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `value`: default `0`; route default is `72`.
  - `minValue`: default `0`.
  - `maxValue`: default `100`.
  - `variant`: default `informative`, supports `positive`, `notice`, and
    `negative`.
  - `size`: default `M`, supports `S`, `L`, and `XL`.
  - `staticColor`: no default, supports `white`, `black`, and `auto`.
  - `labelPosition`: default `top`, supports `side`.
  - `label`, `valueLabel`, `formatOptions`, ARIA label props, `data-*` harness
    props, `slot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref` are
    preserved.
  - The styled S2 wrapper intentionally omits legacy aliases, `class`, raw
    `style`, `showValueLabel`, render children, arbitrary DOM events, and raw
    role override.
- Contexts/providers:
  - `MeterContext` is exported and consumed through the shared S2 slotted
    context helper.
  - Public package root Meter exports match S2: values `Meter` and
    `MeterContext`, plus type `MeterProps`.
  - `SkeletonWrapper` wraps the track/fill subtree; value text also follows the
    shared text/skeleton path.
- Refs/imperative behavior:
  - Ref merging includes context/local refs.

## Source Branch Coverage

| Layer    | Upstream branch                    | Solid owner              | Class           | Observable                                       | Status  | Evidence                         |
| -------- | ---------------------------------- | ------------------------ | --------------- | ------------------------------------------------ | ------- | -------------------------------- |
| Headless | meter role and fallback role token | Solidaria meter props    | semantics       | `role="meter progressbar"` and ARIA values       | matched | unit and e2e tests               |
| Headless | value/min/max ARIA                 | Solidaria meter props    | semantics       | `aria-valuenow/min/max`                          | matched | unit and e2e tests               |
| Headless | explicit string valueLabel         | Solidaria meter props    | semantics/text  | value text and `aria-valuetext`                  | matched | unit and e2e tests               |
| Headless | renderable displayed valueLabel    | styled Meter             | text            | displayed slot content without object ARIA text  | matched | unit test                        |
| Headless | formatOptions value text           | Solidaria meter props    | semantics/text  | generated formatted value text                   | matched | unit test                        |
| Styled   | S2 prop boundary                   | S2 `Meter` wrapper       | API             | no legacy class/size/variant/showValueLabel DOM  | matched | unit tests                       |
| Styled   | wrapper bar grid                   | S2 `Meter` style macro   | visual/layout   | grid columns/areas, gap, min/max width           | matched | e2e computed contract            |
| Styled   | FieldLabel label branch            | label wrapper/styles     | visual/text     | label typography and grid placement              | matched | unit and e2e tests               |
| Styled   | value Text branch                  | `Text` with value styles | visual/text     | value typography and grid placement              | matched | unit and e2e tests               |
| Styled   | track branch                       | S2 `trackStyles`         | visual          | height, radius, overflow, background, outline    | matched | e2e computed/forced-colors tests |
| Styled   | fill width branch                  | S2 `fillStyles`          | visual/value    | clamped percentage width                         | matched | unit and e2e tests               |
| Styled   | variant fill map                   | S2 `fillStyles`          | visual          | informative/positive/notice/negative fills       | matched | e2e full variant matrix          |
| Styled   | size track map                     | S2 `trackStyles`         | visual          | S/M/L/XL track heights                           | matched | e2e full size matrix             |
| Styled   | staticColor overlay branches       | S2 static-color styles   | visual          | undefined/white/black/auto overlay treatment     | matched | e2e full staticColor matrix      |
| Styled   | labelPosition top/side branches    | S2 bar styles            | visual/layout   | grid template changes                            | matched | e2e label-position matrix        |
| Styled   | forced-colors track/fill branches  | generated S2 CSS         | visual/a11y     | ButtonFace/ButtonText computed contract          | matched | e2e forced-colors test           |
| Styled   | `MeterContext` merge               | S2 `Meter`               | context         | context props apply, local unsafe props override | matched | unit test                        |
| Styled   | `SkeletonWrapper` branch           | `SkeletonWrapper`        | loading/visual  | inert skeleton wrapper around track/value text   | matched | unit test                        |
| Harness  | route control surface              | comparison route         | route integrity | visible labels/order/defaults and changed props  | matched | e2e route-control test           |
| Harness  | root DOM contract                  | comparison visual spec   | route integrity | root data attrs, role, ARIA, track/fill DOM      | matched | e2e computed contract            |

## Evidence

```bash
vp test run packages/solid-spectrum/test/Meter.test.tsx packages/solidaria-components/test/Meter.test.tsx packages/solidaria/test/createMeter.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/meter-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Meter" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Meter tests: `50 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/meter/`.
- Meter Playwright suite: `4 passed`.
- Meter regression snapshot slice: `1 passed`, `49 skipped`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `264`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `155`,
  missing React S2 value exports at `57` of `208`, and extra Solid value exports
  at `4`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: Meter is accepted as of 2026-05-20.
- Headless render/class/style behavior and the defensive equal-range guard
  remain owned by Solidaria Components and are intentionally not re-exposed by
  styled S2 Meter.
- Next legacy normalization candidates in `components/README.md`: Skeleton and
  StatusLight.
