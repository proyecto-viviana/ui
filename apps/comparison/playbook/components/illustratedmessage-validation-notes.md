# IllustratedMessage Validation Notes

Date: 2026-05-23
Status: accepted

## Target

- Component: IllustratedMessage
- Slug: `illustratedmessage`
- Family or direct subcomponents: `IllustratedMessage`,
  `IllustratedMessageContext`, `Heading`, `Content`, `Illustration`, and
  `ButtonGroup` slot contexts.
- Pass goal: accept IllustratedMessage under the current full gate model with
  docs-style composition, size and orientation controls, ButtonGroup actions,
  S2 grid/typography/illustration styling, DropZone context inheritance, refs,
  context slots, and React Spectrum DOM-prop filtering parity.

## Task Status

| Task                   | Status   | Evidence                                                                                             |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs, installed S2 source, S2 story source, and React Aria `filterDOMProps` behavior.         |
| 1 Baseline             | complete | `comparison:report:gaps` and `comparison:report:exports` refreshed during the component pass.        |
| 2 Route harness        | complete | React/Solid fixtures, modeled controls, and `illustrated-message-visual.spec.ts`.                    |
| 3 Source map/API       | complete | Upstream `IllustratedMessage.tsx`; Solid `src/illustratedmessage/index.tsx`; comparison demo data.   |
| 4 Cross-layer audit    | complete | Styled root, child slot contexts, DOM props, refs, unsafe style/class, and DropZone context mapped.  |
| 5 Transitions          | complete | Static route updates cover size, orientation, with-actions, context size, and DropZone target state. |
| 6 State                | n/a      | No standalone state primitive; source is a styled composition/context component.                     |
| 7 ARIA hooks           | n/a      | No component-specific React Aria hook; only default DOM-prop filtering applies.                      |
| 8 Headless             | n/a      | No separate headless component exists upstream.                                                      |
| 9 Styled S2            | complete | Generated S2 style classes and browser computed contract cover grid, typography, icon, and actions.  |
| 10 Runtime lifecycle   | complete | Context refs, Solid prop liveness, and filtered event-prop suppression covered by package tests.     |
| 11 Harness integrity   | complete | React imports real S2; Solid imports the public package API; both receive identical route props.     |
| 12 Comparison evidence | complete | Focused package test, comparison typecheck/build, Playwright, reports, and diff check passed.        |
| 13 Acceptance          | complete | No IllustratedMessage-owned blockers remain.                                                         |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                      | Files changed                                                                                                                                                                                                                                                                                   | Evidence added                                                                                                           | Commands run                                                                                | Blockers | Next owner |
| ---------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 docs/source/story, React Aria DOM prop filtering source behavior, Solid owner files, routes. | `packages/solid-spectrum/src/illustratedmessage/index.tsx`, `packages/solid-spectrum/test/IllustratedMessage.test.tsx`, React/Solid styled fixtures, `illustratedmessage-demo.ts`, component controls, visual-state matrix, manifest, comparison CSS, and `illustrated-message-visual.spec.ts`. | DOM-filter contract, child slot styles, DropZone context, route controls, variant matrix, and zero-tolerance pair diffs. | Focused package, comparison typecheck/build, Playwright, gaps/exports, diff/check commands. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                        | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 MCP page checked on 2026-05-23. Route uses the official `Illustration`, `Heading`, `Content`, and `ButtonGroup` composition and exposes size/orientation/actions.            | none           |
| External Authority And Standards         | complete | React Aria has no component-specific hook here; the relevant external contract is default `filterDOMProps`, plus semantic nested button/heading behavior.                       | none           |
| Upstream React Source Parity             | complete | Installed S2 root style, child contexts, defaults, and DOM filtering were mapped to Solid owner code and browser/package assertions.                                            | none           |
| Solid Idiomatic Implementation           | complete | Context values remain accessor-backed, children stay lazy through providers, refs compose with Solid semantics, and event props are filtered like React.                        | none           |
| Accessibility And I18n                   | complete | Root remains a generic `div`; `id` and `data-*` forward; `role`, labelable ARIA, and arbitrary event props do not. Heading, content, illustration, and buttons remain semantic. | none           |
| Behavior State Machine                   | complete | Route and package tests cover docs default, all size/orientation branches, actions on/off, context override, DropZone target context, and DOM-prop filtering.                   | none           |
| Style Source-To-Computed Parity          | complete | Browser contract compares grid template areas/rows/columns, max width, font styles, illustration sizing, heading/content styles, and ButtonGroup spacing.                       | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2`; Solid fixture imports `@proyecto-viviana/solid-spectrum`; serialized route props and rendered DOM are asserted on both.             | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: missing route, missing modeled controls, permissive Solid DOM props, slot leakage, and missing S2 child slot/action/DropZone context evidence.               | none           |
| Evidence And Handoff                     | complete | Focused tests, comparison typecheck/build, Playwright, gap/export reports, `vp check --fix` precommit hook, and `git diff --check` passed.                                      | none           |

## Research

- S2 docs: IllustratedMessage MCP page checked on 2026-05-23. Public API shows
  `IllustratedMessage` with `Illustration`, `Heading`, `Content`, and
  `ButtonGroup` children.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/IllustratedMessage.tsx`
  - S2 story source in the installed React Spectrum checkout.
  - React Aria default `filterDOMProps` behavior through installed package
    source.
