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

| Task                   | Status  | Evidence                                                                                                                                                                   | Blocker or next action                        |
| ---------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 0 Research             | done    | Live official docs page checked on 2026-05-16, S2 docs MCP, installed `@react-spectrum/s2@1.3.0` source, existing Solid ActionMenu/Menu source, current comparison reports | Continue with Menu source branch ledger       |
| 1 Baseline             | done    | `vp run comparison:report:gaps`, `vp run comparison:report:exports`, `vp run guard:rac-export-gap`                                                                         | None                                          |
| 2 Route harness        | done    | `actionmenu-demo.ts`, component controls, manifest entry, React/Solid styled fixtures, visual matrix route-control entry, `actionmenu-contract.spec.ts`                    | None                                          |
| 3 Source map/API       | partial | Root/menu barrel `ActionMenuContext` export added; trigger props/default label/ref/context/style pass-through covered by package tests                                     | Complete upstream branch ledger and subpaths  |
| 4 Cross-layer audit    | pending |                                                                                                                                                                            | Audit state, ARIA, headless, styled S2 layers |
| 5 Transitions          | pending |                                                                                                                                                                            | Overlay enter/exit and focus-return evidence  |
| 6 State                | partial | Package tests cover fallback actions, render-function items with `shouldCloseOnSelect={false}`, and controlled `isOpen`/`onOpenChange`                                     | Disabled keys, keyboard, focus-return matrix  |
| 7 ARIA hooks           | partial | Package tests cover trigger button role/name/`aria-haspopup`; browser tests cover disabled trigger suppression                                                             | Keyboard model and focus lifecycle            |
| 8 Headless             | partial | Focused Solid package coverage added in `packages/solid-spectrum/test/ActionMenu.test.tsx`                                                                                 | Lower-layer fixes only if later gaps require  |
| 9 Styled S2            | partial | Trigger now uses S2 ActionButton style helper, generated classes, size/quiet attrs, More icon, context styles, unsafe class/style                                          | Computed/pair-diff visual parity              |
| 10 Runtime lifecycle   | pending |                                                                                                                                                                            | Browser contract coverage                     |
| 11 Harness integrity   | done    | Current reports list ActionMenu live on both sides; default visual state moved from `blocked` to `planned`                                                                 | None                                          |
| 12 Comparison evidence | partial | Browser route contract covers mount, controls, disabled trigger, and action callback keys                                                                                  | Add visual/computed parity evidence           |
| 13 Acceptance          | partial | Focused package tests, route contract, reports, comparison build, and repo check pass for this API/styled trigger slice                                                    | Visual/computed parity still planned          |

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

| Gate                                     | Outcome     | Evidence                                                                  | Blockers/owner                         |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------- | -------------------------------------- |
| Official Docs And Viewer Parity          | in-progress | Live docs page and S2 MCP page identify examples, controls, and API props | Need route/control parity              |
| External Authority And Standards         | not-started |                                                                           | Check Menu/APG/WCAG where relevant     |
| Upstream React Source Parity             | in-progress | Upstream `src/ActionMenu.tsx` and `exports/ActionMenu.ts` identified      | Need full Menu/ActionButton branch map |
| Solid Idiomatic Implementation           | not-started |                                                                           | Port without reactive snapshots        |
| Accessibility And I18n                   | in-progress | Default localized more-actions label and trigger semantics covered        | Need keyboard/focus/a11y matrix        |
| Behavior State Machine                   | in-progress | Controlled open, action callback, and close-on-select package tests pass  | Need disabled keys and focus lifecycle |
| Style Source-To-Computed Parity          | in-progress | Trigger uses S2 ActionButton style helper and generated CSS               | Need computed styles and pair diff     |
| React-Vs-Solid Comparison Harness Parity | in-progress | Route is live on both stacks and `actionmenu-contract.spec.ts` passes     | Need visual/computed parity evidence   |
| Evidence And Handoff                     | partial     | Slice tests/reports/build/check recorded                                  | Need visual/computed parity evidence   |

