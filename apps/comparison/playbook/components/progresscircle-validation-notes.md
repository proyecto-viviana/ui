# ProgressCircle Validation Notes

Date: 2026-05-25
Status: accepted

## Acceptance Gate Checklist

- [x] Public API matches the React Spectrum S2 ProgressCircle surface for
      `value`, `minValue`, `maxValue`, `isIndeterminate`, `size`,
      `staticColor`, ARIA label and description props, `slot`, `styles`, unsafe
      props, `id`, and `ref`.
- [x] Official docs/viewer surface is recorded separately from API/source extra
      controls; the live 2026-05-25 S2 docs page exposes interactive viewer
      controls for `value`, `isIndeterminate`, `size`, and `staticColor`.
- [x] Styled public boundary excludes legacy sizes, raw `style`, and the Solid
      `class` alias.
- [x] Comparison viewer controls model the visual S2 prop branches: accessible
      label, value range, indeterminate state, size, and static color, with
      official viewer controls separated from API/source extras.
- [x] Accessibility behavior is delegated to Solidaria `createProgressBar`, with
      determinate and indeterminate ARIA behavior covered by focused tests.
- [x] Style source-to-computed mapping ports the S2 wrapper sizing, square aspect
      ratio, SVG radii, track/fill stroke widths, static-color overlays,
      forced-colors branch, and indeterminate animation.
- [x] Regression protection includes focused styled tests, comparison control
      contract coverage, visual-state matrix evidence, docs/playground coverage
      through shared Progress examples, and the Wave 4 compatibility slice.

## Agent Workflow

| Step                    | Status | Evidence                                                     |
| ----------------------- | ------ | ------------------------------------------------------------ |
| Research                | done   | S2 ProgressCircle docs/source and RAC ProgressBar docs       |
| Baseline and source map | done   | Existing Solid wrapper and comparison fixtures               |
| Implementation          | done   | Styled S2 API, context, SVG geometry, styles, animation      |
| Harness                 | done   | Demo data, side-panel controls, React/Solid fixtures, matrix |
| Verification            | done   | Focused unit, comparison, parity, and check commands         |
| Handoff                 | done   | README status and this note                                  |

## Official Docs And Viewer Parity

| Docs item                   | Official setting/example                                                                                                           | Route/control                                                                                                                          | Status  | Evidence                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Page sections               | `Value`, `API`                                                                                                                     | validation note and API prop inventory                                                                                                 | covered | S2 MCP page info checked 2026-05-25                                       |
| Interactive viewer controls | `value`, `isIndeterminate`, `size`, `staticColor`                                                                                  | side-panel controls with matching defaults and public option surface                                                                   | covered | live S2 docs page checked 2026-05-25; control spec + mounted DOM contract |
| Value section examples      | value range defaults to 0-100 and can be customized with `minValue`/`maxValue`                                                     | `minValue` and `maxValue` route controls                                                                                               | covered | live S2 docs page checked 2026-05-25; focused package tests               |
| API surface                 | `value`, `minValue`, `maxValue`, `isIndeterminate`, `size`, `staticColor`, ARIA props, `id`, `slot`, `styles`, unsafe props, `ref` | API/source inventory, route controls for visual branches, focused package tests for forwarded slot/unsafe props and progress semantics | covered | component controls, source map, focused tests                             |

| Route control     | Source surface  | Official values                                     | Route values                                       | Status  | Evidence                                     |
| ----------------- | --------------- | --------------------------------------------------- | -------------------------------------------------- | ------- | -------------------------------------------- |
| `value`           | official-viewer | numeric; default `50`                               | numeric text input; default `50`                   | covered | control spec + SVG dash/ARIA tests           |
| `isIndeterminate` | official-viewer | boolean; default off                                | switch; default off                                | covered | focused package tests + visual-state matrix  |
| `size`            | official-viewer | `S`, `M`, `L`; default `M`                          | `S`, `M`, `L`; default `M`                         | covered | visual-state matrix + control spec           |
| `staticColor`     | official-viewer | `black`, `white`, `auto`; default omit              | `black`, `white`, `auto`; reset/default omits prop | covered | static-color regression tests + control spec |
| `minValue`        | api-extra       | Value-section example prop; default `0`             | numeric text input; default `0`                    | covered | focused package tests                        |
| `maxValue`        | api-extra       | Value-section example prop; default `100`           | numeric text input; default `100`                  | covered | focused package tests                        |
| `aria-label`      | api-extra       | code-example accessibility prop; default `Loading…` | text; default `Loading…`                           | covered | control spec + mounted DOM contract          |

## Behavior State Machine

- Determinate: exposes progressbar ARIA value attributes and computes SVG fill
  `stroke-dashoffset` from the normalized percentage.
- Custom range: computes percentage from `minValue`, `maxValue`, and `value`;
  equal ranges are guarded from `NaN`.
- Indeterminate: omits determinate ARIA value text/now, removes the determinate
  dash offset, and uses the S2 rotation/dash animation.
- Visual branches: S/M/L sizes, default/white/black/auto static color,
  forced-colors strokes, and unsafe style/class escape hatches.

## Accessibility And I18n

- ProgressCircle has no visible label slot in S2, so comparison defaults always
  supply `aria-label`.
- ARIA labels, descriptions, and details are forwarded to the progressbar root.
- Determinate value text remains generated by the shared progress primitive;
  indeterminate state intentionally omits determinate value attributes.

## Style Source-To-Computed

- React Spectrum S2 renders a square wrapper with a full-size SVG and three
  circles: forced-colors outline, track, and fill. Solid ports that DOM contract.
- Wrapper sizes match S2: S=16px, M=32px, L=64px.
- Radius values match S2: S=`calc(50% - 0.0625rem)`,
  M=`calc(50% - 0.09375rem)`, L=`calc(50% - 0.125rem)`.
- Fill stroke follows S2 blue-900 by default, static overlay for static colors,
  and `ButtonText` in forced colors.

## Known Defects And Regression Protection

- No open ProgressCircle-specific caveats remain in this checkpoint.
- Focused tests cover root/SVG geometry, determinate dash offset, size radius,
  indeterminate ARIA and animation state, static color, data attrs, slot, and
  unsafe style/class escape hatches.
- Comparison controls serialize normalized props on both stacks, which makes the
  route-control contract detect stale option lists or fixture-only props.
