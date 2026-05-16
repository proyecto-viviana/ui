# ActionBar Validation Notes

## Target

- Component: ActionBar
- Slug: actionbar
- Family or direct subcomponents: ActionBarContext, ActionButtonGroup,
  ActionButton, CloseButton, collection `renderActionBar` integration
- Pass goal: bring ActionBar from a tracked catalogue gap to S2 styled parity
  with route controls, collection-selected state wiring, clear-selection
  behavior, emphasis styling, scroll container positioning, focus restore,
  localized labels, forced-colors coverage, and strict visual evidence.
- Date: 2026-05-16

## Task Status

| Task                   | Status      | Evidence                                                                                                        | Blocker or next action                                                                      |
| ---------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0 Research             | done        | S2 docs MCP, installed `@react-spectrum/s2@1.3.0` source, local Solid source/tests, current comparison reports  | None                                                                                        |
| 1 Baseline             | done        | `comparison:report:gaps`, `comparison:report:exports`, focused ActionBar package tests                          | None                                                                                        |
| 2 Route harness        | done        | `actionbar-demo.ts`, React/Solid styled fixtures, component controls, manifest entry, `actionbar-contract.spec` | None                                                                                        |
| 3 Source map/API       | done        | Optional count/clear handler, `ActionBarContext`, `scrollRef`, `styles`, unsafe props, and root refs covered    | None                                                                                        |
| 4 Cross-layer audit    | in progress | Upstream/solid source branch table below                                                                        | Fill as implementation branches land                                                        |
| 5 Transitions          | not started | S2 source uses enter/exit animation when `scrollRef` is present and keeps last selected count during exit       | Add browser transition tests with reduced-motion handling                                   |
| 6 State                | not started | S2 `useActionBarContainer` owns selected-key derivation for collections                                         | Decide whether Solid needs a companion container hook or route-level collection adapter     |
| 7 ARIA hooks           | partial     | Solidaria ActionBar uses toolbar semantics and Escape clearing                                                  | Add focus restore, localized labels, action group labeling, and axe coverage                |
| 8 Headless             | partial     | Solidaria tests cover visibility, Escape, navigation, count text, optional clear, refs, and DOM pass-through    | Add render-prop liveness and a11y smoke                                                     |
| 9 Styled S2            | not started | Solid Spectrum ActionBar currently uses bespoke `vui-action-bar` utility classes rather than S2 source geometry | Port S2 structure/styles and child contexts                                                 |
| 10 Runtime lifecycle   | not started | Upstream measures scrollbar width, observes `scrollRef`, announces actions, restores focus, and animates exit   | Add cleanup/observer/lifecycle proofs                                                       |
| 11 Harness integrity   | in progress | Current reports list ActionBar as live on both sides with planned visual coverage                               | Add strict pair-diff rows only after S2 styling/API parity lands                            |
| 12 Comparison evidence | partial     | `actionbar-contract.spec` covers route mount, controls, zero state, clear, and child actions                    | Add Escape, keyboard navigation, visual, forced-colors, scrollRef, and reduced-motion specs |
| 13 Acceptance          | not started | Not accepted                                                                                                    | Complete parity checklist and commit each slice                                             |

## Source Packet

