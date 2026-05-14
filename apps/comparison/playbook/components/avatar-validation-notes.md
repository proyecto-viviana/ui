# Avatar Validation Notes

## Target

- Component: Avatar
- Slug: avatar
- Family or direct subcomponents: AvatarGroup
- Pass goal: standalone Avatar styled parity, comparison route, and strict
  default visual evidence
- Date: 2026-05-14

## Source Packet

| Source                        | Files or docs                                                                                  | Finding                                                                                                       |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP                   | `Avatar` page                                                                                  | Public API is `alt`, `id`, `isOverBackground`, numeric `size`, `slot`, `src`, `styles`, unsafe class/style.   |
| React Spectrum S2 source      | `@react-spectrum/s2/src/Avatar.tsx`                                                            | Avatar renders the S2 `Image` wrapper, defaults `alt=""`, `size=24`, `slot="avatar"`, and has no initials UI. |
| React Spectrum S2 source      | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                       | AvatarGroup is a separate component and provides `AvatarContext` with size, styles, and `isOverBackground`.   |
| React Spectrum S2 source      | `@react-spectrum/s2/src/ActionButton.tsx`                                                      | ActionButton provides `AvatarContext` with numeric avatar sizes and icon-grid placement styles.               |
| Solid source before this pass | `packages/solid-spectrum/src/avatar/index.tsx`                                                 | Solid had local fallback initials, named size tokens, and an `online` prop that are not part of S2 Avatar.    |
| Comparison harness            | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-visual` e2e | Avatar had catalogue entries but no live React/Solid route or standalone visual assertions before this pass.  |

## Four-Layer Audit

| Layer      | React owner                 | Solid owner                                  | Status                                                                                 |
| ---------- | --------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/Avatar` | `@proyecto-viviana/solid-spectrum/Avatar`    | Matched for standalone Avatar default, size, `isOverBackground`, slot, image geometry. |
| Components | No RAC component equivalent | No `solidaria-components` component required | N/A. Avatar is a styled Spectrum image wrapper, not an ARIA behavior component.        |
| Headless   | No React Aria hook required | No `solidaria` hook required                 | N/A. Accessibility is the native image `alt` contract.                                 |
| State      | No React Stately primitive  | No `solid-stately` primitive required        | N/A. Avatar is stateless.                                                              |

## Interaction Dependency Map

| Dependency             | Upstream source branch                                                | Solid validation                                                                                      | Status  |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| `size`                 | `Avatar.tsx` computes root width/height as `size / 16rem`             | `e2e/avatar-visual.spec.ts` compares root and image geometry for `16`, `24`, `64`, and `112`.         | matched |
| `isOverBackground`     | `Avatar.tsx` changes outline style and large outline width            | Computed contract compares outline style, width, and color with/without the comparison backdrop.      | matched |
| `src` absent           | `Image` wrapper remains visible; nested `img` is unrevealed           | Default exact screenshot compares the blank gray avatar surface with zero pixel tolerance.            | matched |
| `slot` / child context | Avatar defaults `slot="avatar"` and consumes `AvatarContext`          | Existing Button-family context test verifies nested ActionButton slot/context consumption.            | matched |
| AvatarGroup            | Separate source component providing group label, overlap, and context | Covered in `avatargroup-validation-notes.md`; do not treat standalone Avatar as AvatarGroup evidence. | linked  |

## Changes Made

- Reworked Solid Avatar to follow upstream S2 Avatar instead of the old local
  profile-avatar abstraction:
  - numeric S2 size contract with `rem` width/height;
  - default `slot="avatar"`;
  - image-wrapper root styling with gray background, rounded full shape,
    overflow clipping, flex sizing, and over-background outline;
  - nested image geometry and opacity state aligned with React S2;
  - no initials fallback rendering for S2 Avatar.
- Kept legacy `xs/sm/md/lg/xl`, `fallback`, and `online` inputs as compatibility
  no-ops or aliases so existing local demos still compile, but they are not
  documented as S2 Avatar API.
- Wired the Avatar comparison route on both React and Solid fixtures.
- Added docs-style controls for `alt`, `src`, `size`, and `isOverBackground`.
- Marked Avatar live in the comparison manifest and added visual matrix rows.
- Added `e2e/avatar-visual.spec.ts` for strict default screenshot parity,
  control propagation, and source-derived computed contracts.

## Current Evidence

```bash
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/avatar-visual.spec.ts --reporter=line
vp run comparison:report:gaps
```

Results:

- Solid Spectrum build: passed.
- Comparison build: passed.
- Avatar visual suite: `3 passed`.
- Gap report moved official styled entries live on both sides from `23` to `24`
  and missing/gap entries from `46` to `45`; strict pair-diff states moved from
  `21` to `22`.

## Remaining Work

- Image remains a separate official missing/gap component. Avatar only matches
  the image-wrapper subset required by upstream Avatar.
- Revisit legacy Avatar `fallback`/`online` compatibility once local custom
  examples are either moved off S2 Avatar or given separate non-S2 components.
