# AvatarGroup Validation Notes

## Target

- Component: AvatarGroup
- Slug: avatargroup
- Family or direct subcomponents: Avatar, AvatarContext
- Pass goal: AvatarGroup styled parity, child Avatar context parity, DOM prop
  filtering parity, route-control integrity, full documented size/count matrix,
  forced-colors coverage, and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                         | Blocker or next action |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 AvatarGroup docs, AvatarGroup source, Avatar source, React Aria `useLabel` and `filterDOMProps` source        | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                                | None                   |
| 2 Route harness        | done   | AvatarGroup controls, route defaults, React/Solid fixtures, visible control assertions                           | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                             | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers label wiring, root role, DOM filtering, size variable, child context, overlap, and outlines | None                   |
| 5 Transitions          | done   | Static component; label, size, count, overlap, over-background, and forced-colors obligations recorded           | None                   |
| 6 State                | n/a    | No state package owner                                                                                           | None                   |
| 7 ARIA hooks           | done   | S2 `useLabel` matched by Solidaria `createLabel` for visible label and `aria-label` fallback                     | None                   |
| 8 Headless             | done   | Native labelled `role="group"` root plus S2 DOM prop filtering                                                   | None                   |
| 9 Styled S2            | done   | `AvatarGroup`, child `AvatarContext`, S2 overlap branch, unit tests, computed browser matrix                     | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus child Avatar rendering; no timers, overlays, portals, or global listeners                     | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, full size/count matrix, forced-colors environment check    | None                   |
| 12 Comparison evidence | done   | AvatarGroup Playwright suite `4 passed`; current reports and guards refreshed                                    | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                                        | None                   |

## Source Packet

| Source                   | Files or docs                                                                                        | Finding                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| S2 docs MCP              | `AvatarGroup` page                                                                                   | Public API is `children`, `label`, size `16/20/24/28/32/36/40`, `id`, `slot`, label ARIA props, styles, unsafe class/style.    |
| React Spectrum S2 source | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                             | Root is a labelled `role="group"` flex container with `--size`; it provides `AvatarContext` for size, overlap, and background. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Avatar.tsx`                                                                  | Child Avatar consumes context `styles`, `size`, and `isOverBackground`; group parity depends on this context path.             |
| React Aria source        | `useLabel`, `useLabels`, `filterDOMProps`                                                            | `fieldProps` provide `id`, `aria-label`, and `aria-labelledby`; default DOM filtering preserves only `id` and `data-*`.        |
| Solid source after pass  | `packages/solid-spectrum/src/avatar/index.tsx`                                                       | Solid matches S2 label wiring, root filtering, context propagation, size variable, overlap styles, and visible label sizing.   |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-group-visual` e2e | AvatarGroup is live on both stacks with strict default evidence, route-control checks, size/count matrix, and forced-colors.   |

## Official Docs And Viewer Parity

| Docs item     | Official setting/example                | Route/control                      | Status  | Evidence                                |
| ------------- | --------------------------------------- | ---------------------------------- | ------- | --------------------------------------- |
| `children`    | Avatar children                         | child count radio, default `4`     | matched | e2e asserts option order/default/count  |
| `label`       | visible group label                     | text input, default `Project team` | matched | unit and e2e tests                      |
| `size`        | `16/20/24/28/32/36/40`, default `24`    | radio options in documented order  | matched | e2e asserts option order/default/matrix |
| `aria-label`  | non-visible group label fallback        | component API                      | matched | unit test                               |
| `id`/`data-*` | S2 root DOM props                       | component API                      | matched | unit test                               |
| `slot`        | context slot prop                       | component API                      | matched | source audit                            |
| `styles`      | S2 style macro without width override   | component API                      | matched | source audit                            |
| unsafe props  | `UNSAFE_className`, `UNSAFE_style`      | component API                      | matched | unit test                               |
| DOM filtering | S2 default `filterDOMProps(otherProps)` | component API                      | matched | unit test                               |

## Baseline

- Before the support sweep, AvatarGroup was an official comparison gap with no
  live React/Solid route and no strict visual evidence.
- The initial support sweep moved AvatarGroup live and added default strict
  evidence, but left retro-audit gaps in route-control assertions, branch
  coverage, forced-colors, current reports, and full check evidence.
