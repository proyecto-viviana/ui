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

| Task                   | Status | Evidence                                                                                                                                                                                                                                                                                                                                                                                           | Blocker or next action |
| ---------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | Live official docs page checked on 2026-05-16, S2 docs MCP, installed `@react-spectrum/s2@1.3.0` source, existing Solid ActionMenu/Menu source, current comparison reports                                                                                                                                                                                                                         | None                   |
| 1 Baseline             | done   | `vp run comparison:report:gaps`, `vp run comparison:report:exports`, `vp run guard:rac-export-gap`                                                                                                                                                                                                                                                                                                 | None                   |
| 2 Route harness        | done   | `actionmenu-demo.ts`, component controls, manifest entry, React/Solid styled fixtures, visual matrix route-control entry, `actionmenu-contract.spec.ts`                                                                                                                                                                                                                                            | None                   |
| 3 Source map/API       | done   | Root/menu barrel `ActionMenuContext` export added; trigger props/default label/autoFocus/ref/context/style/data pass-through covered by package tests; `./ActionMenu` subpath and ActionMenu support exports mapped from `exports/ActionMenu.ts`; Menu/ActionButton/Popover source owners identified; ActionMenu static MenuSection/link/custom-root branches covered                              | None                   |
| 4 Cross-layer audit    | done   | ActionMenu tests exposed and fixed lower-layer MenuTrigger ARIA prop reactivity; menu surface labelling added; placement, transition, style, static composition, submenu, selection, unavailable help, cleanup, and autoFocus branches mapped to owning layers and evidence                                                                                                                        | None                   |
| 5 Transitions          | done   | Browser contract covers open, Escape close, outside pointer close, focus-out close, menu removal, open-change state, focus restore, omitted-prop default reset, plus computed entering/exiting popover opacity/translate transition parity and delayed cleanup                                                                                                                                     | None for this slice    |
| 6 State                | done   | Package tests cover fallback actions, render-function/static JSX items, render-function item liveness while open, `shouldCloseOnSelect={false}`, controlled open, reactive omitted defaults, disabled keys, keyboard open/close, outside close, focus-out close, focus return after delayed exit, placement axes, portal unmount cleanup, touch/virtual activation, and disabled touch suppression | None                   |
| 7 ARIA hooks           | done   | Tests cover role/name, `aria-haspopup`, reactive `aria-expanded`, `aria-controls`, menu labels, disabled item semantics, keyboard focus, Escape, forced colors, reduced motion, scoped axe, manual semantic assertions, target size, and contrast-sensitive states                                                                                                                                 | None                   |
| 8 Headless             | done   | Focused Solid package coverage proves static JSX child laziness, render-function item liveness, custom MenuItem root ownership, slotted context resolution, trigger DOM data prop ownership, ActionMenu MenuSection composition, link MenuItems, and Menu/Button/Popover headless integration in `packages/solid-spectrum/test/ActionMenu.test.tsx`                                                | None                   |
| 9 Styled S2            | done   | Trigger now uses S2 ActionButton styling, generated More icon, and pressScale motion; open menu uses generated S2 menu/item/section/header/heading styling, submenu chevron descriptors/popovers, link-out descriptors for `_blank` items, trigger/open-menu/interaction/forced-colors visual evidence plus placement and reduced-motion parity                                                    | None                   |
| 10 Runtime lifecycle   | done   | `actionmenu-contract.spec.ts` covers mount, controls, default reset, actions, keyboard menu-button state, Escape/outside/focus-out cleanup, and focus restore; package tests cover portal cleanup on unmount and popover entering/exiting attributes; `actionmenu-visual.spec.ts` covers closed trigger, trigger interactions, open menu, transition lifecycle, placement axes, and autoFocus      | None                   |
| 11 Harness integrity   | done   | Current reports list ActionMenu live on both sides; default visual state moved from `blocked` to `planned`                                                                                                                                                                                                                                                                                         | None                   |
| 12 Comparison evidence | done   | Browser route contract covers mount, controls, disabled trigger, action callback keys, keyboard/outside/focus-out/touch/virtual ARIA behavior, scoped axe/manual semantics, target size/contrast, plus default trigger, trigger interaction, open-menu, transition lifecycle, placement, forced-colors, and reduced-motion visual/computed parity                                                  | None                   |
| 13 Acceptance          | done   | Focused package tests, route contract, visual spec, reports, comparison build, and repo check pass for the completed ActionMenu source ledger                                                                                                                                                                                                                                                      | None                   |

## Current After ActionMenu Submenu Source Slice

- Added S2 submenu composition support for static `ActionMenu` children:
  submenu items now render S2 chevron descriptors and submenu menus are wrapped
  in S2 popovers with submenu placement offsets.
- Fixed the shared submenu open lifecycle so mouse/pointer hover opens the
  submenu and the submenu popover is not closed only because focus remains on
  the parent menu item.
- Added ActionMenu package coverage for composed `SubmenuTrigger` + `Menu`
  children, including ARIA relationship, descriptor icon, submenu item content,
  and submenu popover trigger metadata.
- Verification for this slice:
  `vp test packages/solid-spectrum/test/ActionMenu.test.tsx` (`25` passed),
  `vp test packages/solidaria-components/test/Menu.test.tsx` (`89` passed),
  `vp test packages/solidaria-components/test/Popover.test.tsx` (`24` passed),
  `vp test packages/solid-spectrum/test/Menu.test.tsx` (`22` passed),
  `vp test packages/solidaria/test/overlays.test.tsx` (`25` passed),
  combined affected run (`185` passed), and
  `vp run --filter @proyecto-viviana/solid-spectrum build`.

## Latest Section Header Source Slice Summary

- Added the upstream Menu section slot context path for Solid Spectrum:
  `Menu` and the lower-level `ActionMenu` menu renderer now provide S2
  `Header`, `Heading`, and description text slot contexts, including
  `role="presentation"` on section headings.
- Added `HeadingContext` to the shared text primitive so menu section headings
  can receive generated S2 styles without falling back to standalone heading
  classes.
