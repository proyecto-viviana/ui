# Badge Validation Notes

Date: 2026-05-20
Status: accepted

## Target

- Component: Badge
- Slug: badge
- Family or direct subcomponents: BadgeContext, Text slot, Icon slot,
  SkeletonWrapper
- Pass goal: S2 styled Badge parity, route controls, text/icon slot contexts,
  skeleton wrapper behavior, forced-colors parity, and strict default visual
  evidence
- Date: 2026-05-20

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

## Current Component Closeout

- Closeout date: 2026-05-20.
- Current gate status: accepted.
- Documentation/source check: React Spectrum S2 MCP `Badge` API and installed
  `@react-spectrum/s2@1.3.0/src/Badge.tsx` match the Solid public API, route
  controls, and source ledger below.
- Source fix closed: Solid Badge now filters root DOM props through Solidaria
  `filterDOMProps`, matching installed React S2's default
  `filterDOMProps(otherProps)` call. This preserves `id` and `data-*`, while
  filtering inherited ARIA label/description props, `hidden`, and event
  handlers from the presentational root.
- Package verification on 2026-05-20:
  `vp test run packages/solid-spectrum/test/Badge.test.tsx` passed `7/7`, and
  `vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: Badge"`
  passed `1/1`.
- Browser verification on 2026-05-20:
  `vp run --filter @proyecto-viviana/comparison build` passed, and
  `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/badge-visual.spec.ts --reporter=line`
  passed `4/4`.
- Report/check verification on 2026-05-20:
  `vp run comparison:report:gaps`, `vp run comparison:report:exports`,
  `vp run guard:rac-parity`, `vp run guard:rac-export-gap`, and
  `vp run check` passed.

## Acceptance Gate Checklist

These gates are additive. Badge is accepted only with direct evidence for every
in-scope item below.

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                             | Blockers/owner |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Official Docs And Viewer Parity          | done    | S2 MCP API checked on 2026-05-20; viewer exposes content, variant, fill style, size, overflow mode, and icon composition, with route evidence for inherited ARIA/global props being filtered per source behavior.                    | None           |
| External Authority And Standards         | done    | Badge remains presentational metadata with native `span role="presentation"` semantics; no WAI-ARIA composite widget keyboard pattern applies.                                                                                       | None           |
| Upstream React Source Parity             | done    | Installed React S2 `Badge.tsx`, React Aria `filterDOMProps`, S2 `control`, text/icon slot contexts, and `SkeletonWrapper` are mapped to Solid source, package tests, and browser contracts.                                          | None           |
| Solid Idiomatic Implementation           | done    | Solid keeps reactive context/style accessors, slotted context/ref/style merging, lazy child resolution, and shared Solidaria DOM prop filtering without adding effects or local state.                                               | None           |
| Accessibility And I18n                   | done    | Presentational role, filtered ARIA labels/descriptions, caller-supplied text, icon `aria-hidden` route path, forced-colors environment, and non-interactive event filtering are covered.                                             | None           |
| Behavior State Machine                   | done    | Static render matrix covers default, all documented prop axes, icon composition, text truncation, skeleton loading wrapper, context override, legacy aliases, and forced-colors route state; no focus/keyboard/overlay owner exists. | None           |
| Style Source-To-Computed Parity          | done    | Control geometry, semantic/categorical color variants, fill styles, sizes, text overflow, icon slot centering, skeleton wrapper, and forced-colors computed contracts match React S2 across representative route states.             | None           |
| React-Vs-Solid Comparison Harness Parity | done    | React and Solid fixtures pass the same docs props plus intentionally filtered ARIA/global props; strict default screenshot, route-control assertions, computed style matrix, and forced-colors contract all pass.                    | None           |
| Evidence And Handoff                     | done    | Focused package tests, Badge regression snapshot, comparison build, Badge browser suite, reports, guards, full check, and README status update are complete for this component boundary.                                             | None           |