| Source                   | Files or docs                                                  | Finding                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `ActionBar` page                                               | ActionBar is a bulk-action surface used from collection `renderActionBar` examples for TableView, ListView, and TreeView.                                                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/ActionBar.tsx`, `exports/ActionBar.ts` | Root exports `ActionBar`, `ActionBarContext`, `ActionButton`, and `Text`; source includes emphasis, scrollRef positioning, ActionButtonGroup, CloseButton, and animation. |
| Solid source before pass | `packages/solidaria-components/src/ActionBar.tsx`              | Headless layer has toolbar semantics, count text, clear button, render-prop class/style, Escape clear, and live announcement.                                             |
| Solid styled before pass | `packages/solid-spectrum/src/actionbar/index.tsx`              | Styled layer wraps the headless component with local utility classes and does not yet match the S2 root structure, props, context, or exported subpath surface.           |
| Comparison harness       | manifest, fixtures, visual matrix, reports                     | Catalogue entry exists, but no live React/Solid route, no controls, no visual states, and no ActionBar-specific e2e spec are wired.                                       |

## Official Docs And Viewer Parity

| Docs item           | Official setting/example                                        | Current Solid/route status                                        | Required proof                                    |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| `children`          | `ActionButton` children inside the bar                          | Solid renders arbitrary children inside a wrapper                 | ActionButtonGroup child semantics and visual diff |
| `selectedItemCount` | number, `"all"`, hidden at `0`; optional API default            | optional in Solid; hides at `0`; package tests cover default      | last-count exit behavior                          |
| `onClearSelection`  | optional clear handler                                          | optional in Solid; click/Escape no-op safely when omitted         | lifecycle/interaction browser coverage            |
| `isEmphasized`      | emphasized neutral container and staticColor auto children      | route control and Solid class flag added; S2 visuals missing      | computed style, visual, forced-colors matrix      |
| `scrollRef`         | absolute container positioning and scrollbar-width compensation | prop accepted; basic container class and inset compensation added | browser geometry and resize assertion             |
| `slot`              | named or null slot via Spectrum context                         | styled context and local override covered                         | broader slot matrix                               |
| `styles`            | S2 style macro overrides                                        | merged into root class; package test covers pass-through          | allowed override matrix                           |
| unsafe props        | `UNSAFE_className`, `UNSAFE_style`                              | merged into root; package test covers class/style                 | visual/forced-colors proof                        |
| `ref`               | DOMRef to root                                                  | headless and styled root refs covered                             | lifecycle/focus restore proof                     |
| Collection examples | TableView/ListView/TreeView `renderActionBar`                   | no comparison route integration                                   | route fixture with selected keys and clear action |

## Baseline

- Current reports after the accepted Accordion pass:
  - Official entries in comparison app: `69`.
  - Official styled entries live on both sides: `34`.
  - Official entries still missing/gap: `35`.
  - Official visual states tracked: `190`.
  - Official visual states with current React/Solid visual evidence: `51`.
  - Official visual states with strict pair-diff tests: `35`.
  - Official visual states blocked by missing implementations: `34`.
- `comparison:report:gaps` lists `ActionBar` as:
  - `react=tracked`;
  - `solid=missing`;
  - default visual state `blocked`.
- `comparison:report:exports` lists:
  - root catalogue export gap: `0`;
  - missing non-root/support S2 exports: `76`;
  - `ActionBarContext` is still missing from Solid Spectrum public exports.
- Focused baseline package tests pass:
  - `vp test run packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx`
  - `2` files, `32` tests.

## Current After Route Harness

- Current reports after wiring the ActionBar route:
  - Official entries in comparison app: `69`.
  - Official styled entries live on both sides: `35`.
  - Official entries still missing/gap: `34`.
  - Official visual states tracked: `190`.
  - Official visual states with current React/Solid visual evidence: `51`.
  - Official visual states with strict pair-diff tests: `35`.
  - Official visual states blocked by missing implementations: `33`.
- `comparison:report:gaps` now lists `ActionBar: Styled default (planned)`
  under incomplete visual/pair-diff coverage rather than blocked missing
  implementation.
- `comparison:report:exports` is unchanged for ActionBar public support exports:
  - root catalogue export gap: `0`;
  - missing non-root/support S2 exports: `76`;
  - `ActionBarContext` is still missing from Solid Spectrum public exports.
- Route-harness proof:
  - `COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionbar-contract.spec.ts --reporter=line`
  - `4` browser tests passed.

## Current After API Slice

- Catalogue report is unchanged from the route harness:
  - Official styled entries live on both sides: `35`.
  - Official entries still missing/gap: `34`.
  - Official visual states blocked by missing implementations: `33`.
- Export report improved:
  - solid-spectrum public value exports: `138`.
  - missing React S2 value exports: `75`.
  - missing non-root/support S2 exports: `75`.
  - `ActionBarContext` is no longer listed as missing.
- Package proof:
  - `vp test run packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx`
  - `2` files, `40` tests passed.
- Route proof remains green after the API change:
  - `COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionbar-contract.spec.ts --reporter=line`
  - `4` browser tests passed.

## Source Map And Public Contract

| Layer               | Upstream files/owner                                             | Solid files/owner                                 | Current status |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | -------------- |
| State               | S2 `useActionBarContainer` plus collection selected-key state    | no Solid equivalent yet                           | gap            |
| ARIA hooks          | `useKeyboard`, `FocusScope`, live announcer                      | Solidaria `createToolbar`, `announce`             | partial        |
| Headless components | no RAC ActionBar primitive; S2 component owns composition        | `packages/solidaria-components/src/ActionBar.tsx` | partial        |
| Styled S2           | `ActionBar.tsx`, `ActionButtonGroup`, `CloseButton`, style macro | `packages/solid-spectrum/src/actionbar/index.tsx` | gap            |
| Public package API  | `ActionBar`, `ActionBarContext`, subpath `ActionButton`, `Text`  | root `ActionBar` and `ActionBarContext` exported  | partial        |
| Comparison route    | docs examples and React S2 fixture                               | direct ActionBar route fixture with controls      | partial        |

## Source Branch Coverage

| Layer    | Upstream branch                        | Solid owner       | Observable                                            | Status  | Evidence      |
| -------- | -------------------------------------- | ----------------- | ----------------------------------------------------- | ------- | ------------- |
| Headless | hidden when `selectedItemCount === 0`  | Solidaria         | no toolbar in DOM                                     | covered | package tests |
| Headless | count text for number and `"all"`      | Solidaria         | selected count label                                  | covered | package tests |
| Headless | Escape clears selection                | Solidaria         | `onClearSelection` called                             | covered | package tests |
| Headless | toolbar arrow/Home/End navigation      | Solidaria toolbar | focus movement across action buttons                  | covered | package tests |
| Headless | optional clear handler                 | Solidaria         | no throw when omitted                                 | covered | package tests |
| Headless | refs and DOM pass-through              | Solidaria         | consumer root ref and safe DOM attrs                  | covered | package tests |
| Styled   | context consumption and root ref merge | Solid Spectrum    | context-provided props/ref apply                      | covered | package tests |
| Styled   | emphasized root                        | Solid Spectrum    | class flag applies; neutral/staticColor missing       | partial | package tests |
| Styled   | CloseButton child                      | Solid Spectrum    | S2 close button geometry and localized label          | gap     | none          |
| Styled   | ActionButtonGroup child wrapper        | Solid Spectrum    | quiet group, action label, staticColor propagation    | gap     | none          |
| Styled   | scroll container mode                  | Solid Spectrum    | prop accepted with basic positioning/inset style      | partial | type/build    |
| Styled   | enter/exit animation                   | Solid Spectrum    | translateY transition and last-count retained on exit | gap     | none          |
| Harness  | direct route controls                  | comparison app    | selected count, `"all"`, zero state, emphasized prop  | covered | browser spec  |
| Harness  | clear and child action behavior        | comparison app    | clear hides the bar; child ActionButton increments    | covered | browser spec  |
| Harness  | docs-style collection integration      | comparison app    | selected rows drive ActionBar and clear selection     | gap     | none          |
| Harness  | strict visual states                   | comparison app    | zero-tolerance React/Solid ActionBar screenshots      | gap     | none          |

## Transition Plan

- Static states:
  - default selected count;
  - single selection;
  - `"all"` selection;
  - emphasized and non-emphasized;
  - disabled child action if S2 child context requires it;
  - explicit style/unsafe class/style overrides;
  - forced-colors active.
- Interaction timelines:
  - clear button press;
  - Escape clear;
  - toolbar arrow/Home/End navigation;
  - child ActionButton press;
  - focus restore after the bar exits.
- Collection timelines:
  - selected-key count from a Table/List/Tree route fixture;
  - clear-selection resets selected keys and hides the bar;
  - scrollRef mode positions the bar over the collection and compensates for
    scrollbar width.
- Lifecycle and cleanup:
  - resize observer attaches only when `scrollRef` is present;
  - enter/exit animation can be made deterministic under reduced motion;
  - announcement fires when actions become available, not on every render.

## Immediate Implementation Order

1. Done: add route data/fixtures/controls for `actionbar` with direct S2 props
   and a deterministic selected-count example.
2. In progress: public API/context/ref/style pass is done; remaining work is S2
   structure, CloseButton, ActionButtonGroup composition, animation, and visual
   parity.
3. Fill remaining headless gaps: render-prop liveness, axe smoke, and lifecycle
   tests.
4. Add comparison e2e specs for route controls, clear/Escape behavior, toolbar
   keyboard behavior, scrollRef geometry, forced-colors, reduced motion, and
   strict pair-diff visual states.
5. Refresh reports and close the ActionBar checklist only when package tests,
   browser evidence, report counts, export report, and full check are green.

## Evidence

```bash
vp run comparison:report:gaps
vp run comparison:report:exports
vp test run packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx
vp test run packages/solidaria-components/test/comparison-solid-h.test.tsx packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx
vp run check:fix
vp run comparison:build
COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionbar-contract.spec.ts --reporter=line
```