- Added package coverage for direct `Menu` and static `ActionMenu`
  composition with `MenuSection`, `Header`, and `Heading`; both tests assert
  generated section/header/heading classes and suppression of the standalone
  heading typography path.
- Verification for this slice:
  `vp test packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
  (`49` passed), affected package run
  (`packages/solid-spectrum/test/ActionMenu.test.tsx`,
  `packages/solid-spectrum/test/Menu.test.tsx`,
  `packages/solidaria-components/test/Menu.test.tsx`,
  `packages/solidaria-components/test/Popover.test.tsx`,
  `packages/solidaria/test/overlays.test.tsx`, `187` passed),
  `vp run --filter @proyecto-viviana/solid-spectrum build`,
  `vp run check:fix`, `vp run check`, and `git diff --check`.

## Latest Selection Indicator Source Slice Summary

- Confirmed the S2 Menu selection docs path: `selectionMode` enables single
  and multiple selection on shared `Menu` primitives. Upstream `ActionMenu`
  itself does not expose `selectionMode`, so this source branch is owned by the
  shared Menu stack that ActionMenu composes.
- Enabled opt-in Menu selection through Solid state, aria hooks, and headless
  render props while keeping default action-only menus at `selectionMode="none"`.
  Single-select items now expose `menuitemradio`; multiple-select items expose
  `menuitemcheckbox`; selected state is reflected through `aria-checked`,
  `data-selected`, and render props only when selection mode is enabled.
- Added S2 selection indicators for direct `MenuItem`: single selection renders
  the hidden/visible checkmark column, and multiple selection renders the
  checkbox box with selected checkmark. Generated S2 CSS was regenerated and
  normalized for these new style helpers.
- Added parity coverage at every touched layer:
  `createMenuState`, `createMenu`, `createMenuItem`, headless `Menu`, direct S2
  `Menu`, and ActionMenu regression coverage.
- Verification for this slice:
  `vp test packages/solid-stately/test/collections.test.ts packages/solidaria/test/createMenu.test.tsx packages/solidaria-components/test/Menu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
  (`207` passed), dependency-order builds for
  `@proyecto-viviana/solid-stately`, `@proyecto-viviana/solidaria`,
  `@proyecto-viviana/solidaria-components`, and
  `@proyecto-viviana/solid-spectrum`, plus `vp run check:fix`,
  `vp run check`, and `git diff --check`.

## Latest MenuSection Selection Source Slice Summary

- Added static `MenuSection` selection parity to the shared Menu stack so each
  section can own independent `selectionMode`, controlled/uncontrolled selected
  keys, change callbacks, disabled keys, and close-on-select behavior while
  action-only menus keep the default `selectionMode="none"` path.
- Wired static `MenuItem` rows to the active section selection context for
  `menuitemradio`/`menuitemcheckbox` roles, `aria-checked`, `data-selected`,
  disabled semantics, keyboard activation, and section-aware S2 selection
  indicators inside direct `Menu` and static `ActionMenu` composition.
- Added parity coverage for independent multiple/single section selection,
  controlled section selection, keyboard activation, disabled key suppression
  and navigation skipping, ActionMenu section selection indicators, and
  `shouldCloseOnSelect={false}` inside a selected section.
- Verification for this slice:
  `vp test packages/solidaria-components/test/Menu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
  (`148` passed), `vp run --filter @proyecto-viviana/solidaria-components build`,
  `vp run --filter @proyecto-viviana/solid-spectrum build`,
  `vp run check:fix`, `vp run check`, and `git diff --check`.

## Latest Unavailable Contextual Help Source Slice Summary

- Matched the upstream unavailable item branch more closely: unavailable menu
  items keep submenu-trigger semantics, expose the unavailable descriptor, and
  open a contextual help popover with the submenu trigger id used by
  `aria-controls`.
- Reset contextual help content away from the surrounding menu text context and
  added S2 heading/body text contexts so help popovers use contextual help
  typography instead of menu item typography. Popover aria/id props are now
  typed on the styled wrapper because those attributes are forwarded to the
  headless popover element.
- Added direct S2 `Menu` and ActionMenu subpath coverage for unavailable items:
  descriptor labelling, hover-open behavior, submenu help dialog identity,
  accessible popover name, contextual heading styling, body content, and the
  `isUnavailable={false}` plain-item fallback.
- Verification for this slice:
  `vp test packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
  (`55` passed), `vp run --filter @proyecto-viviana/solid-spectrum build`,
  `vp run check:fix`, `vp run check`, and `git diff --check`.

## Latest ActionMenu Source Ledger Closure Summary

- Closed the remaining upstream `ActionMenu` branch ledger against
  `@react-spectrum/s2@1.3.0/src/ActionMenu.tsx` and
  `exports/ActionMenu.ts`: trigger DOM/ARIA/style/ref/default-label/autoFocus
  branches, menu state props, static/data collection paths, support exports,
  submenu/unavailable/help composition, selection, popover placement, transition
  lifecycle, cleanup, and S2 style owners are mapped to direct evidence.
- Fixed the Solid wrapper's `autoFocus` branch. Upstream forwards this through
  `ActionButton`; Solid renders a specialized `MenuButton`, so the wrapper now
  focuses the trigger once the trigger element is available.
- Added package coverage for local trigger ref forwarding, local generated
  `styles`, `UNSAFE_className`, `UNSAFE_style`, `aria-details`, and initial
  `autoFocus`.
