# ProgressBar Validation Notes

Date: 2026-05-25
Status: accepted

## Acceptance Gate Checklist

- [x] Public API matches the React Spectrum S2 ProgressBar surface for
      `label`, `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`,
      `isIndeterminate`, `size`, `staticColor`, `labelPosition`, ARIA label and
      description props, `slot`, `styles`, unsafe props, `id`, and `ref`.
- [x] Official docs/viewer surface is recorded separately from API/source extra
      controls; the live 2026-05-25 S2 docs page exposes interactive viewer
      controls for `label`, `value`, `isIndeterminate`, `size`, `staticColor`,
      `labelPosition`, `formatOptions`, and `valueLabel`.
- [x] Styled public boundary excludes legacy variants, legacy sizes,
      `showValueLabel`, raw `style`, and the Solid `class` alias.
- [x] Comparison viewer controls model every visual S2 prop branch that can be
      driven without custom children: label, value range, value label,
      indeterminate state, size, static color, label position, and generated
      value formatting.
- [x] Accessibility behavior is delegated to Solidaria `createProgressBar`,
      with visible-label association and indeterminate ARIA value omission
      covered by focused tests.
- [x] Style source-to-computed mapping ports the S2 wrapper grid, FieldLabel
      text, track/fill geometry, static-color overlays, size map, forced-colors
      branch, and RTL/LTR indeterminate animation.
- [x] Regression protection includes focused styled tests, comparison control
      contract coverage, visual-state matrix evidence, docs/playground cleanup,
      and the package regression snapshot slice.

## Agent Workflow

| Step                    | Status | Evidence                                                     |
| ----------------------- | ------ | ------------------------------------------------------------ |
| Research                | done   | S2 ProgressBar docs/source and RAC ProgressBar docs          |
| Baseline and source map | done   | Existing Solid wrapper and comparison fixtures               |
| Implementation          | done   | Styled S2 API, context, layout, styles, and animation        |
| Harness                 | done   | Demo data, side-panel controls, React/Solid fixtures, matrix |
| Verification            | done   | Focused unit, comparison, parity, and check commands         |
| Handoff                 | done   | README status and this note                                  |

## Official Docs And Viewer Parity

| Docs item                   | Official setting/example                                                                                                                                                                    | Route/control                                                                                                                          | Status  | Evidence                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Page sections               | `Value`, `API`                                                                                                                                                                              | validation note and API prop inventory                                                                                                 | covered | S2 MCP page info checked 2026-05-25                                       |
| Interactive viewer controls | `label`, `value`, `isIndeterminate`, `size`, `staticColor`, `labelPosition`, `formatOptions`, `valueLabel`                                                                                  | side-panel controls with matching defaults and public option surface                                                                   | covered | live S2 docs page checked 2026-05-25; control spec + mounted DOM contract |
| Value section examples      | value range defaults to 0-100 and can be customized with `minValue`/`maxValue`                                                                                                              | `minValue` and `maxValue` route controls                                                                                               | covered | live S2 docs page checked 2026-05-25; focused package tests               |
| API surface                 | `label`, `value`, `minValue`, `maxValue`, `valueLabel`, `formatOptions`, `isIndeterminate`, `size`, `staticColor`, `labelPosition`, ARIA props, `id`, `slot`, `styles`, unsafe props, `ref` | API/source inventory, route controls for visual branches, focused package tests for forwarded slot/unsafe props and progress semantics | covered | component controls, source map, focused tests                             |

| Route control     | Source surface  | Official values                           | Route values                                                | Status  | Evidence                                     |
| ----------------- | --------------- | ----------------------------------------- | ----------------------------------------------------------- | ------- | -------------------------------------------- |
| `label`           | official-viewer | text; default `Loading…`                  | text; default `Loading…`                                    | covered | control spec + mounted DOM contract          |
| `value`           | official-viewer | numeric; default `50`                     | numeric text input; default `50`                            | covered | control spec + progress width/ARIA tests     |
| `isIndeterminate` | official-viewer | boolean; default off                      | switch; default off                                         | covered | focused package tests + visual-state matrix  |
| `size`            | official-viewer | `S`, `M`, `L`, `XL`; default `M`          | `S`, `M`, `L`, `XL`; default `M`                            | covered | visual-state matrix + control spec           |
| `staticColor`     | official-viewer | `white`, `black`, `auto`; default omit    | `white`, `black`, `auto`; reset/default omits prop          | covered | static-color regression tests + control spec |
| `labelPosition`   | official-viewer | `top`, `side`; default `top`              | `top`, `side`; default `top`                                | covered | visual-state matrix + control spec           |
| `formatOptions`   | official-viewer | `Decimal`, `Percent`, `Currency`, `Unit`  | `decimal`, `percent`, `currency`, `unit`; default `percent` | covered | control spec + generated value-label tests   |
| `valueLabel`      | official-viewer | text; default empty                       | text; default empty                                         | covered | focused package tests                        |
| `minValue`        | api-extra       | Value-section example prop; default `0`   | numeric text input; default `0`                             | covered | focused package tests                        |
| `maxValue`        | api-extra       | Value-section example prop; default `100` | numeric text input; default `100`                           | covered | focused package tests                        |

## Behavior State Machine

- Determinate: exposes `aria-valuenow/min/max`, generated percent value text,
  clamped fill width, and visible value text when a label is present.
- Custom range: computes fill percentage from `minValue`, `maxValue`, and
  `value`; equal ranges are guarded from `NaN`.
- Custom value label: string/number labels become `aria-valuetext` and visible
  value text; renderable labels remain display-only.
- Indeterminate: omits determinate ARIA value text/now, hides the value slot,
  and uses the S2 moving fill animation with locale-aware direction.
- Visual branches: S/M/L/XL sizes, top/side label position, default/white/black
  /auto static color, forced colors, and unsafe style/class escape hatches.

## Accessibility And I18n

- Visible `label` is linked with an internal ID through `aria-labelledby` unless
  an explicit ARIA label is supplied.
- ARIA labels, descriptions, and details are forwarded to the progressbar root.
- `formatOptions` remains delegated to the shared localized number formatting
  path in `createProgressBar`.
- RTL changes the indeterminate animation direction to match React Spectrum S2.

## Style Source-To-Computed

- React Spectrum S2 uses shared bar utilities for a grid root with label/value
  areas and track/fill styling. Solid ports those macro branches directly.
- Track heights match S2: S=4px, M=6px, L=8px, XL=10px.
- Fill color follows S2 accent by default, static overlay for static colors,
  and `ButtonText` in forced colors.
- Track color follows gray-300 by default, static overlay for static colors,
  and `ButtonFace` plus outline in forced colors.

## Known Defects And Regression Protection

- No open ProgressBar-specific caveats remain in this checkpoint.
- Focused tests cover semantics, label association, value text, custom labels,
  indeterminate state, S2 visual props, data attrs, slot, unsafe style/class,
  clamping, and equal-range defense.
- Comparison controls serialize normalized props on both stacks, which makes the
  route-control contract detect stale option lists or fixture-only props.
