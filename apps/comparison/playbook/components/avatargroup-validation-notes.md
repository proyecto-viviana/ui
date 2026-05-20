# AvatarGroup Validation Notes

Date: 2026-05-20
Status: accepted

## Target

- Component: AvatarGroup
- Slug: avatargroup
- Family or direct subcomponents: Avatar, AvatarContext
- Pass goal: AvatarGroup styled parity, child Avatar context parity, DOM prop
  filtering parity, route-control integrity, full documented size/count matrix,
  forced-colors coverage, and strict default visual evidence
- Date: 2026-05-20

## Task Status

| Task                   | Status | Evidence                                                                                                         | Blocker or next action |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 AvatarGroup docs, AvatarGroup source, Avatar source, React Aria `useLabel` and `filterDOMProps` source        | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                                | None                   |
| 2 Route harness        | done   | AvatarGroup controls, route defaults, React/Solid fixtures, visible controls, and query-only count assertions    | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                             | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers label wiring, root role, DOM filtering, size variable, child context, overlap, and outlines | None                   |
| 5 Transitions          | done   | Static component; label, size, count, overlap, over-background, and forced-colors obligations recorded           | None                   |
| 6 State                | n/a    | No state package owner                                                                                           | None                   |
| 7 ARIA hooks           | done   | S2 `useLabel` matched by Solidaria `createLabel` for visible label and `aria-label` fallback                     | None                   |
| 8 Headless             | done   | Native labelled `role="group"` root plus S2 DOM prop filtering                                                   | None                   |
| 9 Styled S2            | done   | `AvatarGroup`, child `AvatarContext`, S2 overlap branch, unit tests, computed browser matrix                     | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus child Avatar rendering; no timers, overlays, portals, or global listeners                     | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, query-only count matrix, forced-colors environment check   | None                   |
| 12 Comparison evidence | done   | AvatarGroup Playwright suite `4 passed`; current reports and guards refreshed                                    | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                                        | None                   |

## Current Component Closeout

- Closeout date: 2026-05-20.
- Current gate status: accepted.
- Documentation/source check: React Spectrum S2 MCP `AvatarGroup` API and
  installed `@react-spectrum/s2@1.3.0/src/AvatarGroup.tsx` match the Solid
  public API, route controls, and source ledger below.
- Source caveat closed: the MCP API table lists `aria-describedby` and
  `aria-details` through inherited ARIA labeling props, but installed React S2
  calls `useLabel` and default `filterDOMProps(otherProps)` without
  `labelable: true`, so those two props are not forwarded to the root.
- Package verification on 2026-05-20:
  `vp test run packages/solid-spectrum/test/AvatarGroup.test.tsx packages/solid-spectrum/test/Avatar.test.tsx`
  passed `12/12`.
- Browser verification on 2026-05-20:
  `vp run --filter @proyecto-viviana/comparison build` passed, and
  `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/avatar-group-visual.spec.ts --reporter=line`
  passed `4/4`.
- Report/check verification on 2026-05-20:
  `vp run comparison:report:gaps`, `vp run comparison:report:exports`, and
  `vp run check` passed.

## Acceptance Gate Checklist

