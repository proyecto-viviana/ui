# Link Validation Notes

## Target

- Component: Link
- Slug: link
- Family or direct subcomponents: LinkContext, RAC/Solidaria Link,
  Skeleton text consumer
- Pass goal: S2 styled Link parity, route controls, static color coverage,
  hover/focus behavior, skeleton text behavior, forced-colors parity, and strict
  default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                               | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------ | ---------------------- |
| 0 Research             | done   | S2 Link docs and S2 source                                                                             | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                      | None                   |
| 2 Route harness        | done   | Link controls, route defaults, React/Solid fixtures, visible control assertions                        | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                   | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers RAC link semantics, styling branches, context, skeleton, events, and attributes   | None                   |
| 5 Transitions          | done   | Hover/focus/press, static-color, skeleton, and forced-colors obligations recorded                      | None                   |
| 6 State                | n/a    | No state package owner                                                                                 | None                   |
| 7 ARIA hooks           | done   | Link behavior is owned by RAC/Solidaria Link                                                           | None                   |
| 8 Headless             | done   | Anchor/span switching, role, disabled, current, focus, hover, and press behavior covered by unit tests | None                   |
| 9 Styled S2            | done   | `Link`, `LinkContext`, S2 style macro branches, unit tests, computed browser matrix                    | None                   |
| 10 Runtime lifecycle   | done   | Static DOM plus Solidaria event handling; no timers, overlays, portals, or global listeners            | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, computed matrix, hover branch, forced-colors     | None                   |
| 12 Comparison evidence | done   | Link Playwright suite `5 passed`; current reports and guards refreshed                                 | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                              | None                   |

## Source Packet

| Source                   | Files or docs                                                  | Finding                                                                                                                              |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| S2 docs MCP              | `Link` page                                                    | Public API includes `children`, `href`, `variant`, `staticColor`, `isStandalone`, `isQuiet`, ARIA labels, anchor props, and events.  |
| React Spectrum S2 source | `@react-spectrum/s2/src/Link.tsx`                              | Link wraps RAC Link, uses `focusRing`, `staticColor`, `baseColor`, `LinkContext`, skeleton text, and inert skeleton sync.            |
| Solid source before pass | `packages/solid-spectrum/src/link/index.tsx`                   | Solid already used the S2 style macro from the support sweep; route-control and forced-colors evidence were incomplete.              |
| Solid source after pass  | `packages/solid-spectrum/src/link/index.tsx`                   | Solid matches the S2 styling path, Solidaria link semantics, context merge, skeleton text branch, and legacy `subtle` alias.         |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `link-visual` e2e | Link is live on both stacks with strict default visual evidence, route-control checks, computed contracts, hover, and forced-colors. |

## Official Docs And Viewer Parity

| Docs item      | Official setting/example                        | Route/control                                     | Status  | Evidence                                |
| -------------- | ----------------------------------------------- | ------------------------------------------------- | ------- | --------------------------------------- |
| `children`     | visible Link content                            | text input, default `View project`                | matched | e2e asserts default and changed values  |
| `href`         | URL for native anchor links                     | text input, default `https://example.com/project` | matched | e2e and unit tests                      |
| `variant`      | `primary`, `secondary`; default `primary`       | radio options in S2 order                         | matched | e2e asserts option labels/order/default |
| `staticColor`  | `auto`, `black`, `white`, or undefined          | radio options `default`, `black`, `white`, `auto` | matched | e2e asserts labels/order/default/matrix |
| `isStandalone` | standalone typography/weight branch             | switch, default off                               | matched | e2e asserts default and changed value   |
| `isQuiet`      | quiet standalone underline interaction branch   | switch, default off                               | matched | unit and e2e hover tests                |
| Native attrs   | target, rel, download, hrefLang, referrerPolicy | component API                                     | matched | unit test                               |
| ARIA/events    | labels, current state, focus, hover, press      | component API                                     | matched | unit tests                              |
| `slot`         | named slot or `null`                            | component API and context merge                   | matched | unit context test                       |
| `styles`       | S2 style macro override                         | component API                                     | matched | style macro accepts allowed overrides   |
| unsafe props   | `UNSAFE_className`, `UNSAFE_style`              | component API                                     | matched | unit tests                              |

## Baseline

