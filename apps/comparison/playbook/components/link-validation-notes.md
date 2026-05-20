# Link Validation Notes

Date: 2026-05-20
Status: accepted

Link has now been normalized against the current acceptance gates. Historical
evidence from the original 2026-05-15 pass is superseded by this closeout,
which records the corrected S2 API boundary, headless press event parity,
comparison harness coverage, and refreshed report/guard evidence.

## Current-Gate Closeout

- Scope: styled S2 `Link`, `LinkContext`, public package root exports,
  Solidaria headless Link press events, comparison route controls, docs examples,
  visual-state matrix coverage, and Skeleton text consumer behavior.
- Sources rechecked: React Spectrum S2 Link API/events docs, React Aria Link API,
  S2 Link source, S2 package root exports, Solid Link/Solidaria sources,
  comparison route controls, Link visual spec, and existing Link unit tests.
- Result: accepted for Link. Solid now exposes the documented S2 Link surface:
  `variant` is `primary | secondary`, `staticColor` is `auto | black | white`,
  `isStandalone`/`isQuiet` drive the styled branches, `UNSAFE_className` and
  `UNSAFE_style` remain escape hatches, and the styled component no longer
  exposes the legacy `subtle` variant, legacy `class` alias, styled
  `isDisabled`, hover callbacks, or `onClick` branch. Headless Solidaria Link
  still owns RAC-level disabled/hover/class/style/render behavior.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and docs examples match the S2 surface for
      `children`, `href`, `variant`, `staticColor`, `isStandalone`, `isQuiet`,
      ARIA label props, native anchor props, press/focus/key events, `slot`,
      `styles`, unsafe props, and `ref`.
- [x] Styled public type: `LinkProps` omits S2-excluded headless props:
      `isDisabled`, `class`, raw `style`, render-function children, hover
      callbacks, and `onClick`; package root type exports only `LinkProps`.
- [x] Headless parity: Solidaria Link forwards the full S2/RAC press event
      surface, including `onPressUp` and `onPressChange`, while preserving the
      lower-level RAC-compatible disabled/hover/class/style behavior outside the
      styled S2 wrapper.
- [x] DOM/accessibility contract: links render as `a` with `href` or
      `span role="link"` without `href`; S2-styled Link does not inherit
      Provider disabled state, does not strip `href` through a styled disabled
      prop, forwards documented ARIA/native anchor props, and exposes refs.
- [x] Style source-to-computed: S2 style macro output covers primary/secondary,
      static color, standalone typography, quiet hover/focus underline,
      focus ring, forced-colors, context style merging, and Skeleton text.
- [x] Harness contract: route controls match the docs-style option surface, the
      visual-state matrix includes Link root DOM contract coverage, and browser
      computed contracts compare root DOM, style branches, hover, and
      forced-colors behavior against React Spectrum.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      Link Playwright, regression slice, reports, guards, README status, and
      this note are refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                                |
| ----------------------- | ------ | ----------------------------------------------------------------------- |
| Research                | done   | S2 Link API/events, RAC Link API, S2 Link source, root exports          |
| Baseline and source map | done   | Existing note plus current source/API/export recheck                    |
| Implementation          | done   | Styled API narrowing, press event forwarding, root export cleanup       |
| Harness                 | done   | Docs/playground cleanup, root DOM matrix row, visual contract expansion |
| Verification            | done   | Focused unit tests, package builds, comparison build, Link visual e2e   |
| Handoff                 | done   | README normalization status, closeout note, commit                      |

## Behavior State Machine

- Stable states: no-`href` span link; native anchor link; primary and secondary
  variants; default, black, white, and auto static color branches; inline,
  standalone, quiet standalone, and Skeleton loading consumer states.
- Interaction states: hover toggles the quiet standalone underline; keyboard
  focus-visible applies focus ring and quiet underline; press dispatches
  `onPressStart`, `onPressChange`, `onPressUp`, `onPressEnd`, and `onPress`.
- Context states: `LinkContext` can provide slotted style, unsafe style/class,
  visual props, refs, and children; local unsafe class/style props override
  context unsafe values through the same shared S2 context helpers used by the
  rest of the styled package.
- Environment states: forced-colors active resolves to the same computed color
  and focus outline contract as React Spectrum.
- Cleanup contract: Link owns no timers, portals, observers, subscriptions, or
  global listeners; Skeleton only contributes inert/text wrapping while loading.

## Accessibility And I18n

- Anchor mode uses native `a[href]` semantics and forwards documented native
  anchor attributes: `target`, `rel`, `download`, `hrefLang`, `ping`, and
  `referrerPolicy`.
