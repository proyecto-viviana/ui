# Image Validation Notes

## Target

- Component: Image
- Slug: image
- Family or direct subcomponents: ImageCoordinator
- Pass goal: standalone Image styled parity, conditional source/error/coordinator
  behavior, comparison route, and strict default visual evidence
- Date: 2026-05-14

## Source Packet

| Source                        | Files or docs                                                                                 | Finding                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP                   | `Image` page                                                                                  | Public API includes `alt`, `src`, native image loading/fetch attributes, `renderError`, `group`, and dimensions.           |
| S2 docs MCP                   | `Image` sections: Conditional sources, Error state, ImageCoordinator                          | Docs call out conditional `colorScheme` sources, custom error rendering, and grouped reveal coordination.                  |
| React Spectrum S2 source      | `@react-spectrum/s2/src/Image.tsx`                                                            | Image renders a gray wrapper div, nested `img` or `picture`, loading opacity state, error fallback, and alt warn.          |
| React Spectrum S2 source      | `@react-spectrum/s2/src/ImageCoordinator.tsx`                                                 | Coordinator tracks registered image URLs and reveals all images after all load or timeout.                                 |
| Solid source before this pass | `packages/solid-spectrum/src/image/index.tsx`                                                 | Solid only rendered a bare native `img` with context-hidden support; wrapper, source, error, and coordinator were missing. |
| Comparison harness            | `comparison-manifest`, styled fixtures, component controls, visual matrix, `image-visual` e2e | Image was a catalogue gap with no live React/Solid route or Image-specific visual assertions before this pass.             |

## Four-Layer Audit

| Layer      | React owner                                       | Solid owner                              | Status                                                                                             |
| ---------- | ------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/Image`                        | `@proyecto-viviana/solid-spectrum/Image` | Matched for wrapper, image geometry, loading reveal, error fallback, and sources.                  |
| Components | Native `img`/`picture`                            | Native `img`/`picture`                   | N/A. Image does not have a separate React Aria Components primitive.                               |
| Headless   | Native image semantics                            | Native image semantics                   | Matched through native `alt` accessible-name behavior and hidden context handling.                 |
| State      | Local loading/error state plus `ImageCoordinator` | Solid signals plus `ImageCoordinator`    | Matched for load registration, all-loaded reveal, unregister on error, and timeout path structure. |

## Interaction Dependency Map

| Dependency              | Upstream source branch                                        | Solid validation                                                                                        | Status  |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------- |
| `alt`                   | `Image.tsx` passes alt to nested `img` and warns if absent    | Unit test queries by image role/name; comparison controls drive alt into both stacks.                   | matched |
| `src` string            | Wrapper renders a nested `img` with full-size object styles   | Unit test checks native attributes; e2e default screenshot and computed contract compare React/Solid.   | matched |
| conditional `src` array | `Image.tsx` renders `picture/source` by provider color scheme | Unit test checks dark provider source; e2e computed contract compares source attributes.                | matched |
| `renderError`           | Error state replaces image content with custom render         | Unit test fires image error; e2e error mode asserts both stacks render custom error and no image.       | matched |
| `ImageCoordinator`      | Coordinator delays reveal until all group images load         | Unit test checks first load does not reveal until second load; e2e coordinator mode asserts two images. | matched |
| `ImageContext`          | Context may hide or provide inherited props                   | Unit test verifies hidden context returns no image.                                                     | matched |
| Native fetch attributes | Image forwards loading, decoding, fetch priority, etc.        | Unit test checks width, height, `fetchpriority`, and `itemprop`; API props tracked in control metadata. | matched |

## Changes Made

- Reworked Solid Image from a bare `img` into the upstream S2 wrapper model:
  - gray wrapper surface, overflow clipping, inherited object-fit/object-position,
    full-size nested image, and opacity reveal state;
  - `picture/source` support for `src` arrays, including `colorScheme` filtering
    against the Solid Provider theme;
  - custom `renderError` replacement after image error;
  - `ImageCoordinator`, `createImageGroup`, and `DefaultImageGroup` for grouped
    image reveal behavior;
  - context style/ref/class merging, hidden context behavior, native image
    attributes, and dev-only missing-alt warning.
- Kept the image/picture subtree stable across `loading -> loaded -> revealed`
  state changes. A first implementation recreated the native image when reveal
  state changed, causing repeated `load` events and a browser-level loop.
- Exported Image, ImageContext, ImageCoordinator, and Image group helpers from
  the Solid Spectrum barrel.
- Added focused Solid unit tests for wrapper/attributes, error state,
  conditional sources, coordinator reveal, and hidden context.
- Wired Image into the comparison route on both React and Solid fixtures.
- Added docs-style controls for `alt`, source mode, and `objectFit`.
- Marked Image live in the comparison manifest and added visual matrix rows.
- Added `e2e/image-visual.spec.ts` for strict default screenshot parity,
  control propagation, computed contracts, error state, and coordinator mode.

## Current Evidence

```bash
vp test run packages/solid-spectrum/test/Image.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/image-visual.spec.ts --reporter=line
vp run comparison:report:gaps
```

Results:

- Focused Solid tests: `16 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Image visual suite: `4 passed`.
- Gap report moved official styled entries live on both sides to `26`,
  missing/gap entries to `43`, and strict pair-diff states to `24`.
- Browser stability probe: before the stable-subtree fix, Solid Image repeated
  reveal/complete effects hundreds of thousands of times; after the fix, the
  Image route renders both stacks with normal millisecond DOM evaluation.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                       |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 0-1 research/baseline      | partial | Sources and API were captured, and gap movement was recorded; official viewer option/default/reset inventory, export report, and guard baselines were not.    |
| Task 2 route harness             | partial | Route controls and prop propagation are covered; visible control labels/order/defaults and internal sentinel absence are not explicitly asserted.             |
| Tasks 3-4 source branch coverage | partial | The dependency map covers the main branches, but it is not a complete branch ledger for Image, ImageCoordinator, context, error, loading, and source paths.   |
| Task 5 transition plan           | partial | Loading/error/coordinator behavior is tested, but before/trigger/transient/settled/cleanup points were not written as a formal transition plan.               |
| Task 9 styled branches           | partial | Wrapper, source, object-fit, error, and coordinator branches are covered; forced-colors/high-contrast styling was not browser-tested.                         |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; failure taxonomy exists for the stability bug, but full `vp run check`, export report, and guard refresh do not. |

Retro-audit gaps to backfill before release hardening:

- Add a branch ledger for string `src`, conditional sources, missing alt dev
  warning, loading/reveal state, error fallback, ImageContext, native
  attributes, and ImageCoordinator registration/unregistration/timeout.
- Add route-control UI assertions for visible option labels/order/defaults and
  sentinel absence.
- Refresh evidence with current `comparison:report:gaps`,
  `comparison:report:exports`, and guard lines.
- Add forced-colors coverage or document why the Image wrapper has no
  additional high-contrast branch beyond generated S2 styles.
- Expand the transition plan if ImageCoordinator becomes release-critical for
  grouped async reveal behavior.

## Remaining Work

- Image is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- Skeleton remains a separate official component. Image only covers the
  loading-surface behavior that upstream Image owns directly.
- Native image loading is browser-dependent, so the comparison suite uses data
  URL sources and waits for complete images before strict screenshot capture.
