# ActionMenu Validation Notes

## Target

- Component: ActionMenu
- Slug: actionmenu
- Family or direct subcomponents: ActionMenuContext, ActionButton, MenuTrigger,
  Menu, MenuItem, MenuSection, SubmenuTrigger, UnavailableMenuItemTrigger,
  ContextualHelpPopover, Text, Keyboard, Header, Heading, Collection
- Pass goal: bring ActionMenu from a tracked catalogue gap to S2 styled parity
  with the official compositional API, menu overlay behavior, default localized
  more-actions label, trigger sizing and quiet styling, menu sizing,
  controlled/uncontrolled open state, disabled keys, close-on-select behavior,
  S2 subpath exports, route controls, browser contracts, and visual evidence.
- Date: 2026-05-16

## Task Status

| Task                   | Status  | Evidence                                                                                                                                                                                                                                                                                    | Blocker or next action                             |
| ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 0 Research             | done    | Live official docs page checked on 2026-05-16, S2 docs MCP, installed `@react-spectrum/s2@1.3.0` source, existing Solid ActionMenu/Menu source, current comparison reports                                                                                                                  | Continue with Menu source branch ledger            |
| 1 Baseline             | done    | `vp run comparison:report:gaps`, `vp run comparison:report:exports`, `vp run guard:rac-export-gap`                                                                                                                                                                                          | None                                               |
| 2 Route harness        | done    | `actionmenu-demo.ts`, component controls, manifest entry, React/Solid styled fixtures, visual matrix route-control entry, `actionmenu-contract.spec.ts`                                                                                                                                     | None                                               |
| 3 Source map/API       | partial | Root/menu barrel `ActionMenuContext` export added; trigger props/default label/ref/context/style pass-through covered by package tests                                                                                                                                                      | Complete upstream branch ledger and subpaths       |
| 4 Cross-layer audit    | partial | ActionMenu tests exposed and fixed lower-layer MenuTrigger ARIA prop reactivity; menu surface labelling added                                                                                                                                                                               | Complete visual/style and placement audit          |
| 5 Transitions          | partial | Browser contract covers open, Escape close, outside pointer close, menu removal, open-change state, and focus restore                                                                                                                                                                       | Add visual transition evidence if needed           |
| 6 State                | partial | Package tests cover fallback actions, render-function and static JSX items, `shouldCloseOnSelect={false}`, controlled open, disabled keys, keyboard open/close, outside close, focus return, placement axes, touch activation, virtual activation, and disabled touch suppression           | Blur-specific lifecycle audit                      |
| 7 ARIA hooks           | partial | Tests cover role/name, `aria-haspopup`, reactive `aria-expanded`, `aria-controls`, menu labels, disabled item semantics, keyboard focus, Escape, forced colors, reduced motion, scoped axe, and manual semantic assertions                                                                  | Target-size/contrast-sensitive state audit         |
| 8 Headless             | partial | Focused Solid package coverage added in `packages/solid-spectrum/test/ActionMenu.test.tsx`                                                                                                                                                                                                  | Lower-layer fixes only if later gaps require       |
| 9 Styled S2            | partial | Trigger now uses S2 ActionButton styling, generated More icon, and pressScale motion; open menu uses generated S2 menu/item styling with trigger/open-menu/interaction/forced-colors visual evidence plus placement and reduced-motion parity                                               | Remaining source branch ledger                     |
| 10 Runtime lifecycle   | partial | `actionmenu-contract.spec.ts` covers mount, controls, actions, keyboard menu-button state, Escape/outside cleanup, and focus restore; `actionmenu-visual.spec.ts` covers closed trigger, trigger interactions, open menu, and placement axes                                                | Add remaining transient lifecycle coverage         |
| 11 Harness integrity   | done    | Current reports list ActionMenu live on both sides; default visual state moved from `blocked` to `planned`                                                                                                                                                                                  | None                                               |
| 12 Comparison evidence | partial | Browser route contract covers mount, controls, disabled trigger, action callback keys, keyboard/outside/touch/virtual ARIA behavior, scoped axe/manual semantics, plus default trigger, trigger interaction, open-menu, placement, forced-colors, and reduced-motion visual/computed parity | Add target-size/contrast evidence                  |
| 13 Acceptance          | partial | Focused package tests, route contract, visual spec, reports, comparison build, and repo check pass for the current ActionMenu slices                                                                                                                                                        | Target-size/contrast and source ledger gaps remain |

## Agent Workflow

No subagents are assigned for the initial ActionMenu slice. Keep work local
unless a later route, source, or test subtask is explicitly split.

| Task               | Agent role  | Context pack                                            | Docs/skills/tools                       | Allowed writes | Required output                       | Status  |
| ------------------ | ----------- | ------------------------------------------------------- | --------------------------------------- | -------------- | ------------------------------------- | ------- |
| Checklist/baseline | local Codex | S2 docs/source, Solid source, comparison reports        | React Spectrum S2 skill, local commands | Playbook notes | Baseline note and committed checklist | done    |
| Route harness      | local Codex | This note, manifest/control/fixture patterns            | Playwright after implementation         | comparison app | Live React/Solid ActionMenu route     | done    |
| API/styled port    | local Codex | Upstream ActionMenu/Menu/ActionButton source branch map | package tests, generated S2 CSS         | packages       | Public API and styled parity          | partial |

