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

| Task                   | Status      | Evidence                                                                                                                        | Blocker or next action                                                                      |
| ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0 Research             | done        | S2 docs MCP, installed `@react-spectrum/s2@1.3.0` source, local Solid source/tests, current comparison reports                  | None                                                                                        |
| 1 Baseline             | done        | `comparison:report:gaps`, `comparison:report:exports`, focused ActionBar package tests                                          | None                                                                                        |
| 2 Route harness        | done        | `actionbar-demo.ts`, React/Solid styled fixtures, component controls, manifest entry, `actionbar-contract.spec`                 | None                                                                                        |
| 3 Source map/API       | done        | Optional count/clear handler, `ActionBarContext`, `scrollRef`, `styles`, unsafe props, and root refs covered                    | None                                                                                        |
| 4 Cross-layer audit    | in progress | Upstream/solid source branch table below                                                                                        | Fill as implementation branches land                                                        |
| 5 Transitions          | partial     | Solid styled layer now keeps last selected count during `scrollRef` exit and holds the bar for the S2 200ms window              | Add browser transition tests with reduced-motion handling                                   |
| 6 State                | not started | S2 `useActionBarContainer` owns selected-key derivation for collections                                                         | Decide whether Solid needs a companion container hook or route-level collection adapter     |
| 7 ARIA hooks           | partial     | Solidaria ActionBar uses toolbar semantics, Escape clearing, axe smoke, and ARIA ID checks; styled layer localizes labels       | Add focus restore and localized live announcement proof                                     |
| 8 Headless             | done        | Solidaria tests cover visibility, Escape, navigation, count text, optional clear, refs, DOM pass-through, render props, and axe | None                                                                                        |
| 9 Styled S2            | partial     | S2 macro root geometry, wrapper order, close button, ActionButtonGroup, staticColor propagation, and generated CSS are wired    | Add visual, forced-colors, and strict pair-diff proof                                       |
| 10 Runtime lifecycle   | partial     | Styled layer measures scrollbar width, observes `scrollRef`, and cleans up enter/exit timers                                    | Add focus restore, live announcement, and browser lifecycle proofs                          |
| 11 Harness integrity   | in progress | Current reports list ActionBar as live on both sides with planned visual coverage                                               | Add strict pair-diff rows only after S2 styling/API parity lands                            |
| 12 Comparison evidence | partial     | `actionbar-contract.spec` covers route mount, controls, zero state, clear, and child actions                                    | Add Escape, keyboard navigation, visual, forced-colors, scrollRef, and reduced-motion specs |
| 13 Acceptance          | not started | Not accepted                                                                                                                    | Complete parity checklist and commit each slice                                             |

## Source Packet

