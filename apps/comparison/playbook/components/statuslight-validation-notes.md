# StatusLight Validation Notes

Date: 2026-05-20
Status: accepted

StatusLight has now been normalized against the current acceptance gates.
Historical evidence from the original 2026-05-15 pass is superseded by this
closeout, which records the corrected S2 API boundary, root DOM filtering,
comparison viewer parity, browser contract coverage, and refreshed
report/guard evidence.

## Current-Gate Closeout

- Scope: styled S2 `StatusLight`, `StatusLightContext`, public package root
  exports, comparison route controls, visual-state matrix coverage, Skeleton
  consumer behavior, and focused styled/browser tests.
- Sources rechecked: React Spectrum S2 StatusLight API, S2 StatusLight source,
  S2 package root exports, Solid StatusLight/Text/Skeleton sources, comparison
  route controls, StatusLight visual spec, and existing StatusLight unit tests.
- Result: accepted for StatusLight. Solid now exposes the documented S2
  surface: `children`, documented `variant` values, `size` values `S | M | L |
XL`, optional `role="status"`, `id`, role-gated ARIA label props, `slot`,
  `styles`, `UNSAFE_className`, `UNSAFE_style`, `data-*` harness attributes,
  and `ref`. The styled wrapper no longer exposes legacy `info`, `sm`/`md`/`lg`
  aliases, legacy `class`, legacy `indicatorClass`, raw `style`, arbitrary DOM
  events, or exported root type aliases beyond `StatusLightProps`.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and route defaults match the S2 surface
      for `children`, `variant`, `size`, optional `role="status"`, style
      props, unsafe props, ARIA labels, `id`, `slot`, and `ref`.
- [x] Styled public type: `StatusLightProps` omits the prior compatibility
      aliases and arbitrary DOM event/style/class props; package root type
      exports only `StatusLightProps`.
- [x] DOM/accessibility contract: styled StatusLight renders the S2 `div` root,
      forwards only S2-filtered `id`/`data-*` props by default, forwards label
      ARIA props only when the status role is present, and keeps `role`
      optional.
- [x] Style source-to-computed: S2 style macro output covers wrapper layout,
      typography, default/neutral color branch, every documented light fill,
      all S2 light sizes, text slot wrapping, Skeleton light fill, and
      forced-colors behavior.
- [x] Harness contract: route controls match the docs-style option surface, the
      visual-state matrix includes StatusLight root DOM contract coverage, and
      browser computed contracts compare root DOM, style branches, status role,
      and forced-colors output against React Spectrum.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      StatusLight Playwright, regression slice, reports, guards, README status,
      and this note are refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                              |
| ----------------------- | ------ | --------------------------------------------------------------------- |
| Research                | done   | S2 StatusLight API/source, package root exports, current Solid source |
| Baseline and source map | done   | Existing note plus current source/API/export recheck                  |
| Implementation          | done   | Styled API narrowing, root export cleanup, DOM prop boundary cleanup  |
| Harness                 | done   | Route root API props, root DOM matrix row, visual contract expansion  |
| Verification            | done   | Focused unit tests, package builds, comparison build, StatusLight e2e |
| Handoff                 | done   | README normalization status, current-gate closeout note, commit       |

## Behavior State Machine

- Stable states: text label; no children with explicit ARIA label; optional
  `role="status"`; default variant/size fallback; every documented semantic and
  categorical variant; all S2 sizes.
- Visual states: wrapper layout/typography, neutral root color branch, SVG
  light fill variants, S/M/L/XL SVG light sizes, text slot treatment, Skeleton
  loading light branch, and forced-colors active branch.
- Context states: `StatusLightContext` can provide slotted visual props, role,
  ARIA props, styles, unsafe class/style, and refs; local unsafe class merges
  with context unsafe class and local unsafe style overrides context style keys.
- Interaction states: no direct user interaction belongs to StatusLight; raw DOM
  event compatibility props are not part of the styled S2 API and are filtered
  from the root.
- Cleanup contract: StatusLight owns no timers, portals, observers,
  subscriptions, global listeners, generated IDs, or async lifecycle.

## Accessibility And I18n

- The root is a native `div`; `role="status"` is present only when requested.
- Label ARIA props are S2-filtered: `aria-label`, `aria-labelledby`,
  `aria-describedby`, and `aria-details` are forwarded only when a role is
  present.
- Development warnings mirror the S2 source for missing label text and labelled
  StatusLights without a role.
