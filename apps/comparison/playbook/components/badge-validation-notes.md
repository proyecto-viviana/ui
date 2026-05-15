# Badge Validation Notes

## Target

- Component: Badge
- Slug: badge
- Family or direct subcomponents: BadgeContext, Text slot, Icon slot,
  SkeletonWrapper
- Pass goal: S2 styled Badge parity, route controls, text/icon slot contexts,
  skeleton wrapper behavior, forced-colors parity, and strict default visual
  evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                 | Blocker or next action |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Badge docs and S2 source                                                                              | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                        | None                   |
| 2 Route harness        | done   | Badge controls, route defaults, React/Solid fixtures, route-control assertions                           | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                     | None                   |
| 4 Cross-layer audit    | done   | Source branch ledger covers style branches, slots, context, legacy aliases, and skeleton wrapper         | None                   |
| 5 Transitions          | done   | Static component; overflow, icon, skeleton, and forced-colors obligations recorded                       | None                   |
| 6 State                | n/a    | No state package owner                                                                                   | None                   |
| 7 ARIA hooks           | n/a    | Badge has no dedicated ARIA hook                                                                         | None                   |
| 8 Headless             | n/a    | Native `span role="presentation"` metadata semantics                                                     | None                   |
| 9 Styled S2            | done   | `Badge`, `BadgeContext`, S2 style macro branches, generated CSS, unit tests, and computed browser matrix | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus provider contexts; no timers, overlays, portals, or global listeners                  | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, computed matrix, forced-colors contract            | None                   |
| 12 Comparison evidence | done   | Badge Playwright suite `4 passed`; current reports refreshed during sweep                                | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check in sweep                       | None                   |

## Source Packet

