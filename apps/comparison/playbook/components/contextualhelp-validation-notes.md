# ContextualHelp Validation Notes

## Target

- Component: ContextualHelp
- Slug: contextualhelp
- Family or direct subcomponents: ContextualHelp, ContextualHelpPopover,
  ContextualHelpContext, Heading, Content, Footer
- Pass goal: align the S2 ContextualHelp public surface, trigger, popover
  source geometry, touch behavior, menu-helper composition, comparison route,
  and current visual evidence.
- Date: 2026-05-21

## Task Status

| Task                   | Status | Evidence                                                                                             | Blocker or next action |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 ContextualHelp API via S2 MCP; React Aria Tooltip Interactions via MCP; installed React S2 source | None                   |
| 1 Baseline             | done   | Prior note showed partial source/style parity and planned open-popover pair-diff                     | None                   |
| 2 Route harness        | done   | `contextualhelp-demo.ts`, controls, React/Solid fixtures, visual-state rows, browser specs           | None                   |
| 3 Source map/API       | done   | `ContextualHelp`, `ContextualHelpPopover`, `ContextualHelpContext`, root exports, localized labels   | None                   |
| 4 Cross-layer audit    | done   | Main popover, unavailable menu helper, ActionButton trigger, PopoverTrigger state, slots, refs       | None                   |
| 5 Transitions          | done   | Open/close state delegates to PopoverTrigger/SubmenuTrigger overlay paths                            | None                   |
| 6 State                | done   | Controlled open route and package signal tests                                                       | None                   |
| 7 ARIA hooks           | done   | Trigger labels, dialog relationships, heading ids, aria-details, menu unavailable description        | None                   |
| 8 Headless             | done   | PopoverTrigger and menu SubmenuTrigger integration covered by package tests                          | None                   |
| 9 Styled S2            | done   | Trigger, popover frame, dialog inner, Heading/Content/Footer slots, menu-helper defaults, pair-diff  | None                   |
| 10 Runtime lifecycle   | done   | Press/touch open, controlled close guard, menu hover open, portal dialog assertions                  | None                   |
| 11 Harness integrity   | done   | Modeled controls contract and visual-state matrix updated                                            | None                   |
| 12 Comparison evidence | done   | Focused package tests, comparison build, ContextualHelp visual spec, modeled-controls grep           | None                   |
| 13 Acceptance          | done   | Current-gate checklist normalized and component README updated                                       | None                   |

## Agent Workflow