| Source                   | Files or docs                                                  | Finding                                                                                                                                                                   |
| ------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `ActionBar` page                                               | ActionBar is a bulk-action surface used from collection `renderActionBar` examples for TableView, ListView, and TreeView.                                                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/ActionBar.tsx`, `exports/ActionBar.ts` | Root exports `ActionBar`, `ActionBarContext`, `ActionButton`, and `Text`; source includes emphasis, scrollRef positioning, ActionButtonGroup, CloseButton, and animation. |
| Solid source before pass | `packages/solidaria-components/src/ActionBar.tsx`              | Headless layer has toolbar semantics, count text, clear button, render-prop class/style, Escape clear, and live announcement.                                             |
| Solid styled before pass | `packages/solid-spectrum/src/actionbar/index.tsx`              | Styled layer wraps the headless component with local utility classes and does not yet match the S2 root structure, props, context, or exported subpath surface.           |
| Comparison harness       | manifest, fixtures, visual matrix, reports                     | Catalogue entry exists, but no live React/Solid route, no controls, no visual states, and no ActionBar-specific e2e spec are wired.                                       |

## Official Docs And Viewer Parity

| Docs item           | Official setting/example                                        | Current Solid/route status                                                                             | Required proof                                    |
| ------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| `children`          | `ActionButton` children inside the bar                          | Solid wraps children in a quiet `ActionButtonGroup`; package tests cover label and child quiet mode    | visual diff                                       |
| `selectedItemCount` | number, `"all"`, hidden at `0`; optional API default            | optional in Solid; hides at `0`; package tests cover default and scrollRef last-count exit             | browser transition proof                          |
| `onClearSelection`  | optional clear handler                                          | optional in Solid; click/Escape no-op safely when omitted                                              | lifecycle/interaction browser coverage            |
| `isEmphasized`      | emphasized neutral container and staticColor auto children      | root S2 emphasized styles and child `staticColor="auto"` are wired                                     | computed style, visual, forced-colors matrix      |
| `scrollRef`         | absolute container positioning and scrollbar-width compensation | prop accepted; S2 absolute positioning, inset compensation, and exit hold are covered in package tests | browser geometry and resize assertion             |
| `slot`              | named or null slot via Spectrum context                         | styled context and local override covered                                                              | broader slot matrix                               |
| `styles`            | S2 style macro overrides                                        | merged into root class; package test covers pass-through                                               | allowed override matrix                           |
| unsafe props        | `UNSAFE_className`, `UNSAFE_style`                              | merged into root; package test covers class/style                                                      | visual/forced-colors proof                        |
| `ref`               | DOMRef to root                                                  | headless and styled root refs covered                                                                  | lifecycle/focus restore proof                     |
| Collection examples | TableView/ListView/TreeView `renderActionBar`                   | no comparison route integration                                                                        | route fixture with selected keys and clear action |

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

## Current After S2 Structure Slice

- Styled S2 implementation moved from bespoke utility classes to generated S2
  macro classes for the root container, wrapper order, selection text, close
  button, and ActionButtonGroup composition.
- The CSS generator now imports `packages/solid-spectrum/src/actionbar` so
  ActionBar's `style()` macro output is included in `s2-generated.css`.
- Package proof:
  - `vp test run packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx`
  - `2` files, `43` tests passed.
- Repo/build proof:
  - `vp run check`
  - `vp run comparison:build`
  - comparison build produced `70` static pages including
    `/components/actionbar/index.html`.
- Route proof remains green after S2 styling:
  - `COMPARISON_PORT=4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionbar-contract.spec.ts --reporter=line`
  - `4` browser tests passed.
- Current reports:
  - Official styled entries live on both sides: `35`.
  - Official entries still missing/gap: `34`.
  - Official visual states with strict pair-diff tests: `35`.
  - Official visual states blocked by missing implementations: `33`.
  - solid-spectrum public value exports: `138`.
  - missing React S2 value exports: `75`.
  - missing non-root/support S2 exports: `75`.

## Current After Headless Slice

- Headless ActionBar coverage now includes reactive render-prop class/style
  updates across selected-count changes.
- Accessibility smoke now covers the selected toolbar, selection count, clear
  button, action children, and `aria-labelledby` reference integrity.
- Package proof:
  - `vp test run packages/solidaria-components/test/ActionBar.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx`
  - `2` files, `46` tests passed.

## Source Map And Public Contract

| Layer               | Upstream files/owner                                             | Solid files/owner                                 | Current status |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------- | -------------- |
| State               | S2 `useActionBarContainer` plus collection selected-key state    | no Solid equivalent yet                           | gap            |
| ARIA hooks          | `useKeyboard`, `FocusScope`, live announcer                      | Solidaria `createToolbar`, `announce`             | partial        |
| Headless components | no RAC ActionBar primitive; S2 component owns composition        | `packages/solidaria-components/src/ActionBar.tsx` | partial        |
| Styled S2           | `ActionBar.tsx`, `ActionButtonGroup`, `CloseButton`, style macro | `packages/solid-spectrum/src/actionbar/index.tsx` | partial        |
| Public package API  | `ActionBar`, `ActionBarContext`, subpath `ActionButton`, `Text`  | root `ActionBar` and `ActionBarContext` exported  | partial        |
| Comparison route    | docs examples and React S2 fixture                               | direct ActionBar route fixture with controls      | partial        |

## Source Branch Coverage

| Layer    | Upstream branch                        | Solid owner       | Observable                                             | Status  | Evidence      |
| -------- | -------------------------------------- | ----------------- | ------------------------------------------------------ | ------- | ------------- |
| Headless | hidden when `selectedItemCount === 0`  | Solidaria         | no toolbar in DOM                                      | covered | package tests |
| Headless | count text for number and `"all"`      | Solidaria         | selected count label                                   | covered | package tests |
| Headless | Escape clears selection                | Solidaria         | `onClearSelection` called                              | covered | package tests |
| Headless | toolbar arrow/Home/End navigation      | Solidaria toolbar | focus movement across action buttons                   | covered | package tests |
| Headless | optional clear handler                 | Solidaria         | no throw when omitted                                  | covered | package tests |
| Headless | refs and DOM pass-through              | Solidaria         | consumer root ref and safe DOM attrs                   | covered | package tests |
| Headless | render-prop liveness                   | Solidaria         | class/style update as selected count changes           | covered | package tests |
| Headless | a11y smoke and ARIA ID integrity       | Solidaria         | no axe violations or dangling ARIA references          | covered | package tests |
| Styled   | context consumption and root ref merge | Solid Spectrum    | context-provided props/ref apply                       | covered | package tests |
| Styled   | emphasized root                        | Solid Spectrum    | S2 emphasized root classes and child staticColor apply | partial | package tests |
| Styled   | CloseButton child                      | Solid Spectrum    | S2 close button geometry and localized label           | partial | package tests |
| Styled   | ActionButtonGroup child wrapper        | Solid Spectrum    | quiet group, action label, staticColor propagation     | covered | package tests |
| Styled   | scroll container mode                  | Solid Spectrum    | S2 positioning and scrollbar inset compensation        | partial | package tests |
| Styled   | enter/exit animation                   | Solid Spectrum    | translateY classes and last-count retained on exit     | partial | package tests |
| Harness  | direct route controls                  | comparison app    | selected count, `"all"`, zero state, emphasized prop   | covered | browser spec  |
| Harness  | clear and child action behavior        | comparison app    | clear hides the bar; child ActionButton increments     | covered | browser spec  |
| Harness  | docs-style collection integration      | comparison app    | selected rows drive ActionBar and clear selection      | gap     | none          |
| Harness  | strict visual states                   | comparison app    | zero-tolerance React/Solid ActionBar screenshots       | gap     | none          |

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
2. Done: public API/context/ref/style pass and the first S2 structure slice are
   landed; remaining styled work is browser visual parity, forced-colors, and
   reduced-motion transition proof.
3. Done: filled remaining headless gaps for render-prop liveness, axe smoke,
   and ARIA reference integrity.
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
