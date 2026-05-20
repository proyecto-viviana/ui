# Image Validation Notes

Date: 2026-05-20
Status: accepted

Image has now been normalized against the current acceptance gates. Historical
evidence from the original 2026-05-15 pass remains below; this closeout records
the current S2 API correction, public root export cleanup, root DOM contract
coverage, and refreshed Image gates.

## Current-Gate Closeout

- Scope: direct styled S2 `Image`, public package root exports, `ImageContext`,
  `ImageCoordinator`, conditional sources, custom error rendering, coordinator
  reveal behavior, and Skeleton consumer interaction from the image side.
- Sources rechecked: React Spectrum S2 Image docs/API, S2 Image and
  ImageCoordinator source, S2 package root exports, Solid Image source,
  comparison route controls, visual-state matrix, and Image visual specs.
- Result: accepted for Image. Solid now exposes the documented S2 Image public
  prop surface without the legacy `class` alias, public `hidden` prop, or
  arbitrary root DOM prop spreading; package root exports now match S2 for
  Image values; refs resolve to the wrapper div; context/unsafe/style merging
  follows the S2 wrapper contract; and browser evidence still covers strict
  default parity, route controls, conditional sources, error, coordinator, and
  forced-colors behavior.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and the public contract include the
      documented Image API: `src`, `alt`, native image loading/fetch attrs,
      `renderError`, `group`, `width`, `height`, `itemProp`, `slot`, `styles`,
      `UNSAFE_className`, `UNSAFE_style`, and wrapper `ref`.
- [x] Styled public type: `ImageProps` now follows S2 source intent by using an
      explicit prop list instead of `HTMLAttributes<HTMLDivElement>`, hiding the
      legacy `class` alias, arbitrary root DOM props, raw `children`, and public
      `hidden`.
- [x] DOM/accessibility contract: native image semantics stay on the nested
      `img`/`picture` subtree, missing `alt` warns in development, arbitrary
      root IDs/data/ARIA/events are not spread, and wrapper refs are tested.
- [x] Style source-to-computed: wrapper, nested image, conditional source, and
      Skeleton loading styles remain driven by S2 style output and context,
      with local unsafe props overriding context unsafe props as in S2.
- [x] Harness contract: route controls match the docs-style option surface, the
      visual-state matrix includes an Image root DOM contract row, and browser
      computed contracts compare wrapper/image/source output against React
      Spectrum.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      Image Playwright, reports, guards, README status, and this note are
      refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                               |
| ----------------------- | ------ | ---------------------------------------------------------------------- |
| Research                | done   | S2 Image API/source, ImageCoordinator source, S2 root export surface   |
| Baseline and source map | done   | Existing Image note plus current source/API/export recheck             |
| Implementation          | done   | Image type narrowing, root export cleanup, context/ref/root tests      |
| Harness                 | done   | Root DOM contract row added to the visual-state matrix                 |
| Verification            | done   | Focused unit tests, package builds, comparison build, Image visual e2e |
| Handoff                 | done   | README normalization status, closeout note, commit                     |

## Behavior State Machine

- Stable states: default loaded image; conditional source image; custom error
  fallback; two-image coordinator fixture; Skeleton loading consumer state.
- Environment states: forced-colors active resolves to the same wrapper/image
  computed contract as React Spectrum.
- Runtime states: loading -> loaded -> revealed for normal images; loading ->
  error for failed images; coordinator register -> partial load -> all load ->
  reveal; source/cache-key changes reset loading state.
- Context states: `ImageContext` can hide Image internally, provide slot/styles
  and unsafe props, and local Image props override context unsafe props where S2
  does.
- Cleanup contract: Image unregisters coordinator entries on cleanup or error
  and owns no portals, global listeners, observers, or external subscriptions.

## Accessibility And I18n

- Image uses native `img` accessibility semantics. `alt` is forwarded to the
  nested native image, and missing `alt` emits the S2 development warning.
- Arbitrary root ARIA props are intentionally not public on the styled S2 Image
  wrapper; documented wrapper escape hatches are `slot`, `styles`,
  `UNSAFE_className`, `UNSAFE_style`, and `ref`.
- Conditional source filtering follows the Provider color-scheme context and
  does not introduce locale-specific formatting, generated IDs, live-region
  announcements, or bidirectional text handling.

## Style Source-To-Computed

- React S2 Image source drives a gray wrapper div, nested `img` or `picture`,
  object-fit inheritance, opacity reveal, Skeleton loading opacity/visibility,
  and custom error fallback behavior.
- Solid S2 Image now follows that contract without accepting the legacy styled
  `class` alias or arbitrary root DOM props.
- Browser contracts compare wrapper dimensions, overflow, background, radius,
  object fit/position, nested image geometry, opacity, picture/source output,
  and forced-colors behavior against React Spectrum.

