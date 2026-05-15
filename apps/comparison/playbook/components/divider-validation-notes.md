# Divider Validation Notes

## Target

- Component: Divider
- Slug: divider
- Family or direct subcomponents: React Aria `Separator` / Solidaria
  `Separator`
- Pass goal: S2 styled Divider parity, headless separator semantics, context
  export parity, route controls, computed-style matrix, forced-colors branch,
  and strict default visual evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                     | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 0 Research             | done   | S2 Divider docs, React Aria Separator docs, S2 source, RAC Separator behavior                                | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, `guard:rac-export-gap`, `guard:rac-parity`            | None                   |
| 2 Route harness        | done   | Divider controls, React/Solid fixtures, manifest entry, route defaults, route-control assertions             | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                         | None                   |
| 4 Cross-layer audit    | done   | Source branch ledger covers separator element choice, role/orientation, size, static color, context, styling | None                   |
| 5 Transitions          | done   | Static component; transition and interaction branches marked not applicable                                  | None                   |
| 6 State                | n/a    | No state package owner                                                                                       | None                   |
| 7 ARIA hooks           | n/a    | Divider uses headless separator semantics directly                                                           | None                   |
| 8 Headless             | done   | `createSeparator` now matches RAC explicit role behavior; separator tests pass                               | None                   |
| 9 Styled S2            | done   | `Divider`, `DividerContext`, S2 style macro branches, generated CSS, and unit tests                          | None                   |
| 10 Runtime lifecycle   | done   | Static separator; no timers, overlays, portals, or global listeners                                          | None                   |
| 11 Harness integrity   | done   | Default exact pair diff, control assertions, computed-style matrix, forced-colors contract                   | None                   |
| 12 Comparison evidence | done   | Divider Playwright suite `4 passed`; current reports refreshed                                               | None                   |
| 13 Acceptance          | done   | Builds, focused tests, gap/export reports, RAC guards, full check, and Divider visual suite pass             | None                   |

## Source Packet