- StatusLight owns no locale-sensitive formatting, generated labels,
  bidirectional text transforms, or live-update batching. The S2 guidance that
  only one status light should update simultaneously remains a caller
  responsibility.

## Style Source-To-Computed

- React S2 StatusLight source renders a flex wrapper with `CenterBaseline`, an
  aria-hidden SVG circle, `Text` for the label, `StatusLightContext`,
  `useIsSkeleton`, S2 style macro branches, `filterDOMProps` with
  `labelable: !!role`, and optional unsafe escape hatches.
- Solid follows that observable contract without the prior compatibility
  aliases for variant, size, root class, indicator class, raw style, or root
  events.
- Browser contracts compare root tag/id/data attributes, role, role-gated ARIA
  attributes, root layout/typography/color, SVG light dimensions/fill/overflow,
  CenterBaseline wrapper styles, text slot DOM, every documented variant, every
  S2 size, and forced-colors output against React Spectrum.

## Source Packet

| Source                   | Files or docs                                                         | Finding                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `StatusLight` API                                                     | Public API includes `children`, documented variants, S/M/L/XL sizes, optional `role="status"`, label ARIA props, style props, and `slot`.     |
| React Spectrum S2 source | `@react-spectrum/s2/src/StatusLight.tsx`                              | S2 uses a flex wrapper, `CenterBaseline`, SVG circle fill/size, `Text`, `StatusLightContext`, `useIsSkeleton`, and filtered DOM props.        |
| Solid source after pass  | `packages/solid-spectrum/src/statuslight/index.tsx`                   | Solid matches the S2 styled prop boundary and strips the prior legacy aliases/event/style/class compatibility branches.                       |
| Solid consumer sources   | Text and Skeleton                                                     | Text slot and Skeleton loading consumers continue to cover inert text and skeleton light behavior.                                            |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `statuslight-visual` e2e | StatusLight is live on both stacks with strict default evidence, route-control checks, root DOM contract, computed matrix, and forced-colors. |

## Official Docs And Viewer Parity

| Docs item     | Official setting/example                                     | Route/control                                 | Status  | Evidence                                |
| ------------- | ------------------------------------------------------------ | --------------------------------------------- | ------- | --------------------------------------- |
| `children`    | visible StatusLight label                                    | text input, default `Sync complete`           | matched | e2e asserts default and changed values  |
| `variant`     | all S2 semantic/categorical variants                         | select options in S2 order, default `neutral` | matched | e2e asserts option labels/order/default |
| `size`        | `S`, `M`, `L`, `XL`; default `M`                             | radio options in S2 order                     | matched | e2e asserts option labels/order/default |
| `role`        | optional `status` role                                       | radio options `default`, `status`             | matched | e2e asserts labels/order/default        |
| ARIA labels   | labelable only when the status role is used in the S2 source | component API and route fixture               | matched | unit and e2e tests                      |
| `id`/`data-*` | filtered DOM props                                           | route fixture                                 | matched | e2e root DOM contract                   |
| `slot`        | named slot or `null`                                         | component API and context merge               | matched | source audit and unit context test      |
| `styles`      | S2 style macro override                                      | component API                                 | matched | source audit and browser contract       |
| unsafe props  | `UNSAFE_className`, `UNSAFE_style`                           | component API                                 | matched | unit tests                              |

## Baseline

- Before the support sweep, StatusLight was a catalogue gap with no live Solid
  styled route and no StatusLight-specific strict visual evidence.
- The initial StatusLight pass made the component live and visually covered, but
  kept compatibility branches that S2 does not expose: legacy `info`,
  `sm`/`md`/`lg`, `class`, `indicatorClass`, and generic DOM prop pass-through.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `266`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `155`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `4`.

## Source Map And Public Contract

| Layer               | Upstream files                            | Solid files                                         | Status  |
| ------------------- | ----------------------------------------- | --------------------------------------------------- | ------- |
| State               | none                                      | none                                                | n/a     |
| ARIA hooks          | none                                      | none                                                | n/a     |
| Headless components | native `div`, SVG, and `Text` composition | native `div`, SVG, and `Text` composition           | matched |
| Styled S2           | `@react-spectrum/s2/src/StatusLight.tsx`  | `packages/solid-spectrum/src/statuslight/index.tsx` | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture       | demo data, controls, fixtures, visual matrix, e2e   | matched |

