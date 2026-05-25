# Menu Validation Notes

## Target

- Component: Menu
- Slug: menu
- Family or direct subcomponents: MenuContext, MenuTrigger, MenuItem,
  MenuSection, SubmenuTrigger, UnavailableMenuItemTrigger,
  ContextualHelpPopover, Collection, Text, Keyboard, Header, Heading, Content
- Pass goal: bring Menu from a tracked route/export gap to live React/Solid
  comparison parity with the official `MenuTrigger` + `ActionButton` + `Menu`
  composition, public `./Menu` subpath exports, trigger/menu sizing, placement
  axes, selection modes, action dispatch, overlay cleanup, and strict default
  trigger/open-menu visual evidence.
- Date: 2026-05-17

## Task Status

| Task                   | Status | Evidence                                                                                                                       | Blocker or next action |
| ---------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| 0 Research             | done   | S2 Menu docs, installed `@react-spectrum/s2@1.3.0` Menu source/export surface, existing Solid Menu/ActionMenu source and tests | None                   |
| 1 Baseline             | done   | Before pass: Menu was a missing/gap catalogue entry and `MenuContext` was missing from S2 value exports                        | None                   |
| 2 Route harness        | done   | `menu-demo.ts`, controls, manifest entry, React/Solid styled fixtures, visual-state rows, `menu-contract.spec.ts`              | None                   |
| 3 Source map/API       | done   | `MenuContext`, `./Menu` subpath, export-map/build entries, top-level `MenuTrigger` composition, placement options              | None                   |
| 4 Cross-layer audit    | done   | ActionButton/MenuTrigger ARIA and ref ownership, Popover placement, MenuContext slots, MenuItem refs/styles, selection paths   | None                   |
| 5 Transitions          | done   | Browser contract covers open, keyboard open, Escape, outside close, focus restore, and route default reset                     | None                   |
| 6 State                | done   | Route tests cover action, open-change, disabled trigger, omitted defaults, and multiple selection state                        | None                   |
| 7 ARIA hooks           | done   | Package and route tests cover menu-button ARIA, `aria-controls`, menu roles, keyboard open, Escape cleanup, and focus restore  | None                   |
| 8 Headless             | done   | Existing direct Menu tests plus new top-level MenuTrigger composition cover headless Menu/Button/Popover integration           | None                   |
| 9 Styled S2            | done   | Generated S2 menu/item styling, trigger ActionButton styling, pressScale, and strict trigger/open-menu pair diffs              | None                   |
| 10 Runtime lifecycle   | done   | `menu-contract.spec.ts` and `menu-visual.spec.ts` cover route lifecycle and current visual/computed contracts                  | None                   |
| 11 Harness integrity   | done   | Current reports list Menu live on both sides, no longer in missing/gap entries                                                 | None                   |
| 12 Comparison evidence | done   | Contract spec, visual spec, focused package tests, build, and reports pass                                                     | None                   |
| 13 Acceptance          | done   | Menu pass accepted for route/API/export/source slice and default/open visual parity                                            | None                   |

## Gate Outcome Summary

| Gate                                     | Outcome | Evidence                                                                                                                           | Blockers/owner |
| ---------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | done    | Route uses documented `MenuTrigger` + `ActionButton` + `Menu` composition with modeled public controls                             | None           |
| External Authority And Standards         | done    | React Aria/RAC menu behavior is covered through the shared Menu stack; browser route checks assert menu-button semantics directly  | None           |
| Upstream React Source Parity             | done    | Public values, contexts, subpath exports, trigger options, item slots, selection, and placement owners mapped to Solid files/tests | None           |
| Solid Idiomatic Implementation           | done    | Reactive context props, refs, DOM ARIA sync, event listeners with cleanup, and lazy children are covered                           | None           |
| Accessibility And I18n                   | done    | Accessible trigger/menu names, ARIA state, keyboard open/Escape, focus restore, disabled trigger, and ID integrity covered         | None           |
| Behavior State Machine                   | done    | Open/close, action, outside press, keyboard, controlled route state, disabled suppression, and selection updates covered           | None           |
| Style Source-To-Computed Parity          | done    | Trigger and open menu have strict zero-tolerance pair diffs plus computed style contracts against React Spectrum                   | None           |
| React-Vs-Solid Comparison Harness Parity | done    | Both fixtures receive identical demo props and route tests prove controls update both mounted stacks                               | None           |
| Evidence And Handoff                     | done    | Verification commands and refreshed reports recorded below                                                                         | None           |