## Agent Workflow

No subagents were assigned for Badge. The pass stayed local because the
implementation fix and evidence updates are in one component boundary.

| Task                    | Owner       | Inputs                                                                      | Writes                                                                                          | Evidence                                  | Status |
| ----------------------- | ----------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- | ------ |
| Source/API verification | local Codex | S2 MCP API, installed React S2 source, Solid Badge source, existing notes   | playbook note                                                                                   | source packet and DOM filtering finding   | done   |
| Implementation closure  | local Codex | Badge source, package tests, React/Solid route fixtures, Badge browser spec | Solid Badge root filtering, unit tests, regression snapshot, route fixture and browser contract | package tests and Badge Playwright suite  | done   |
| Acceptance bookkeeping  | local Codex | current report output, component README current-gate list                   | this note, component README, controls/matrix notes                                              | reports, guards, full check, commit scope | done   |

## Source Packet

| Source                   | Files or docs                                                   | Finding                                                                                                                                 |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Badge` API checked 2026-05-20                                  | Public API includes `children`, `variant`, `fillStyle`, `size`, `overflowMode`, `slot`, style props, and inherited ARIA labeling props. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Badge.tsx`                              | Badge uses `control`, text/icon slot contexts, `SkeletonWrapper`, `BadgeContext`, and generated S2 style macro CSS.                     |
| React Aria source        | `filterDOMProps`                                                | Default filtering preserves `id` and `data-*`; inherited ARIA label/description props, global props like `hidden`, and events drop.     |
| Solid source before pass | `packages/solid-spectrum/src/badge/index.tsx`                   | Solid was a count-only circular helper with handwritten classes and no S2 text/icon/context surface.                                    |
| Solid source after pass  | `packages/solid-spectrum/src/badge/index.tsx`                   | Solid owns the S2 style macro surface, contexts, slots, skeleton wrapper, compatibility alias mapping, and S2 root DOM prop filtering.  |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `badge-visual` e2e | Badge is live on both stacks with strict default visual evidence, route-control checks, computed contracts, and forced-colors evidence. |

## Official Docs And Viewer Parity

