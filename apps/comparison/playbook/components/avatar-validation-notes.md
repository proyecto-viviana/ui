# Avatar Validation Notes

## Target

- Component: Avatar
- Slug: avatar
- Family or direct subcomponents: AvatarContext, nested Image wrapper behavior,
  AvatarGroup consumers
- Pass goal: standalone Avatar styled parity, DOM prop filtering parity, route
  controls, size/over-background coverage, forced-colors environment coverage,
  and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Avatar docs, Avatar source, AvatarGroup source, and ActionButton AvatarContext source                | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                       | None                   |
| 2 Route harness        | done   | Avatar controls, route defaults, React/Solid fixtures, visible control assertions                       | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                    | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers root styles, image state, default slot, context, DOM filtering, and legacy aliases | None                   |
| 5 Transitions          | done   | Static component; image reveal, size, over-background, forced-colors, and context obligations recorded  | None                   |
| 6 State                | n/a    | No state package owner                                                                                  | None                   |
| 7 ARIA hooks           | n/a    | Avatar has no dedicated ARIA hook                                                                       | None                   |
| 8 Headless             | n/a    | Native image `alt` semantics plus DOM prop filtering                                                    | None                   |
| 9 Styled S2            | done   | `Avatar`, `AvatarContext`, S2 image wrapper branches, unit tests, computed browser matrix               | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus image loading; no timers, overlays, portals, or global listeners                     | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, full size matrix, forced-colors environment check | None                   |
| 12 Comparison evidence | done   | Avatar Playwright suite `4 passed`; current reports and guards refreshed                                | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                               | None                   |

## Source Packet

| Source                   | Files or docs                                                                                  | Finding                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Avatar` page                                                                                  | Public API is `alt`, `id`, `isOverBackground`, numeric `size`, `slot`, `src`, `styles`, unsafe class/style.                            |
| React Spectrum S2 source | `@react-spectrum/s2/src/Avatar.tsx`                                                            | Avatar renders the S2 `Image` wrapper, defaults `alt=""`, `size=24`, `slot="avatar"`, filters DOM props, and has no initials UI.       |
| React Spectrum S2 source | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                       | AvatarGroup is separate and provides `AvatarContext` with size, styles, and `isOverBackground`.                                        |
| React Spectrum S2 source | `@react-spectrum/s2/src/ActionButton.tsx`                                                      | ActionButton provides `AvatarContext` with numeric avatar sizes and icon-grid placement styles.                                        |
| Solid source before pass | `packages/solid-spectrum/src/avatar/index.tsx`                                                 | Solid matched the S2 root/image structure from the support sweep, but root DOM prop filtering and full route evidence were incomplete. |
| Solid source after pass  | `packages/solid-spectrum/src/avatar/index.tsx`                                                 | Solid matches S2 root/image geometry, image reveal state, default slot, context merge, DOM filtering, and compatibility aliases.       |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-visual` e2e | Avatar is live on both stacks with strict default visual evidence, route-control checks, full size matrix, and forced-colors evidence. |

## Official Docs And Viewer Parity

| Docs item          | Official setting/example                 | Route/control                     | Status  | Evidence                                |
| ------------------ | ---------------------------------------- | --------------------------------- | ------- | --------------------------------------- |
| `alt`              | native image alternate text              | text input, default `Alana`       | matched | unit and e2e tests                      |
| `src`              | optional image URL                       | text input, default empty         | matched | unit and e2e tests                      |
| `size`             | numeric size, default `24`               | radio options in documented order | matched | e2e asserts option labels/order/default |
| `isOverBackground` | over-background outline treatment        | switch, default off               | matched | e2e asserts default and changed value   |
| `slot`             | default `avatar`, supports `null`        | component API and context merge   | matched | unit tests                              |
| `styles`           | S2 style macro without width override    | component API                     | matched | source audit                            |
| unsafe props       | `UNSAFE_className`, `UNSAFE_style`       | component API                     | matched | unit tests                              |
| DOM props          | S2 `filterDOMProps` behavior             | component API                     | matched | unit test                               |
| legacy local props | `fallback`, `online`, named size aliases | compatibility only                | matched | unit tests                              |

## Baseline

- Before the support sweep, Avatar had catalogue entries but no standalone live
  React/Solid comparison route and no Avatar-specific strict visual evidence.