### 1. Official Docs And Viewer Parity

- [x] Live official S2 page opened and dated:
      2026-05-16, `https://react-spectrum.adobe.com/ActionMenu`
- [x] Primary docs example recorded:
      compositional `ActionMenu` with `MenuItem`, icons, `Text` label and
      description slots, and `Keyboard` shortcuts
- [x] Viewer controls inventoried:
      `size`, `align`, `direction`, `menuSize`, `isQuiet`, `isDisabled`
- [ ] Defaults, reset behavior, and omitted-prop behavior proven in route tests
- [x] Comparison route default matches official example or records deviations:
      React uses the official compositional item example; Solid now uses the
      public ActionMenu API with the localized default more-actions label and
      shared route controls
- [x] Side-panel controls match official viewer controls and selection
      semantics:
      `size`, `align`, `direction`, `menuSize`, `isQuiet`, `isDisabled`
- [x] Route tests assert visible defaults/options and mounted DOM changes:
      `e2e/actionmenu-contract.spec.ts`

### 2. External Authority And Standards

- [ ] React Aria/S2 Menu docs and testing docs checked
- [ ] W3C/APG menu button/menu guidance checked where relevant
- [ ] WCAG focus, target size, forced-colors, and reduced-motion obligations
      mapped where relevant
- [ ] Source disagreements recorded with chosen authority
- [ ] External obligations mapped to route/source/behavior/a11y/style rows

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
- [ ] Menu/menuitem roles, IDs, ownership, ordering, and multiple-instance
      collision checks
- [ ] Keyboard model, focus order, focus-visible, focus return, and Escape
      behavior
- [ ] Disabled trigger and disabled item semantics
- [x] Default localized more-actions label
- [ ] Explicit ARIA labeling behavior
- [ ] Forced colors, reduced motion, contrast-sensitive states, and target size
- [ ] Axe or similar smoke result plus manual semantic assertions

### 6. Behavior State Machine

- [ ] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed
- [ ] Pointer, keyboard, touch/virtual click, blur, Escape, outside press, and
      disabled suppression
- [ ] Controlled/uncontrolled open state, defaultOpen, onOpenChange ordering
- [ ] Item action, disabledKeys, and shouldCloseOnSelect behavior
- [ ] Overlay placement, flip, focus, portal, and cleanup behavior
- [ ] Before/trigger/immediate/transient/settled/cleanup transition evidence

### 7. Style Source-To-Computed Parity

- [ ] Upstream S2 style declarations and owner branches identified
- [ ] Solid style/token path uses S2-compatible generated classes
- [ ] Comparison app CSS does not patch component behavior/style/geometry
- [ ] Button size, quiet state, menu size, align, direction, disabled, focus,
      hover, pressed, forced-colors, and reduced-motion axes mapped
- [ ] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches
- [ ] Visual deviations classified

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official composition
- [x] Solid fixture imports package public API
- [x] Both fixtures receive the same props and environment settings
- [x] Focused route tests prove controls update mounted React and Solid DOM
- [ ] Computed style, a11y, geometry, runtime, and pair-diff evidence cover
      rendering-affecting branches
- [x] Harness stability is proven:
      `vp run comparison:build`,
      `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison playwright test e2e/actionmenu-contract.spec.ts --reporter=line`

### 9. Evidence And Handoff

- [x] Focused package tests:
      `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx`,
      `28` tests passed
- [x] Focused Playwright/runtime tests:
      `e2e/actionmenu-contract.spec.ts`, `3` tests passed
- [x] Comparison reports refreshed when status/evidence changed:
      `comparison:report:gaps`, `comparison:report:exports`
- [x] `vp run comparison:build`:
      `70` pages built, including `/components/actionmenu/index.html`
- [x] `vp run check`:
      pass
- [ ] Final status is `accepted`, `partial`, or `pre-pass`:
- [ ] Remaining gaps listed by gate and owner:

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
- APG/W3C/WCAG/ARIA-AT/platform sources: pending
- Missing related docs recorded as `none found`: pending

