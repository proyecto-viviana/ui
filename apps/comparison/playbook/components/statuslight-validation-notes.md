# StatusLight Validation Notes

## Target

- Component: StatusLight
- Slug: statuslight
- Family or direct subcomponents: StatusLightContext, Text slot,
  CenterBaseline/SVG light, Skeleton consumer
- Pass goal: S2 styled StatusLight parity, route controls, labelable live-status
  behavior, skeleton consumer behavior, forced-colors parity, and strict default
  visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                          | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 StatusLight docs and S2 source                                                                 | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                 | None                   |
| 2 Route harness        | done   | StatusLight controls, route defaults, React/Solid fixtures, visible control assertions            | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                              | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers wrapper, SVG light, text, role, context, skeleton, and aliases               | None                   |
| 5 Transitions          | done   | Static component; variant, size, role, skeleton, and forced-colors obligations recorded           | None                   |
| 6 State                | n/a    | No state package owner                                                                            | None                   |
| 7 ARIA hooks           | n/a    | StatusLight has no dedicated ARIA hook                                                            | None                   |
| 8 Headless             | n/a    | Native `div`/`svg`/text composition                                                               | None                   |
| 9 Styled S2            | done   | `StatusLight`, `StatusLightContext`, S2 style macro branches, unit tests, computed browser matrix | None                   |
| 10 Runtime lifecycle   | done   | Static markup plus provider contexts; no timers, overlays, portals, or global listeners           | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, computed matrix, forced-colors contract     | None                   |
| 12 Comparison evidence | done   | StatusLight Playwright suite `4 passed`; current reports and guards refreshed                     | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                         | None                   |

## Source Packet

| Source                   | Files or docs                                                         | Finding                                                                                                                                       |
| ------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `StatusLight` page                                                    | Public API includes `children`, `variant`, `size`, optional `role="status"`, label ARIA props, style props, unsafe escapes, and `slot`.       |
| React Spectrum S2 source | `@react-spectrum/s2/src/StatusLight.tsx`                              | StatusLight uses a flex wrapper, `CenterBaseline`, SVG circle fill/size, `Text`, `StatusLightContext`, `useIsSkeleton`, and labelable props.  |
| Solid source before pass | `packages/solid-spectrum/src/statuslight/index.tsx`                   | Solid already used the S2 structure from the support sweep, but labelable ARIA filtering and route-control evidence were incomplete.          |
| Solid source after pass  | `packages/solid-spectrum/src/statuslight/index.tsx`                   | Solid matches the S2 wrapper, SVG light, text slot, context merge, skeleton branch, legacy aliases, and role-gated ARIA labels.               |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `statuslight-visual` e2e | StatusLight is live on both stacks with strict default visual evidence, route-control checks, computed contracts, and forced-colors evidence. |

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                                     | Route/control                                 | Status  | Evidence                                |
| ------------ | ------------------------------------------------------------ | --------------------------------------------- | ------- | --------------------------------------- |
| `children`   | visible StatusLight label                                    | text input, default `Sync complete`           | matched | e2e asserts default and changed values  |
| `variant`    | all S2 semantic/categorical variants                         | select options in S2 order, default `neutral` | matched | e2e asserts option labels/order/default |
| `size`       | `S`, `M`, `L`, `XL`; default `M`                             | radio options in S2 order                     | matched | e2e asserts option labels/order/default |
| `role`       | optional `status` role                                       | radio options `default`, `status`             | matched | e2e asserts labels/order/default        |
| ARIA labels  | labelable only when the status role is used in the S2 source | component API                                 | matched | unit test covers role-gated labels      |
| `slot`       | named slot or `null`                                         | component API and context merge               | matched | unit context test                       |
| `styles`     | S2 style macro override                                      | component API                                 | matched | style macro accepts allowed overrides   |
| unsafe props | `UNSAFE_className`, `UNSAFE_style`                           | component API                                 | matched | unit test covers class/style merge      |

## Baseline