## Target

- Component: Image
- Slug: image
- Family or direct subcomponents: ImageCoordinator, ImageContext, internal
  ImageGroup helpers, Skeleton consumers
- Pass goal: standalone Image styled parity, source/error/coordinator behavior,
  Skeleton loading interaction, root prop boundary parity, route-control
  integrity, forced-colors coverage, and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                   | Blocker or next action |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Image docs/source, ImageCoordinator source, Skeleton source, Provider color-scheme source               | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                          | None                   |
| 2 Route harness        | done   | Image controls, route defaults, React/Solid fixtures, visible control assertions                           | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                       | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers wrapper, native img props, conditional sources, error, coordinator, Skeleton, context | None                   |
| 5 Transitions          | done   | Loading, loaded, revealed, error, coordinator reveal, and forced-colors obligations recorded               | None                   |
| 6 State                | n/a    | Local image state only; no separate state package owner                                                    | None                   |
| 7 ARIA hooks           | n/a    | Native image semantics; no React Aria Image hook                                                           | None                   |
| 8 Headless             | done   | Native image `alt`, missing-alt dev warning, native fetch attributes, and root prop boundary               | None                   |
| 9 Styled S2            | done   | S2 wrapper styles, nested image styles, picture/source styles, Skeleton loading style                      | None                   |
| 10 Runtime lifecycle   | done   | Load/error handlers, stable image subtree, coordinator register/load/unregister, timeout path              | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, source/error/coordinator checks, forced-colors check | None                   |
| 12 Comparison evidence | done   | Image Playwright suite `5 passed`; current reports and guards refreshed                                    | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                                  | None                   |

## Source Packet