- Public props/defaults:
  - `variant`: default `neutral`; supports `informative`, `neutral`,
    `positive`, `notice`, `negative`, `yellow`, `chartreuse`, `celery`,
    `seafoam`, `cyan`, `indigo`, `purple`, `fuchsia`, `magenta`, `pink`,
    `turquoise`, `brown`, `cinnamon`, and `silver`.
  - `size`: default `M`; supports `S`, `L`, and `XL`.
  - `role`: optional `status`; labelable ARIA props are forwarded only when the
    role is present.
  - `children`, `id`, `data-*` harness props, `slot`, `styles`,
    `UNSAFE_className`, `UNSAFE_style`, and `ref` are preserved.
  - The styled S2 wrapper intentionally omits legacy variant/size aliases,
    legacy class aliases, raw style, arbitrary events, and arbitrary DOM props.
- Contexts/providers:
  - `StatusLightContext` is exported and consumed through the shared S2 slotted
    context helper.
  - Public package root StatusLight exports match S2: values `StatusLight` and
    `StatusLightContext`, plus type `StatusLightProps`.
  - `TextContext` wraps the label so primitive text receives the S2 text slot.
  - Skeleton consumers mark text inert and switch the SVG light to the skeleton
    fill branch.
- Refs/imperative behavior:
  - Ref merging includes context/local refs.

## Source Branch Coverage

| Layer   | Upstream branch                      | Solid owner                    | Class              | Observable                                       | Status  | Evidence                |
| ------- | ------------------------------------ | ------------------------------ | ------------------ | ------------------------------------------------ | ------- | ----------------------- |
| Styled  | S2 prop boundary                     | S2 `StatusLight` wrapper       | API                | no legacy class/size/variant/event/style props   | matched | unit tests              |
| Styled  | DOM prop filtering                   | Solidaria `filterDOMProps`     | route integrity    | id/data attrs and role-gated ARIA labels         | matched | unit and e2e tests      |
| Styled  | wrapper layout                       | S2 `StatusLight` style macro   | visual/layout      | display, gap, baseline alignment, width, font    | matched | e2e computed contract   |
| Styled  | wrapper color default/neutral branch | S2 `StatusLight` style macro   | visual             | root foreground color                            | matched | e2e computed contract   |
| Styled  | SVG light `variant` fill map         | S2 `StatusLight` style macro   | visual             | every documented fill token                      | matched | e2e full variant matrix |
| Styled  | SVG light `size` S/M/L/XL            | S2 `StatusLight` style macro   | visual             | light width/height                               | matched | e2e size matrix         |
| Styled  | SVG light overflow                   | S2 `StatusLight` style macro   | visual             | `overflow: visible`                              | matched | e2e computed contract   |
| Styled  | `CenterBaseline` composition         | `CenterBaseline` helper        | visual/composition | centered baseline wrapper                        | matched | e2e computed contract   |
| Styled  | text child wrapping                  | `TextContext` + `Text`         | composition        | primitive text receives `data-rsp-slot="text"`   | matched | unit and e2e tests      |
| Styled  | optional `role="status"`             | native root `div`              | a11y               | live status role only when requested             | matched | unit and e2e tests      |
| Styled  | S2 dev warnings                      | S2 `StatusLight` wrapper       | developer feedback | missing label and labelled-without-role warnings | matched | unit and source audit   |
| Styled  | `StatusLightContext` merge           | S2 `StatusLight`               | context            | context props apply and unsafe props merge       | matched | unit test               |
| Styled  | skeleton text/light consumers        | `Skeleton` and `useIsSkeleton` | loading/visual     | inert text and skeleton light fill               | matched | unit test               |
| Styled  | forced-colors environment            | generated S2 CSS               | visual/a11y        | computed contract matches React                  | matched | e2e forced-colors test  |
| Harness | route control surface                | comparison route               | route integrity    | visible labels/order/defaults and changed props  | matched | e2e route-control test  |
| Harness | root DOM contract                    | comparison visual spec         | route integrity    | root id/data, role, and ARIA filtering           | matched | e2e root DOM contract   |

## Evidence

```bash
vp test run packages/solid-spectrum/test/StatusLight.test.tsx packages/solid-spectrum/test/Skeleton.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/statuslight-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: StatusLight" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused StatusLight/Skeleton tests: `16 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/statuslight/`.
- StatusLight Playwright suite: `5 passed`.
- StatusLight regression snapshot slice: `1 passed`, `49 skipped`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `266`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `155`,
  missing React S2 value exports at `57` of `208`, and extra Solid value
  exports at `4`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: StatusLight is accepted as of 2026-05-20.
- No legacy StatusLight compatibility aliases remain in the styled S2 wrapper.
- Next component should be selected from `components/README.md` after this
  commit.
