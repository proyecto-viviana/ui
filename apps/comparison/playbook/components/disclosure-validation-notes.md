# Disclosure Validation Notes

Date: 2026-05-22
Status: accepted

## Target

- Component: Disclosure
- Slug: `disclosure`
- Family or direct subcomponents: `Disclosure`, `DisclosureHeader`,
  `DisclosureTitle`, `DisclosurePanel`, `DisclosureGroup`,
  `DisclosureTrigger`, `createDisclosure`, and `createDisclosureState`.
- Pass goal: accept Disclosure under the current full gate model with parity
  for S2 composition, size, density, quiet and disabled states, controlled
  expansion, header actions, panel semantics, trigger interaction states, RTL,
  reduced motion, forced colors, and public package subpath exports.

## Task Status

| Task                   | Status   | Evidence                                                                                                       |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | React Spectrum S2 Disclosure docs/source, React Aria Disclosure docs/source, Solid state/headless/styled code. |
| 1 Baseline             | complete | `comparison:report:gaps`, `comparison:report:exports`, current Disclosure package tests.                       |
| 2 Route harness        | complete | Disclosure manifest entry, controls, React/Solid fixtures, and `e2e/disclosure-visual.spec.ts`.                |
| 3 Source map/API       | complete | Upstream S2 source, RAC Disclosure source behavior, and Solid owner files mapped below.                        |
| 4 Cross-layer audit    | complete | State, ARIA hook, headless component, styled S2 wrapper, comparison route, and reports mapped.                 |
| 5 Transitions          | complete | Expanded/collapsed, hover, pressed, focus-visible, reduced-motion, forced-colors, and disabled covered.        |
| 6 State                | complete | `createDisclosureState` coverage through existing Disclosure tests.                                            |
| 7 ARIA hooks           | complete | `packages/solidaria/src/disclosure/createDisclosure.ts` and focused hook tests.                                |
| 8 Headless             | complete | `packages/solidaria-components/src/Disclosure.tsx` and focused component tests.                                |
| 9 Styled S2            | complete | `packages/solid-spectrum/src/disclosure/index.tsx`, generated CSS, package export shim, and browser checks.    |
| 10 Runtime lifecycle   | complete | Panel measurement, `hidden=until-found`, press state, hover state, and transition branches audited.            |
| 11 Harness integrity   | complete | React imports real S2 Disclosure; Solid imports public S2 package/subpath; route props are shared.             |
| 12 Comparison evidence | complete | Focused package, typecheck, build, Playwright, gaps, exports, root check, and whitespace gates below.          |
| 13 Acceptance          | complete | No accepted Disclosure blockers remain; remaining catalogue/export gaps belong to other components.            |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                       | Files changed                                                                                                                                                        | Evidence added                                                                                                                               | Commands run                                                                       | Blockers | Next owner |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2/RAC docs through MCP/skills; installed S2 source; Solidaria hook/headless/styled source; comparison fixtures. | Disclosure hook/headless/styled files, package subpath export config, comparison data/fixtures/controls/matrix/e2e spec, generated CSS, this note, component README. | S2 viewer controls, route fixture, exact pair diffs, computed S2 style contract, trigger interaction contract, semantic callback assertions. | Focused package, typecheck, build, Playwright, gaps, exports, root check commands. | none     | none       |

## Acceptance Gate Checklist

- [x] Official Docs And Viewer Parity
- [x] External Authority And Standards
- [x] Upstream React Source Parity
- [x] Solid Idiomatic Implementation
- [x] Accessibility And I18n
- [x] Behavior State Machine
- [x] Style Source-To-Computed Parity
- [x] React-Vs-Solid Comparison Harness Parity
- [x] Known Defects And Regression Protection
- [x] Evidence And Handoff