| Agent role  | Files read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Files changed | Evidence added                              | Commands run                                                                  | Blockers | Next owner  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ----------- |
| local Codex | `apps/comparison/playbook/component-validation-notes-template.md`, `apps/comparison/playbook/components/actionbar-validation-notes.md`, `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/ActionMenu.tsx`, `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/ActionMenu.ts` | This note     | Baseline reports and upstream/source packet | `comparison:report:gaps`, `comparison:report:exports`, `guard:rac-export-gap` | None     | local Codex |

## Acceptance Gate Checklist

These gates are additive. ActionMenu is not accepted until every in-scope item
below is checked with direct evidence.

## Gate Outcome Summary

| Gate                                     | Outcome     | Evidence                                                                                                                                                                                                                                                   | Blockers/owner                             |
| ---------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Official Docs And Viewer Parity          | in-progress | Live docs page and S2 MCP page identify examples, controls, and API props                                                                                                                                                                                  | Need route/control parity                  |
| External Authority And Standards         | done        | W3C APG menu-button/menu patterns and React Aria Menu trigger docs checked                                                                                                                                                                                 | None for this slice                        |
| Upstream React Source Parity             | in-progress | Upstream `src/ActionMenu.tsx` and `exports/ActionMenu.ts` identified                                                                                                                                                                                       | Need full Menu/ActionButton branch map     |
| Solid Idiomatic Implementation           | not-started |                                                                                                                                                                                                                                                            | Port without reactive snapshots            |
| Accessibility And I18n                   | in-progress | Labeling, reactive ARIA state, disabled items, keyboard focus, Escape, focus restore, default locale, forced-colors, reduced-motion media environments, scoped axe, and manual semantics covered                                                           | Need target-size/contrast audit            |
| Behavior State Machine                   | in-progress | Controlled open, action callback, close-on-select, disabled keys, keyboard open/close, outside pointer close, touch activation, virtual activation, disabled touch suppression, focus cleanup, and placement axes pass                                     | Need blur-specific lifecycle audit         |
| Style Source-To-Computed Parity          | in-progress | Closed trigger, trigger hover/focus/pressed states, open menu, forced-colors, and reduced-motion states use generated S2 style helpers/CSS with pair diff and computed parity across covered axes                                                          | Need remaining source branch ledger        |
| React-Vs-Solid Comparison Harness Parity | in-progress | Route is live on both stacks; `actionmenu-contract.spec.ts` and `actionmenu-visual.spec.ts` pass for current trigger interaction, open-menu, placement, forced-colors, reduced-motion, scoped axe, manual semantic, touch, and virtual activation coverage | Need target-size/contrast evidence         |
| Evidence And Handoff                     | partial     | Slice tests/reports/build/check recorded, including strict trigger visual evidence                                                                                                                                                                         | Remaining menu/overlay gaps listed by gate |

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated:
      2026-05-16, `https://react-spectrum.adobe.com/ActionMenu`
- [x] Primary docs example recorded:
      compositional `ActionMenu` with `MenuItem`, icons, `Text` label and
      description slots, and `Keyboard` shortcuts
- [x] Viewer controls inventoried:
      `size`, `align`, `direction`, `menuSize`, `isQuiet`, `isDisabled`
- [x] Public placement API axis added to route controls:
      `shouldFlip`
- [ ] Defaults, reset behavior, and omitted-prop behavior proven in route tests
- [x] Comparison route default matches official example or records deviations:
      React uses the official compositional item example; Solid now uses the
      public ActionMenu API with the localized default more-actions label and
      shared route controls
- [x] Side-panel controls match official viewer controls, public placement
      axis, and selection semantics:
      `size`, `align`, `direction`, `menuSize`, `shouldFlip`, `isQuiet`,
      `isDisabled`
- [x] Route tests assert visible defaults/options and mounted DOM changes:
      `e2e/actionmenu-contract.spec.ts`

### 2. External Authority And Standards

- [x] React Aria/S2 Menu docs and testing docs checked
- [x] W3C/APG menu button/menu guidance checked where relevant
- [x] Forced-colors and reduced-motion obligations mapped where relevant
- [ ] WCAG target size obligations mapped where relevant
- [x] Source disagreements recorded with chosen authority:
      React S2 emits `aria-haspopup="true"` while Solid emits
      `aria-haspopup="menu"`; APG allows both, so the browser contract accepts
      either value and keeps the rest of the state contract strict
- [x] External obligations mapped to route/source/behavior/a11y/style rows for
      the behavior/a11y slice

### 3. Upstream React Source Parity

- [x] Upstream ActionMenu files identified:
      `@react-spectrum/s2/src/ActionMenu.tsx`,
      `@react-spectrum/s2/exports/ActionMenu.ts`
- [x] Initial Solid owner files identified:
      `packages/solid-spectrum/src/menu/ActionMenu.tsx`,
      `packages/solid-spectrum/src/menu/index.tsx`,
      `packages/solidaria-components/src/Menu.tsx`,
      `packages/solidaria/src/menu/createMenuTrigger.ts`
- [ ] Upstream Menu, ActionButton, Content, context, and generated style owners
      identified
- [x] Public props/defaults/contexts/refs/root exports mapped for the current
      slice