- Action mode without `href` renders `span role="link"` and uses normalized
  press events instead of exposing a styled `onClick` branch.
- ARIA props covered by the S2 API, including `aria-label`,
  `aria-labelledby`, `aria-describedby`, `aria-details`, and `aria-current`,
  flow through to the rendered link.
- Link has no generated IDs, live-region behavior, locale-specific formatting,
  or bidirectional text transforms.
- Provider disabled state is intentionally not inherited by styled Link because
  S2 Link omits `isDisabled`; disabled Link semantics remain available at the
  headless Solidaria component layer.

## Style Source-To-Computed

- React S2 Link source wraps RAC Link with S2 `focusRing`, `staticColor`,
  `baseColor`, standalone font/weight treatment, quiet underline conditions,
  forced-colors overrides, `LinkContext`, and Skeleton text/inert handling.
- Solid S2 Link now follows that contract without accepting the prior styled
  `subtle` alias, `class` alias, or disabled/hover/click compatibility props.
- Browser contracts compare root tag/role/href, absent disabled markers,
  variant/staticColor data attributes, text color, typography, underline,
  focus outline, quiet hover branch, and forced-colors output against React
  Spectrum.

## Source Packet

| Source                   | Files or docs                                                  | Finding                                                                                                                                |
| ------------------------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Link` API and Events                                          | Public API includes variants `primary`/`secondary`, static color, standalone/quiet, native anchor props, ARIA props, and press events. |
| React Aria docs MCP      | `Link` API                                                     | RAC Link still owns disabled, hover callbacks, class/style functions, render override, and compatibility `onClick`.                    |
| React Spectrum S2 source | `@react-spectrum/s2/src/Link.tsx`                              | S2 omits disabled, class/style/render/children functions, hover callbacks, `onClick`, and global DOM attrs from the styled surface.    |
| Solid source after pass  | `packages/solid-spectrum/src/link/index.tsx`                   | Solid matches the S2 styled prop boundary and no longer maps `subtle`, `class`, disabled, hover callbacks, or `onClick`.               |
| Solidaria source         | `packages/solidaria/src/link/createLink.ts`, components Link   | Press event forwarding now includes `onPressUp` and `onPressChange`.                                                                   |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `link-visual` e2e | Link is live on both stacks with strict default evidence, route-control checks, root DOM contract, hover, and forced-colors.           |

## Official Docs And Viewer Parity

| Docs item      | Official setting/example                        | Route/control                                     | Status  | Evidence                                |
| -------------- | ----------------------------------------------- | ------------------------------------------------- | ------- | --------------------------------------- |
| `children`     | visible Link content                            | text input, default `View project`                | matched | e2e asserts default and changed values  |
| `href`         | URL for native anchor links                     | text input, default `https://example.com/project` | matched | e2e and unit tests                      |
| `variant`      | `primary`, `secondary`; default `primary`       | radio options in S2 order                         | matched | e2e asserts option labels/order/default |
| `staticColor`  | `auto`, `black`, `white`, or undefined          | radio options `default`, `black`, `white`, `auto` | matched | e2e asserts labels/order/default/matrix |
| `isStandalone` | standalone typography/weight branch             | switch, default off                               | matched | e2e asserts default and changed value   |
| `isQuiet`      | quiet standalone underline interaction branch   | switch, default off                               | matched | unit and e2e hover tests                |
| Native attrs   | target, rel, download, hrefLang, ping, referrer | component API                                     | matched | unit test                               |
| ARIA/events    | labels, current, focus, key, press events       | component API                                     | matched | unit tests                              |
| `slot`         | named slot or `null`                            | component API and context merge                   | matched | unit context test                       |
| `styles`       | S2 style macro override                         | component API                                     | matched | source audit and browser contract       |
| unsafe props   | `UNSAFE_className`, `UNSAFE_style`              | component API                                     | matched | unit tests                              |

## Baseline

- Before the support sweep, Link was a catalogue gap with no live Solid styled
  route and no Link-specific strict visual evidence.
- The initial Link pass made the component live and visually covered, but kept
  compatibility branches that S2 does not expose: `subtle`, styled `class`,
  styled `isDisabled`, hover callbacks, and `onClick`.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `263`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `155`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `4`.

## Source Map And Public Contract