## Official Docs And Viewer Parity

| Docs item       | Official setting/example                                                                                                | Current Solid/route status                                                                                                    | Required proof                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Primary example | `ActionMenu` composed with `MenuItem`, icons, `Text` label/description slots, and `Keyboard` shortcuts                  | Solid supports render-function item composition with `MenuItem`, `Text`, and `Keyboard`; static JSX children remain follow-up | Route fixture and package tests                      |
| `size`          | ActionButton size options `XS`, `S`, `M`, `L`, `XL`; default `M`                                                        | Solid accepts `size`, defaults to `M`, and applies S2 ActionButton trigger styles/attributes                                  | API tests, computed geometry, visual states          |
| `menuSize`      | Menu size options `S`, `M`, `L`, `XL`; default `M`                                                                      | Solid accepts `menuSize` and maps it to current menu/item classes; computed parity remains planned                            | API tests, computed item/menu geometry               |
| `align`         | `start` or `end`; default `start`                                                                                       | Solid accepts `align` and exposes it to the comparison DOM; overlay geometry parity remains planned                           | Browser placement contract                           |
| `direction`     | `bottom`, `top`, `left`, `right`, `start`, `end`; default `bottom`                                                      | Solid accepts `direction` and exposes it to the comparison DOM; overlay geometry parity remains planned                       | Browser placement contract                           |
| `isQuiet`       | Quiet ActionButton styling                                                                                              | Solid passes `isQuiet` through the S2 ActionButton trigger style helper                                                       | S2 class/computed/visual parity                      |
| `isDisabled`    | Disabled trigger suppresses open/action                                                                                 | Current Solid passes to the headless menu button                                                                              | Package and browser interaction tests                |
| Open state      | `defaultOpen`, controlled `isOpen`, and `onOpenChange`                                                                  | Solid exposes these props through the headless MenuTrigger path                                                               | Controlled/uncontrolled package tests                |
| Collection      | Static children or dynamic `items`; `disabledKeys`; `onAction`; `shouldCloseOnSelect`                                   | Solid supports data-driven items and render-function `items`; static JSX children remain follow-up                            | Package and route tests                              |
| Styling         | `styles`, `UNSAFE_className`, `UNSAFE_style` target the trigger ActionButton                                            | Solid forwards context/local trigger styles and unsafe class/style                                                            | S2 generated CSS, style passthrough, computed parity |
| Labeling/i18n   | Labelable DOM props; missing `aria-label` defaults to localized more-actions message                                    | Solid uses localized default label and supports explicit label/ARIA props                                                     | Locale/default-label and explicit-label tests        |
| Ref/context     | `ActionMenuContext`, focusable ref to trigger button                                                                    | Solid exports `ActionMenuContext` from root and menu barrel; ref targets trigger button                                       | Export tests, ref tests, context override tests      |
| Subpath exports | `ActionMenu`, `ActionMenuContext`, Menu subcomponents, `Collection`, `ContextualHelpPopover`, content primitives, `Key` | Current Solid root exports exist for some values, but S2 ActionMenu subpath parity is not implemented                         | Export report and TypeScript/API tests               |

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
  - Data-driven items and render-function `items` composition are covered.
    Static JSX children remain a follow-up because the current Solid Menu
    collection layer is item-data driven.
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

## Source Packet