- Before the support sweep, Link was a catalogue gap with no live Solid styled
  route and no Link-specific strict visual evidence.
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
- Current reports list Link live and strict:
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `175`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`.
- Improvement target: close Link retro-audit gaps without changing its accepted
  public behavior.

## Source Map And Public Contract

| Layer               | Upstream files                      | Solid files                                       | Status  |
| ------------------- | ----------------------------------- | ------------------------------------------------- | ------- |
| State               | none                                | none                                              | n/a     |
| ARIA hooks          | RAC Link internals                  | Solidaria Link internals                          | matched |
| Headless components | `react-aria-components/Link`        | `@proyecto-viviana/solidaria-components/Link`     | matched |
| Styled S2           | `@react-spectrum/s2/src/Link.tsx`   | `packages/solid-spectrum/src/link/index.tsx`      | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `variant`: default `primary`, supports `secondary`.
  - `staticColor`: no default, supports `black`, `white`, and `auto`.
  - `isStandalone` and `isQuiet`: default false.
  - `children`, `href`, ARIA label props, native anchor props, event props,
    `slot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref` are
    preserved.
- Contexts/providers:
  - `LinkContext` is exported and consumed through the shared S2 slotted context
    helper.
  - `Skeleton` consumers mark the link inert and wrap the label with skeleton
    text.
- Refs/imperative behavior:
  - Ref merging includes context/local refs and the skeleton inert ref.
- Unsupported or intentionally different branches:
  - Legacy `subtle` remains as a compatibility alias for S2 `secondary`.
  - Legacy `class` remains a compatibility escape hatch alongside
    `UNSAFE_className`.

## Source Branch Coverage

| Layer    | Upstream branch                        | Solid owner              | Class              | Observable                                      | Status  | Evidence                                  |
| -------- | -------------------------------------- | ------------------------ | ------------------ | ----------------------------------------------- | ------- | ----------------------------------------- |
| Headless | no `href` renders span link            | Solidaria `Link`         | semantics          | `span role="link"`                              | matched | unit test                                 |
| Headless | `href` renders native anchor           | Solidaria `Link`         | semantics          | `a[href]` and native anchor attrs               | matched | unit and e2e tests                        |
| Headless | disabled link behavior                 | Solidaria `Link`         | semantics/events   | disabled attrs, no `href`, no press callback    | matched | unit tests                                |
| Headless | current link state                     | Solidaria `Link`         | semantics          | `aria-current` and `data-current`               | matched | unit test                                 |
| Headless | focus, hover, press render props       | Solidaria `Link`         | interaction        | data attrs and consumer callbacks               | matched | unit tests                                |
| Styled   | focus ring                             | S2 `Link` style macro    | visual/a11y        | focus outline color/width/radius                | matched | unit focus test and e2e computed contract |
| Styled   | variant color map                      | S2 `Link` style macro    | visual             | primary accent and secondary neutral color      | matched | e2e full variant matrix                   |
| Styled   | staticColor map                        | S2 `Link` style macro    | visual             | black/white/auto transparent overlay branches   | matched | e2e full staticColor matrix               |
| Styled   | standalone typography                  | S2 `Link` style macro    | visual/text        | UI font and medium weight                       | matched | unit and e2e tests                        |
| Styled   | quiet standalone hover/focus underline | S2 `Link` style macro    | interaction/visual | underline appears on hover/focus-visible        | matched | unit focus/hover and e2e hover branch     |
| Styled   | forced-colors color/outline branches   | generated S2 CSS         | visual/a11y        | LinkText/Highlight computed contract            | matched | e2e forced-colors test                    |
| Styled   | `LinkContext` merge                    | S2 `Link`                | context            | context props apply, local props/classes merge  | matched | unit test                                 |
| Styled   | skeleton text/inert branch             | `Skeleton` text consumer | loading/semantics  | inert link and skeleton text child              | matched | unit test                                 |
| Compat   | legacy `subtle` alias                  | S2 `Link`                | compatibility      | `subtle` maps to equivalent secondary classes   | matched | unit test                                 |
| Harness  | route control surface                  | comparison route         | route integrity    | visible labels/order/defaults and changed props | matched | e2e route-control test                    |

## Transition Plan

- Static states:
  - default primary inline anchor;
  - secondary variant;
  - undefined/black/white/auto static colors;
  - standalone and quiet standalone;
  - forced-colors active;
  - skeleton text/inert branch.
- Interaction timelines:
  - hover toggles quiet standalone underline;
  - keyboard focus-visible applies focus ring and quiet underline;
  - press callbacks fire only when enabled;
  - disabled links suppress press and remove native `href`.
- Overlay/loading/async timelines:
  - skeleton loading is covered by unit tests; Link owns no async lifecycle.
- Cleanup assertions:
  - not applicable. Link owns no timers, portals, observers, subscriptions, or
    global event listeners.
- Visual-state rows changed:
  - Link has strict default evidence plus asserted route-control,
    variant/staticColor, quiet-hover, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders `a` when `href` is present; otherwise renders `span role="link"`.
  - disabled links render without a native `href` and expose disabled semantics.
- Accessible name/description assertions:
  - text children and ARIA label props flow through Solidaria Link.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - hover, focus-visible, and press branches are covered by focused unit tests;
    quiet hover is also covered by the browser comparison contract.
- Event pipeline and consumer handler assertions:
  - `onPress`, hover, and focus handlers are covered through Solidaria tests.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - skeleton text remains reactive and shares the merged unsafe style branch.
- Announcements:
  - not applicable. Link has no live-region behavior.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; no generated IDs or client lifecycle side effects.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Link.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/link-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Link" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid Link tests: `22 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/link/`.
- Link Playwright suite: `5 passed`.
- Link regression snapshot slice: `1 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `175`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Link is playbook-accepted for owned behavior.
- No in-scope Link gates remain open.
- Remaining comparison-live support components still need the same hardening:
  Meter, Avatar, AvatarGroup, Image, Skeleton, and Form.