- Verification for this closure:
  `vp test packages/solid-stately/test/collections.test.ts packages/solidaria/test/createMenu.test.tsx packages/solidaria-components/test/Menu.test.tsx packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
  (`265` passed),
  `vp run --filter @proyecto-viviana/solid-spectrum build`,
  `vp run comparison:report:exports` (`146` Solid value exports, `67`
  missing React S2 value exports),
  `vp run comparison:report:gaps` (`204` tracked states, `56` visual evidence
  states, `38` strict pair-diff states, `32` blocked states),
  `vp run comparison:build` (`70` pages, including ActionMenu),
  `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts e2e/actionmenu-visual.spec.ts --reporter=line --workers=1`
  (`25` passed), `vp run check:fix`, `vp run check`, and `git diff --check`.

## Agent Workflow

No subagents are assigned for the initial ActionMenu slice. Keep work local
unless a later route, source, or test subtask is explicitly split.

| Task               | Agent role  | Context pack                                            | Docs/skills/tools                       | Allowed writes | Required output                       | Status |
| ------------------ | ----------- | ------------------------------------------------------- | --------------------------------------- | -------------- | ------------------------------------- | ------ |
| Checklist/baseline | local Codex | S2 docs/source, Solid source, comparison reports        | React Spectrum S2 skill, local commands | Playbook notes | Baseline note and committed checklist | done   |
| Route harness      | local Codex | This note, manifest/control/fixture patterns            | Playwright after implementation         | comparison app | Live React/Solid ActionMenu route     | done   |
| API/styled port    | local Codex | Upstream ActionMenu/Menu/ActionButton source branch map | package tests, generated S2 CSS         | packages       | Public API and styled parity          | done   |

| Agent role  | Files read                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Files changed | Evidence added                              | Commands run                                                                  | Blockers | Next owner  |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------- | ----------------------------------------------------------------------------- | -------- | ----------- |
| local Codex | `apps/comparison/playbook/component-validation-notes-template.md`, `apps/comparison/playbook/components/actionbar-validation-notes.md`, `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/src/ActionMenu.tsx`, `node_modules/.pnpm/@react-spectrum+s2@1.3.0_react-dom@19.2.5_react@19.2.5__react@19.2.5/node_modules/@react-spectrum/s2/exports/ActionMenu.ts` | This note     | Baseline reports and upstream/source packet | `comparison:report:gaps`, `comparison:report:exports`, `guard:rac-export-gap` | None     | local Codex |

## Acceptance Gate Checklist

These gates are additive. ActionMenu is not accepted until every in-scope item
below is checked with direct evidence.

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                                                                                                                                                                                                                        | Blockers/owner      |
| ---------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Official Docs And Viewer Parity          | done    | Live docs page and S2 MCP page identify examples, controls, API props, modeled route controls, default/reset behavior, and final ActionMenu source-ledger acceptance                                                                                                                                                            | None                |
| External Authority And Standards         | done    | W3C APG menu-button/menu patterns and React Aria Menu trigger docs checked                                                                                                                                                                                                                                                      | None for this slice |
| Upstream React Source Parity             | done    | Upstream `src/ActionMenu.tsx`, `src/Menu.tsx`, `src/ActionButton.tsx`, `src/Popover.tsx`, content/export owners, and `exports/ActionMenu.ts` identified; ActionMenu subpath exports now map to `packages/solid-spectrum/src/ActionMenu.ts` plus root support exports; all user-observable ActionMenu branches have evidence     | None                |
| Solid Idiomatic Implementation           | done    | Dynamic ActionMenu trigger defaults, controlled open state, ref forwarding, reactive MenuButton ARIA, slotted context resolution, trigger data prop ownership, static child/provider laziness, render-function liveness, custom root ownership, autoFocus, and overlay focus listener cleanup are covered by focused tests      | None                |
| Accessibility And I18n                   | done    | Labeling, reactive ARIA state, disabled items, keyboard focus, Escape, focus restore, focus-out ARIA reset, default locale, forced-colors, reduced-motion media environments, scoped axe, manual semantics, target-size, contrast-sensitive states, and aria-details covered                                                    | None                |
| Behavior State Machine                   | done    | Controlled open, omitted default reset, action callback, close-on-select, disabled keys, keyboard open/close, outside pointer close, focus-out close, portal unmount cleanup, touch activation, virtual activation, disabled touch suppression, focus cleanup after delayed exit, placement axes, and transition lifecycle pass | None                |
| Style Source-To-Computed Parity          | done    | Closed trigger, trigger hover/focus/pressed states, open menu, popover transition branches, forced-colors, and reduced-motion states use generated S2 style helpers/CSS with pair diff and computed parity across covered axes                                                                                                  | None                |
| React-Vs-Solid Comparison Harness Parity | done    | Route is live on both stacks; `actionmenu-contract.spec.ts` and `actionmenu-visual.spec.ts` pass for trigger interaction, open-menu, placement, forced-colors, reduced-motion, scoped axe, manual semantic, touch, virtual activation, target-size, and contrast coverage                                                       | None                |
| Evidence And Handoff                     | done    | Slice tests/reports/build/check recorded, strict trigger/open-menu visual evidence captured, and the source-ledger closure adds autoFocus/ref/style/aria-details coverage                                                                                                                                                       | None                |

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
- [x] Defaults, reset behavior, and omitted-prop behavior proven in route tests
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
- [x] WCAG target size obligations mapped where relevant:
      route checks compare Solid trigger geometry to React Spectrum, record the
      upstream XS `20px` target, and enforce the `24px` floor for non-XS sizes
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
- [x] Upstream Menu, ActionButton, Content, context, and generated style owners
      identified:
      `src/Menu.tsx`, `src/ActionButton.tsx`, `src/Popover.tsx`,
      `src/Content.tsx`, `exports/ActionMenu.ts`, and generated style owners
- [x] Public props/defaults/contexts/refs/root exports mapped for the current
      slice
- [x] Slots/subpath exports mapped:
      `./ActionMenu` package export, generated DOM/SSR entries, `Collection`,
      `UnavailableMenuItemTrigger`, `ContextualHelpPopover`, `Header`,
      `Heading`, `Text`, `Keyboard`, and `Key`
- [x] Full source branch ledger mapped
- [x] DOM, ARIA, state, event, effect, cleanup, style, geometry, and
      cross-component branches mapped
- [x] Source branch ledger covers every user-observable upstream branch
- [x] Remaining gaps have owners and are not counted as accepted:
      no remaining ActionMenu-scoped gaps; unrelated global support-export gaps
      stay outside this component acceptance

### 4. Solid Idiomatic Implementation

- [x] Dynamic props, context values, and derived values remain reactive for
      ActionMenu trigger defaults and controlled open state
- [x] No prop destructuring/spread snapshots live Solid accessors for
      ActionMenu trigger defaults, disabled state, quiet state, size, and
      controlled open state
- [x] Children remain lazy across provider/context boundaries
- [x] Render props/custom roots receive live state where applicable
- [x] Refs use Solid semantics for the ActionMenu trigger
- [x] Effects, observers, timers, listeners, and subscriptions have cleanup
- [x] Tests cover relevant reactive update risks for ActionMenu trigger
      defaults and controlled open state

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
- [x] Contrast-sensitive states and target size

### 6. Behavior State Machine

- [x] State/input -> trigger -> expected React -> expected Solid -> evidence
      rows completed for the behavior/a11y slice
- [x] Pointer, keyboard, touch/virtual click, Escape, outside press, and
      disabled suppression
- [x] Blur/focus-out lifecycle closes the open menu and clears route ARIA state
- [x] Controlled/uncontrolled open state, defaultOpen, and onOpenChange payloads
- [x] Item action, disabledKeys, and shouldCloseOnSelect behavior
- [x] Overlay placement and flip behavior
- [x] Overlay focus, portal, and cleanup behavior for keyboard open/Escape,
      outside pointer close, focus-out close, focus return, and unmount cleanup
- [x] Before/trigger/immediate/transient/settled/cleanup transition evidence

### 7. Style Source-To-Computed Parity

- [x] Upstream S2 style declarations and owner branches identified
- [x] Solid style/token path uses S2-compatible generated classes
- [x] Comparison app CSS does not patch component behavior/style/geometry
- [x] Button size, quiet state, menu size, align, direction, shouldFlip,
      disabled, focus, hover, and pressed axes mapped for current trigger/menu
      coverage
- [x] Forced-colors and reduced-motion axes mapped
- [x] Computed-style/class/attribute/geometry/CSS-variable assertions cover
      rendering-affecting branches
- [x] Visual deviations classified

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream component and official composition
- [x] Solid fixture imports package public API
- [x] Both fixtures receive the same props and environment settings
- [x] Focused route tests prove controls update mounted React and Solid DOM
- [x] Computed style, a11y, geometry, runtime, and pair-diff evidence cover
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
- [x] Target-size and color-contrast evidence is covered by
      `e2e/actionmenu-contract.spec.ts`
- [x] Harness stability is proven:
      `vp run comparison:build`,
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts e2e/actionmenu-visual.spec.ts --reporter=line --workers=1`