| Source                   | Files or docs                                                                                                                                                 | Finding                                                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live official S2 docs    | `https://react-spectrum.adobe.com/ActionMenu`                                                                                                                 | Viewer exposes `size`, `align`, `direction`, `menuSize`, `isQuiet`, and `isDisabled`; example uses compositional menu items with icons, labels, descriptions, and keyboard slots. |
| S2 docs MCP              | `ActionMenu` page                                                                                                                                             | API includes trigger, menu, collection, overlay, events, accessibility, and advanced props.                                                                                       |
| React Spectrum S2 source | `src/ActionMenu.tsx`, `exports/ActionMenu.ts`                                                                                                                 | Uses `ActionMenuContext`, `useSpectrumContextProps`, localized default label, `filterDOMProps`, `ActionButton`, `MenuTrigger`, and `Menu`.                                        |
| Solid styled source      | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`                                                               | Existing ActionMenu is a wrapper around headless MenuTrigger/MenuButton/Menu/MenuItem with utility classes, item data assumptions, and no S2 context/ref/styles/subpath parity.   |
| Solid headless/source    | `packages/solidaria-components/src/Menu.tsx`, `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solid-stately/src/collections/createMenuState.ts` | Headless menu trigger/state behavior exists and should be reused instead of reimplementing overlay mechanics.                                                                     |
| Comparison harness       | `comparison-manifest.ts`, `component-controls.ts`, React/Solid styled fixtures, visual matrix, reports                                                        | Route now mounts both stacks with modeled controls and a browser route contract; visual/computed parity remains planned.                                                          |

## Source Map And Public Contract

| Layer               | Upstream files                                                                                           | Solid files                                                                                                                                     | Status            |
| ------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| State               | `src/ActionMenu.tsx` via `MenuTrigger` state                                                             | `packages/solid-stately/src/collections/createMenuState.ts`, `packages/solidaria-components/src/Menu.tsx`                                       | pending audit     |
| ARIA hooks          | `MenuTrigger`, `Menu`, `ActionButton`, labelable DOM props                                               | `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solidaria-components/src/Menu.tsx`                                                | pending audit     |
| Headless components | React Aria Components slots/context through S2 Menu                                                      | `packages/solidaria-components/src/Menu.tsx`                                                                                                    | pending audit     |
| Styled S2           | `src/ActionMenu.tsx`, `src/ActionButton.tsx`, `src/Menu.tsx`, content primitives, generated style output | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/src/s2-generated.css` | partial trigger   |
| Exports             | `exports/ActionMenu.ts`                                                                                  | `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/src/menu/index.tsx`                                                            | partial/root only |

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

| Layer               | Matched                                           | Ported differently                                         | Not applicable | Gaps                                                                                      |
| ------------------- | ------------------------------------------------- | ---------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------- |
| State               | Basic menu trigger state                          | Solid owns state through solid-stately                     |                | Controlled ActionMenu open state and callbacks need direct tests                          |
| ARIA hooks          | Basic menu roles exist                            | Solidaria hook stack differs from React Aria               |                | Default localized label, labelable DOM props, focus return, outside press need validation |
| Headless components | Menu/MenuItem primitives                          | Solid children/data APIs differ                            |                | Official compositional ActionMenu API needs parity                                        |
| Styled S2           | S2 ActionButton trigger helper                    | Menu surface/items still use current Solid utility classes |                | Menu styles, overlay geometry, computed parity, generated visual evidence                 |
| Exports             | Root `ActionMenu` and `ActionMenuContext` exports | Current path is `./menu/ActionMenu`                        |                | S2 subpath support exports and related ActionMenu support values                          |

- Solid idioms checked:
  - child/provider laziness: pending
  - dynamic prop/context getters: pending
  - render-prop/custom root liveness: pending
  - refs and cleanup ownership: pending

## Interaction Dependency Map

| Input/state           | Trigger                    | Expected React behavior                                         | Expected Solid behavior to prove                         | Evidence                            |
| --------------------- | -------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| `isDisabled`          | click/keyboard on trigger  | Trigger is disabled and menu does not open                      | Same trigger-disabled state; style parity still pending  | route contract                      |
| `defaultOpen`         | initial render             | Menu is open without controlled state                           | Same initial overlay; focus behavior still pending       | package tests                       |
| controlled `isOpen`   | route control toggle       | Overlay follows prop and emits `onOpenChange` from interactions | Same callback payload without stale state                | package tests                       |
| `onAction`            | click/keyboard item        | Callback receives key                                           | Same key; disabled item suppression still pending        | route contract                      |
| `shouldCloseOnSelect` | item action                | Menu closes or remains open according to prop                   | Same remain-open behavior; close/focus lifecycle pending | package tests                       |
| `disabledKeys`        | focus/select disabled item | Disabled item is not selectable/actionable                      | Same DOM semantics and keyboard skip behavior            | pending                             |
| `align`/`direction`   | open overlay near viewport | Popover aligns/flips according to props                         | Same placement or documented deviation                   | controls asserted; geometry pending |
| `size`/`menuSize`     | route control change       | Trigger/menu geometry and typography update                     | Same computed size classes and dimensions                | controls asserted; style pending    |
| `isQuiet`             | route control change       | Trigger switches quiet/non-quiet ActionButton styling           | Same class/computed/visual state                         | controls asserted; style pending    |
| missing aria label    | render trigger             | Localized more-actions label is applied                         | Same localized default                                   | package tests                       |