| Source                   | Files or docs                                                                                 | Finding                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Image` API and content docs                                                                  | Public API includes `alt`, `src`, native image loading/fetch attributes, `renderError`, `group`, dimensions, and styles.      |
| React Spectrum S2 source | `@react-spectrum/s2/src/Image.tsx`                                                            | Image renders a gray wrapper div, nested `img` or `picture`, loading opacity state, error fallback, and alt warning.          |
| React Spectrum S2 source | `@react-spectrum/s2/src/ImageCoordinator.tsx`                                                 | Coordinator tracks registered image URLs and reveals all images after all load or timeout.                                    |
| React Spectrum S2 source | `@react-spectrum/s2/src/Skeleton.tsx`                                                         | Skeleton loading uses the shared `loadingStyle` and animation helper while hiding native image content.                       |
| Solid source after pass  | `packages/solid-spectrum/src/image/index.tsx`                                                 | Solid matches wrapper, stable native subtree, source mapping, error fallback, coordinator, Skeleton, and root boundary.       |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `image-visual` e2e | Image is live on both stacks with strict default evidence, route-control checks, source/error/coordinator, and forced-colors. |

## Official Docs And Viewer Parity

| Docs item           | Official setting/example                 | Route/control                            | Status  | Evidence                                |
| ------------------- | ---------------------------------------- | ---------------------------------------- | ------- | --------------------------------------- |
| `alt`               | accessible image text                    | text input, default `Gradient landscape` | matched | unit and e2e tests                      |
| `src` string        | native image URL                         | `sourceMode=basic`                       | matched | unit and e2e tests                      |
| conditional sources | `ImageSource[]` with color scheme/media  | `sourceMode=conditional`                 | matched | unit and e2e tests                      |
| `renderError`       | custom fallback on load error            | `sourceMode=error`                       | matched | unit and e2e tests                      |
| `group`             | ImageCoordinator reveal group            | `sourceMode=coordinator`                 | matched | unit and e2e tests                      |
| native img attrs    | `width`, `height`, `fetchPriority`, etc. | component API                            | matched | unit test                               |
| `objectFit` route   | wrapper inherited object fit             | radio options `cover`, `contain`         | matched | e2e asserts option order/default/matrix |
| `slot`              | context slot prop                        | component API                            | matched | source audit                            |
| `styles`/unsafe     | S2 styles and unsafe escape hatches      | component API                            | matched | unit test                               |
| root prop boundary  | no arbitrary wrapper prop spreading      | component API                            | matched | source audit and unit test              |

## Baseline

- Before the support sweep, Image was a catalogue gap with no live React/Solid
  route and no Image-specific strict visual assertions.
- The initial Image pass moved Image live and added focused source/error
  evidence, but left retro-audit gaps in route-control defaults, branch ledger,
  forced-colors, current reports, guards, and full check evidence.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `262`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `155`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `4`.

## Source Map And Public Contract

| Layer               | Upstream files                       | Solid files                                       | Status  |
| ------------------- | ------------------------------------ | ------------------------------------------------- | ------- |
| State               | local reducer in `Image.tsx`         | local Solid signals in `src/image/index.tsx`      | matched |
| ARIA hooks          | native `img` semantics               | native `img` semantics                            | matched |
| Headless components | native image/picture/source elements | native image/picture/source elements              | matched |
| Styled S2           | `Image.tsx`, `ImageCoordinator.tsx`  | `src/image`, `src/skeleton`, `src/provider`       | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture  | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `src`: string or `ImageSource[]`; empty string omits native `src`.
  - `alt`: passed to the nested native image; missing alt warns outside
    production.
  - `crossOrigin`, `decoding`, `fetchPriority`, `loading`,
    `referrerPolicy`, `width`, `height`, and `itemProp`: forwarded to the
    nested native image.
  - `renderError`: replaces image content after an error when not in Skeleton
    mode.
  - `group`: selects the coordinator context for register/load/unregister.
  - `slot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref`: supported
    on the wrapper through S2 context helpers.
  - Arbitrary root DOM props such as `id`, `data-*`, ARIA labels, and events
    are not spread to the wrapper, matching current S2 source. The legacy
    styled `class` alias and public `hidden` prop are intentionally not part of
    `ImageProps`.
- Contexts/providers:
  - `ImageContext` supports context props and the S2 internal hidden branch.
  - Public package root Image exports match S2: `Image`, `ImageContext`,
    `ImageCoordinator`, `ImageProps`, and `ImageCoordinatorProps`.
  - `ImageCoordinator` coordinates grouped reveal behavior; internal group
    helpers remain implementation details rather than package root exports.
  - Provider color scheme filters or annotates conditional sources.
  - Skeleton context hides native image content and applies the shared loading
    style.

## Source Branch Coverage

| Layer    | Upstream branch           | Solid owner             | Class           | Observable                                          | Status  | Evidence               |
| -------- | ------------------------- | ----------------------- | --------------- | --------------------------------------------------- | ------- | ---------------------- |
| Headless | native image attributes   | nested `img`            | semantics/API   | `src`, `alt`, dimensions, fetch priority, item prop | matched | unit test              |
| Headless | missing `alt` warning     | Image dev warning       | accessibility   | console warning outside production                  | matched | unit test              |
| Headless | root prop boundary        | wrapper render          | API             | arbitrary wrapper props/events do not pass through  | matched | unit test              |
| Styled   | wrapper surface           | S2 Image wrapper styles | visual/layout   | div wrapper, overflow, background, object fit       | matched | e2e computed contract  |
| Styled   | image geometry/reveal     | nested image styles     | visual/layout   | full size image, opacity reveal, transition branch  | matched | unit and e2e tests     |
| Styled   | conditional source list   | source mapping          | source routing  | picture/source attrs match color scheme             | matched | unit and e2e tests     |
| Runtime  | error fallback            | `renderError` path      | lifecycle       | error content replaces image content                | matched | unit and e2e tests     |
| Runtime  | coordinator reveal        | ImageCoordinator        | lifecycle       | first image waits until all group images load       | matched | unit and e2e tests     |
| Runtime  | hidden context            | ImageContext            | context         | hidden context returns no wrapper/image             | matched | unit test              |
| Styled   | Skeleton loading          | Skeleton context/style  | composition     | image hidden with shared loading style              | matched | Skeleton tests         |
| Styled   | forced-colors environment | generated S2 CSS        | visual/a11y     | computed contract matches React under forced colors | matched | e2e forced-colors test |
| Harness  | route control surface     | comparison route        | route integrity | visible labels/order/defaults and changed props     | matched | e2e route-control test |

## Transition Plan

- Static states:
  - default loaded image;
  - conditional source image;
  - custom error fallback;
  - two-image coordinator fixture;
  - Skeleton loading consumer state;
  - forced-colors active.
- Runtime timelines:
  - loading -> loaded -> revealed for normal images;
  - loading -> error for failed images;
  - coordinator register -> partial load -> all load -> reveal;
  - source/cache-key change resets loading state;
  - hidden context suppresses registration and rendering.
- Cleanup assertions:
  - ImageCoordinator unregisters each image on cleanup or error.
  - Stable native image/picture subtree avoids repeated load loops after reveal.
- Visual-state rows changed:
  - Image has strict default evidence plus asserted route-control,
    source/error/coordinator, and forced-colors rows.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Image.test.tsx packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/image-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solid Image/Skeleton/Button-family tests: `29 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/image/`.
- Image Playwright suite: `5 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `262`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `155`,
  missing React S2 value exports at `57` of `208`, and extra Solid value exports
  at `4`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: Image is accepted as of 2026-05-20.
- Skeleton placeholder interaction remains covered in
  `skeleton-validation-notes.md`; Image owns only the image-side consumer
  behavior.
- Next legacy normalization candidates in `components/README.md`: Link, Meter,
  Skeleton, and StatusLight.