### 9. Evidence And Handoff

- [x] Focused package tests:
      `vp test packages/solid-stately/test/collections.test.ts packages/solidaria/test/createMenu.test.tsx packages/solidaria-components/test/Menu.test.tsx packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`,
      `265` tests passed
- [x] Focused Playwright/runtime and visual tests:
      `e2e/actionmenu-contract.spec.ts` and `e2e/actionmenu-visual.spec.ts`,
      `25` tests passed
- [x] Comparison reports refreshed when status/evidence changed:
      `comparison:report:gaps` (`204` states, `56` visual evidence, `38`
      strict pair-diff states, `32` blocked states),
      `comparison:report:exports` (`146` Solid value exports, `67` missing
      React S2 value exports)
- [x] `vp run comparison:build`:
      `70` pages built, including `/components/actionmenu/index.html`
- [x] `vp run --filter @proyecto-viviana/solid-spectrum build`:
      pass
- [x] `vp run check:fix`:
      pass
- [x] `vp run check`:
      pass
- [x] Final status is `done` for ActionMenu:
      source branch ledger is closed for user-observable ActionMenu branches
- [x] Remaining gaps listed by gate and owner:
      no ActionMenu-scoped gaps remain after source-ledger closure

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
- WCAG/ARIA-AT/platform sources: APG menu-button/menu guidance, forced-colors,
  reduced-motion, target-size, and scoped axe obligations are mapped to route
  and visual evidence.
- Missing related docs recorded as `none found` for ActionMenu-specific
  follow-ups outside the S2 page and source packet.

## Official Docs And Viewer Parity

| Docs item       | Official setting/example                                                                                                | Current Solid/route status                                                                                                          | Required proof                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Primary example | `ActionMenu` composed with `MenuItem`, icons, `Text` label/description slots, and `Keyboard` shortcuts                  | Solid supports static JSX and render-function item composition with `MenuItem`, `Text`, and `Keyboard`                              | Route fixture and package tests                      |
| `size`          | ActionButton size options `XS`, `S`, `M`, `L`, `XL`; default `M`                                                        | Solid accepts `size`, defaults to `M`, and applies S2 ActionButton trigger styles/attributes                                        | API tests, computed geometry, visual states          |
| `menuSize`      | Menu size options `S`, `M`, `L`, `XL`; default `M`                                                                      | Solid accepts `menuSize` and maps it to generated S2 menu/item classes; default open menu has strict visual/computed parity         | API tests, computed item/menu geometry               |
| `align`         | `start` or `end`; default `start`                                                                                       | Solid accepts `align` and exposes it to the comparison DOM; overlay geometry parity remains planned                                 | Browser placement contract                           |
| `direction`     | `bottom`, `top`, `left`, `right`, `start`, `end`; default `bottom`                                                      | Solid accepts `direction` and exposes it to the comparison DOM; overlay geometry parity remains planned                             | Browser placement contract                           |
| `isQuiet`       | Quiet ActionButton styling                                                                                              | Solid passes `isQuiet` through the S2 ActionButton trigger style helper                                                             | S2 class/computed/visual parity                      |
| `isDisabled`    | Disabled trigger suppresses open/action                                                                                 | Current Solid passes to the headless menu button                                                                                    | Package and browser interaction tests                |
| Open state      | `defaultOpen`, controlled `isOpen`, and `onOpenChange`                                                                  | Solid exposes these props through the headless MenuTrigger path                                                                     | Controlled/uncontrolled package tests                |
| Collection      | Static children or dynamic `items`; `disabledKeys`; `onAction`; `shouldCloseOnSelect`                                   | Solid supports static JSX children, data-driven items, and render-function `items`                                                  | Package and route tests                              |
| Styling         | `styles`, `UNSAFE_className`, `UNSAFE_style` target the trigger ActionButton                                            | Solid forwards context/local trigger styles and unsafe class/style                                                                  | S2 generated CSS, style passthrough, computed parity |
| Labeling/i18n   | Labelable DOM props; missing `aria-label` defaults to localized more-actions message                                    | Solid uses localized default label and supports explicit label/ARIA props                                                           | Locale/default-label and explicit-label tests        |
| Ref/context     | `ActionMenuContext`, focusable ref to trigger button                                                                    | Solid exports `ActionMenuContext` from root and menu barrel; ref targets trigger button                                             | Export tests, ref tests, context override tests      |
| Subpath exports | `ActionMenu`, `ActionMenuContext`, Menu subcomponents, `Collection`, `ContextualHelpPopover`, content primitives, `Key` | Solid implements `./ActionMenu`, package export map entries, DOM/SSR build entries, root support exports, and focused package tests | Export report, package tests, package build          |

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
    lifecycle, and full Menu/ActionButton source branch ledger remain tracked.