| Source                   | Files or docs                                                   | Finding                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Badge` page                                                    | Public API includes `children`, `variant`, `fillStyle`, `size`, `overflowMode`, `slot`, style props, and ARIA labels.                   |
| React Spectrum S2 source | `@react-spectrum/s2/src/Badge.tsx`                              | Badge uses `control`, text/icon slot contexts, `SkeletonWrapper`, `BadgeContext`, and generated S2 style macro CSS.                     |
| Solid source before pass | `packages/solid-spectrum/src/badge/index.tsx`                   | Solid was a count-only circular helper with handwritten classes and no S2 text/icon/context surface.                                    |
| Solid source after pass  | `packages/solid-spectrum/src/badge/index.tsx`                   | Solid owns the S2 style macro surface, contexts, slots, skeleton wrapper, and compatibility alias mapping.                              |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `badge-visual` e2e | Badge is live on both stacks with strict default visual evidence, route-control checks, computed contracts, and forced-colors evidence. |

## Official Docs And Viewer Parity

| Docs item      | Official setting/example                      | Route/control                                      | Status  | Evidence                                |
| -------------- | --------------------------------------------- | -------------------------------------------------- | ------- | --------------------------------------- |
| `children`     | visible Badge content                         | text input, default `Published`                    | matched | e2e asserts default and changed values  |
| `variant`      | all S2 semantic/categorical variants          | select options in S2 order, default `neutral`      | matched | e2e asserts option labels/order/default |
| `fillStyle`    | `bold`, `subtle`, `outline`; default `bold`   | radio options in S2 order                          | matched | e2e asserts option labels/order/default |
| `size`         | `S`, `M`, `L`, `XL`; default `S`              | radio options in S2 order                          | matched | e2e asserts option labels/order/default |
| `overflowMode` | `wrap`, `truncate`; default `wrap`            | radio options in S2 order                          | matched | e2e asserts option labels/order/default |
| Icon + Text    | `<Badge><Icon /><Text /></Badge>`             | `iconPlacement=start` renders icon + explicit Text | matched | unit and e2e contracts                  |
| `slot`         | named slot or `null`                          | component API and context merge                    | matched | unit context tests                      |
| `styles`       | S2 style macro override                       | component API                                      | matched | style macro accepts allowed overrides   |
| unsafe props   | `UNSAFE_className`, `UNSAFE_style`            | component API                                      | matched | unit test covers class/style merge      |
| ARIA labels    | `aria-label`, `aria-labelledby`, descriptions | inherited through DOM prop filtering               | matched | source audit and DOM prop pass-through  |

## Baseline

- Before the support sweep, Badge was a catalogue gap with no live Solid styled
  route and no Badge-specific strict visual evidence.
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
- Current post-sweep reports list Badge live and strict:
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `172`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - missing S2 value exports: `80`.
- Improvement target: close Badge retro-audit gaps without changing its
  accepted public behavior.

## Source Map And Public Contract

| Layer               | Upstream files                      | Solid files                                             | Status  |
| ------------------- | ----------------------------------- | ------------------------------------------------------- | ------- |
| State               | none                                | none                                                    | n/a     |
| ARIA hooks          | none                                | none                                                    | n/a     |
| Headless components | native `span` + DOM props           | native `span` + Solid DOM props                         | matched |
| Styled S2           | `@react-spectrum/s2/src/Badge.tsx`  | `packages/solid-spectrum/src/badge/index.tsx`           | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture | Badge demo data, controls, fixtures, visual matrix, e2e | matched |

- Public props/defaults:
  - `variant`: default `neutral`, all S2 variant values supported.
  - `fillStyle`: default `bold`, supports `subtle` and `outline`.
  - `size`: default `S`, supports `M`, `L`, and `XL`.
  - `overflowMode`: default `wrap`, supports `truncate`.
  - `children`, ARIA label props, DOM props, `slot`, `styles`,
    `UNSAFE_className`, `UNSAFE_style`, and `ref` are preserved.
- Contexts/providers:
  - `BadgeContext` is exported and consumed through the shared S2 slotted
    context helper.
  - `TextContext` wraps text-only children and applies the S2 overflow branch.
  - `IconContext` centers icon children and binds `--iconPrimary` to
    `currentColor`.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.
- Unsupported or intentionally different branches:
  - Legacy `count` remains as content compatibility.
  - Legacy variants map to S2 equivalents: `primary -> accent`,
    `secondary -> neutral`, `success -> positive`, `warning -> notice`,
    `danger -> negative`, `info -> informative`.
  - Legacy `sm`, `md`, and `lg` sizes map to `S`, `M`, and `L`.

## Source Branch Coverage

| Layer   | Upstream branch                     | Solid owner            | Class               | Observable                                                 | Status  | Evidence                                  |
| ------- | ----------------------------------- | ---------------------- | ------------------- | ---------------------------------------------------------- | ------- | ----------------------------------------- |
| Styled  | `control({wrap: true, icon: true})` | S2 `Badge` style macro | visual/layout       | display, gap, font, min-size, radius, padding              | matched | e2e computed contract                     |
| Styled  | `variant` color map                 | S2 `Badge` style macro | visual              | foreground/background/border match representative branches | matched | unit branch tests and e2e computed matrix |
| Styled  | `fillStyle=bold`                    | S2 `Badge` style macro | visual              | bold background and foreground branches                    | matched | e2e computed matrix                       |
| Styled  | `fillStyle=subtle`                  | S2 `Badge` style macro | visual              | subtle background and gray foreground                      | matched | e2e computed matrix                       |
| Styled  | `fillStyle=outline`                 | S2 `Badge` style macro | visual              | layer background and semantic border branches              | matched | e2e computed matrix                       |
| Styled  | `size` S/M/L/XL                     | S2 `Badge` style macro | visual              | control size, font, radius, and padding branches           | matched | e2e control and computed tests            |
| Styled  | `overflowMode` wrap/truncate        | `TextContext` styles   | visual/text         | `white-space`, hidden overflow, ellipsis                   | matched | unit and e2e computed tests               |
| Styled  | icon child context                  | `IconContext`          | visual/composition  | icon centered, ordered before text, `currentColor`         | matched | unit and e2e computed tests               |
| Styled  | text-only child wrapping            | `TextContext` + `Text` | composition         | primitive text receives `data-rsp-slot="text"`             | matched | unit tests                                |
| Styled  | `BadgeContext` merge                | S2 `Badge`             | context             | context props apply, local props/classes/styles merge      | matched | unit tests                                |
| Styled  | `SkeletonWrapper`                   | S2 `Badge`             | loading/composition | skeleton wrapper marks loading subtree inert               | matched | unit tests                                |
| Styled  | forced-colors environment           | generated S2 CSS       | visual/a11y         | forced-colors computed contract matches React              | matched | e2e forced-colors test                    |
| Compat  | legacy variant/size/count aliases   | S2 `Badge`             | compatibility       | aliases map to equivalent S2 class output/content          | matched | unit tests                                |
| Harness | route control surface               | comparison route       | route integrity     | visible labels/order/defaults and changed props            | matched | e2e route-control test                    |

## Transition Plan

- Static states:
  - default neutral/bold/S/wrap text-only;
  - semantic and categorical variants;
  - bold/subtle/outline fill styles;
  - S/M/L/XL sizes;
  - wrap and truncate overflow;
  - icon + text composition;
  - forced-colors active;
  - skeleton loading wrapper.
- Interaction timelines:
  - not applicable. Badge has no press, hover, focus, keyboard, or value
    transition semantics.
- Overlay/loading/async timelines:
  - skeleton loading wrapper is covered by unit tests; Badge owns no async
    lifecycle.
- Cleanup assertions:
  - not applicable. Badge owns no timers, portals, observers, subscriptions, or
    global event listeners.
- Visual-state rows changed:
  - Badge has strict default evidence plus asserted route-control, branch, and
    forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders a native `span` with `role="presentation"` like React Spectrum S2.
- Accessible name/description assertions:
  - Badge is presentational metadata; ARIA label props pass through for callers
    that need explicit labeling.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - DOM event props remain available through DOM prop pass-through, but Badge
    owns no interaction behavior.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - text/icon providers are scoped around the Badge subtree and do not require
    eager child evaluation.
- Announcements:
  - not applicable.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; no generated IDs or client lifecycle side effects.

## Evidence

```bash
vp test run packages/solid-spectrum/test/Badge.test.tsx
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Badge"
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/badge-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid Badge tests: `6 passed`.
- Badge regression snapshot: `1 passed`.
- Comparison build: passed and generated `/components/badge/`.
- Badge Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `172`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Badge is playbook-accepted for owned behavior.
- No in-scope Badge gates remain open.
- The next retro-audit hardening candidate should be StatusLight, then Link or
  Meter.