- [ ] Slots/subpath exports and full source branch ledger mapped
- [ ] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped
- [ ] Source branch ledger covers every user-observable upstream branch
- [ ] Remaining gaps have owners and are not counted as accepted

### 4. Solid Idiomatic Implementation

- [ ] Dynamic props, context values, and derived values remain reactive
- [ ] No prop destructuring/spread snapshots live Solid accessors
- [ ] Children remain lazy across provider/context boundaries
- [ ] Render props/custom roots receive live state where applicable
- [ ] Refs use Solid semantics
- [ ] Effects, observers, timers, listeners, and subscriptions have cleanup
- [ ] Tests cover relevant reactive update risks

### 5. Accessibility And I18n

- [x] Trigger native element, role, accessible name, and `aria-haspopup`
- [x] Menu/menuitem roles, IDs, ownership, and ordering for the current
      ActionMenu route
- [x] Keyboard model, focus order, focus return, and Escape behavior for
      menu-button open/close
- [x] Disabled trigger and disabled item semantics
- [x] Default localized more-actions label
- [x] Explicit ARIA labeling behavior
- [x] Focus-visible trigger styling parity
- [x] Forced colors and reduced motion
- [x] Scoped browser axe smoke plus manual semantic assertions
- [ ] Contrast-sensitive states and target size

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed for the behavior/a11y slice
- [x] Pointer, keyboard, touch/virtual click, Escape, outside press, and
      disabled suppression
- [ ] Blur-specific lifecycle audit if later branch mapping identifies a gap
- [x] Controlled/uncontrolled open state, defaultOpen, and onOpenChange payloads
- [x] Item action, disabledKeys, and shouldCloseOnSelect behavior
- [x] Overlay placement and flip behavior
- [ ] Overlay focus, portal, and cleanup behavior
- [ ] Before/trigger/immediate/transient/settled/cleanup transition evidence

### 7. Style Source-To-Computed Parity

- [ ] Upstream S2 style declarations and owner branches identified
- [ ] Solid style/token path uses S2-compatible generated classes
- [ ] Comparison app CSS does not patch component behavior/style/geometry
- [x] Button size, quiet state, menu size, align, direction, shouldFlip,
      disabled, focus, hover, and pressed axes mapped for current trigger/menu
      coverage
- [x] Forced-colors and reduced-motion axes mapped
- [ ] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches
- [ ] Visual deviations classified

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official composition
- [x] Solid fixture imports package public API
- [x] Both fixtures receive the same props and environment settings
- [x] Focused route tests prove controls update mounted React and Solid DOM
- [ ] Computed style, a11y, geometry, runtime, and pair-diff evidence cover
      every rendering-affecting branch
- [x] Closed default trigger pair diff and computed trigger axes are covered by
      `e2e/actionmenu-visual.spec.ts`
- [x] Open menu pair diff and computed menu/item slot geometry are covered by
      `e2e/actionmenu-visual.spec.ts`
- [x] Placement-axis geometry is covered by `e2e/actionmenu-visual.spec.ts`
- [x] Trigger hover, focus-visible, and pressed visual states are covered by
      `e2e/actionmenu-visual.spec.ts`
- [x] Forced-colors and reduced-motion media environments are covered by
      `e2e/actionmenu-visual.spec.ts`
- [x] Scoped axe and manual semantic accessibility evidence is covered by
      `e2e/actionmenu-contract.spec.ts`
- [x] Touch and virtual activation lifecycle evidence is covered by
      `e2e/actionmenu-contract.spec.ts`
- [x] Harness stability is proven:
      `vp run comparison:build`,
      `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts e2e/actionmenu-visual.spec.ts --reporter=line`

### 9. Evidence And Handoff

- [x] Focused package tests:
      `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`,
      `123` tests passed
- [x] Focused Playwright/runtime tests:
      `e2e/actionmenu-contract.spec.ts`, `8` tests passed
- [x] Focused Playwright/visual tests:
      `e2e/actionmenu-visual.spec.ts`, `12` tests passed
- [x] Comparison reports refreshed when status/evidence changed:
      `comparison:report:gaps` (`202` states, `56` visual evidence, `39`
      strict pair-diff states), `comparison:report:exports`
- [x] `vp run comparison:build`:
      `70` pages built, including `/components/actionmenu/index.html`
- [x] `vp run check`:
      pass
- [x] Final status is `partial` for ActionMenu:
      target-size/contrast-sensitive states and source branch ledger remain
      open
- [x] Remaining gaps listed by gate and owner:
      local Codex continues with target-size/contrast-sensitive states and
      source branch ledger evidence

## Research

- React Spectrum S2 docs:
  - Live official page, checked 2026-05-16:
    `https://react-spectrum.adobe.com/ActionMenu`
  - S2 MCP page: `ActionMenu`
- React Spectrum S2 source:
  - `@react-spectrum/s2@1.3.0/src/ActionMenu.tsx`
  - `@react-spectrum/s2@1.3.0/exports/ActionMenu.ts`
