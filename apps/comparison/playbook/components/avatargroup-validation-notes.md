# AvatarGroup Validation Notes

## Target

- Component: AvatarGroup
- Slug: avatargroup
- Family or direct subcomponents: Avatar
- Pass goal: AvatarGroup styled parity, child Avatar context parity, comparison
  route, and strict default visual evidence
- Date: 2026-05-14

## Source Packet

| Source                   | Files or docs                                                                                        | Finding                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| S2 docs MCP              | `AvatarGroup` page                                                                                   | Public API is `children`, `label`, `size`, `id`, `slot`, label ARIA props, `styles`, unsafe class/style.                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                             | Root is a labelled `role="group"` flex container with `--size`; it provides `AvatarContext` to overlap and size avatars. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Avatar.tsx`                                                                  | Child Avatar consumes context `styles`, `size`, and `isOverBackground`; group parity depends on this context path.       |
| Solid source before pass | `packages/solid-spectrum/src/avatar/index.tsx`                                                       | `AvatarGroup` was a placeholder `flex -space-x-2` wrapper with no label wiring, no S2 sizing, and no child context.      |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-group-visual` e2e | AvatarGroup was an official missing/gap entry with no live React/Solid route before this pass.                           |

## Four-Layer Audit

| Layer      | React owner                      | Solid owner                                    | Status                                                                                 |
| ---------- | -------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| Styled     | `@react-spectrum/s2/AvatarGroup` | `@proyecto-viviana/solid-spectrum/AvatarGroup` | Matched for labelled group root, S2 sizes, child Avatar context, and overlap geometry. |
| Components | No RAC component equivalent      | No `solidaria-components` component required   | N/A. Root semantics come from native `role="group"` plus label wiring.                 |
| Headless   | `useLabel`                       | `createLabel`                                  | Matched for visible label and aria-label fallback.                                     |
| State      | No React Stately primitive       | No `solid-stately` primitive required          | N/A. AvatarGroup is stateless.                                                         |

## Interaction Dependency Map

| Dependency        | Upstream source branch                                                       | Solid validation                                                                                                | Status  |
| ----------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| `label`           | `useLabel({labelElementType: 'span'})` wires visible label to group root     | `AvatarGroup.test.tsx` and `avatar-group-visual.spec.ts` assert accessible group names on both stacks.          | matched |
| `size`            | Root sets `--size`; child AvatarContext supplies `size`                      | Unit and visual specs compare root variable and child Avatar dimensions for representative S2 sizes.            | matched |
| child overlap     | Avatar child style applies `marginStart: calc(var(--size) / -4)` after first | Visual computed contract compares first and subsequent Avatar `margin-inline-start` values against React.       | matched |
| over-background   | Group provides child `isOverBackground: true`                                | Visual computed contract compares child outline style, width, and color against React.                          | matched |
| standalone Avatar | Child Avatar is a separate component                                         | Standalone Avatar evidence remains in `avatar-validation-notes.md`; this pass only validates group composition. | linked  |

## Changes Made

- Replaced the placeholder Solid `AvatarGroup` wrapper with the upstream S2
  contract:
  - labelled `role="group"` root using `createLabel`;
  - `--size` root variable and S2 container styles;
  - child `AvatarContext` with group overlap styles, size, and
    `isOverBackground`;
  - visible label text sizing from the group size.
- Added `AvatarGroupContext` to the Solid public surface.
- Added the `avatargroup` comparison route on both React and Solid fixtures.
- Added docs-style controls for `label`, `size`, and child `count`.
- Marked AvatarGroup live in the comparison manifest and added visual matrix
  rows.
- Added `e2e/avatar-group-visual.spec.ts` for strict default screenshot parity,
  control propagation, and source-derived computed contracts.
- Added `packages/solid-spectrum/test/AvatarGroup.test.tsx` for local label,
  aria-label, and context checks.

## Current Evidence

```bash
vp test run packages/solid-spectrum/test/AvatarGroup.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx
vp test run packages/solid-spectrum/test/regression.test.tsx -t Avatar
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/avatar-visual.spec.ts e2e/avatar-group-visual.spec.ts --reporter=line
vp run comparison:report:gaps
```

Results:

- Solid AvatarGroup and Button-family context unit tests: `14 passed`.
- Solid Avatar regression slice: `2 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Avatar and AvatarGroup visual suites: `6 passed`.
- Gap report moved official styled entries live on both sides from `24` to `25`,
  missing/gap entries from `45` to `44`, and strict pair-diff states from `22`
  to `23`.

## Retro-Audit Against Playbook

| Gate                             | Status  | Finding                                                                                                                                                      |
| -------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Tasks 0-1 research/baseline      | partial | Sources and API were captured, and gap movement was recorded; official viewer option/default/reset inventory and export guard baselines were not.            |
| Task 2 route harness             | partial | Route controls and prop propagation are covered; visible control labels/order/defaults and internal sentinel absence are not explicitly asserted.            |
| Tasks 3-4 source branch coverage | partial | The dependency map covers key branches, but it is not a complete branch ledger for label wiring, group styles, child context, overlap, and aria-label paths. |
| Task 5 transition plan           | partial | AvatarGroup is static, but child-count, label, size, overlap, and over-background visual obligations were not written as a formal visual-state plan.         |
| Task 9 styled branches           | partial | Label, size, overlap, and child context branches are covered; forced-colors/high-contrast styling was not browser-tested.                                    |
| Tasks 11-13 evidence/sign-off    | partial | Exact default and computed contracts passed; failure taxonomy, full `vp run check`, export report, and guard refresh were not recorded for this pass.        |

Retro-audit gaps to backfill before release hardening:

- Add a branch ledger for visible label, aria-label fallback, root group role,
  size variable, child AvatarContext, overlap styles, and over-background
  outline behavior.
- Add route-control UI assertions for visible option labels/order/defaults and
  sentinel absence.
- Refresh evidence with current `comparison:report:gaps`,
  `comparison:report:exports`, and guard lines.
- Add forced-colors coverage or document why generated S2 token output is the
  accepted boundary for AvatarGroup.

## Remaining Work

- AvatarGroup is comparison-live with focused evidence; it is not yet fully
  playbook-complete.
- Image remains a separate official missing/gap component. AvatarGroup only
  validates the child Avatar image-wrapper subset used by S2 group composition.
- Revisit legacy Avatar `fallback`/`online` compatibility once local custom
  examples are either moved off S2 Avatar or given separate non-S2 components.