| Agent role | Files read                                                                                                                                   | Files changed                                                                                                                                                                                                                                                                        | Evidence added                                                                                                  | Commands run                                                                                                                                                                                                                                                                                                                                                                                                                      | Blockers | Next owner |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 and React Aria MCP docs; React S2 `ContextualHelp.tsx`, `Menu.tsx`, legacy menu helper source; Solid ContextualHelp/Menu tests and source | `packages/solid-spectrum/src/contextualhelp/index.tsx`, root exports, intl files, package tests, React/Solid fixtures, `apps/comparison/e2e/contextualhelp-visual.spec.ts`, `component-controls.ts`, `visual-state-matrix.ts`, `comparison-manifest.ts`, this note, component README | Open-popover pair-diff now asserted; source note records main `offset={8}` pin and menu-helper submenu defaults | `vp test run packages/solid-spectrum/test/ContextualHelpTrigger.test.tsx`; `vp test run packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`; `vp run --filter @proyecto-viviana/comparison build`; `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/contextualhelp-visual.spec.ts --reporter=line`; modeled-controls grep | none     | none       |

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                              | Blockers/owner |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 API shows `ContextualHelp` with `Heading`, `Content`, `Footer`, `variant`, `size`, placement geometry, controlled open state, refs/styles/UNSAFE props, and ARIA props. Route controls model them. | none           |
| External Authority And Standards         | complete | React Aria Tooltip Interactions says touch interactions do not show tooltips and points to Popover for adjacent information. ContextualHelp uses a press-open dialog popover.                         | none           |
| Upstream React Source Parity             | complete | React S2 main `ContextualHelp` source uses ActionButton, Popover padding none, `offset={8}`, wrapper width/padding, and dialog inner negative margin. Solid mirrors those computed branches.          | none           |
| Solid Idiomatic Implementation           | complete | Reactive accessors, lazy content providers, Solid refs/context merging, controlled/uncontrolled state, and localized variant labels are covered by package tests.                                     | none           |
| Accessibility And I18n                   | complete | Package/browser tests cover accessible trigger labels, dialog names, aria-details, heading ids, menu unavailable label, and English/Spanish strings.                                                  | none           |
| Behavior State Machine                   | complete | Tests cover default/help/info variants, controlled open/close, touch-like press open, legacy `content` alias, Heading/Content/Footer slots, and menu unavailable hover open.                          | none           |
| Style Source-To-Computed Parity          | complete | Browser pair-diff covers the open popover. Solid frame/inner styles match React computed geometry, including the `-24px` inner margin that React derives from `self(paddingTop)`.                     | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2` ContextualHelp; Solid fixture imports public solid-spectrum API; modeled controls update both stacks; visual spec asserts both dialogs.                    | none           |
| Evidence And Handoff                     | complete | Verification commands and refreshed comparison metadata are recorded here.                                                                                                                            | none           |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Official S2 ContextualHelp API checked through S2 MCP on 2026-05-21.
- [x] Primary docs composition recorded:
      `ContextualHelp > Heading + Content + Footer`.
- [x] Route controls cover trigger label, heading, content, footer, variant,
      ActionButton size, placement, crossOffset, containerPadding, controlled
      open state, and shouldFlip.
- [x] Offset remains visible in serialized route/API props, while rendered main
      popover geometry follows React S2's hard-coded `offset={8}`.
- [x] Browser route tests assert visible defaults/options and mounted DOM
      changes.

### 2. External Authority And Standards

- [x] React Aria Tooltip Interactions checked through MCP.
- [x] Touch caveat mapped to ContextualHelp: touch-essential help uses a
      press-open Popover/Dialog path instead of Tooltip.
- [x] No conflicting APG pattern was required for this icon-triggered dialog
      popover beyond name, role, value, keyboard, and focus relationship checks.

### 3. Upstream React Source Parity

- [x] Upstream S2 files identified:
      `react-spectrum/packages/@react-spectrum/s2/src/ContextualHelp.tsx`,
      `react-spectrum/packages/@react-spectrum/s2/src/Popover.tsx`,
      `react-spectrum/packages/@react-spectrum/s2/src/Dialog.tsx`, and
      `react-spectrum/packages/@react-spectrum/s2/src/Menu.tsx`.
- [x] Solid owners identified:
      `packages/solid-spectrum/src/contextualhelp/index.tsx`,
      `packages/solid-spectrum/src/popover`, and `packages/solid-spectrum/src/menu`.
- [x] Main ContextualHelp mirrors React S2 ActionButton trigger, default variant
      and size, placement default, `offset={8}`, container padding, flip, hidden
      arrow, popover padding none, 268px wrapper, 24px frame padding, and 24px
      dialog inner padding with `-24px` computed margin.
- [x] Menu unavailable helper defaults match React S2 SubmenuTrigger popover
      context: `placement: "end top"`, `offset: -2`, `crossOffset: -8`.
- [x] Public exports now include `ContextualHelpContext` and the contextual help
      props needed by S2 slots/styles.

### 4. Solid Idiomatic Implementation

- [x] Props are read through accessors after `splitProps`; controlled open state
      remains reactive.
- [x] Children remain lazy inside Text/Content/Footer/Heading providers.
- [x] Context styles, class names, unsafe styles, and refs merge with slotted
      context values.
- [x] Localized trigger labels update from variant and explicit label inputs.
- [x] The inline `margin: "-24px"` is internal-only and used because the local
      style macro returned negative margin class names that were not emitted to
      generated CSS for this component.

### 5. Accessibility And I18n

- [x] Trigger accessible names include localized Help/Information labels.
- [x] Explicit trigger labels are preserved and disambiguated with the variant
      label.
- [x] Dialogs are named by heading/trigger as appropriate and expose resolvable
      relationships.
- [x] `aria-details`, `aria-labelledby`, `aria-describedby`, ids, and refs are
      covered by package tests.
- [x] Menu unavailable icon label is localized through `menu.unavailable`;
      ContextualHelp variant labels are localized in English and Spanish.

### 6. Behavior State Machine

- [x] Default uncontrolled press path opens and closes through PopoverTrigger.
- [x] Controlled `isOpen` and `onOpenChange` route path is asserted in package
      tests and Playwright.
- [x] Touch-like press opens ContextualHelp, covering the Tooltip touch caveat.
- [x] Variant, size, placement, crossOffset, containerPadding, shouldFlip, and
      serialized offset are routed through both comparison stacks.
- [x] Unavailable menu item hover opens the contextual help dialog through the
      submenu trigger path.

### 7. Style Source-To-Computed Parity

- [x] Trigger uses S2 ActionButton quiet icon styling.
- [x] Popover uses hidden arrow and no popover padding.
- [x] Surface geometry matches React S2: 268px outer width, 24px frame padding,
      inner dialog padding with negative margin, `heading-xs`, `body-sm`, and
      footer margin top.
- [x] Open-popover React-vs-Solid pair-diff is asserted by
      `e2e/contextualhelp-visual.spec.ts`.
- [x] Menu-helper popover keeps the React S2 submenu placement offsets rather
      than the main ContextualHelp `offset={8}` branch.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React styled fixture imports current upstream `@react-spectrum/s2`
      ContextualHelp.
- [x] Solid styled fixture imports public `@proyecto-viviana/solid-spectrum`
      ContextualHelp.
- [x] Both fixtures receive the same normalized route props and render
      Heading/Content/Footer children.
- [x] Modeled-controls contract proves side-panel controls update both mounted
      stacks.
- [x] Visual spec covers controlled open state, routed geometry, and touch-like
      press activation.

### 9. Evidence And Handoff

- [x] Focused package test:
      `vp test run packages/solid-spectrum/test/ContextualHelpTrigger.test.tsx`
      (`12` passed).
- [x] Menu helper package tests:
      `vp test run packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx`
      (`59` passed).
- [x] Comparison build:
      `vp run --filter @proyecto-viviana/comparison build` (`70` pages).
- [x] Focused visual/browser spec:
      `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/contextualhelp-visual.spec.ts --reporter=line`
      (`3` passed).
- [x] Focused modeled-controls contract:
      `COMPARISON_BASE_URL=http://127.0.0.1:4324 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/modeled-controls-contract.spec.ts --grep "ContextualHelp" --reporter=line`
      (`1` passed).