- Solid source:
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx`
  - `packages/solid-spectrum/src/menu/index.tsx`
  - `packages/solidaria-components/src/Menu.tsx`
  - `packages/solidaria/src/menu/createMenuTrigger.ts`
  - `packages/solid-stately/src/collections/createMenuState.ts`
- Existing Solid tests:
  - `packages/solid-spectrum/test/regression.test.tsx`
  - `packages/solid-spectrum/test/Menu.test.tsx`
  - `packages/solidaria-components/test/Menu.test.tsx`
  - `packages/solidaria/test/createMenu.test.tsx`
  - `packages/solid-stately/test/collections.test.ts`
- APG/W3C:
  - `https://w3c.github.io/wai-website/ARIA/apg/patterns/menu-button/`
  - `https://www.w3.org/WAI/ARIA/apg/patterns/menubar/`
- WCAG/ARIA-AT/platform sources: pending where forced-colors/reduced-motion
  evidence needs them
- Missing related docs recorded as `none found`: pending

## Official Docs And Viewer Parity

| Docs item       | Official setting/example                                                                                                | Current Solid/route status                                                                                                  | Required proof                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Primary example | `ActionMenu` composed with `MenuItem`, icons, `Text` label/description slots, and `Keyboard` shortcuts                  | Solid supports static JSX and render-function item composition with `MenuItem`, `Text`, and `Keyboard`                      | Route fixture and package tests                      |
| `size`          | ActionButton size options `XS`, `S`, `M`, `L`, `XL`; default `M`                                                        | Solid accepts `size`, defaults to `M`, and applies S2 ActionButton trigger styles/attributes                                | API tests, computed geometry, visual states          |
| `menuSize`      | Menu size options `S`, `M`, `L`, `XL`; default `M`                                                                      | Solid accepts `menuSize` and maps it to generated S2 menu/item classes; default open menu has strict visual/computed parity | API tests, computed item/menu geometry               |
| `align`         | `start` or `end`; default `start`                                                                                       | Solid accepts `align` and exposes it to the comparison DOM; overlay geometry parity remains planned                         | Browser placement contract                           |
| `direction`     | `bottom`, `top`, `left`, `right`, `start`, `end`; default `bottom`                                                      | Solid accepts `direction` and exposes it to the comparison DOM; overlay geometry parity remains planned                     | Browser placement contract                           |
| `isQuiet`       | Quiet ActionButton styling                                                                                              | Solid passes `isQuiet` through the S2 ActionButton trigger style helper                                                     | S2 class/computed/visual parity                      |
| `isDisabled`    | Disabled trigger suppresses open/action                                                                                 | Current Solid passes to the headless menu button                                                                            | Package and browser interaction tests                |
| Open state      | `defaultOpen`, controlled `isOpen`, and `onOpenChange`                                                                  | Solid exposes these props through the headless MenuTrigger path                                                             | Controlled/uncontrolled package tests                |
| Collection      | Static children or dynamic `items`; `disabledKeys`; `onAction`; `shouldCloseOnSelect`                                   | Solid supports static JSX children, data-driven items, and render-function `items`                                          | Package and route tests                              |
| Styling         | `styles`, `UNSAFE_className`, `UNSAFE_style` target the trigger ActionButton                                            | Solid forwards context/local trigger styles and unsafe class/style                                                          | S2 generated CSS, style passthrough, computed parity |
| Labeling/i18n   | Labelable DOM props; missing `aria-label` defaults to localized more-actions message                                    | Solid uses localized default label and supports explicit label/ARIA props                                                   | Locale/default-label and explicit-label tests        |
| Ref/context     | `ActionMenuContext`, focusable ref to trigger button                                                                    | Solid exports `ActionMenuContext` from root and menu barrel; ref targets trigger button                                     | Export tests, ref tests, context override tests      |
| Subpath exports | `ActionMenu`, `ActionMenuContext`, Menu subcomponents, `Collection`, `ContextualHelpPopover`, content primitives, `Key` | Current Solid root exports exist for some values, but S2 ActionMenu subpath parity is not implemented                       | Export report and TypeScript/API tests               |

## Baseline

- `comparison:report:gaps`:
  - Official S2 catalogue entries: `69`
  - Official entries in comparison app: `69`
  - Official styled entries live on both sides: `35`
  - Official entries still missing/gap: `34`
  - Official visual states tracked: `194`
  - Official visual states with current React/Solid visual evidence: `52`
  - Official visual states with strict pair-diff tests: `36`
  - Official visual states blocked by missing implementations: `33`
  - ActionMenu is listed as `react=tracked solid=missing`
  - ActionMenu visual state is `Styled default (blocked)`
- `comparison:report:exports`:
  - React Spectrum S2 value exports: `208`
  - solid-spectrum public value exports: `138`
  - missing React S2 value exports: `75`
  - extra solid-spectrum value exports: `5`
  - wildcard exports: `0`
  - missing catalogue root exports: `0`
  - missing non-root/support S2 exports: `75`
  - ActionMenu-specific missing support export: `ActionMenuContext`
- `guard:rac-export-gap`:
  - RAC named exports: `229`
  - solidaria-components named exports: `394`
  - missing in solidaria-components: `0`
- Improvement target:
  - Move ActionMenu from `solid=missing` to live on both stacks.
  - Reduce blocked visual states by at least one.
  - Add strict/default visual evidence for ActionMenu.
  - Remove `ActionMenuContext` from S2 support export gaps if in scope.

## Current After Route Harness