- React Aria docs: no IllustratedMessage-specific primitive found; this is a
  styled S2 composition component.
- APG/W3C/ARIA-AT: no standalone widget pattern applies. Accessibility
  obligations come from preserving generic root semantics and semantic child
  content.
- Source disagreement resolved: the S2 docs page presents the child composition
  only, while installed source defaults `orientation` internally differently in
  destructuring and class generation. Runtime source class generation and
  official viewer defaults are the chosen authority for route parity.

## Official Docs And Viewer Parity

| Docs item   | Official setting/example                                   | Route/control                                       | Status  |
| ----------- | ---------------------------------------------------------- | --------------------------------------------------- | ------- |
| Composition | `Illustration`, `Heading`, `Content`, and `ButtonGroup`.   | Default route renders the same child composition.   | passing |
| Size        | S2 sizes `S`, `M`, and `L`.                                | Side-panel size radios in documented order.         | passing |
| Orientation | `vertical` and `horizontal`.                               | Side-panel orientation radios in documented order.  | passing |
| Actions     | Optional `ButtonGroup` composition.                        | `withActions` checkbox controls action rendering.   | passing |
| DOM props   | S2 root uses default `filterDOMProps`.                     | Route passes id/data/role/ARIA and asserts output.  | passing |
| Viewer      | Same theme, provider, and component canvas for both sides. | Strict pair diffs capture default and horizontal L. | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                                     | Solid files                                                                                                     | Status                                                                                     |
| ------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| State               | none                                                               | none                                                                                                            | Not applicable; no state primitive.                                                        |
| ARIA hooks          | React Aria default `filterDOMProps`                                | `@proyecto-viviana/solidaria` `filterDOMProps`                                                                  | Matched default forwarding boundary.                                                       |
| Headless components | none                                                               | none                                                                                                            | Not applicable; no headless layer.                                                         |
| Styled S2           | `@react-spectrum/s2/src/IllustratedMessage.tsx`, S2 story examples | `packages/solid-spectrum/src/illustratedmessage/index.tsx`, fixtures, demo data, visual spec, generated classes | Matched root styles, child contexts, slots, refs, unsafe escape props, and route controls. |

- Public props/defaults: `children`, `size='M'`, `orientation='vertical'`,
  `styles`, `UNSAFE_className`, `UNSAFE_style`, context slot props, and refs.
- Slots/subcomponents: child `Heading`, `Content`, `Illustration`, and
  `ButtonGroup` receive S2 context styles.
- Contexts/providers: `IllustratedMessageContext` and DropZone-owned
  `isInDropZone`/`isDropTarget` state feed illustration accent styling.
