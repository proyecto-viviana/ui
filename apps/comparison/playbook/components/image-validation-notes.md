# Image Validation Notes

## Target

- Component: Image
- Slug: image
- Family or direct subcomponents: ImageCoordinator, ImageContext,
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
- Current reports list:
  - official entries in comparison app: `69`;
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `180`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`;
  - extra Solid value exports: `3`.

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
    are not spread to the wrapper, matching current S2 source.
- Contexts/providers:
  - `ImageContext` supports hidden/context props.
  - `ImageCoordinator`, `DefaultImageGroup`, and `createImageGroup` coordinate
    grouped reveal behavior.
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

- Focused Solid Image/Skeleton/Button-family tests: `27 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/image/`.
- Image Playwright suite: `5 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `180`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Image is playbook-accepted for owned behavior.
- Skeleton placeholder interaction remains accepted in
  `skeleton-validation-notes.md`; Image owns only the image-side consumer
  behavior.
- Form remains the final comparison-live support pass to accept in this sweep.