- `comparison:report:gaps`:
  - Official styled entries live on both sides: `36`
  - Official entries still missing/gap: `33`
  - Official visual states tracked: `195`
  - Official visual states with current React/Solid visual evidence: `52`
  - Official visual states with strict pair-diff tests: `36`
  - Official visual states blocked by missing implementations: `32`
  - ActionMenu is no longer listed under missing/gap official entries.
  - ActionMenu visual state is now `Styled default (planned)`.
- `comparison:report:exports` is unchanged for ActionMenu public support
  exports:
  - React Spectrum S2 value exports: `208`
  - solid-spectrum public value exports: `138`
  - missing React S2 value exports: `75`
  - missing non-root/support S2 exports: `75`
  - `ActionMenuContext` remains missing.
- Route-harness proof:
  - `vp run comparison:build`
  - `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionmenu-contract.spec.ts --reporter=line`
  - `3` browser tests passed.
- Known route-harness gaps for the next slices:
  - Solid ActionMenu route uses the current data-driven API, not the official
    S2 compositional children API.
  - Solid does not yet consume `size`, `menuSize`, or `direction`.
  - Visual/computed parity is intentionally still planned, not accepted.

## Current After API/Styled Trigger Slice

- Solid package changes:
  - `ActionMenu` now exposes the S2 trigger-facing API for `size`,
    `menuSize`, `align`, `direction`, `shouldFlip`, `defaultOpen`, `isOpen`,
    `onOpenChange`, `autoFocus`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, trigger ARIA props, `ref`, and `ActionMenuContext`.
  - The trigger uses the S2 ActionButton style helper, generated styles,
    default horizontal More icon, context style merging, and a localized
    default more-actions label.
  - Data-driven items, render-function `items` composition, and static JSX
    child composition are covered.
- `comparison:report:exports`:
  - React Spectrum S2 value exports: `208`
  - solid-spectrum public value exports: `139`
  - missing React S2 value exports: `74`
  - missing non-root/support S2 exports: `74`
  - `ActionMenuContext` is no longer listed as missing.
- `comparison:report:gaps`:
  - Official styled entries live on both sides: `36`
  - Official entries still missing/gap: `33`
  - Official visual states tracked: `195`
  - Official visual states with current React/Solid visual evidence: `52`
  - Official visual states with strict pair-diff tests: `36`
  - Official visual states blocked by missing implementations: `32`
  - ActionMenu remains live on both stacks with `Styled default (planned)`.
- Verification:
  - `vp run check`
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx`
  - `vp run comparison:report:exports`
  - `vp run comparison:report:gaps`
  - `vp run comparison:build`
  - `vp fmt packages/solid-spectrum/src/s2-generated.css --write`
  - `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionmenu-contract.spec.ts --reporter=line`

## Current After Behavior/A11y Slice

- External authority:
  - W3C APG menu-button guidance requires a button that opens a menu, supports
    Enter/Space optional arrow opening, tracks expanded state, and links to the
    menu while open.
  - W3C APG menu guidance requires menu/menuitem roles, menu focus when open,
    Escape close with focus return, and disabled items that cannot activate.
  - React Aria Menu trigger docs require pressable triggers to expose an
    interactive role/semantic element, forward refs, and spread DOM props.
  - React S2 uses `aria-haspopup="true"` while Solid emits
    `aria-haspopup="menu"`; APG allows both.
- Implementation fixes:
  - `packages/solidaria-components/src/Menu.tsx` now keeps MenuButton
    `aria-expanded`, `aria-controls`, and related menu-button ARIA attributes
    reactive instead of freezing them through a DOM spread.
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now labels the menu
    surface with the trigger label to satisfy menu accessibility requirements.
- Evidence:
  - Focused package tests:
    `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`
    passed `119` tests.
  - Browser route contract:
    `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionmenu-contract.spec.ts --reporter=line`
    passed `4` tests.
  - `vp run check` passed.
  - `vp run comparison:build` built `70` pages and
    `/components/actionmenu/index.html`.
  - `vp run comparison:report:gaps` and
    `vp run comparison:report:exports` are unchanged from the API/styled
    trigger slice.

## Current After Visual Trigger Slice

- Solid package changes:
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now reuses the generated
    S2 workflow `MoreIcon` instead of a custom three-circle SVG so the default
    trigger icon matches React Spectrum's generated asset.
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` covers the generated
    More icon structure used by the default trigger.
- Visual evidence:
  - `apps/comparison/e2e/actionmenu-visual.spec.ts` passes strict
    zero-tolerance screenshot comparison for the closed default trigger.
  - The same spec asserts closed trigger computed styles and geometry match
    React Spectrum across default, `size=XS`, `size=XL`, `isQuiet`, and
    `isDisabled` viewer axes.
- `comparison:report:gaps`:
  - Official styled entries live on both sides: `36`
  - Official entries still missing/gap: `33`
  - Official visual states tracked: `195`
  - Official visual states with current React/Solid visual evidence: `53`
  - Official visual states with strict pair-diff tests: `37`
  - Official visual states blocked by missing implementations: `32`
  - ActionMenu is no longer listed under official states without complete
    visual/pair-diff coverage for the default closed trigger.