These gates are additive. AvatarGroup is accepted only with direct evidence for
every in-scope item below.

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                                   | Blockers/owner |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Official Docs And Viewer Parity          | done    | S2 MCP API checked on 2026-05-20; viewer exposes the user-facing `label` and `size` props, fixes the documented `aria-label`, preserves the four-child example path, and covers child count through route query evidence.                  | None           |
| External Authority And Standards         | done    | Native `role="group"` naming follows ARIA labeling semantics; no WAI-ARIA composite widget keyboard pattern applies because AvatarGroup owns no interaction model.                                                                         | None           |
| Upstream React Source Parity             | done    | Installed React S2 `AvatarGroup.tsx`, `Avatar.tsx`, React Aria `useLabel`, `useLabels`, and `filterDOMProps` are mapped to Solid source, package tests, and browser contracts.                                                             | None           |
| Solid Idiomatic Implementation           | done    | Solid keeps reactive accessors for context size, uses shared slotted context/ref/style helpers, and avoids extra state or effects for static markup.                                                                                       | None           |
| Accessibility And I18n                   | done    | Visible label plus `aria-label`, `aria-label` fallback, generated IDs, filtered description ARIA props, forced-colors environment, and non-interactive event filtering are covered.                                                        | None           |
| Behavior State Machine                   | done    | Static render lifecycle only: default, size changes, label changes, child-count matrix, context override, and forced-colors route states have package/browser evidence; no transitions, focus, keyboard, overlay, or cleanup owner exists. | None           |
| Style Source-To-Computed Parity          | done    | Group flex/align styles, `--size`, Avatar child context sizing, overlap margins, over-background outlines, visible label typography, and forced-colors computed contracts match React S2 across documented sizes and child counts.         | None           |
| React-Vs-Solid Comparison Harness Parity | done    | React and Solid styled fixtures pass the same props, including intentionally filtered ARIA description props; strict default screenshot, route-control assertions, computed style matrix, and forced-colors contract all pass.             | None           |
| Evidence And Handoff                     | done    | Focused package tests, comparison build, AvatarGroup browser suite, reports, formatter/check, and README status update are complete for this component boundary.                                                                           | None           |

## Agent Workflow

No subagents were assigned for AvatarGroup. The current-gate normalization and
coverage closure stayed local because the write set is narrow and shares a
single component boundary.

| Task                    | Owner       | Inputs                                                                                | Writes                                                                                   | Evidence                                    | Status |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------- | ------ |
| Source/API verification | local Codex | S2 MCP API, installed React S2 source, React Aria label/filter helpers, Solid source  | playbook note                                                                            | source packet and ARIA filtering caveat     | done   |
| Coverage closure        | local Codex | existing AvatarGroup unit and browser specs, React/Solid styled fixtures              | AvatarGroup package test, comparison fixtures, e2e contract, visual matrix/control notes | package tests and AvatarGroup browser suite | done   |
| Acceptance bookkeeping  | local Codex | current report output, component README current-gate list, existing AvatarGroup notes | this note and component README                                                           | reports, full check, commit boundary        | done   |

## Source Packet