- Current reports list:
  - official entries in comparison app: `69`;
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `178`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`;
  - extra Solid value exports: `3`.

## Source Map And Public Contract

| Layer               | Upstream files                             | Solid files                                       | Status  |
| ------------------- | ------------------------------------------ | ------------------------------------------------- | ------- |
| State               | none                                       | none                                              | n/a     |
| ARIA hooks          | `react-aria/useLabel`                      | `solidaria/createLabel`                           | matched |
| Headless components | native `role="group"` plus DOM prop filter | native group root plus Solidaria `filterDOMProps` | matched |
| Styled S2           | `@react-spectrum/s2/src/AvatarGroup.tsx`   | `packages/solid-spectrum/src/avatar/index.tsx`    | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture        | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `children`: Avatar children are rendered before the optional visible label.
  - `label`: optional visible label; when present, it labels the group through
    `aria-labelledby`.
  - `size`: default `24`, limited to S2 AvatarGroup sizes
    `16/20/24/28/32/36/40`.
  - `aria-label`: supported for non-visible labelling.
  - `id` and `data-*`: preserved by S2 default DOM filtering.
  - `hidden`, events, and `aria-describedby`/`aria-details`: filtered from the
    root to match the current S2 `filterDOMProps(otherProps)` plus `useLabel`
    source behavior.
  - `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref`: supported through
    the shared S2 context/merge helpers.
- Contexts/providers:
  - `AvatarGroupContext` is exported and consumed through the shared S2 slotted
    context helper.
  - AvatarGroup provides child `AvatarContext` with overlap styles, inherited
    size, and `isOverBackground: true`.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.

## Source Branch Coverage

| Layer    | Upstream branch               | Solid owner                | Class         | Observable                                              | Status  | Evidence                      |
| -------- | ----------------------------- | -------------------------- | ------------- | ------------------------------------------------------- | ------- | ----------------------------- |
| ARIA     | visible `label`               | `createLabel`              | semantics     | group has accessible name from visible label            | matched | unit and e2e tests            |
| ARIA     | `aria-label` fallback         | `createLabel`              | semantics     | group is named when no visible label is supplied        | matched | unit test                     |
| Headless | DOM prop filtering            | Solidaria `filterDOMProps` | semantics/API | `id`/`data-*` pass; events/global/extra ARIA props drop | matched | unit test                     |
| Styled   | group root                    | S2 AvatarGroup style macro | visual/layout | flex display and center alignment                       | matched | e2e computed contract         |
| Styled   | root size variable            | inline `--size`            | visual/layout | `--size` is `size / 16rem`                              | matched | unit and e2e tests            |
| Styled   | child Avatar size context     | child `AvatarContext`      | composition   | children inherit width/height from AvatarGroup size     | matched | unit and e2e full size matrix |
| Styled   | child overlap                 | `avatarGroupAvatar` styles | visual/layout | first Avatar margin is zero, later avatars overlap      | matched | e2e computed contract         |
| Styled   | over-background child outline | child `AvatarContext`      | visual        | child outline style/width/color match React             | matched | e2e computed contract         |
| Styled   | visible label typography      | `avatarGroupText` styles   | visual        | label margin and size token map match each group size   | matched | e2e computed contract         |
| Styled   | forced-colors environment     | generated S2 CSS           | visual/a11y   | computed contract matches React under forced colors     | matched | e2e forced-colors test        |
| Harness  | route control surface         | comparison route           | route         | visible labels/order/defaults and changed props/counts  | matched | e2e route-control test        |

## Transition Plan

- Static states:
  - default route with four children and visible label;
  - every documented group size;
  - child counts `2`, `3`, and `4`;
  - visible label and `aria-label` fallback;
  - child Avatar overlap and over-background outline treatment;
  - forced-colors active.
- Interaction timelines:
  - not applicable. AvatarGroup has no press, hover, focus, keyboard, selection,
    popover, or value transition semantics.
- Cleanup assertions:
  - not applicable. AvatarGroup owns no timers, portals, observers,
    subscriptions, or global event listeners.
- Visual-state rows changed:
  - AvatarGroup has strict default evidence plus asserted route-control,
    size/count/context, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders a `div role="group"` labelled by visible label text or `aria-label`.
- Accessible name/description assertions:
  - visible `label` and `aria-label` paths are covered.
  - `aria-describedby` and `aria-details` are intentionally filtered because
    current S2 source does not pass them through `fieldProps`.
- ID stability and collision checks:
  - root ID comes from the consumer-supplied ID or generated label helper ID;
    label ID is generated only when visible label text is present.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - S2 default DOM filtering does not expose generic event handlers on the root.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props/classes merge and
    local explicit values override context where supplied.
  - size is exposed to child Avatar context through an accessor.
- Announcements:
  - not applicable.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; generated IDs follow the shared label helper path.

## Evidence

```bash
vp test run packages/solid-spectrum/test/AvatarGroup.test.tsx packages/solid-spectrum/test/Avatar.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/avatar-group-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solid AvatarGroup/Avatar tests: `10 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/avatargroup/`.
- AvatarGroup Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `178`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- AvatarGroup is playbook-accepted for owned behavior.
- Standalone Avatar evidence remains in `avatar-validation-notes.md`.
- Image, Skeleton, and Form remain separate comparison-live passes with their
  own acceptance boundaries.