## Acceptance Gate Checklist

### 1. Official Docs And Viewer Parity

- [x] Live official S2 Menu API recorded: `MenuTrigger` supports `align`,
      `direction`, `shouldFlip`, `defaultOpen`, `isOpen`, `onOpenChange`, and
      `trigger`; `Menu` supports collection, action, selection, close,
      focus-wrap, size, slot, and style props; `MenuItem` supports label,
      description, keyboard, link, ref, style, and close-on-select props.
- [x] Primary docs composition recorded:
      `MenuTrigger` wraps `ActionButton` and `Menu`.
- [x] Comparison route default matches the documented composition:
      trigger label "Layer actions", menu items Copy/Duplicate/Delete, text
      description slots, keyboard shortcuts, and icon slots.
- [x] Viewer controls modeled:
      `triggerSize`, `size`, `align`, `direction`, `shouldFlip`,
      `selectionMode`, and `isDisabled`.
- [x] Route tests assert defaults, control options, omitted-prop reset, mounted
      DOM changes, disabled trigger, selection state, and cleanup.

### 2. External Authority And Standards

- [x] S2/RAC Menu behavior covered through installed source and the existing
      shared Menu stack.
- [x] Browser route assertions check menu-button ARIA, menu/menuitem roles,
      accessible names, keyboard open via ArrowDown, Escape cleanup, focus
      restore, and ARIA ID integrity.
- [x] Source disagreement recorded:
      React may expose `aria-haspopup="true"` while Solid exposes
      `aria-haspopup="menu"`; the route contract accepts either allowed value
      and keeps the rest of the ARIA state strict.

### 3. Upstream React Source Parity

- [x] Upstream owners identified:
      `@react-spectrum/s2/src/Menu.tsx`, `exports/Menu.ts`, RAC Menu/MenuTrigger
      behavior, ActionButton, and Popover.
- [x] Solid owners identified:
      `packages/solid-spectrum/src/menu/index.tsx`,
      `packages/solid-spectrum/src/menu/menu-context.ts`,
      `packages/solid-spectrum/src/button/ActionButton.tsx`,
      `packages/solid-spectrum/src/Menu.ts`, root export barrel,
      `package.json`, and `vite.config.ts`.
- [x] Public values mapped:
      `Menu`, `MenuContext`, `MenuItem`, `MenuSection`, `MenuTrigger`,
      `SubmenuTrigger`, `UnavailableMenuItemTrigger`, `Collection`,
      `ContextualHelpPopover`, `Text`, `Keyboard`, `Header`, `Heading`, and
      `Content` from the `./Menu` subpath.
- [x] Public props/defaults mapped:
      size defaults, placement defaults, shouldFlip default, slot/context
      merging, item `styles`/`UNSAFE_*`, refs, and selection/action props.
- [x] Export report confirms `MenuContext` is no longer missing.

### 4. Solid Idiomatic Implementation

- [x] MenuContext slotted props remain reactive and local props override context.
- [x] MenuTrigger placement options flow through Solid contexts into Popover
      without creating a barrel cycle.
- [x] ActionButton registers with the surrounding MenuTrigger/PopoverTrigger
      context and keeps menu-button ARIA reactive after open/close.
- [x] DOM keyboard listeners added for ArrowDown/ArrowUp have cleanup.
- [x] MenuItem supports Solid refs and style accessors without snapshotting
      render state.

### 5. Accessibility And I18n

- [x] Trigger role/name and menu-button ARIA state covered in package and route
      tests.
- [x] Menu roles and item roles covered for action and selection modes.
- [x] Keyboard open, Escape close, outside close, focus restore, and disabled
      trigger suppression covered.
- [x] ARIA ID integrity covered: trigger `aria-controls` points at the open
      menu and is removed after cleanup.
- [x] Locale-specific default label is owned by ActionMenu; direct Menu route
      uses explicit labels.

### 6. Behavior State Machine

- [x] Default route mount and omitted-prop reset covered.
- [x] Pointer open -> action click -> close and callback payload covered.
- [x] Keyboard focus -> ArrowDown open -> Escape close -> focus restore covered.
- [x] Outside pointer close and open-change state reset covered.
- [x] Multiple selection mode toggles selected keys without diverging from
      React Spectrum route behavior.