- [x] Closeout reports:
      `vp run --filter @proyecto-viviana/comparison report:gaps`,
      `vp run --filter @proyecto-viviana/comparison report:exports`,
      `vp run guard:rac-parity`, and `vp run guard:rac-export-gap`.
- [x] Full repo check:
      `vp run check` found formatting issues, then `vp run check:fix` completed
      formatting, lint, and typecheck.

## Source Branch Ledger

| Branch                  | React source behavior                                                                                                                       | Solid owner                                                 | Status  | Evidence                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------- | -------------------------------------------- |
| Main trigger            | Quiet icon ActionButton, `XS` default, help/info icons, localized accessible name                                                           | `ContextualHelp`                                            | matched | Package tests and visual route               |
| Main popover            | Popover padding none, hidden arrow, placement default `bottom start`, `containerPadding` default 8, `offset={8}`, `shouldFlip` default true | `ContextualHelp`                                            | matched | Visual spec and controls contract            |
| Dialog content          | 268px wrapper, 24px frame, dialog inner negative margin, Heading/Content/Footer slot styles                                                 | `contextualHelpFrame`, `contextualHelpInner`, slot contexts | matched | Open pair-diff and package slot tests        |
| Controlled state        | `isOpen`, `defaultOpen`, `onOpenChange` drive overlay state                                                                                 | `PopoverTrigger` props                                      | matched | Package signal test and Playwright           |
| Menu unavailable helper | Submenu dialog popover at `end top`, offset `-2`, crossOffset `-8`                                                                          | `ContextualHelpPopover`                                     | matched | Menu/ActionMenu package tests and source map |
| Touch-essential help    | Tooltip does not appear on touch; adjacent information should use Popover-like UI                                                           | ContextualHelp press path                                   | matched | Touch-like Playwright test                   |

## Remaining Gaps

- Assistive-technology transcript rows are still not captured for the
  ContextualHelp dialog. This is a cross-suite evidence gap, not a blocking
  source/style/behavior parity gap for this component pass.

## Final Status

Accepted for this ContextualHelp pass: public API, route harness, main popover
geometry, Heading/Content/Footer slots, controlled state, touch press behavior,
menu unavailable helper defaults, i18n, and strict open-popover visual evidence
are in place.