- Unsupported or intentionally different branches: Solid keeps legacy
  `illustration`, `heading`, and `description` shortcuts for compatibility, but
  route and acceptance evidence use the official child composition.

## Behavior State Machine

| State/input             | Trigger                             | Expected React                                                    | Expected Solid | Status  | Evidence                                     |
| ----------------------- | ----------------------------------- | ----------------------------------------------------------------- | -------------- | ------- | -------------------------------------------- |
| Docs default            | Route mount                         | Vertical M message with illustration, heading, content, actions.  | Same.          | matched | Default strict pair diff and DOM contract.   |
| Size branches           | Query/control changes S/M/L         | Root/children style classes update, illustration M or L size.     | Same.          | matched | Browser matrix and package context tests.    |
| Orientation branches    | Query/control vertical/horizontal   | Grid areas, rows, columns, max width, and text alignment update.  | Same.          | matched | Browser matrix contract.                     |
| Actions on/off          | Query/control `withActions`         | ButtonGroup renders or is omitted without changing root contract. | Same.          | matched | Browser route-control and matrix assertions. |
| DOM prop boundary       | Route passes `id`, data, role, ARIA | `id` and `data-*` forward; role and labelable ARIA do not.        | Same.          | matched | Browser root contract and package test.      |
| Context slot override   | Context provider plus local props   | Local props win; refs compose; slot does not leak to root DOM.    | Same.          | matched | Package context/ref test.                    |
| DropZone target context | Context sets drop target true       | Illustration receives accent context styles.                      | Same.          | matched | Package DropZone context test.               |
| Event prop filtering    | Consumer passes `onClick`           | Default DOM filter does not forward global event handler.         | Same.          | matched | Package filtered-event test.                 |

## Accessibility And I18n

| Surface                                             | Upstream/current React                                               | Solid | Status  | Evidence                                           |
| --------------------------------------------------- | -------------------------------------------------------------------- | ----- | ------- | -------------------------------------------------- |
| Role/name/description/value                         | Root is a generic `div`; role and labelable ARIA are filtered.       | Same. | matched | Package and browser root contract.                 |
| ARIA references and generated IDs                   | No root ARIA references survive default DOM filtering.               | Same. | matched | Package and browser root contract.                 |
| Keyboard and focus                                  | No root keyboard model; action buttons use Button/ButtonGroup model. | Same. | matched | Browser text/buttons and existing Button evidence. |
| Disabled/readonly/required/invalid/hidden semantics | Not supported by IllustratedMessage root.                            | Same. | n/a     | Source map.                                        |
| Form labels/help/error/reset/submit                 | Not a form field.                                                    | Same. | n/a     | Source map.                                        |
| Live announcements and cleanup                      | No live region or announcement behavior.                             | Same. | n/a     | Source map.                                        |
| Forced colors/reduced motion/contrast/target size   | Static layout; action target size owned by Button/ButtonGroup.       | Same. | matched | Visual pair diff and Button family evidence.       |
| Locale/direction/formatting/messages                | No component-local strings beyond consumer children.                 | Same. | n/a     | Source map.                                        |
| Multiple instances                                  | No generated root ids; child ids are consumer-owned.                 | Same. | matched | Package ref/context and route contract.            |

## Style Source-To-Computed

| Style branch             | Upstream declaration                                                | Solid owner                                          | Observable proof                                     | Status  |
| ------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | ------- |
| Root grid                | `display: grid`, S2 grid template areas/rows/columns by orientation | `illustratedMessage` style macro                     | Browser computed grid contract.                      | matched |
| Root max width/alignment | Vertical 380px, horizontal 528px, justify/text alignment branches   | `illustratedMessage` style macro                     | Browser computed style contract.                     | matched |
| Heading                  | `HeadingContext` styles by size and orientation                     | `HeadingContext.Provider` with generated styles      | Package class test and browser heading contract.     | matched |
| Content                  | `ContentContext` body font by size                                  | `ContentContext.Provider` with generated styles      | Package class test and browser content contract.     | matched |
| Illustration             | `IllustrationContext` size M/L, grid area, icon primary accent      | `IllustrationContext.Provider` with generated styles | Package illustration size and browser contract.      | matched |
| ButtonGroup              | `ButtonGroupContext` grid area and top margin                       | `ButtonGroupContext.Provider`                        | Package class test and browser ButtonGroup contract. | matched |
| Unsafe overrides         | `UNSAFE_className`, `UNSAFE_style`, `styles` allowed overrides      | context/local merge helpers                          | Package context/override test.                       | matched |

