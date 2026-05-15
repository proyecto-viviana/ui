# Link Validation Notes

## Target

- Component: Link
- Slug: link
- Family or direct subcomponents: LinkContext
- Pass goal: S2 styled Link parity, route controls, static color coverage,
  skeleton text behavior, and strict default visual evidence
- Date: 2026-05-15

## Source Packet

| Source                   | Files or docs                                                         | Finding                                                                                                         |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Link` page                                                           | Public API includes `children`, `href`, `variant`, `staticColor`, `isStandalone`, `isQuiet`, and anchor events. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Link.tsx`                                     | Link uses `focusRing`, `staticColor`, `baseColor`, `LinkContext`, skeleton text, and inert skeleton sync.       |
| Solid source before pass | `packages/solid-spectrum/src/link/index.tsx`                          | Solid used handwritten Tailwind-style classes and did not expose the S2 context or generated style macro path.  |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix, `link-visual` e2e | Link was a catalogue gap with no live React/Solid route or Link-specific strict visual assertion.               |

## Four-Layer Audit

| Layer      | React owner                  | Solid owner                             | Status                                                                                   |
| ---------- | ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/Link`    | `@proyecto-viviana/solid-spectrum/Link` | Matched for variants, static colors, standalone/quiet styling, focus ring, and skeleton. |
| Components | React Aria Components `Link` | `solidaria-components` `Link`           | Matched for anchor/span switching, role, disabled state, hover, focus, and press events. |
| Headless   | React Aria link behavior     | `solidaria` link behavior               | Existing Solidaria behavior covers href, router-safe press, hover, focus, and disabled.  |
| State      | none                         | none                                    | N/A. Link has no separate state package owner.                                           |

## Interaction Dependency Map

| Dependency                 | Upstream branch                                                                    | Solid validation                                                                                 | Status  |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------- |
| `href`                     | Links with `href` render anchors; disabled links render non-anchors                | Unit tests assert anchor and disabled-span behavior; e2e compares tag and href.                  | matched |
| `variant`                  | `primary` uses accent color; `secondary` uses neutral color                        | Unit tests assert generated class divergence; e2e computed styles compare primary and secondary. | matched |
| `staticColor`              | Static colors use transparent overlay and backdrop-specific styling                | Route controls and e2e computed styles cover `black` and `white`.                                | matched |
| `isStandalone`/`isQuiet`   | Standalone links switch font treatment; quiet standalone underlines on interaction | Unit tests assert class transitions on hover; e2e compares quiet standalone computed styles.     | matched |
| `LinkContext`              | Context provides default/slot props                                                | Exported from barrel and covered by unit context test.                                           | matched |
| `SkeletonContext` consumer | Skeleton text wraps children and marks the DOM inert                               | Unit test covers inert root and nested skeleton text; Skeleton notes list Link as covered.       | matched |

## Changes Made

- Reworked Solid Link around the S2 style macro instead of handwritten classes.
- Added `LinkContext`, `LinkStaticColor`, S2-style props, context/class/style
  merging, skeleton text integration, and inert skeleton synchronization.
- Kept the legacy `subtle` variant as a compatibility alias for S2
  `secondary`.
- Exported `LinkContext` and `LinkStaticColor` from the public barrel.
- Added Link S2 CSS generation to `scripts/generate-solid-spectrum-s2-css.ts`.
- Added focused Solid unit tests for default rendering, variants, static color,
  quiet standalone interaction, context, disabled semantics, focus, hover,
  press, `UNSAFE_style`, and skeleton behavior.
- Wired Link into the comparison manifest, route defaults, controls, React and
  Solid fixtures, visual state matrix, and strict Playwright visual suite.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Link.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/link-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
```

Results:

- Focused Solid Link tests: `21 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Link visual suite: `3 passed`.
- Current gap report after the Form follow-up lists official styled entries
  live on both sides at `32`, missing/gap entries at `37`, visual evidence
  states at `48`, and strict pair-diff states at `31`.
- Current export report lists missing React S2 value exports at `81` of `208`
  and extra Solid value exports at `3`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                                  |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tasks 0-1 research/baseline      | partial | Sources and API were captured, but before-report lines, official viewer option order/default/reset inventory, and `guard:rac-export-gap` were not recorded in the notes. |
| Task 2 route harness             | partial | Route controls and serialized prop propagation are covered, but visible control labels/order/defaults and sentinel-value absence are not asserted.                       |
| Tasks 3-4 source branch coverage | gap     | The interaction dependency map is useful, but it is not a branch-by-branch ledger for every upstream Link source branch.                                                 |
| Task 9 styled branches           | partial | Core S2 style branches are covered; forced-colors/high-contrast branches remain untested in a browser contract.                                                          |
| Tasks 10-12 runtime/evidence     | partial | Hover/focus/press and skeleton behavior have focused evidence, but skeleton visual state and formal failure taxonomy were not recorded.                                  |
| Task 13 sign-off                 | partial | Focused tests/builds ran; full `vp run check` and full guard refresh were not run as part of this component sign-off.                                                    |

Retro-audit gaps to backfill before release hardening:

- Add a compact source branch ledger for `@react-spectrum/s2/src/Link.tsx`.
- Add route-control UI assertions for option labels, order, defaults, and
  internal sentinel absence.
- Add forced-colors coverage or record the branch as intentionally delegated to
  the S2 token compiler.
- Add a skeleton visual-state row if skeleton rendering is claimed as visual
  parity rather than unit-only behavior.

## Handoff

- Link is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- The recent support-component sweep is comparison-live through Form, with
  broader FormContext consumer inheritance carried forward as a separate gap.