| Layer               | Upstream files                      | Solid files                                       | Status  |
| ------------------- | ----------------------------------- | ------------------------------------------------- | ------- |
| State               | RAC Link internals                  | Solidaria Link internals                          | matched |
| ARIA hooks          | React Aria Link/usePress behavior   | Solidaria Link/createPress behavior               | matched |
| Headless components | `react-aria-components/Link`        | `@proyecto-viviana/solidaria-components/Link`     | matched |
| Styled S2           | `@react-spectrum/s2/src/Link.tsx`   | `packages/solid-spectrum/src/link/index.tsx`      | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `variant`: default `primary`, supports `primary` and `secondary` only.
  - `staticColor`: no default, supports `black`, `white`, and `auto`.
  - `isStandalone` and `isQuiet`: default false.
  - `children`, `href`, ARIA label/current/description props, native anchor
    props, focus/key/press events, `routerOptions`, `slot`, `styles`,
    `UNSAFE_className`, `UNSAFE_style`, and `ref` are preserved.
  - The styled S2 wrapper intentionally omits `isDisabled`, hover callbacks,
    `onClick`, legacy `class`, raw `style`, render override, and render-function
    children.
- Contexts/providers:
  - `LinkContext` is exported and consumed through the shared S2 slotted context
    helper.
  - Public package root Link exports match S2: values `Link` and `LinkContext`,
    plus type `LinkProps`.
  - Provider disabled state is not inherited by styled Link.
  - Skeleton consumers mark the link inert and wrap the label with skeleton
    text.
- Refs/imperative behavior:
  - Ref merging includes context/local refs and the Skeleton inert ref.

## Source Branch Coverage

| Layer    | Upstream branch                        | Solid owner              | Class              | Observable                                      | Status  | Evidence                                  |
| -------- | -------------------------------------- | ------------------------ | ------------------ | ----------------------------------------------- | ------- | ----------------------------------------- |
| Headless | no `href` renders span link            | Solidaria `Link`         | semantics          | `span role="link"`                              | matched | unit test                                 |
| Headless | `href` renders native anchor           | Solidaria `Link`         | semantics          | `a[href]` and native anchor attrs               | matched | unit and e2e tests                        |
| Headless | current link state                     | Solidaria `Link`         | semantics          | `aria-current` and `data-current`               | matched | unit test                                 |
| Headless | focus/key handling                     | Solidaria `Link`         | interaction        | focus-visible attrs and keyboard events         | matched | unit tests                                |
| Headless | full press event surface               | Solidaria `Link`         | interaction        | press start/change/up/end/press callbacks       | matched | unit tests                                |
| Styled   | S2 prop boundary                       | S2 `Link` wrapper        | API                | no subtle/class/disabled/hover/click branches   | matched | unit tests                                |
| Styled   | focus ring                             | S2 `Link` style macro    | visual/a11y        | focus outline color/width/radius                | matched | unit focus test and e2e computed contract |
| Styled   | variant color map                      | S2 `Link` style macro    | visual             | primary accent and secondary neutral color      | matched | e2e full variant matrix                   |
| Styled   | staticColor map                        | S2 `Link` style macro    | visual             | black/white/auto transparent overlay branches   | matched | e2e full staticColor matrix               |
| Styled   | standalone typography                  | S2 `Link` style macro    | visual/text        | UI font and medium weight                       | matched | unit and e2e tests                        |
| Styled   | quiet standalone hover/focus underline | S2 `Link` style macro    | interaction/visual | underline appears on hover/focus-visible        | matched | unit focus/hover and e2e hover branch     |
| Styled   | forced-colors color/outline branches   | generated S2 CSS         | visual/a11y        | LinkText/Highlight computed contract            | matched | e2e forced-colors test                    |
| Styled   | `LinkContext` merge                    | S2 `Link`                | context            | context unsafe/style props merge with locals    | matched | unit test                                 |
| Styled   | Skeleton text/inert branch             | `Skeleton` text consumer | loading/semantics  | inert link and skeleton text child              | matched | unit test                                 |
| Harness  | route control surface                  | comparison route         | route integrity    | visible labels/order/defaults and changed props | matched | e2e route-control test                    |

## Evidence

```bash
vp test run packages/solid-spectrum/test/Link.test.tsx packages/solidaria-components/test/Link.test.tsx
vp run --filter @proyecto-viviana/solidaria build
vp run --filter @proyecto-viviana/solidaria-components build
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/link-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Link" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solid Link tests: `47 passed`.
- Solidaria build: passed.
- Solidaria Components build: passed.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/link/`.
- Link Playwright suite: `5 passed`.
- Link regression snapshot slice: `1 passed`, `49 skipped`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `263`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `155`,
  missing React S2 value exports at `57` of `208`, and extra Solid value exports
  at `4`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: Link is accepted as of 2026-05-20.
- Headless disabled/hover/class/style/render behavior remains owned by
  Solidaria Components and is intentionally not re-exposed by styled S2 Link.
- Next legacy normalization candidates in `components/README.md`: Meter,
  Skeleton, and StatusLight.