## Current After Source/Subpath Export Slice

- Solid package changes:
  - `packages/solid-spectrum/src/ActionMenu.ts` now mirrors upstream
    `exports/ActionMenu.ts` for ActionMenu, menu subcomponents, `Collection`,
    `ContextualHelpPopover`, text/content primitives, and `Key`.
  - `packages/solid-spectrum/package.json` and
    `packages/solid-spectrum/tsup.config.ts` now publish/build the
    `./ActionMenu` DOM and SSR entries.
  - Root S2 support exports now include the implemented `Collection`,
    `UnavailableMenuItemTrigger`, `ContextualHelpPopover`, `Header`, and
    `HeaderContext` values so the support export report reflects the new
    implementation.
  - `UnavailableMenuItemTrigger` composes the headless submenu trigger with the
    S2 unavailable descriptor icon and localized `menu.unavailable` label.
  - `ContextualHelpPopover` and `Header` were added as the support primitives
    needed by the ActionMenu subpath.
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx`
    passed `36` tests.
  - `vp run --filter @proyecto-viviana/solid-spectrum build` passed and
    produced `dist/ActionMenu.js` plus `dist/ActionMenu.ssr.js`.
  - `vp run comparison:report:exports` now reports `145` Solid value exports,
    `68` missing React S2 value exports, and `68` missing support exports.
  - `vp run comparison:report:gaps` remains at `203` tracked visual states,
    `56` visual evidence states, `39` strict pair-diff states, and `32`
    blocked states.
  - `vp run comparison:build` built `70` pages, including
    `/components/actionmenu/index.html`.
  - `vp run check:fix` and `vp run check` passed.
- Remaining gaps:
  - Full Menu/ActionButton source branch ledger, portal/focus cleanup audit,
    and transition transient evidence remain tracked.

## Current After Defaults/Cleanup Source Slice

- Source-ledger coverage added:
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` now proves trigger
    defaults recover reactively when `label`, `size`, `isQuiet`, and
    `isDisabled` are omitted after a non-default render.
  - The same package test file now proves an open ActionMenu removes its
    portal menu content and menu ID reference on unmount.
  - `apps/comparison/e2e/actionmenu-contract.spec.ts` now proves the comparison
    route resets non-default viewer params back to the official omitted-prop
    defaults on a fresh route load.
  - `apps/comparison/src/data/visual-state-matrix.ts` records the default-reset
    contract in the ActionMenu route-control evidence row.
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx`
    passed `38` tests.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts --reporter=line`
    passed `11` tests.
- Remaining gaps at that point:
  - Blur-specific lifecycle audit and transient visual transition evidence
    remain open.

## Current After Blur Lifecycle Source Slice

- Source-ledger coverage added:
  - `packages/solidaria/src/overlays/createOverlay.ts` now closes topmost
    overlays on document `focusin` outside when `shouldCloseOnBlur` is enabled,
    before focus containment can retain a stale menu.
  - `packages/solidaria-components/test/Popover.test.tsx` proves modal Popover
    closes when focus moves outside.
  - `apps/comparison/e2e/actionmenu-contract.spec.ts` proves React and Solid
    ActionMenu both close, clear `aria-controls`, and publish
    `data-comparison-last-open-state="false"` when focus leaves the open
    overlay.
- Verification:
  - `vp test run packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`
    passed `176` tests.
  - `vp run --filter @proyecto-viviana/solidaria build` passed.
  - `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts --reporter=line`
    passed `12` tests.
- Remaining gaps:
  - Full source branch ledger and transient visual transition evidence remain
    open.

## Current After Transition Lifecycle Source Slice

- Source-ledger coverage added:
  - `packages/solid-spectrum/src/menu/s2-menu-styles.ts` now ports React S2
    Popover opacity/translate transition branches for ActionMenu's menu
    popover.
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now drives entering and
    exiting render state, keeps the exiting popover mounted for the `200ms`
    transition, and restores trigger focus after keyboard-close exits.
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` proves entering and
    exiting attributes plus delayed cleanup.
  - `apps/comparison/e2e/actionmenu-visual.spec.ts` proves entering computed
    opacity/translate exactly, exiting transition metadata plus live
    opacity/translate ranges, placement, pointer-events, and delayed cleanup
    match React Spectrum.
  - The open-menu screenshot target now captures the popover surface for the
    strict default state and uses a backed forced-colors capture with a bounded
    threshold for Chromium text subpixel rasterization.
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx` passed `17`
    tests.
  - `vp run --filter @proyecto-viviana/solid-spectrum build` passed.
  - `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-contract.spec.ts --reporter=line --workers=1`
    passed `12` tests.
  - `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/actionmenu-visual.spec.ts --reporter=line --workers=1`
    passed `13` tests.
  - `vp run comparison:report:gaps` reports `204` tracked states, `56`
    visual evidence states, `38` strict pair-diff states, and `32` blocked
    states.
  - `vp run comparison:report:exports` reports `145` Solid value exports and
    `68` missing React S2 value exports.
  - `vp run comparison:build` built `70` pages, including
    `/components/actionmenu/index.html`.
  - `vp run check` passed.