- [x] Disabled trigger suppresses opening on both stacks.

### 7. Style Source-To-Computed Parity

- [x] Trigger uses the same S2 ActionButton style path as React Spectrum and
      now has strict zero-tolerance pair-diff evidence.
- [x] Open Menu popover has strict zero-tolerance pair-diff evidence.
- [x] Computed trigger styles match React Spectrum across default, XS, XL, and
      disabled viewer axes.
- [x] Computed open-menu styles and geometry match React Spectrum for the menu
      surface, first item, icon, label, description, and keyboard shortcut
      slots.
- [x] Comparison app CSS only lays out the fixture row; component style remains
      owned by generated S2 classes.

### 8. React-Vs-Solid Comparison Harness Parity

- [x] React fixture imports current upstream S2 `MenuTrigger`, `ActionButton`,
      `Menu`, `MenuItem`, `Text`, and `Keyboard`.
- [x] Solid fixture imports the package public API.
- [x] Both fixtures receive identical normalized props from `menu-demo.ts`.
- [x] Route tests prove controls update mounted React and Solid DOM.
- [x] Visual tests prove default trigger and open menu pair-diff parity.

### 9. Evidence And Handoff

- [x] Focused package tests:
      `vp test packages/solid-spectrum/test/Menu.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/regression.test.tsx`
      (`109` passed).
- [x] Focused Playwright route contract:
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/menu-contract.spec.ts --reporter=line --workers=1`
      (`4` passed).
- [x] Focused Playwright visual contract:
      `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/menu-visual.spec.ts --reporter=line --workers=1`
      (`4` passed).
- [x] Comparison build:
      `vp run --filter @proyecto-viviana/comparison build` (`70` pages,
      including `/components/menu`).
- [x] Refreshed reports:
      `vp run comparison:report:gaps` now reports `37` styled entries live on
      both sides, `32` missing/gap entries, `58` visual-evidence states, and
      `40` strict pair-diff states; Menu is not in the missing/gap list.
      `vp run comparison:report:exports` reports `147` Solid value exports and
      `66` missing S2 value exports; `MenuContext` is no longer missing.
- [x] Repo-wide check:
      `vp run check:fix` and `vp run check` passed.

## Baseline And After

- Before this pass:
  - `comparison:report:gaps`: `36` styled entries live on both sides,
    `33` missing/gap entries; Menu was `react=tracked solid=missing`.
  - `comparison:report:exports`: `146` Solid value exports, `67` missing S2
    exports; `MenuContext` was missing.
- After this pass:
  - `comparison:report:gaps`: `37` styled entries live on both sides,
    `32` missing/gap entries; Menu has strict default/open visual evidence.
  - `comparison:report:exports`: `147` Solid value exports, `66` missing S2
    exports; `MenuContext` is exported.

## Files Changed For This Pass

- Package source and exports:
  `packages/solid-spectrum/src/menu/index.tsx`,
  `packages/solid-spectrum/src/menu/menu-context.ts`,
  `packages/solid-spectrum/src/button/ActionButton.tsx`,
  `packages/solid-spectrum/src/Menu.ts`,
  `packages/solid-spectrum/src/ActionMenu.ts`,
  `packages/solid-spectrum/src/index.ts`,
  `packages/solid-spectrum/package.json`,
  `packages/solid-spectrum/vite.config.ts`,
  `macro-emitted package CSS`.
- Package tests:
  `packages/solid-spectrum/test/Menu.test.tsx`,
  `packages/solid-spectrum/test/ActionMenu.test.tsx`,
  `packages/solid-spectrum/test/regression.test.tsx`,
  `packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap`.
- Comparison route and evidence:
  `apps/comparison/src/data/menu-demo.ts`,
  `apps/comparison/src/data/component-controls.ts`,
  `apps/comparison/src/data/comparison-manifest.ts`,
  `apps/comparison/src/data/visual-state-matrix.ts`,
  `apps/comparison/src/components/react/fixtures/styled.jsx`,
  `apps/comparison/src/components/solid/fixtures/styled.tsx`,
  `apps/comparison/src/styles/global.css`,
  `apps/comparison/e2e/menu-contract.spec.ts`,
  `apps/comparison/e2e/menu-visual.spec.ts`.

## Final Status

Accepted for this Menu component pass. Remaining catalogue gaps are owned by
other components listed in the refreshed global reports.