## Known Defects And Regression Protection

| Finding source       | Defect or risk                                                                     | Class       | Blocking? | Regression evidence or owner                                                      |
| -------------------- | ---------------------------------------------------------------------------------- | ----------- | --------- | --------------------------------------------------------------------------------- |
| Current pass         | IllustratedMessage had no live comparison route, controls, visual matrix, or spec. | route gap   | no        | React/Solid fixtures, controls, matrix, and Playwright spec added.                |
| Current pass         | Solid forwarded more root props than React Spectrum default `filterDOMProps`.      | port bug    | no        | Solid now uses shared filter; unit and browser contracts assert the boundary.     |
| Current pass         | `slot` leaked to the root DOM instead of being context selection only.             | port bug    | no        | Unit test asserts slot selection without root `slot` attribute.                   |
| Current pass         | Child slot styles, actions, and DropZone illustration state lacked direct proof.   | style gap   | no        | Package and browser assertions cover child styles, actions, and DropZone context. |
| Current-gate reports | Remaining missing/gap catalogue entries could be confused with this pass.          | report risk | no        | Reports list remaining gaps outside IllustratedMessage ownership.                 |

Canonical scenario smoke:

| Scenario               | React result                                 | Solid result | Status  | Evidence                    |
| ---------------------- | -------------------------------------------- | ------------ | ------- | --------------------------- |
| Empty-state default    | Illustration, heading, content, actions.     | Same.        | matched | Default pair diff.          |
| Horizontal large state | Horizontal grid with L illustration/actions. | Same.        | matched | Horizontal L pair diff.     |
| Control updates        | Controls remount/update rendered props.      | Same.        | matched | Route-control browser test. |

Composition smoke:

| Composition context   | Upstream expectation                                | Solid result | Status  | Evidence                   |
| --------------------- | --------------------------------------------------- | ------------ | ------- | -------------------------- |
| Child composition     | Context styles apply to children.                   | Same.        | matched | Package and browser tests. |
| ButtonGroup actions   | ButtonGroup receives S2 spacing context.            | Same.        | matched | Package and browser tests. |
| DropZone context      | Drop target context can accent the illustration.    | Same.        | matched | Package test.              |
| Slotted context props | Slot props merge with local props and refs compose. | Same.        | matched | Package context/ref test.  |

## Evidence

- `vp test run packages/solid-spectrum/test/IllustratedMessage.test.tsx`
  - `3` focused tests passed.
- `vp run comparison:typecheck`
  - comparison Astro check passed with `0` errors, `0` warnings, `0` hints.
- `COMPARISON_BASE_URL=http://127.0.0.1:4322 vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/illustrated-message-visual.spec.ts --reporter=line`
  - `4` browser tests passed.
- `vp run comparison:build`
  - comparison build passed.
- `vp run comparison:report:gaps`
  - report passed with `69` official entries, `57` live styled entries on both
    sides, and `12` remaining missing/gap entries outside this pass.
- `vp run comparison:report:exports`
  - report passed with `0` missing catalogue root exports.
- `vp check --fix`
  - precommit hook passed while committing the implementation checkpoint.
- `git diff --check`
  - no whitespace errors.

## Blockers

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
| none  | none | none    | none              |

## Handoff

- Status after this pass: accepted as of 2026-05-23.
- Remaining gaps: none owned by IllustratedMessage.
- Next ordered task: continue with the next remaining comparison-live
  component gap.
- Risks or skipped checks with reason: no screen-reader transcript tooling
  exists in this repo; semantic DOM, ARIA filtering, keyboard-free root
  behavior, and browser parity assertions cover the in-scope obligations.