| Docs item      | Official setting/example                    | Route/control                                       | Status  | Evidence                                |
| -------------- | ------------------------------------------- | --------------------------------------------------- | ------- | --------------------------------------- |
| `children`     | visible Badge content                       | text input, default `Published`                     | matched | e2e asserts default and changed values  |
| `variant`      | all S2 semantic/categorical variants        | select options in S2 order, default `neutral`       | matched | e2e asserts option labels/order/default |
| `fillStyle`    | `bold`, `subtle`, `outline`; default `bold` | radio options in S2 order                           | matched | e2e asserts option labels/order/default |
| `size`         | `S`, `M`, `L`, `XL`; default `S`            | radio options in S2 order                           | matched | e2e asserts option labels/order/default |
| `overflowMode` | `wrap`, `truncate`; default `wrap`          | radio options in S2 order                           | matched | e2e asserts option labels/order/default |
| Icon + Text    | `<Badge><Icon /><Text /></Badge>`           | `iconPlacement=start` renders icon + explicit Text  | matched | unit and e2e contracts                  |
| `slot`         | named slot or `null`                        | component API and context merge                     | matched | unit context tests                      |
| `styles`       | S2 style macro override                     | component API                                       | matched | style macro accepts allowed overrides   |
| unsafe props   | `UNSAFE_className`, `UNSAFE_style`          | component API                                       | matched | unit test covers class/style merge      |
| ARIA labels    | inherited through public API table          | route passes labels/descriptions; roots filter them | matched | unit and e2e tests                      |
| DOM filtering  | default `filterDOMProps(otherProps)`        | component API                                       | matched | unit and e2e tests                      |

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
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `252`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `6`.
- Improvement target: close Badge retro-audit gaps without changing its legacy
  public behavior.

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
  - `children`, `slot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and
    `ref` are preserved.
  - `id` and `data-*` root DOM props are preserved through S2 default
    filtering.
  - inherited ARIA labeling/description props, global attrs like `hidden`, and
    DOM event handlers are filtered from the presentational root to match
    installed React S2 source behavior.
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

| Layer    | Upstream branch                     | Solid owner                | Class               | Observable                                                 | Status  | Evidence                                  |
| -------- | ----------------------------------- | -------------------------- | ------------------- | ---------------------------------------------------------- | ------- | ----------------------------------------- |
| Styled   | `control({wrap: true, icon: true})` | S2 `Badge` style macro     | visual/layout       | display, gap, font, min-size, radius, padding              | matched | e2e computed contract                     |
| Styled   | `variant` color map                 | S2 `Badge` style macro     | visual              | foreground/background/border match representative branches | matched | unit branch tests and e2e computed matrix |
| Styled   | `fillStyle=bold`                    | S2 `Badge` style macro     | visual              | bold background and foreground branches                    | matched | e2e computed matrix                       |
| Styled   | `fillStyle=subtle`                  | S2 `Badge` style macro     | visual              | subtle background and gray foreground                      | matched | e2e computed matrix                       |
| Styled   | `fillStyle=outline`                 | S2 `Badge` style macro     | visual              | layer background and semantic border branches              | matched | e2e computed matrix                       |
| Styled   | `size` S/M/L/XL                     | S2 `Badge` style macro     | visual              | control size, font, radius, and padding branches           | matched | e2e control and computed tests            |
| Styled   | `overflowMode` wrap/truncate        | `TextContext` styles       | visual/text         | `white-space`, hidden overflow, ellipsis                   | matched | unit and e2e computed tests               |
| Styled   | icon child context                  | `IconContext`              | visual/composition  | icon centered, ordered before text, `currentColor`         | matched | unit and e2e computed tests               |
| Styled   | text-only child wrapping            | `TextContext` + `Text`     | composition         | primitive text receives `data-rsp-slot="text"`             | matched | unit tests                                |
| Styled   | `BadgeContext` merge                | S2 `Badge`                 | context             | context props apply, local props/classes/styles merge      | matched | unit tests                                |
| Styled   | `SkeletonWrapper`                   | S2 `Badge`                 | loading/composition | skeleton wrapper marks loading subtree inert               | matched | unit tests                                |
| Styled   | forced-colors environment           | generated S2 CSS           | visual/a11y         | forced-colors computed contract matches React              | matched | e2e forced-colors test                    |
| Headless | DOM prop filtering                  | Solidaria `filterDOMProps` | semantics/API       | `id`/`data-*` pass; ARIA/global/event props drop           | matched | unit and e2e tests                        |
| Compat   | legacy variant/size/count aliases   | S2 `Badge`                 | compatibility       | aliases map to equivalent S2 class output/content          | matched | unit tests                                |
| Harness  | route control surface               | comparison route           | route integrity     | visible labels/order/defaults and changed props            | matched | e2e route-control test                    |

## Style Source-To-Computed

| Upstream style owner                         | Solid owner                         | Observable                                                     | Evidence                         | Status  |
| -------------------------------------------- | ----------------------------------- | -------------------------------------------------------------- | -------------------------------- | ------- |
| S2 `control({shape: "default", wrap, icon})` | `badgeStyles` generated class       | display, alignment, gap, font, radius, padding, min dimensions | computed contract                | matched |
| semantic and categorical variant color map   | `badgeStyles` variant branch        | foreground, background, and border color branches              | package branch tests and e2e     | matched |
| `fillStyle` bold/subtle/outline              | `badgeStyles` fill branch           | bold fill, subtle fill, outline layer/background/border        | computed matrix                  | matched |
| S/M/L/XL sizes                               | S2 control size branch              | control size, label padding, font, and radius                  | route-control and computed tests | matched |
| `overflowMode` wrap/truncate                 | `TextContext` `textStyles` branch   | `white-space`, overflow, and ellipsis behavior                 | package and e2e tests            | matched |
| icon child context                           | `IconContext` with `centerBaseline` | icon order, centering wrapper, currentColor fill               | package and e2e tests            | matched |
| skeleton wrapper                             | shared `SkeletonWrapper`            | loading subtree marked inert                                   | package test                     | matched |
| forced-colors environment                    | generated S2 CSS                    | forced-colors computed contract matches React                  | e2e forced-colors test           | matched |

## Behavior State Machine

Badge is a static metadata component, so its owned state machine is a
render-state matrix rather than an interaction machine.

| State/axis           | Observable                                                                     | Evidence                       | Status  |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------ | ------- |
| default route        | neutral/bold/S/wrap text-only badge with strict zero-tolerance visual pair     | e2e default screenshot         | matched |
| prop controls        | route controls drive content, variant, fill, size, overflow, and icon content  | e2e route-control test         | matched |
| variant/fill/size    | representative semantic, categorical, outline, subtle, and bold branches       | package tests and computed e2e | matched |
| icon composition     | icon child is slotted before text and uses currentColor                        | package and computed e2e tests | matched |
| overflow             | truncate text branch applies nowrap/ellipsis                                   | package and computed e2e tests | matched |
| context override     | BadgeContext props merge with local unsafe class/style                         | package test                   | matched |
| skeleton loading     | shared Skeleton wrapper marks loading subtree inert                            | package test                   | matched |
| filtered root props  | `id`/`data-*` pass; ARIA label/description, `hidden`, and handlers are dropped | package and browser tests      | matched |
| legacy aliases/count | legacy count, variant aliases, and size aliases map to S2 output               | package and regression tests   | matched |
| forced colors        | computed color/border/icon contract matches React under media emulation        | browser forced-colors test     | matched |

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

## Accessibility And I18n

| Concern                  | React S2 behavior                                                      | Solid behavior                                    | Evidence                  | Status  |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------- | ------------------------- | ------- |
| Root semantics           | native `span role="presentation"`                                      | native `span role="presentation"`                 | package and browser tests | matched |
| ARIA labels/descriptions | inherited API props are filtered by default root `filterDOMProps`      | Solidaria `filterDOMProps` filters the same props | package and browser tests | matched |
| Global attrs and events  | `hidden` and generic event handlers are filtered from the root         | same default filtering                            | package test              | matched |
| `id`/`data-*`            | default filter preserves root `id` and `data-*`                        | same preservation                                 | package and browser tests | matched |
| Icon route content       | icon is caller-hidden with `aria-hidden="true"` in the route fixture   | same route fixture behavior                       | browser tests             | matched |
| Caller text/localization | no owned text beyond caller-supplied children and optional icon labels | same caller-supplied children                     | source audit              | n/a     |
| Forced colors            | generated CSS keeps color/border contract in forced colors             | computed contract matches React                   | browser forced-colors     | matched |

## Runtime Semantics

- Native element/role decision:
  - renders a native `span` with `role="presentation"` like React Spectrum S2.
- Accessible name/description assertions:
  - Badge is presentational metadata; inherited ARIA label and description props
    are listed in the public API table but filtered by installed React S2's
    default root `filterDOMProps(otherProps)` path.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - DOM event props are filtered from the root, and Badge owns no interaction
    behavior.
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

- Focused Solid Badge tests: `7 passed`.
- Badge regression snapshot: `1 passed`.
- Comparison build: passed and generated `/components/badge/`.
- Badge Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `252`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists missing React S2 value exports at `57` of `208`
  and extra Solid value exports at `6`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: Badge is accepted as of 2026-05-20.
- This pass fixed the Solid root DOM filtering mismatch and closed the stale
  ARIA pass-through note.
- Use `components/README.md` for the current-gate normalization queue.