- Remaining gaps at that point:
  - Full source branch ledger remained open; closed by the latest source-ledger
    closure.

## Current After Solid Idiom Source Slice

- Source-ledger coverage added:
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now forwards `data-*`
    DOM props to the trigger button, matching React S2's `filterDOMProps`
    ActionButton path, and omits them from the menu prop bag.
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` proves reactive trigger
    data prop ownership, slotted `ActionMenuContext` resolution, local prop
    override of context defaults, and `slot={null}` context opt-out.
  - The same package test file proves static JSX menu children stay lazy while
    the ActionMenu is closed and render under the menu provider after opening.
  - The same package test file proves data-driven render-function children
    update while the menu remains open.
- Verification:
  - `vp test run packages/solid-spectrum/test/ActionMenu.test.tsx` passed `21`
    tests.
  - `vp test run packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`
    passed `181` tests.
  - `vp run --filter @proyecto-viviana/solid-spectrum build` passed.
  - `vp run comparison:report:gaps` remains at `204` tracked states, `56`
    visual evidence states, `38` strict pair-diff states, and `32` blocked
    states.
  - `vp run comparison:report:exports` remains at `145` Solid value exports
    and `68` missing React S2 value exports.
  - `vp run comparison:build` built `70` pages, including
    `/components/actionmenu/index.html`.
- Remaining gaps at that point:
  - Full source branch ledger remained open, with custom root/render ownership
    and deeper Menu/Popover branch deltas still to classify; closed by later
    source-ledger slices.

## Current After ActionMenu Composition Source Slice

- Source-ledger coverage added:
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` now provides the
    ActionMenu `menuSize` and `hideLinkOutIcon` values to static compositional
    Menu children, matching React S2's ActionMenu-to-Menu prop flow.
  - `packages/solid-spectrum/src/menu/index.tsx` now renders the S2 link-out
    descriptor for `MenuItem href target="_blank"` and supports
    `hideLinkOutIcon`.
  - `MenuSection` now uses the generated S2 section style helper instead of
    legacy utility classes.
  - `packages/solid-spectrum/test/ActionMenu.test.tsx` proves ActionMenu
    static `MenuSection` composition, `_blank` link item anchors/descriptors,
    descriptor hiding, menu-size propagation into link icon sizing, and custom
    MenuItem root render-state ownership.
- Verification:
  - `vp test packages/solid-spectrum/test/ActionMenu.test.tsx` passed `24`
    tests.
  - `vp test packages/solid-spectrum/test/Menu.test.tsx` passed `22` tests.
  - `vp test run packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx`
    passed `184` tests.
  - `vp run --filter @proyecto-viviana/solid-spectrum build` passed.
  - `vp run check:fix` passed after the build regenerated CSS formatting.
  - `vp run check` passed.
- Remaining gaps at that point:
  - Full source branch ledger remained open, especially normal submenu behavior,
    section header/heading slot styling parity, selection indicators, and
    remaining Menu/Popover branches not yet mapped to evidence; closed by later
    source-ledger slices.

## Current After Section Header Source Slice

- Source-ledger coverage added:
  - `packages/solid-spectrum/src/text/Heading.tsx` now supports
    `HeadingContext`, generated `styles`, unsafe style/class merging, hidden
    state, context refs, and context-provided DOM props such as
    `role="presentation"`.
  - `packages/solid-spectrum/src/menu/index.tsx` now mirrors React S2 `Menu`
    provider wiring for section `Header`, section `Heading`, and menu text
    slots. Solid also supplies `default`/`label` text slots at this level so
    static JSX children created before item render-prop providers still receive
    valid S2 text slot context.
  - `packages/solid-spectrum/src/menu/ActionMenu.tsx` applies the same provider
    wiring around its lower-level `HeadlessMenu` path, which is separate from
    the public `Menu` component.
  - `packages/solid-spectrum/test/Menu.test.tsx` and
    `packages/solid-spectrum/test/ActionMenu.test.tsx` prove section header and
    heading styling in both direct Menu and ActionMenu static composition.