- Before the support sweep, StatusLight was a catalogue gap with no live Solid
  styled route and no StatusLight-specific strict visual evidence.
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
- Current reports list StatusLight live and strict:
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `173`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`.
- Improvement target: close StatusLight retro-audit gaps without changing its
  accepted public behavior.

## Source Map And Public Contract

| Layer               | Upstream files                            | Solid files                                         | Status  |
| ------------------- | ----------------------------------------- | --------------------------------------------------- | ------- |
| State               | none                                      | none                                                | n/a     |
| ARIA hooks          | none                                      | none                                                | n/a     |
| Headless components | native `div`, SVG, and `Text` composition | native `div`, SVG, and `Text` composition           | matched |
| Styled S2           | `@react-spectrum/s2/src/StatusLight.tsx`  | `packages/solid-spectrum/src/statuslight/index.tsx` | matched |
| Comparison route    | S2 docs/viewer and React S2 fixture       | demo data, controls, fixtures, visual matrix, e2e   | matched |

- Public props/defaults:
  - `variant`: default `neutral`, all S2 variant values supported.
  - `size`: default `M`, supports `S`, `L`, and `XL`.
  - `role`: optional `status`; ARIA label props are forwarded only when the
    role is present, matching React Spectrum's labelable DOM filtering.
  - `children`, DOM props, `slot`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, and `ref` are preserved.
- Contexts/providers:
  - `StatusLightContext` is exported and consumed through the shared S2 slotted
    context helper.
  - `TextContext` wraps the label text so primitive text receives the S2 text
    slot.
  - `Skeleton` consumers mark text inert and switch the SVG light to the
    skeleton fill branch.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.
- Unsupported or intentionally different branches:
  - Legacy `info` maps to `informative`.
  - Legacy `sm`, `md`, and `lg` sizes map to `S`, `M`, and `L`.
  - Legacy `class` and `indicatorClass` remain compatibility escape hatches.

## Source Branch Coverage

| Layer   | Upstream branch                      | Solid owner                    | Class              | Observable                                      | Status  | Evidence                |
| ------- | ------------------------------------ | ------------------------------ | ------------------ | ----------------------------------------------- | ------- | ----------------------- |
| Styled  | wrapper layout                       | S2 `StatusLight` style macro   | visual/layout      | display, gap, baseline alignment, width, font   | matched | e2e computed contract   |
| Styled  | wrapper color default/neutral branch | S2 `StatusLight` style macro   | visual             | root foreground color                           | matched | e2e computed contract   |
| Styled  | SVG light `variant` fill map         | S2 `StatusLight` style macro   | visual             | every documented fill token                     | matched | e2e full variant matrix |
| Styled  | SVG light `size` S/M/L/XL            | S2 `StatusLight` style macro   | visual             | light width/height                              | matched | e2e size matrix         |
| Styled  | SVG light overflow                   | S2 `StatusLight` style macro   | visual             | `overflow: visible`                             | matched | e2e computed contract   |
| Styled  | `CenterBaseline` composition         | `CenterBaseline` helper        | visual/composition | centered baseline wrapper                       | matched | e2e computed contract   |
| Styled  | text child wrapping                  | `TextContext` + `Text`         | composition        | primitive text receives `data-rsp-slot="text"`  | matched | unit and e2e tests      |
| Styled  | optional `role="status"`             | native root `div`              | a11y               | live status role only when requested            | matched | unit and e2e tests      |
| Styled  | labelable ARIA props                 | role-gated DOM attributes      | a11y               | labels forwarded only for `role="status"`       | matched | unit test               |
| Styled  | `StatusLightContext` merge           | S2 `StatusLight`               | context            | context props apply, local props/classes merge  | matched | unit test               |
| Styled  | skeleton text/light consumers        | `Skeleton` and `useIsSkeleton` | loading/visual     | inert text and skeleton light fill              | matched | unit test               |
| Styled  | forced-colors environment            | generated S2 CSS               | visual/a11y        | computed contract matches React                 | matched | e2e forced-colors test  |
| Compat  | legacy variant/size/class aliases    | S2 `StatusLight`               | compatibility      | aliases map to equivalent S2 output             | matched | unit tests              |
| Harness | route control surface                | comparison route               | route integrity    | visible labels/order/defaults and changed props | matched | e2e route-control test  |

## Transition Plan

- Static states:
  - default neutral/M text-only;
  - every semantic and categorical variant;
  - S/M/L/XL SVG light sizes;
  - optional `role="status"`;
  - role-gated label ARIA props;
  - forced-colors active;
  - skeleton loading text/light branch.
- Interaction timelines:
  - not applicable. StatusLight has no press, hover, focus, keyboard, or value
    transition semantics.
- Overlay/loading/async timelines:
  - skeleton loading is covered by unit tests; StatusLight owns no async
    lifecycle.
- Cleanup assertions:
  - not applicable. StatusLight owns no timers, portals, observers,
    subscriptions, or global event listeners.
- Visual-state rows changed:
  - StatusLight has strict default evidence plus asserted route-control,
    full variant/size/role, and forced-colors rows.

## Runtime Semantics

- Native element/role decision:
  - renders a native `div`; `role="status"` is only present when requested.
- Accessible name/description assertions:
  - S2 source only treats label ARIA props as labelable when `role` is present;
    Solid now filters the same label props unless `role="status"` is active.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - DOM event props remain available through DOM prop pass-through, but
    StatusLight owns no interaction behavior.
- Solid idiom regression assertions:
  - context values merge through `mergeProps`; local props override context
    values where supplied.
  - text provider and skeleton consumer remain reactive without eager child
    evaluation.
- Announcements:
  - `role="status"` is available for live updates; multiple simultaneous live
    updates remain a caller-level S2 usage constraint.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; no generated IDs or client lifecycle side effects.

## Evidence

```bash
vp test run packages/solid-spectrum/test/StatusLight.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/statuslight-visual.spec.ts --reporter=line
vp test run packages/solid-spectrum/test/regression.test.tsx -t "Regression: StatusLight" -u
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Focused Solid StatusLight tests: `6 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/statuslight/`.
- StatusLight Playwright suite: `4 passed`.
- StatusLight regression snapshot slice: `1 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `173`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- StatusLight is playbook-accepted for owned behavior.
- No in-scope StatusLight gates remain open.
- Remaining comparison-live support components still need the same hardening:
  Link, Meter, Avatar, AvatarGroup, Image, Skeleton, and Form.