- `comparison:report:exports`:
  - React Spectrum S2 value exports: `208`
  - solid-spectrum public value exports: `140`
  - missing React S2 value exports: `73`
  - missing non-root/support S2 exports: `73`
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx` passed `9`
    tests.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionmenu-visual.spec.ts --reporter=line`
    passed `2` tests.
  - `vp run comparison:build` built `70` pages and
    `/components/actionmenu/index.html`.
  - `vp fmt packages/solid-spectrum/src/s2-generated.css --write` passed.
- Remaining gaps:
  - `align`, `direction`, and `shouldFlip` now have overlay placement parity
    evidence in `e2e/actionmenu-visual.spec.ts`.
  - At this point, focus/hover/pressed, forced-colors, reduced-motion, open
    menu screenshots, and menu item computed-style parity remained follow-up
    visual slices.

## Current After Open Menu Slice

- Solid package changes:
  - `packages/solid-spectrum/src/menu/s2-menu-styles.ts` ports the React S2
    menu, menu item, icon, label, description, value, keyboard, and section
    style helpers into the generated Solid Spectrum CSS path.
  - `packages/solid-spectrum/src/menu/index.tsx` now renders menu items with
    S2 slot contexts for icons, `Text` label/description/value slots, and
    `Keyboard` shortcuts. Text spans keep React Spectrum's
    `data-rsp-slot="text"` marker so shared control selectors treat icon+text
    items correctly.
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` renders the popover menu
    through the generated S2 menu surface and item styles.
- Visual evidence:
  - `apps/comparison/e2e/actionmenu-visual.spec.ts` passes strict
    zero-tolerance screenshot comparison for the closed trigger and open menu.
  - The same spec asserts trigger computed styles across default, `size=XS`,
    `size=XL`, `isQuiet`, and `isDisabled`, plus open menu computed
    style/geometry parity for the menu surface, first item, icon, label,
    description, and keyboard shortcut slots.
- `comparison:report:gaps`:
  - Official styled entries live on both sides: `36`
  - Official entries still missing/gap: `33`
  - Official visual states tracked: `196`
  - Official visual states with current React/Solid visual evidence: `54`
  - Official visual states with strict pair-diff tests: `38`
  - Official visual states blocked by missing implementations: `32`
- `comparison:report:exports` is unchanged from the API/styled trigger slice:
  - React Spectrum S2 value exports: `208`
  - solid-spectrum public value exports: `139`
  - missing React S2 value exports: `74`
  - missing non-root/support S2 exports: `74`
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx`
    passed `31` tests.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-visual.spec.ts --reporter=line`
    passed `4` tests.
- Remaining gaps:
  - `align`, `direction`, and `shouldFlip` now have overlay placement parity
    evidence across placement axes.
  - Focus/hover/pressed are now covered by the interaction visual slice.
  - Forced-colors, reduced-motion, and visual accessibility evidence remain
    follow-up visual slices.

## Current After Interaction Visual Slice

- Solid package changes:
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now applies the same
    pressScale transform path React S2 applies through ActionButton.
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` covers the pressed
    transform and `will-change` style on the ActionMenu trigger.
- Visual evidence:
  - `apps/comparison/e2e/actionmenu-visual.spec.ts` covers strict padded
    pair-diff evidence for trigger hover and focus-visible states.
  - The same spec covers pressed trigger motion with matching pressScale
    transform and a bounded transform antialias threshold.
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`
    passed `123` tests.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts e2e/actionmenu-visual.spec.ts --reporter=line`
    passed `14` tests.
  - `vp run comparison:report:gaps` now reports `198` tracked visual states,
    `55` with current React/Solid visual evidence, `38` strict pair-diff
    states, and lists ActionMenu trigger interaction states as asserted due to
    the pressed transform antialias threshold.
  - `vp run comparison:report:exports` remains at `140` Solid value exports
    and `73` missing React S2 value exports.
- Remaining gaps:
  - Forced-colors, reduced-motion, axe/manual semantics, touch/virtual click
    lifecycle, full compositional API, and S2 subpath exports remain tracked.

## Source Packet