- Verification:
  - `vp test packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
    passed `49` tests.
  - `vp test packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/Menu.test.tsx packages/solidaria-components/test/Menu.test.tsx packages/solidaria-components/test/Popover.test.tsx packages/solidaria/test/overlays.test.tsx`
    passed `187` tests.
  - `vp run --filter @proyecto-viviana/solid-spectrum build` passed.
  - `vp run check:fix` passed.
  - `vp run check` passed.
  - `git diff --check` passed.
- Remaining gaps at that point:
  - Full source branch ledger remained open, especially selection indicators and
    remaining Menu/Popover branches not yet mapped to evidence; closed by later
    source-ledger slices.

## Source Packet

| Source                   | Files or docs                                                                                                                                                                                                                                                                                                         | Finding                                                                                                                                                                                                                                                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live official S2 docs    | `https://react-spectrum.adobe.com/ActionMenu`                                                                                                                                                                                                                                                                         | Viewer exposes `size`, `align`, `direction`, `menuSize`, `isQuiet`, and `isDisabled`; example uses compositional menu items with icons, labels, descriptions, and keyboard slots.                                                                                                                                                         |
| S2 docs MCP              | `ActionMenu` page                                                                                                                                                                                                                                                                                                     | API includes trigger, menu, collection, overlay, events, accessibility, and advanced props.                                                                                                                                                                                                                                               |
| W3C APG                  | Menu button and menu/menubar patterns                                                                                                                                                                                                                                                                                 | Menu buttons require open-state ARIA, keyboard opening, menu roles, Escape close, focus return, and disabled-item semantics.                                                                                                                                                                                                              |
| React Spectrum S2 source | `src/ActionMenu.tsx`, `src/Menu.tsx`, `src/ActionButton.tsx`, `src/Popover.tsx`, `src/Content.tsx`, `exports/ActionMenu.ts`                                                                                                                                                                                           | Uses `ActionMenuContext`, `useSpectrumContextProps`, localized default label, `filterDOMProps`, `ActionButton`, `MenuTrigger`, `Menu`, Popover focus/close behavior, opacity/translate transition branches, and content slots; subpath re-exports menu/support primitives.                                                                |
| Solid styled source      | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/src/menu/menu-context.ts`, `packages/solid-spectrum/src/menu/s2-menu-styles.ts`                                                                                                             | ActionMenu now wraps the headless trigger with S2 ActionButton trigger styling, pressScale motion, generated S2 menu/item/section slot styling, trigger data prop forwarding, static JSX child laziness/composition, link-out descriptors, unavailable item affordance, placement-axis parity, and popover transition lifecycle evidence. |
| Solid public surface     | `packages/solid-spectrum/src/ActionMenu.ts`, `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/package.json`, `packages/solid-spectrum/tsup.config.ts`                                                                                                                                                 | ActionMenu subpath and root support exports now expose the implemented upstream support values.                                                                                                                                                                                                                                           |
| Solid headless/source    | `packages/solidaria-components/src/Menu.tsx`, `packages/solidaria-components/src/Popover.tsx`, `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solidaria/src/overlays/createOverlay.ts`, `packages/solidaria/src/popover/createPopover.ts`, `packages/solid-stately/src/collections/createMenuState.ts` | Headless menu trigger/state behavior owns open state, ARIA updates, focus return, focus-out close, outside dismissal, and popover portal cleanup.                                                                                                                                                                                         |
| Comparison harness       | `comparison-manifest.ts`, `component-controls.ts`, React/Solid styled fixtures, visual matrix, reports                                                                                                                                                                                                                | Route now mounts both stacks with modeled controls, browser route contract coverage, and closed trigger, trigger interaction, open-menu, transition lifecycle, placement, forced-colors, and reduced-motion visual/computed evidence.                                                                                                     |

## Source Map And Public Contract

| Layer               | Upstream files                                                                                                              | Solid files                                                                                                                                                                                                         | Status                  |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| State               | `src/ActionMenu.tsx` via `MenuTrigger` state                                                                                | `packages/solid-stately/src/collections/createMenuState.ts`, `packages/solidaria-components/src/Menu.tsx`                                                                                                           | done                    |
| ARIA hooks          | `MenuTrigger`, `Menu`, `ActionButton`, labelable DOM props                                                                  | `packages/solidaria/src/menu/createMenuTrigger.ts`, `packages/solidaria/src/overlays/createOverlay.ts`, `packages/solidaria-components/src/Menu.tsx`                                                                | done                    |
| Headless components | React Aria Components slots/context through S2 Menu                                                                         | `packages/solidaria-components/src/Menu.tsx`, `packages/solidaria-components/src/Popover.tsx`, `packages/solidaria/src/popover/createPopover.ts`                                                                    | done                    |
| Styled S2           | `src/ActionMenu.tsx`, `src/ActionButton.tsx`, `src/Menu.tsx`, `src/Popover.tsx`, content primitives, generated style output | `packages/solid-spectrum/src/menu/ActionMenu.tsx`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/src/menu/s2-menu-styles.ts`, `packages/solid-spectrum/src/s2-generated.css`               | done                    |
| Exports             | `exports/ActionMenu.ts`                                                                                                     | `packages/solid-spectrum/src/ActionMenu.ts`, `packages/solid-spectrum/src/index.ts`, `packages/solid-spectrum/src/menu/index.tsx`, `packages/solid-spectrum/package.json`, `packages/solid-spectrum/tsup.config.ts` | ActionMenu subpath done |

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

| Layer               | Matched                                                                                                                                                                                                                              | Ported differently                                | Not applicable | Gaps                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | -------------- | --------------------------------------------------------- |
| State               | Basic menu trigger state, controlled open, default open, action, disabled keys, close-on-select, outside close, focus-out close, focus restore after delayed exit, transition lifecycle, and placement axes                          | Solid owns state through solid-stately            |                | None                                                      |
| ARIA hooks          | Roles, labels, reactive expanded/controls, focus return, disabled item semantics, outside close state, aria-details, and focus-out state reset                                                                                       | Solidaria hook stack differs from React Aria      |                | None                                                      |
| Headless components | Menu/MenuItem primitives, static JSX collection registration, reactive MenuButton ARIA attributes, Popover focus-out close, submenus, selection indicators, unavailable help, and custom roots                                       | Solid collection registration is local to Menu    |                | None                                                      |
| Styled S2           | S2 ActionButton trigger helper, pressScale motion, S2 menu/item slot helpers, and Popover transition branches with closed trigger, trigger interaction, open-menu, transition, placement, forced-colors, and reduced-motion evidence | Menu and overlay internals remain Solidaria-owned |                | None                                                      |
| Exports             | Root `ActionMenu`, `ActionMenuContext`, ActionMenu support exports, and `./ActionMenu` subpath                                                                                                                                       | Solid adds an explicit `src/ActionMenu.ts` entry  |                | Remaining non-ActionMenu support exports in global report |

- Solid idioms checked:
  - child/provider laziness: static ActionMenu children stay lazy until open
    and render under menu providers
  - dynamic prop/context getters: MenuButton ARIA spread snapshot fixed;
    slotted ActionMenuContext, trigger data prop ownership, and omitted
    default restoration covered
  - render-prop/custom root liveness: render-function item liveness covered;
    custom root ownership covered
  - refs and cleanup ownership: trigger ref/context, autoFocus, portal cleanup,
    transition cleanup, and focus restoration covered

## Interaction Dependency Map