- Earlier Avatar pass moved live entries from `23` to `24`, missing/gap entries
  from `46` to `45`, and strict pair-diff states from `21` to `22`.
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
- Current reports list Avatar live and strict:
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `177`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`.
- Improvement target: close Avatar retro-audit gaps without reintroducing the
  old local initials/status-avatar abstraction.

## Source Map And Public Contract

| Layer               | Upstream files                            | Solid files                                       | Status  |
| ------------------- | ----------------------------------------- | ------------------------------------------------- | ------- |
| State               | none                                      | none                                              | n/a     |
| ARIA hooks          | none                                      | none                                              | n/a     |
| Headless components | native image `alt` and DOM prop filtering | native `img` plus Solidaria `filterDOMProps`      | matched |
| Styled S2           | `@react-spectrum/s2/src/Avatar.tsx`       | `packages/solid-spectrum/src/avatar/index.tsx`    | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture       | demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `alt`: defaults to empty string on the nested image.
  - `src`: optional; no source keeps the image unrevealed.
  - `size`: default `24`, supports documented numeric sizes and arbitrary
    numbers.
  - `isOverBackground`: default false.
  - `slot`: default `avatar`, supports `null` for local override.
  - `id`, `data-*`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and `ref`
    are preserved according to S2 DOM filtering.
- Contexts/providers:
  - `AvatarContext` is exported and consumed through the shared S2 slotted
    context helper.
  - AvatarGroup and ActionButton provide Avatar context; standalone Avatar
    evidence stays scoped to Avatar while consumer context evidence remains in
    the owning component notes.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.
- Unsupported or intentionally different branches:
  - Legacy named sizes map to numeric values:
    `xs -> 24`, `sm -> 32`, `md -> 40`, `lg -> 56`, and `xl -> 80`.
  - Legacy `fallback` and `online` remain no-op compatibility props and do not
    render initials or status UI.

## Source Branch Coverage

| Layer    | Upstream branch                   | Solid owner                | Class           | Observable                                       | Status  | Evidence                           |
| -------- | --------------------------------- | -------------------------- | --------------- | ------------------------------------------------ | ------- | ---------------------------------- |
| Headless | image `alt` default               | nested `img`               | semantics       | default empty `alt`, supplied alt preserved      | matched | unit and e2e tests                 |
| Headless | DOM prop filtering                | Solidaria `filterDOMProps` | semantics/API   | `id`/`data-*` pass, label/global props filter    | matched | unit test                          |
| Styled   | default slot                      | Avatar root                | composition     | `slot="avatar"` by default, `slot={null}` unset  | matched | unit and e2e tests                 |
| Styled   | root image wrapper                | S2 Avatar style macro      | visual/layout   | flex, center alignment, radius, overflow, bg     | matched | e2e computed contract              |
| Styled   | numeric size                      | inline root size           | visual/layout   | width/height from `size / 16rem`                 | matched | unit and e2e full size matrix      |
| Styled   | large-size outline width          | S2 Avatar style macro      | visual          | large avatars use the large outline-width branch | matched | e2e over-background large state    |
| Styled   | over-background outline           | S2 Avatar style macro      | visual          | outline style/color/width                        | matched | e2e computed contract              |
| Styled   | nested Image geometry             | nested `img` style macro   | visual          | display, full width/height, object fit/position  | matched | e2e computed contract              |
| Styled   | image reveal state                | nested `img` style macro   | visual          | opacity 0 without `src`, opacity 1 with `src`    | matched | unit tests and route prop controls |
| Styled   | forced-colors environment         | generated S2 CSS           | visual/a11y     | computed contract matches React                  | matched | e2e forced-colors environment test |
| Styled   | `AvatarContext` merge             | S2 `Avatar`                | context         | context props apply, local props/classes merge   | matched | unit test                          |
| Compat   | legacy size/fallback/status props | S2 `Avatar`                | compatibility   | size aliases map; fallback/status do not render  | matched | unit tests                         |
| Harness  | route control surface             | comparison route           | route integrity | visible labels/order/defaults and changed props  | matched | e2e route-control test             |

## Transition Plan

- Static states:
  - default blank gray avatar surface;
  - all documented sizes;
  - small and large over-background outlines;
  - empty `src` image-unrevealed state;
  - supplied `src` image-revealed state;
  - forced-colors active;
  - context-provided size/style/class.
- Interaction timelines:
  - not applicable. Avatar has no press, hover, focus, keyboard, or value
    transition semantics.
- Image lifecycle:
  - source presence controls the reveal class; network load success/failure is
    not owned by Avatar beyond passing `src` to the nested image.
- Cleanup assertions:
  - not applicable. Avatar owns no timers, portals, observers, subscriptions, or
    global event listeners.
- Visual-state rows changed:
  - Avatar has strict default evidence plus asserted route-control, full
    size/over-background, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders an image wrapper with a nested native `img`.
- Accessible name/description assertions:
  - native image `alt` carries the avatar description; root ARIA labels are not
    part of the S2 Avatar API and are filtered out.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - Avatar is static; S2 DOM prop filtering does not expose generic event
    handlers on the root.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - size and slot are accessors so context and local overrides stay reactive.
- Announcements:
  - not applicable.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; no generated IDs or client lifecycle side effects.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Avatar.test.tsx packages/solid-spectrum/test/AvatarGroup.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/avatar-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Avatar" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid Avatar/AvatarGroup tests: `9 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/avatar/`.
- Avatar Playwright suite: `4 passed`.
- Avatar regression snapshot slice: `2 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `177`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Avatar is playbook-accepted for owned behavior.
- No in-scope Avatar gates remain open.
- AvatarGroup remains a separate component and still needs its own acceptance
  hardening.
- Remaining comparison-live support components still need the same hardening:
  AvatarGroup, Image, Skeleton, and Form.