| Source                   | Files or docs                                                                                                                                                 | Finding                                                                                                                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live official S2 docs    | `https://react-spectrum.adobe.com/ActionMenu`                                                                                                                 | Viewer exposes `size`, `align`, `direction`, `menuSize`, `isQuiet`, and `isDisabled`; example uses compositional menu items with icons, labels, descriptions, and keyboard slots.                         |
| S2 docs MCP              | `ActionMenu` page                                                                                                                                             | API includes trigger, menu, collection, overlay, events, accessibility, and advanced props.                                                                                                               |
| W3C APG                  | Menu button and menu/menubar patterns                                                                                                                         | Menu buttons require open-state ARIA, keyboard opening, menu roles, Escape close, focus return, and disabled-item semantics.                                                                              |
| React Spectrum S2 source | `src/ActionMenu.tsx`, `exports/ActionMenu.ts`                                                                                                                 | Uses `ActionMenuContext`, `useSpectrumContextProps`, localized default label, `filterDOMProps`, `ActionButton`, `MenuTrigger`, and `Menu`.                                                                |
| Solid styled source      | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/src/menu/s2-menu-styles.ts`         | ActionMenu now wraps the headless trigger with S2 ActionButton trigger styling, pressScale motion, generated S2 menu/item slot styling, static JSX child composition, and placement-axis parity evidence. |
| Solid headless/source    | `packages/solidaria-components/src/Menu.tsx`, `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solid-stately/src/collections/createMenuState.ts` | Headless menu trigger/state behavior exists and should be reused instead of reimplementing overlay mechanics.                                                                                             |
| Comparison harness       | `comparison-manifest.ts`, `component-controls.ts`, React/Solid styled fixtures, visual matrix, reports                                                        | Route now mounts both stacks with modeled controls, browser route contract coverage, and closed trigger, trigger interaction, open-menu, and placement visual/computed evidence.                          |

## Source Map And Public Contract

| Layer               | Upstream files                                                                                           | Solid files                                                                                                                                                                                           | Status                    |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| State               | `src/ActionMenu.tsx` via `MenuTrigger` state                                                             | `packages/solid-stately/src/collections/createMenuState.ts`, `packages/solidaria-components/src/Menu.tsx`                                                                                             | pending audit             |
| ARIA hooks          | `MenuTrigger`, `Menu`, `ActionButton`, labelable DOM props                                               | `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solidaria-components/src/Menu.tsx`                                                                                                      | pending audit             |
| Headless components | React Aria Components slots/context through S2 Menu                                                      | `packages/solidaria-components/src/Menu.tsx`                                                                                                                                                          | pending audit             |
| Styled S2           | `src/ActionMenu.tsx`, `src/ActionButton.tsx`, `src/Menu.tsx`, content primitives, generated style output | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/src/menu/s2-menu-styles.ts`, `packages/solid-spectrum/src/s2-generated.css` | partial trigger/open menu |
| Exports             | `exports/ActionMenu.ts`                                                                                  | `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/src/menu/index.tsx`                                                                                                                  | partial/root only         |

- Public props/defaults to map:
  `children`, `items`, `disabledKeys`, `onAction`, `shouldCloseOnSelect`,
  `isOpen`, `defaultOpen`, `onOpenChange`, `align`, `direction`, `shouldFlip`,
  `isDisabled`, `isQuiet`, `autoFocus`, `size`, `menuSize`, `styles`,
  `UNSAFE_className`, `UNSAFE_style`, `id`, ARIA labeling props.
- Slots/subcomponents to map:
  `MenuItem`, `MenuSection`, `SubmenuTrigger`, `UnavailableMenuItemTrigger`,
  `Collection`, `ContextualHelpPopover`, `Text`, `Keyboard`, `Header`,
  `Heading`.
- Contexts/providers:
  `ActionMenuContext` with focusable trigger ref.
- Refs:
  focusable ref to trigger button.
- Unsupported or intentionally different branches:
  none accepted yet.

## Cross-Layer Audit

| Layer               | Matched                                                                                                                                                      | Ported differently                                | Not applicable | Gaps                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------- | ---------------------------------------------------------------- |
| State               | Basic menu trigger state, controlled open, default open, action, disabled keys, close-on-select, outside close, and placement axes                           | Solid owns state through solid-stately            |                | Touch/virtual click lifecycle                                    |
| ARIA hooks          | Roles, labels, reactive expanded/controls, focus return, disabled item semantics, outside close state                                                        | Solidaria hook stack differs from React Aria      |                | Axe and forced-colors validation                                 |
| Headless components | Menu/MenuItem primitives, static JSX collection registration, and reactive MenuButton ARIA attributes                                                        | Solid collection registration is local to Menu    |                | Full official compositional ActionMenu API                       |
| Styled S2           | S2 ActionButton trigger helper, pressScale motion, and S2 menu/item slot helpers with closed trigger, trigger interaction, open-menu, and placement evidence | Menu and overlay internals remain Solidaria-owned |                | Forced-colors and reduced-motion visual evidence                 |
| Exports             | Root `ActionMenu` and `ActionMenuContext` exports                                                                                                            | Current path is `./menu/ActionMenu`               |                | S2 subpath support exports and related ActionMenu support values |

- Solid idioms checked:
  - child/provider laziness: pending
  - dynamic prop/context getters: partial; MenuButton ARIA spread snapshot fixed
  - render-prop/custom root liveness: pending
  - refs and cleanup ownership: pending

## Interaction Dependency Map

| Input/state           | Trigger                    | Expected React behavior                                         | Expected Solid behavior to prove                                    | Evidence                                           |
| --------------------- | -------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------- |
| `isDisabled`          | click/keyboard on trigger  | Trigger is disabled and menu does not open                      | Same trigger-disabled state; style parity still pending             | route contract                                     |
| `defaultOpen`         | initial render             | Menu is open without controlled state                           | Same initial overlay; focus behavior still pending                  | package tests                                      |
| controlled `isOpen`   | route control toggle       | Overlay follows prop and emits `onOpenChange` from interactions | Same callback payload without stale state                           | package tests                                      |
| `onAction`            | click/keyboard item        | Callback receives key                                           | Same key and disabled item suppression                              | route and package tests                            |
| `shouldCloseOnSelect` | item action                | Menu closes or remains open according to prop                   | Same remain-open behavior                                           | package tests                                      |
| `disabledKeys`        | focus/select disabled item | Disabled item is not selectable/actionable                      | Same DOM semantics and action suppression                           | package tests                                      |
| `align`/`direction`   | open overlay near viewport | Popover aligns/flips according to props                         | Same placement and relative geometry                                | visual spec placement axes                         |
| `size`/`menuSize`     | route control change       | Trigger/menu geometry and typography update                     | Same trigger computed size classes and dimensions; menu size parity | visual spec covers trigger `XS`/`XL` and open menu |
| `isQuiet`             | route control change       | Trigger switches quiet/non-quiet ActionButton styling           | Same trigger computed/visual state                                  | visual spec                                        |
| missing aria label    | render trigger             | Localized more-actions label is applied                         | Same localized default                                              | package tests                                      |