| Input/state           | Trigger                               | Expected React behavior                                         | Expected Solid behavior to prove                                        | Evidence                                           |
| --------------------- | ------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| `isDisabled`          | click/keyboard on trigger             | Trigger is disabled and menu does not open                      | Same trigger-disabled state and computed visual parity                  | route contract                                     |
| `defaultOpen`         | initial render                        | Menu is open without controlled state                           | Same initial overlay and focus behavior                                 | package tests                                      |
| controlled `isOpen`   | route control toggle                  | Overlay follows prop and emits `onOpenChange` from interactions | Same callback payload without stale state                               | package tests                                      |
| `onAction`            | click/keyboard item                   | Callback receives key                                           | Same key and disabled item suppression                                  | route and package tests                            |
| `shouldCloseOnSelect` | item action                           | Menu closes or remains open according to prop                   | Same remain-open behavior                                               | package tests                                      |
| `disabledKeys`        | focus/select disabled item            | Disabled item is not selectable/actionable                      | Same DOM semantics and action suppression                               | package tests                                      |
| `align`/`direction`   | open overlay near viewport            | Popover aligns/flips according to props                         | Same placement and relative geometry                                    | visual spec placement axes                         |
| focus leaves overlay  | programmatic focus outside while open | Popover closes and menu-button ARIA resets                      | Same menu removal, `aria-controls` cleanup, and open-state callback     | route contract and Popover unit test               |
| open/close transition | opening and Escape closing the menu   | Popover enters/exits with opacity/translate and delayed cleanup | Same computed transition style, mounted exiting state, and focus return | package test and visual spec                       |
| `size`/`menuSize`     | route control change                  | Trigger/menu geometry and typography update                     | Same trigger computed size classes and dimensions; menu size parity     | visual spec covers trigger `XS`/`XL` and open menu |
| `isQuiet`             | route control change                  | Trigger switches quiet/non-quiet ActionButton styling           | Same trigger computed/visual state                                      | visual spec                                        |
| missing aria label    | render trigger                        | Localized more-actions label is applied                         | Same localized default                                                  | package tests                                      |

## Behavior State Machine

| Phase     | React expectation                                                                | Solid expectation                                            | Required proof                                             |
| --------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| before    | Trigger closed, menu absent unless `defaultOpen`                                 | Same                                                         | Package and browser assertions                             |
| trigger   | Pointer/keyboard opens menu and updates ARIA                                     | Same                                                         | Browser contract                                           |
| immediate | Focus moves according to menu trigger behavior                                   | Same                                                         | Focus assertions                                           |
| transient | Hover/focus/pressed states and popover enter/exit branches match source branches | Same computed and visual states                              | Browser visual tests                                       |
| selection | Enabled item action fires; disabled item suppresses                              | Same callback payloads and suppression                       | Package tests                                              |
| close     | Select/Escape/outside press/focus-out close according to props                   | Same ARIA, focus return where applicable, and callback order | Browser and package tests                                  |
| cleanup   | Overlay, listeners, focus scopes, transition timers, and IDs clean up            | Same                                                         | Reopen, focus-out, transition, and multiple-instance tests |

## Accessibility And I18n

| Topic                | Required validation                                                                                     | Evidence                      |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------- |
| Trigger semantics    | Button role, `aria-haspopup`, `aria-expanded`, disabled state, explicit and default accessible names    | done: package and route tests |
| Menu semantics       | Menu/menuitem roles, disabled item semantics, generated IDs, text value, section/submenu behavior       | done: package and route tests |
| Keyboard             | Enter/Space/ArrowDown open, arrow navigation, Home/End where supported, Escape close, Tab/outside close | done: package and route tests |
| Focus                | Initial focus, focus-visible styling, focus return, focus-out close, multiple instance isolation        | done: browser contract/visual |
| I18n                 | Localized more-actions default label; explicit ARIA labels override default                             | done: locale and label tests  |
| Visual accessibility | Forced colors, reduced motion, contrast-sensitive states, target size                                   | done: visual and route tests  |
| Axe/manual semantics | Axe smoke plus direct semantic assertions                                                               | done: route tests             |

## Style Source-To-Computed

| Axis          | Source owner to map                                         | Required Solid proof                                                                                                 |
| ------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Trigger size  | ActionButton `size`                                         | S2 generated class, computed dimensions, and default pair diff for the closed trigger pass                           |
| Quiet state   | ActionButton `isQuiet`                                      | Closed trigger quiet computed parity passes                                                                          |
| Disabled      | ActionButton/MenuItem disabled state                        | Trigger ARIA, suppressed interaction, computed visual state, disabled item semantics, and selection suppression pass |
| Menu size     | Menu `size` from ActionMenu `menuSize`                      | item/menu typography, padding, min width                                                                             |
| Overlay       | MenuTrigger placement props and Popover transition branches | align/direction/flip geometry, opacity/translate transitions, delayed cleanup, and keyboard focus restoration pass   |
| Focus/hover   | ActionButton/Menu interactive states                        | trigger focus-visible, hover, and pressed visual coverage                                                            |
| Forced colors | S2 style branches                                           | computed parity under forced-colors plus strict trigger and bounded open-menu visual evidence                        |
| Unsafe/styles | ActionButton style passthrough                              | class/style forwarding without comparison CSS patching                                                               |

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
  - focus-out blur close and ARIA cleanup;
  - placement axes;
  - disabled trigger/items;
  - shouldCloseOnSelect.
- Visual tests:
  - strict default closed trigger pair diff;
  - trigger hover, focus-visible, and pressed visual states;
  - strict open menu pair diff when stable;
  - popover entering/exiting transition lifecycle;
  - computed style parity for trigger, menu surface, item rows, labels,
    descriptions, keyboard shortcuts, icons, focus, and forced-colors states.
- Final gates:
  - `vp run comparison:report:gaps`
  - `vp run comparison:report:exports`
  - focused package tests
  - focused Playwright contract/visual specs
  - `vp run comparison:build`
  - `vp run check`