| Source                   | Files or docs                                                                | Finding                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Divider` page                                                               | Public API is `orientation`, `size`, `staticColor`, ARIA labels, `slot`, `styles`, and unsafe escape hatches. |
| React Aria docs MCP      | `Separator` page                                                             | Headless separator API owns orientation, slot, render/custom element, global DOM props, and ARIA labels.      |
| React Spectrum S2 source | `@react-spectrum/s2/src/Divider.tsx`                                         | S2 Divider wraps RAC `Separator`, exports `DividerContext`, and defines all visual branches through styles.   |
| Solid source before pass | `packages/solid-spectrum/src/divider/index.tsx`                              | Divider was only an alias to the legacy `Separator`, so S2 context, props, exports, and styling were missing. |
| Solid source after pass  | `packages/solid-spectrum/src/divider/index.tsx`, `solidaria/src/separator/*` | Solid now owns a real S2 Divider while the headless separator matches RAC role/orientation semantics.         |
| Comparison harness       | manifest, controls, fixtures, visual matrix, `e2e/divider-visual.spec.ts`    | Divider is live on both stacks with strict default visual evidence and source-derived computed contracts.     |

## Official Docs And Viewer Parity

| Docs item     | Official setting/example             | Route/control                                      | Status  | Evidence                                                  |
| ------------- | ------------------------------------ | -------------------------------------------------- | ------- | --------------------------------------------------------- |
| `orientation` | `horizontal`, `vertical`; default H  | radio options `horizontal`, `vertical`; default H  | matched | e2e asserts labels/order and serialized props             |
| `size`        | `S`, `M`, `L`; default `M`           | radio options `S`, `M`, `L`; default `M`           | matched | e2e asserts labels/order and computed thickness           |
| `staticColor` | omitted, `auto`, `black`, `white`    | select labels `default`, `auto`, `black`, `white`  | matched | e2e asserts omitted-prop label and no blank sentinel leak |
| ARIA labels   | `aria-label`, `aria-labelledby`, etc | inherited through headless separator props         | matched | unit tests query named separators                         |
| `slot`        | named slot or `null`                 | component API and context merge                    | matched | unit tests cover context/local override behavior          |
| `styles`      | S2 style macro override              | component API                                      | matched | S2 style macro accepts allowed overrides                  |
| unsafe props  | `UNSAFE_className`, `UNSAFE_style`   | component API                                      | matched | unit test covers class/style merge                        |
| Viewer canvas | static-color use needs color surface | route backdrop switches with `staticColor` setting | matched | e2e covers static-color branches in themed wrapper        |

## Baseline

- Before this pass, `comparison:report:gaps` reported:
  - Official entries in comparison app: `69`.
  - Official styled entries live on both sides: `32`.
  - Official entries still missing/gap: `37`.
  - Official visual states tracked: `169`.
  - Official visual states with current React/Solid visual evidence: `48`.
  - Official visual states with strict pair-diff tests: `31`.
  - Official visual states blocked by missing implementations: `36`.
- Before this pass, `comparison:report:exports` reported:
  - React Spectrum S2 value exports: `208`.
  - `solid-spectrum` public value exports: `130`.
  - Missing React S2 value exports: `81`.
  - Extra Solid value exports: `3`.
  - `DividerContext` was missing.
- `guard:rac-export-gap`: `0` missing named exports, `165` extra Solid
  exports.
- `guard:rac-parity`: no missing tracked symbols; `TreeHeader` and
  `TreeSection` still warn as tracker entries not present in the upstream RAC
  index.
- Improvement target: make Divider live on both stacks, add `DividerContext`,
  replace the legacy alias with S2 styling, and add strict route evidence.

## Source Map And Public Contract

| Layer               | Upstream files                                          | Solid files                                                                                              | Status  |
| ------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------- |
| State               | none                                                    | none                                                                                                     | n/a     |
| ARIA hooks          | none dedicated                                          | none dedicated                                                                                           | n/a     |
| Headless components | `react-aria-components/src/Separator.tsx`               | `packages/solidaria-components/src/Separator.tsx`, `packages/solidaria/src/separator/createSeparator.ts` | matched |
| Styled S2           | `@react-spectrum/s2/src/Divider.tsx`                    | `packages/solid-spectrum/src/divider/index.tsx`, `packages/solid-spectrum/src/s2-generated.css`          | matched |
| Comparison route    | S2 docs/viewer and React fixture mounted from S2 source | `apps/comparison/src/data/divider-demo.ts`, fixtures, controls, matrix, e2e spec                         | matched |

- Public props/defaults:
  - `orientation`: `horizontal` by default; `vertical` renders the vertical
    separator branch.
  - `size`: `M` by default; `S` and `L` map to 1px and 4px thickness branches.
  - `staticColor`: omitted by default; `auto`, `black`, and `white` select S2
    static-color styling over a colored route surface.
  - ARIA label props, DOM props, `slot`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, and `ref` are preserved.
- Contexts/providers:
  - `DividerContext` is exported and consumed through the shared S2 slotted
    context helper.
- Refs/imperative behavior:
  - Ref merging follows the shared S2 context/local ref helper.
- Unsupported or intentionally different branches:
  - Legacy `sm`, `md`, and `lg` size aliases map to `S`, `M`, and `L` for
    backward compatibility.
  - Legacy `variant` remains accepted for source compatibility but is not part
    of the S2 Divider API and does not affect S2 output.

## Source Branch Coverage

| Layer    | Upstream branch                        | Solid owner                 | Class              | Observable                                           | Status  | Evidence                                 |
| -------- | -------------------------------------- | --------------------------- | ------------------ | ---------------------------------------------------- | ------- | ---------------------------------------- |
| Headless | horizontal separator element           | `createSeparator`           | accessibility/DOM  | `<hr role="separator">`, no `aria-orientation`       | matched | unit and e2e contract                    |
| Headless | vertical separator element             | `createSeparator`           | accessibility/DOM  | `<div role="separator" aria-orientation="vertical">` | matched | unit and e2e contract                    |
| Styled   | `DividerContext` merge                 | S2 `Divider`                | context            | context props apply and local props override         | matched | unit tests                               |
| Styled   | `size` S/M/L                           | S2 `Divider` style macro    | visual             | 1px/2px/4px thickness branches match React           | matched | computed-style matrix                    |
| Styled   | `orientation` horizontal/vertical      | S2 `Divider` style macro    | visual/semantics   | width/height and element semantics match React       | matched | computed-style matrix                    |
| Styled   | `staticColor` omitted/auto/black/white | S2 `Divider` style macro    | visual/environment | overlay color branches match React                   | matched | route controls and computed-style matrix |
| Styled   | forced-colors background               | S2 `Divider` style macro    | visual/a11y        | `ButtonBorder` branch matches React                  | matched | forced-colors e2e                        |
| Styled   | `styles` and unsafe props              | S2 `Divider`                | API                | classes and inline styles merge with context         | matched | unit tests                               |
| Harness  | optional-prop omitted sentinel         | route controls/data helpers | route integrity    | visible `default` label, no blank option leak        | matched | e2e route-control test                   |

## Transition Plan

- Static states:
  - default horizontal `M`;
  - horizontal S/M/L;
  - vertical M/L;
  - static-color white/black/auto;
  - forced-colors active.
- Interaction timelines:
  - not applicable. Divider has no press, hover, focus, keyboard, or value
    transition semantics.
- Overlay/loading/async timelines:
  - not applicable.
- Cleanup assertions:
  - not applicable. Divider owns no timers, portals, observers, subscriptions,
    or global event listeners.
- Visual-state rows changed:
  - added strict default state plus asserted control, source-branch, and
    forced-colors rows for Divider.

## Runtime Semantics

- Native element/role decision:
  - horizontal renders an `hr` with explicit `role="separator"` to match RAC.
  - vertical renders a `div` with `role="separator"` and
    `aria-orientation="vertical"`.
- Accessible name/description assertions:
  - ARIA label props pass through the headless separator API; unit tests query
    named separators through `aria-label`.
- ID stability and collision checks:
  - no generated IDs.
- Modality rows:
  - not applicable.
- Event pipeline and consumer handler assertions:
  - DOM event props remain available through the headless separator API, but the
    component has no owned interaction behavior.
- Solid idiom regression assertions:
  - context values remain reactive through merged props; local props override
    context props.
- Announcements:
  - not applicable.
- Portal/provider/global cleanup:
  - not applicable.
- SSR/hydration note:
  - static markup only; no generated IDs or client lifecycle side effects.

## Evidence

```bash
vp test run packages/solidaria-components/test/Separator.test.tsx packages/solid-spectrum/test/Divider.test.tsx
vp run --filter @proyecto-viviana/solidaria build
vp run --filter @proyecto-viviana/solidaria-components build
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/divider-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-export-gap
vp run guard:rac-parity
vp run check
```

Results:

- Solidaria Components Separator + Solid Spectrum Divider tests: `22 passed`.
- Solidaria build: passed.
- Solidaria Components build: passed.
- Solid Spectrum build: passed.
- Comparison build: passed and generated `/components/divider/`.
- Divider Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `172`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards still report no missing Solid names.
- Full repo check: passed.

## Handoff

- Divider is playbook-accepted for owned behavior.
- No in-scope Divider gates remain open.
- The next styled pass should be selected from `vp run comparison:report:gaps`.
