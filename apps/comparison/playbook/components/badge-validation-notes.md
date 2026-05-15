# Badge Validation Notes

## Target

- Component: Badge
- Slug: badge
- Family or direct subcomponents: BadgeContext
- Pass goal: S2 styled Badge parity, route controls, text/icon slot context,
  skeleton wrapper behavior, and strict default visual evidence
- Date: 2026-05-15

## Source Packet

| Source                   | Files or docs                                                          | Finding                                                                                                              |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Badge` page                                                           | Public API includes `children`, `variant`, `fillStyle`, `size`, `overflowMode`, style props, slots, and ARIA labels. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Badge.tsx`                                     | Badge uses `control`, text/icon slot contexts, `SkeletonWrapper`, `BadgeContext`, and generated S2 style macro CSS.  |
| Solid source before pass | `packages/solid-spectrum/src/badge/index.tsx`                          | Solid was a count-only circular helper with handwritten classes and no S2 text/icon/context surface.                 |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix, `badge-visual` e2e | Badge was a catalogue gap with no live React/Solid route or strict Badge-specific visual assertion.                  |

## Four-Layer Audit

| Layer      | React owner                               | Solid owner                              | Status                                                                                  |
| ---------- | ----------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/Badge`                | `@proyecto-viviana/solid-spectrum/Badge` | Matched for variant, fill style, size, overflow, text/icon slots, and skeleton wrapper. |
| Components | Native span plus React Aria slot contexts | Native span plus Solid contexts          | Matched for presentation role, DOM props, text wrapping, and icon slot context.         |
| Headless   | Native metadata semantics                 | Native metadata semantics                | N/A. Badge has no separate ARIA primitive.                                              |
| State      | none                                      | none                                     | N/A. Badge has no separate state package owner.                                         |

## Interaction Dependency Map

| Dependency              | Upstream branch                                                        | Solid validation                                                                                          | Status  |
| ----------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| `variant`               | Semantic and categorical color branches                                | Unit tests assert class changes; e2e computed styles compare representative bold/subtle/outline variants. | matched |
| `fillStyle`             | `bold`, `subtle`, and `outline` alter foreground/background/border     | E2E computed contracts compare color, background, and border.                                             | matched |
| `size`                  | S2 t-shirt sizes drive control font, min size, radius, and padding     | E2E matrix covers `S`, `M`, `L`, and `XL` representatives.                                                | matched |
| `overflowMode`          | Text context switches wrapping and truncation behavior                 | Controls and e2e computed contracts cover wrap/truncate text styles.                                      | matched |
| icon children           | IconContext centers icons and sets currentColor fill                   | Unit tests and e2e icon mode assert slot rendering and computed color parity.                             | matched |
| `BadgeContext`          | Context provides default/slot props                                    | Exported from barrel and covered by unit context test.                                                    | matched |
| `SkeletonContext` owner | Badge wraps itself in `SkeletonWrapper` rather than skeletonizing text | Unit test covers inert skeleton wrapper; visual route remains exact for normal state.                     | matched |

## Changes Made

- Reworked Solid Badge around the upstream S2 style macro and shared `control`
  helper.
- Added `BadgeContext`, S2 props, context/class/style merging, text slot
  context, icon slot context, and `SkeletonWrapper` integration.
- Preserved legacy `count` plus old variant/size aliases by mapping them onto
  the S2 surface.
- Exported `BadgeContext`, `BadgeFillStyle`, and `BadgeOverflowMode` from the
  public barrel.
- Added Badge S2 CSS generation to `scripts/generate-solid-spectrum-s2-css.ts`.
- Added focused Solid unit tests for text-only rendering, variants, fill styles,
  sizes, overflow, legacy aliases, icon/text contexts, context props, unsafe
  escape hatches, and skeleton behavior.
- Wired Badge into the comparison manifest, route defaults, controls, React and
  Solid fixtures, visual state matrix, and strict Playwright visual suite.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Badge.test.tsx
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Badge" -u
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/badge-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
```

Results:

- Focused Solid Badge tests: `6 passed`.
- Badge regression snapshot: `1 passed`, `1 updated`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Badge visual suite: `3 passed`.
- Current gap report after the Form follow-up lists official styled entries
  live on both sides at `32`, missing/gap entries at `37`, visual evidence
  states at `48`, and strict pair-diff states at `31`.
- Current export report lists missing React S2 value exports at `81` of `208`
  and extra Solid value exports at `3`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                  |
| -------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tasks 0-1 research/baseline      | partial | Sources and public API were captured, but before-report lines and a full official viewer option/default/reset inventory were not recorded.               |
| Task 2 route harness             | partial | Route controls and prop serialization are covered; visible control labels/order/defaults and route sentinel behavior are not explicitly asserted.        |
| Tasks 3-4 source branch coverage | gap     | The note summarizes dependencies but does not include a branch ledger for every Badge style/context/text/icon/skeleton branch.                           |
| Task 5 transition plan           | partial | Badge has no complex runtime transitions, but overflow and skeleton visual-state obligations were not recorded as a formal visual-state plan.            |
| Task 9 styled branches           | partial | Variant/fill/size/icon branches are covered; forced-colors/high-contrast branches are not browser-tested.                                                |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; formal visual failure taxonomy, full `vp run check`, and full guard refresh were not part of this sign-off. |

Retro-audit gaps to backfill before release hardening:

- Add source branch ledger rows for Badge wrapper styles, text slot,
  IconContext, BadgeContext, legacy alias mapping, and SkeletonWrapper.
- Add route-control UI assertions for option labels/order/defaults and
  sentinel-value absence.
- Decide whether skeleton Badge needs a strict route visual row or remains
  unit-only evidence.
- Add forced-colors coverage or document why the generated S2 token output is
  accepted without a browser high-contrast run.

## Handoff

- Badge is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- The recent support-component sweep is comparison-live through Form, with
  broader FormContext consumer inheritance carried forward as a separate gap.