## Gate Outcome Summary

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                                     | Blockers/owner |
| ---------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 docs checked on 2026-05-22. Route covers `size`, `density`, `isQuiet`, `isDisabled`, `isExpanded`, `DisclosureHeader` action content, panel role selection, and title `level`.                                                            | none           |
| External Authority And Standards         | complete | React Aria docs/source define the heading + trigger button + panel model, `aria-expanded`, `aria-controls`, panel labelling, disabled suppression, and height transition variables.                                                          | none           |
| Upstream React Source Parity             | complete | Installed S2 `Disclosure.tsx` maps root, title, header, action button sizing context, chevron rotation, panel filtering, inner padding, and forced-colors/reduced-motion branches.                                                           | none           |
| Solid Idiomatic Implementation           | complete | Accessors remain live across state/context/render props; children remain lazy; press and hover state are accessor-backed; refs use Solid semantics; panel measurement effects already own cleanup through Solid lifecycle.                   | none           |
| Accessibility And I18n                   | complete | Browser contract compares trigger role/name/id/type, `aria-expanded`, `aria-controls`, panel ids, `aria-labelledby`, hidden state, disabled state, heading level, action separation, RTL direction, and forced-colors disabled text.         | none           |
| Behavior State Machine                   | complete | Browser tests cover controlled expanded state, callback counts/payloads, collapsed/expanded panel visibility, disabled suppression, header action no-toggle behavior, hover, pressed, focus-visible, RTL, reduced motion, and forced colors. | none           |
| Style Source-To-Computed Parity          | complete | Browser tests compare root borders/min-width/color/background, header layout, heading layout, trigger typography/spacing/background/focus ring, chevron path/rotation, panel height/overflow/transition, inner padding, and action sizing.   | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2/Disclosure`; Solid fixture imports public `@proyecto-viviana/solid-spectrum`; both receive normalized shared route props and locale/theme.                                                         | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: missing route, missing S2 hover/pressed styling, absent trigger pressed state, package subpath collision, panel role runtime parity, and harness row antialias false positive.                                            | none           |
| Evidence And Handoff                     | complete | Commands below are green; `comparison:report:gaps` lists Disclosure as live/evidenced, and `comparison:report:exports` has no missing catalogue root export.                                                                                 | none           |

## Research

- React Spectrum S2 docs: Disclosure page checked through the S2 MCP on
  2026-05-22. The page documents default composition, controlled expansion,
  `DisclosureHeader` action content, `size`, `density`, `isQuiet`,
  `isDisabled`, `isExpanded`, `onExpandedChange`, `styles`, unsafe props,
  `DisclosureTitle.level`, and `DisclosurePanel.role`.
- React Aria docs: Disclosure page checked through the React Aria MCP on
  2026-05-22. The docs show the unstyled heading + trigger button + panel
  model and explicitly warn that adjacent interactive elements must not be
  interactive children of the heading trigger.
- Installed upstream source:
  - `react-spectrum/packages/@react-spectrum/s2/src/Disclosure.tsx`
  - React Aria Components Disclosure source through the installed package.
- Source disagreement recorded: the S2 docs table exposes
  `DisclosurePanel.role`, and React Aria Components supports `group` and
  `region`, but the installed S2 `DisclosurePanel` source calls
  `filterDOMProps(otherProps)` before rendering `RACDisclosurePanel`, so the
  React Spectrum S2 runtime filters the `role` prop and renders the default
  `group`. Solid S2 matches the upstream S2 runtime. The lower
  `solidaria-components` DisclosurePanel continues to support explicit
  `role="region"` for React Aria parity.

## Official Docs And Viewer Parity

| Docs item       | Official setting/example                                 | Route/control                                      | Status                  |
| --------------- | -------------------------------------------------------- | -------------------------------------------------- | ----------------------- |
| Default content | `DisclosureTitle` plus `DisclosurePanel`.                | Default route with System Requirements content.    | passing                 |
| Expansion       | `isExpanded`, `defaultExpanded`, `onExpandedChange`.     | Controlled `isExpanded` and callback data attrs.   | passing                 |
| Header content  | `DisclosureHeader` with adjacent `ActionButton`.         | `withHeaderAction` route toggle.                   | passing                 |
| Size            | `S`, `M`, `L`, `XL`; default `M`.                        | Size radio group in documented order.              | passing                 |
| Density         | `compact`, `regular`, `spacious`; default `regular`.     | Density radio group in documented order.           | passing                 |
| Quiet           | `isQuiet` removes borders/uses rounded trigger.          | Quiet route and computed style contract.           | passing                 |
| Disabled        | `isDisabled` disables trigger and suppresses callbacks.  | Disabled route, unit tests, and browser semantics. | passing                 |
| Title level     | `DisclosureTitle.level`, default `3`.                    | `2`, `3`, `4` route options.                       | passing                 |
| Panel role      | S2 docs list `group`/`region`, default `group`.          | Control records `region`; runtime remains `group`. | upstream-runtime caveat |
| Viewer canvas   | Width and route surface must not patch component styles. | Exact pair target is the component root child.     | passing                 |

## Source Map And Public Contract

| Layer               | Upstream files                                  | Solid files                                                                                                       | Status  |
| ------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| State               | React Stately/RAC Disclosure state              | `packages/solid-stately/src/disclosure/*`                                                                         | matched |
| ARIA hooks          | React Aria disclosure behavior                  | `packages/solidaria/src/disclosure/createDisclosure.ts`                                                           | matched |
| Headless components | `react-aria-components` Disclosure components   | `packages/solidaria-components/src/Disclosure.tsx`                                                                | matched |
| Styled S2           | `@react-spectrum/s2/src/Disclosure.tsx`         | `packages/solid-spectrum/src/disclosure/index.tsx`, `src/disclosure-export.ts`, `macro-emitted package CSS`       | matched |
| Comparison route    | S2 docs/viewer and React fixture from S2 source | `apps/comparison/src/data/disclosure-demo.ts`, fixtures, controls, visual matrix, `e2e/disclosure-visual.spec.ts` | matched |

## Behavior State Machine

| State/input      | Trigger                      | Expected React Spectrum                                           | Expected Solid | Evidence                            |
| ---------------- | ---------------------------- | ----------------------------------------------------------------- | -------------- | ----------------------------------- |
| Expanded default | Route mount                  | Trigger `aria-expanded=true`, panel visible, callback count zero. | Same.          | Browser semantics test.             |
| Collapse         | Trigger click                | `onExpandedChange(false)`, panel hidden, count increments once.   | Same.          | Browser semantics test.             |
| Header action    | Adjacent action button click | Action does not nest in trigger and does not toggle disclosure.   | Same.          | Browser semantics test.             |
| Disabled         | Forced trigger click         | Disabled button suppresses toggle and callback.                   | Same.          | Browser and package tests.          |
| Hover            | Pointer hover                | `data-hovered` and S2 hover background.                           | Same.          | Browser interaction style contract. |
| Pressed          | Pointer down                 | `data-pressed` and S2 pressed background.                         | Same.          | Browser interaction style contract. |
| Focus visible    | Keyboard/focus               | Focus-visible ring, offset, and radius branch.                    | Same.          | Browser interaction style contract. |
| RTL              | `ar-SA` route locale         | Provider `dir=rtl`; expanded chevron runtime rotation matches.    | Same.          | Browser style and exact pair tests. |
| Reduced motion   | Media emulation              | Panel transition property becomes `none`.                         | Same.          | Browser environment style contract. |
| Forced colors    | Media emulation              | System color branches, including disabled text, match.            | Same.          | Browser environment style contract. |

## Accessibility And I18n

- The disclosure title renders a heading at the requested level containing a
  native button trigger with generated id, `type="button"`, `aria-expanded`,
  and `aria-controls`.
- The panel renders a generated id, `aria-labelledby` pointing to the trigger,
  `aria-hidden`, and `hidden="until-found"` when collapsed.
- `DisclosureHeader` action content is a sibling of the title trigger, not an
  interactive child of the trigger button, matching the React Aria docs risk.
- `isDisabled` disables the trigger and suppresses expansion callbacks.
- RTL is covered with `ar-SA`; the route provider direction, computed
  direction, chevron rotation, and exact pair screenshot are compared.
- Reduced motion and forced colors are compared in browser media emulation.
- Dedicated assistive-technology transcript capture remains process-wide
  tooling debt; this pass includes DOM, keyboard/pointer interaction, and
  browser parity assertions.

## Style Source-To-Computed Parity

- Root styles map S2 border widths, quiet/group border suppression, border
  color, text color, min width, and background.
- Header styles map the flex row, center alignment, and 4px action gap.
- Title styles map margin reset, flex growth/shrink, display, and min width.
- Trigger styles map S2 typography, font weight, line height, min height by
  size/density, padding, gap, width, transparent/default/hover/pressed/focus
  background, border reset, quiet/focus radius, outline, and disabled color.
- Chevron styles map S2 path data, current-color fill variable, flex shrink,
  transition, size, and rotate branches.
- Panel styles map body font, `--disclosure-panel-height`, overflow clipping,
  reduced-motion transition, and inner padding by size.
- Exact visual pair diffs target the actual Disclosure component child instead
  of the comparison row wrapper. This avoids a harness-row border-radius
  antialias false positive while preserving exact component-pixel evidence.

## Known Defects And Regression Protection

| Finding source  | Defect or risk                                                                                   | Class           | Blocking? | Regression evidence or owner                                                          |
| --------------- | ------------------------------------------------------------------------------------------------ | --------------- | --------- | ------------------------------------------------------------------------------------- |
| Current pass    | Disclosure was missing comparison route controls and visual-state coverage.                      | harness gap     | no        | Manifest, controls, fixtures, visual matrix, modeled controls, and e2e suite.         |
| Current pass    | Solid S2 trigger did not expose hover/pressed runtime style states matching React Spectrum.      | style bug       | no        | `createDisclosure.isPressed`, trigger data attrs, hover/pressed/focus browser test.   |
| Current pass    | `./Disclosure` package subpath collided with the `src/disclosure` directory in build output.     | export bug      | no        | `disclosure-export.ts`, package exports, Vite Plus entries, build and export report.  |
| Current pass    | S2 docs list panel `role`, while S2 runtime filters it before RAC receives it.                   | upstream caveat | no        | Route control and computed style/a11y contract assert both stacks render `group`.     |
| Current pass    | Exact screenshot originally caught outer comparison-row antialiasing instead of component drift. | harness bug     | no        | Exact helper targets the Disclosure child and keeps component pixels strict.          |
| Current reports | Catalogue/export gaps could affect Disclosure acceptance.                                        | report risk     | no        | Gap report lists Disclosure live/evidenced; export report has no missing root export. |

## Commands

- `vp test run packages/solidaria/test/createDisclosure.test.tsx`
  - `9` tests passed.
- `vp test run packages/solidaria-components/test/Disclosure.test.tsx`
  - `33` tests passed.
- `vp test run packages/solid-spectrum/test/Disclosure.test.tsx`
  - `4` tests passed.
- `vp run comparison:typecheck`
  - comparison Astro check passed with `0` errors, `0` warnings, `0` hints.
- `vp run comparison:build`
  - comparison build passed and generated `70` static pages including
    `/components/disclosure/index.html`.
- `vp run comparison:report:gaps`
  - report passed; `69` official entries tracked, `55` live on both sides,
    `14` remaining missing/gap entries outside this pass, `295` visual states
    tracked, `85` evidenced visual states, and `48` strict pair-diff states.
- `vp run comparison:report:exports`
  - report passed; `0` missing catalogue root exports, `33` missing
    non-root/support exports outside this pass, and `5` extra Solid exports
    including compatibility `DisclosureGroup`/`DisclosureTrigger`.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/disclosure-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep Disclosure --reporter=line --workers=1`
  - `7` browser tests passed.
- `vp run check`
  - formatting, lint, and root TypeScript check passed.
- `git diff --check`
  - no whitespace errors.

## Remaining Gaps

- React Spectrum S2's docs/runtime disagreement for `DisclosurePanel.role` is
  recorded as an upstream caveat, not a Solid parity blocker. If upstream S2
  starts forwarding `role`, the browser contract should be updated and Solid S2
  should remove its matching filter.
- Remaining catalogue/export gaps reported by the comparison app are outside
  Disclosure ownership.