## Behavior State Machine

| Phase     | React expectation                                    | Solid expectation                           | Required proof                 |
| --------- | ---------------------------------------------------- | ------------------------------------------- | ------------------------------ |
| before    | Trigger closed, menu absent unless `defaultOpen`     | Same                                        | Package and browser assertions |
| trigger   | Pointer/keyboard opens menu and updates ARIA         | Same                                        | Browser contract               |
| immediate | Focus moves according to menu trigger behavior       | Same                                        | Focus assertions               |
| transient | Hover/focus/pressed states match source branches     | Same computed and visual states             | Computed and screenshot tests  |
| selection | Enabled item action fires; disabled item suppresses  | Same callback payloads and suppression      | Package tests                  |
| close     | Select/Escape/outside press close according to props | Same ARIA, focus return, and callback order | Browser and package tests      |
| cleanup   | Overlay, listeners, focus scopes, and IDs clean up   | Same                                        | Reopen/multiple-instance tests |

## Accessibility And I18n

| Topic                | Required validation                                                                                     | Evidence                         |
| -------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Trigger semantics    | Button role, `aria-haspopup`, `aria-expanded`, disabled state, explicit and default accessible names    | partial: package and route tests |
| Menu semantics       | Menu/menuitem roles, disabled item semantics, generated IDs, text value, section/submenu behavior       | pending                          |
| Keyboard             | Enter/Space/ArrowDown open, arrow navigation, Home/End where supported, Escape close, Tab/outside close | pending                          |
| Focus                | Initial focus, focus-visible styling, focus return, multiple instance isolation                         | pending                          |
| I18n                 | Localized more-actions default label; explicit ARIA labels override default                             | partial: default locale tests    |
| Visual accessibility | Forced colors, reduced motion, contrast-sensitive states, target size                                   | pending                          |
| Axe/manual semantics | Axe smoke plus direct semantic assertions                                                               | pending                          |

## Style Source-To-Computed

| Axis          | Source owner to map                    | Required Solid proof                                   |
| ------------- | -------------------------------------- | ------------------------------------------------------ |
| Trigger size  | ActionButton `size`                    | S2 generated class, computed dimensions, pair diff     |
| Quiet state   | ActionButton `isQuiet`                 | quiet/non-quiet style delta                            |
| Disabled      | ActionButton/MenuItem disabled state   | ARIA, suppressed interaction, computed visual state    |
| Menu size     | Menu `size` from ActionMenu `menuSize` | item/menu typography, padding, min width               |
| Overlay       | MenuTrigger placement props            | align/direction/flip geometry, portal lifecycle        |
| Focus/hover   | ActionButton/Menu interactive states   | computed focus ring and visual coverage                |
| Forced colors | S2 style branches                      | computed parity under forced-colors                    |
| Unsafe/styles | ActionButton style passthrough         | class/style forwarding without comparison CSS patching |

## Comparison Harness Plan

- Add `apps/comparison/src/data/actionmenu-demo.ts` with stable item data and
  serialized props.
- Add ActionMenu controls for `size`, `menuSize`, `align`, `direction`,
  `isQuiet`, `isDisabled`, and open-state scenarios that should be deterministic
  in browser tests.
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