| Source                   | Files or docs                                                                                        | Finding                                                                                                                                                                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `AvatarGroup` API checked 2026-05-20                                                                 | Public API is `children`, `label`, size `16/20/24/28/32/36/40`, `id`, `slot`, label ARIA props, styles, unsafe class/style.                                                                    |
| React Spectrum S2 source | `@react-spectrum/s2/src/AvatarGroup.tsx`                                                             | Root is a labelled `role="group"` flex container with `--size`; it provides `AvatarContext` for size, overlap, and background.                                                                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/Avatar.tsx`                                                                  | Child Avatar consumes context `styles`, `size`, and `isOverBackground`; group parity depends on this context path.                                                                             |
| React Aria source        | `useLabel`, `useLabels`, `filterDOMProps`                                                            | `fieldProps` provide `id`, `aria-label`, and `aria-labelledby`; default DOM filtering preserves only `id` and `data-*`, so `aria-describedby` and `aria-details` are filtered for AvatarGroup. |
| Solid source after pass  | `packages/solid-spectrum/src/avatar/index.tsx`                                                       | Solid matches S2 label wiring, root filtering, context propagation, size variable, overlap styles, and visible label sizing.                                                                   |
| Comparison harness       | `comparison-manifest`, styled fixtures, component controls, visual matrix, `avatar-group-visual` e2e | AvatarGroup is live on both stacks with strict default evidence, visible route-control checks, query-only count matrix, and forced-colors.                                                     |

## Official Docs And Viewer Parity

| Docs item                         | Official setting/example                | Route/control                                                                                  | Status  | Evidence                                                    |
| --------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------- |
| `children`                        | Avatar children                         | fixed four-avatar default; query-only counts `2`/`3`/`4`                                       | matched | e2e asserts no visible count control and query count matrix |
| `label`                           | visible group label                     | text input, default `123 members`                                                              | matched | unit and e2e tests                                          |
| `size`                            | `16/20/24/28/32/36/40`, default `24`    | radio options in documented order                                                              | matched | e2e asserts option order/default/matrix                     |
| `aria-label`                      | group ARIA label and fallback           | route default `Collaborators`, component API                                                   | matched | unit and e2e tests                                          |
| `aria-describedby`/`aria-details` | inherited ARIA labeling props           | route fixture passes both; React/Solid roots assert both absent because S2 source filters them | matched | unit and e2e tests                                          |
| `id`/`data-*`                     | S2 root DOM props                       | component API                                                                                  | matched | unit test                                                   |
| `slot`                            | context slot prop                       | component API                                                                                  | matched | source audit                                                |
| `styles`                          | S2 style macro without width override   | component API                                                                                  | matched | source audit                                                |
| unsafe props                      | `UNSAFE_className`, `UNSAFE_style`      | component API                                                                                  | matched | unit test                                                   |
| DOM filtering                     | S2 default `filterDOMProps(otherProps)` | component API                                                                                  | matched | unit and e2e tests                                          |

## Baseline

- Before the support sweep, AvatarGroup was an official comparison gap with no
  live React/Solid route and no strict visual evidence.
- The initial support sweep moved AvatarGroup live and added default strict
  evidence, but left retro-audit gaps in route-control assertions, branch
  coverage, forced-colors, current reports, and full check evidence.
- Current reports list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `251`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `6`.

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
  - `label`: optional visible label; when present, it contributes to the group
    name through `aria-labelledby`.
  - route default label composition: visible `123 members` plus
    `aria-label="Collaborators"` yields the documented group name
    `Collaborators 123 members`.
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

| Layer    | Upstream branch                   | Solid owner                | Class         | Observable                                                      | Status  | Evidence                      |
| -------- | --------------------------------- | -------------------------- | ------------- | --------------------------------------------------------------- | ------- | ----------------------------- |
| ARIA     | visible `label` plus `aria-label` | `createLabel`              | semantics     | group name composes `Collaborators 123 members`                 | matched | unit and e2e tests            |
| ARIA     | `aria-label` fallback             | `createLabel`              | semantics     | group is named when no visible label is supplied                | matched | unit test                     |
| Headless | DOM prop filtering                | Solidaria `filterDOMProps` | semantics/API | `id`/`data-*` pass; events/global/extra ARIA props drop         | matched | unit test                     |
| Styled   | group root                        | S2 AvatarGroup style macro | visual/layout | flex display and center alignment                               | matched | e2e computed contract         |
| Styled   | root size variable                | inline `--size`            | visual/layout | `--size` is `size / 16rem`                                      | matched | unit and e2e tests            |
| Styled   | child Avatar size context         | child `AvatarContext`      | composition   | children inherit width/height from AvatarGroup size             | matched | unit and e2e full size matrix |
| Styled   | child overlap                     | `avatarGroupAvatar` styles | visual/layout | first Avatar margin is zero, later avatars overlap              | matched | e2e computed contract         |
| Styled   | over-background child outline     | child `AvatarContext`      | visual        | child outline style/width/color match React                     | matched | e2e computed contract         |
| Styled   | visible label typography          | `avatarGroupText` styles   | visual        | label margin and size token map match each group size           | matched | e2e computed contract         |
| Styled   | forced-colors environment         | generated S2 CSS           | visual/a11y   | computed contract matches React under forced colors             | matched | e2e forced-colors test        |
| Harness  | route control surface             | comparison route           | route         | visible label/size controls, no count control, and query counts | matched | e2e route-control test        |

## Style Source-To-Computed

| Upstream style owner                                      | Solid owner                            | Observable                                            | Evidence                           | Status  |
| --------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------- | ---------------------------------- | ------- |
| group container `display: flex` and `alignItems: center`  | `avatarGroupContainer` generated class | root layout matches React                             | computed contract                  | matched |
| inline `--size` from documented group size                | AvatarGroup root style accessor        | size variable is `size / 16rem`                       | package and browser tests          | matched |
| child Avatar context `styles`, `size`, `isOverBackground` | `AvatarContext.Provider` value         | child width/height, overlap, and outline match React  | package test and size/count matrix | matched |
| overlap margin branch                                     | `avatarGroupAvatar` generated class    | first child has zero margin, later children overlap   | computed contract                  | matched |
| visible label typography map                              | `avatarGroupText` generated class      | label margin and font size match each documented size | computed contract                  | matched |
| forced-colors environment                                 | generated S2 CSS                       | forced-colors route contract matches React            | e2e forced-colors test             | matched |

## Behavior State Machine

AvatarGroup is a static composition component, so the owned state machine is a
render-state matrix rather than an interaction machine.

| State/axis          | Observable                                                                             | Evidence                             | Status  |
| ------------------- | -------------------------------------------------------------------------------------- | ------------------------------------ | ------- |
| default route       | four Avatars, visible label, `aria-label`, strict zero-tolerance visual pair           | e2e default screenshot               | matched |
| label changes       | accessible name composes fixed `aria-label` plus visible label                         | package and route-control tests      | matched |
| size changes        | root `--size`, child Avatar dimensions, label typography                               | package test and browser size matrix | matched |
| child count changes | Avatar children render before the label and preserve overlap                           | query-only browser count matrix      | matched |
| context override    | group context local overrides, unsafe props, and child size propagation                | package test                         | matched |
| forced colors       | computed group/child contract matches React under media emulation                      | browser forced-colors test           | matched |
| filtered root props | `hidden`, event handlers, `aria-describedby`, and `aria-details` do not reach the root | package and browser tests            | matched |

## Transition Plan

- Static states:
  - default route with four image children, visible `123 members`, and
    `aria-label="Collaborators"`;
  - every documented group size;
  - child counts `2`, `3`, and `4`;
  - visible label plus `aria-label` composition and `aria-label` fallback;
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

## Accessibility And I18n

| Concern                         | React S2 behavior                                                                                       | Solid behavior                                     | Evidence                        | Status  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------- | ------- |
| Root role                       | native `div role="group"`                                                                               | native `div role="group"`                          | package and browser tests       | matched |
| Visible label                   | `useLabel` labels the group through generated `aria-labelledby`                                         | `createLabel` mirrors visible label ID composition | package and browser tests       | matched |
| `aria-label` fallback           | root is named when no visible label is supplied                                                         | same fallback path                                 | package test                    | matched |
| Visible label plus `aria-label` | accessible name composes both labels                                                                    | same composition                                   | package and route-control tests | matched |
| Description props               | S2 API table lists `aria-describedby`/`aria-details`, but installed source filters them for AvatarGroup | route passes both and Solid filters both           | package and browser tests       | matched |
| Event/global prop filtering     | default S2 filter drops generic events and global attrs like `hidden`                                   | Solidaria filter follows the same default options  | package test                    | matched |
| I18n/localization               | no owned strings beyond caller-supplied label/ARIA text                                                 | same caller-supplied strings                       | source audit                    | n/a     |
| Forced colors                   | child over-background outline contract remains visible                                                  | computed contract matches React                    | browser forced-colors test      | matched |

## Runtime Semantics

- Native element/role decision:
  - renders a `div role="group"` labelled by visible label text, `aria-label`,
    or the S2-supported composition of both.
- Accessible name/description assertions:
  - visible `label`, `aria-label`, and their combined route default are covered.
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

- Focused Solid AvatarGroup/Avatar tests: `12 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/avatargroup/`.
- AvatarGroup Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `251`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists missing React S2 value exports at `57` of `208`
  and extra Solid value exports at `6`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: AvatarGroup is accepted as of 2026-05-20.
- Standalone Avatar evidence remains in `avatar-validation-notes.md`.
- Image, Skeleton, and Form remain separate comparison-live passes with their
  own acceptance boundaries.