## Behavior State Machine

| Phase     | React expectation                                    | Solid expectation                           | Required proof                 |
| --------- | ---------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| before    | Trigger closed, menu absent unless `defaultOpen`     | Same                                        | Package and browser assertions |
| trigger   | Pointer/keyboard opens menu and updates ARIA         | Same                                        | Browser contract               |
| immediate | Focus moves according to menu trigger behavior       | Same                                        | Focus assertions               |
| transient | Hover/focus/pressed states match source branches     | Same computed and visual states             | Browser visual tests           |
| selection | Enabled item action fires; disabled item suppresses  | Same callback payloads and suppression      | Package tests                  |
| close     | Select/Escape/outside press close according to props | Same ARIA, focus return, and callback order | Browser and package tests      |
| cleanup   | Overlay, listeners, focus scopes, and IDs clean up   | Same                                        | Reopen/multiple-instance tests |

## Accessibility And I18n

| Topic                | Required validation                                                                                     | Evidence                         |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Trigger semantics    | Button role, `aria-haspopup`, `aria-expanded`, disabled state, explicit and default accessible names    | partial: package and route tests |
| Menu semantics       | Menu/menuitem roles, disabled item semantics, generated IDs, text value, section/submenu behavior       | partial: package and route tests |
| Keyboard             | Enter/Space/ArrowDown open, arrow navigation, Home/End where supported, Escape close, Tab/outside close | partial: package and route tests |
| Focus                | Initial focus, focus-visible styling, focus return, multiple instance isolation                         | partial: browser contract/visual |
| I18n                 | Localized more-actions default label; explicit ARIA labels override default                             | partial: locale and label tests  |
| Visual accessibility | Forced colors, reduced motion, contrast-sensitive states, target size                                   | pending                          |
| Axe/manual semantics | Axe smoke plus direct semantic assertions                                                               | pending                          |

## Style Source-To-Computed

| Axis          | Source owner to map                    | Required Solid proof                                                                                 |
| ------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Trigger size  | ActionButton `size`                    | S2 generated class, computed dimensions, and default pair diff for the closed trigger pass           |
| Quiet state   | ActionButton `isQuiet`                 | Closed trigger quiet computed parity passes                                                          |
| Disabled      | ActionButton/MenuItem disabled state   | Trigger ARIA, suppressed interaction, and computed visual state pass; menu item visual state pending |
| Menu size     | Menu `size` from ActionMenu `menuSize` | item/menu typography, padding, min width                                                             |
| Overlay       | MenuTrigger placement props            | align/direction/flip geometry passes; portal lifecycle pending                                       |
| Focus/hover   | ActionButton/Menu interactive states   | trigger focus-visible, hover, and pressed visual coverage                                            |
| Forced colors | S2 style branches                      | computed parity under forced-colors                                                                  |
| Unsafe/styles | ActionButton style passthrough         | class/style forwarding without comparison CSS patching                                               |

## Comparison Harness Plan

- Add `apps/comparison/src/data/actionmenu-demo.ts` with stable item data and
  serialized props.
- Add ActionMenu controls for `size`, `menuSize`, `align`, `direction`,
  `shouldFlip`, `isQuiet`, `isDisabled`, and open-state scenarios that should
  be deterministic in browser tests.
- Add React styled fixture using `@react-spectrum/s2/ActionMenu` and the
  official composition.
- Add Solid styled fixture using the public Solid Spectrum API.
- Mark the manifest entry live only after both stacks mount without private
  harness-only imports.
- Add visual-state matrix rows for default, sized, disabled, quiet/non-quiet,
  open menu, and forced-colors evidence.

## Test Plan

- Package tests:
  - Solid Spectrum ActionMenu API, exports, context/ref, style passthrough,
    sizes, controlled/default open, action callbacks, disabled keys, and
    shouldCloseOnSelect.
  - Solidaria/Solid Stately only if parity gaps are in lower layers.
- Browser contract tests:
  - controls update both stacks;
  - open/close by pointer and keyboard;
  - callback/event ordering;
  - focus return and cleanup;
  - placement axes;
  - disabled trigger/items;
  - shouldCloseOnSelect.
- Visual tests:
  - strict default closed trigger pair diff;
  - trigger hover, focus-visible, and pressed visual states;
  - strict open menu pair diff when stable;
  - computed style parity for trigger, menu surface, item rows, labels,
    descriptions, keyboard shortcuts, icons, focus, and forced-colors states.
- Final gates:
  - `vp run comparison:report:gaps`
  - `vp run comparison:report:exports`
  - focused package tests
  - focused Playwright contract/visual specs
  - `vp run comparison:build`
  - `vp run check`
