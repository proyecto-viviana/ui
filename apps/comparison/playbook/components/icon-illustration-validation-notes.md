# Icon And Illustration Validation Notes

Date: 2026-05-25
Status: accepted

## Target

- Component: Icons and Illustrations
- Slug: `icons`, `illustrations`
- Family or direct subcomponents: `createIcon`, `createIllustration`,
  `IconContext`, `IllustrationContext`, packaged workflow icons, custom SVG
  illustrations, and `SpectrumSkeleton` composition.
- Pass goal: accept Icon and Illustration primitives under the current full
  gate model, with React Spectrum S2 source parity for SVG semantics, context
  slot behavior, size classes, skeleton behavior, and strict React-vs-Solid
  visual evidence.

## Task Status

| Task                   | Status   | Evidence                                                                                         |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| 0 Research             | complete | S2 docs references and installed React Spectrum S2 icon runtime source checked.                  |
| 1 Baseline             | complete | `comparison:report:gaps` refreshed with 69/69 official entries live and no catalogue gaps.       |
| 2 Route harness        | complete | Existing Icons/Illustrations routes now have strict primitive DOM and visual evidence.           |
| 3 Source map/API       | complete | React `Icon.mjs`, `Skeleton.mjs`, and `useSpectrumContextProps.mjs` mapped to Solid owners.      |
| 4 Cross-layer audit    | complete | SVG props, slot data attributes, skeleton wrapping, style classes, and context branches mapped.  |
| 5 Transitions          | complete | Static labelled/decorative/skeleton/button-context states are covered.                           |
| 6 State                | n/a      | No standalone state primitive; context and skeleton state are composition-owned.                 |
| 7 ARIA hooks           | n/a      | No component-specific React Aria hook; SVG ARIA attributes are source-owned.                     |
| 8 Headless             | n/a      | No separate headless component exists upstream.                                                  |
| 9 Styled S2            | complete | Generated S2 icon/illustration size and flex-shrink classes match React-computed output.         |
| 10 Runtime lifecycle   | complete | Icon skeleton inert/loading refs remain active; Illustration intentionally has no skeleton wrap. |
| 11 Harness integrity   | complete | React imports installed S2; Solid imports package public APIs; fixtures use matching SVGs.       |
| 12 Comparison evidence | complete | Focused unit tests, strict Playwright pair diffs, typecheck/build, report, and check passed.     |
| 13 Acceptance          | complete | No Icon/Illustration-owned blockers remain.                                                      |

## Agent Workflow

No subagents were used for this component family pass.

| Agent role | Files read                                                                                       | Files changed                                                                                                                                                                                                   | Evidence added                                                                                         | Commands run                                                                                | Blockers | Next owner |
| ---------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 docs refs, installed `Icon.mjs`, `Skeleton.mjs`, `useSpectrumContextProps.mjs`, Solid owners. | `packages/solid-spectrum/src/icon/spectrum-icon.tsx`, generated S2 CSS, Icon and IllustratedMessage tests, React/Solid styled fixtures, visual-state matrix, `icon-illustration-visual.spec.ts`, and this note. | SVG semantic contract, size/style classes, skeleton branch parity, DOM `size` filtering, strict diffs. | Focused package tests, Playwright, comparison build/typecheck/report, `vp run check`, diff. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                  | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 Icons and Illustrations docs references checked; comparison routes expose labelled, decorative, loading, and context examples matching the documented primitive roles. | none           |
| External Authority And Standards         | complete | SVG accessibility obligations are role/name/hidden/focusable semantics; no separate APG widget pattern applies.                                                           | none           |
| Upstream React Source Parity             | complete | Installed React S2 source proved `createIcon` wraps `SkeletonWrapper`, `createIllustration` does not, and default context slots do not become default `data-slot`.        | none           |
| Solid Idiomatic Implementation           | complete | Context values remain accessor-backed; SVG refs compose through Solid; custom illustration `size` is passed to the component without leaking as a DOM attribute.          | none           |
| Accessibility And I18n                   | complete | Browser and unit assertions cover `role=img`, `aria-label`, decorative `aria-hidden`, `focusable=false`, and absence/presence of explicit `data-slot`.                    | none           |
| Behavior State Machine                   | complete | Labelled, decorative, explicit slot, skeleton icon, non-skeleton illustration, S/M/L illustration sizing, and Button context branches are covered.                        | none           |
| Style Source-To-Computed Parity          | complete | Generated S2 classes now cover icon 20px sizing, illustration S/M/L sizing, and `flex-shrink: 0`; Playwright compares computed geometry exactly.                          | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React and Solid fixtures use equivalent custom SVG components and remove unsupported icon `size` fixture props; strict pair diffs compare both primitive galleries.       | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: missing icon/illustration size classes, leaked SVG `size`, wrong default `data-slot`, and incorrect illustration skeleton behavior.                    | none           |
| Evidence And Handoff                     | complete | Focused tests, strict Playwright spec, comparison build/typecheck/report, `vp run check`, and `git diff --check` passed.                                                  | none           |

## Research

- S2 docs:
  - `react-spectrum-s2/references/components/icons.md`
  - `react-spectrum-s2/references/components/illustrations.md`
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/icons/Icon.mjs`
  - `apps/comparison/node_modules/@react-spectrum/s2/icons/Skeleton.mjs`
  - `apps/comparison/node_modules/@react-spectrum/s2/icons/useSpectrumContextProps.mjs`
- React Aria docs: no icon-specific hook or widget pattern applies.
- APG/W3C/ARIA-AT: no standalone widget pattern applies; the normative risk is
  SVG image semantics and decorative hiding.
- Source disagreement resolved: `useSpectrumContextProps` uses a default slot
  for context lookup, but React runtime only writes `data-slot` when the caller
  explicitly passes `slot`. Solid now follows runtime DOM output.

## Official Docs And Viewer Parity

| Docs item      | Official setting/example                                       | Route/control                                                           | Status  |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------- | ------- |
| Icons          | `createIcon` output used as labelled, decorative, and loading. | Icons route renders labelled, decorative, skeleton, and Button-context. | passing |
| Illustrations  | `createIllustration` output with `size` S/M/L.                 | Illustrations route renders labelled S, decorative M, and skeleton L.   | passing |
| SVG semantics  | `role=img`, label or hidden, and `focusable=false`.            | Browser contract compares React and Solid attributes exactly.           | passing |
| Style geometry | Icon 20px, Illustration S/M/L, `flex-shrink: 0`.               | Browser contract compares computed width/height/box geometry exactly.   | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                         | Solid files                                                                 | Status                                                             |
| ------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| State               | `Skeleton.mjs` loading context for `createIcon` only   | `src/icon/spectrum-icon.tsx`, `src/skeleton` helpers                        | Matched icon skeleton loading/inert behavior; illustration is n/a. |
| ARIA hooks          | none                                                   | none                                                                        | Not applicable.                                                    |
| Headless components | none                                                   | none                                                                        | Not applicable.                                                    |
| Styled S2           | `icons/Icon.mjs`, S2 generated class output at runtime | `src/icon/spectrum-icon.tsx`, `src/s2-generated.css`, fixtures, visual spec | Matched size/flex classes and SVG DOM attributes.                  |

- Public props/defaults: `aria-label`, `aria-hidden`, explicit `slot`,
  `UNSAFE_suppressDataSlot`, `styles`, `UNSAFE_className`, `UNSAFE_style`, and
  Illustration `size`.
- Slots/subcomponents: `IconContext` and `IllustrationContext` supply context
  styles and size; explicit local `slot` controls the DOM `data-slot` value.
- Contexts/providers: Button context can style a slotted icon; Skeleton context
  applies only to icons.
- Unsupported or intentionally different branches: none accepted. Fixture icon
  `size` props were removed because React S2 icons do not support them.

## Behavior State Machine

| State/input             | Trigger       | Expected React                                        | Expected Solid | Status  | Evidence                              |
| ----------------------- | ------------- | ----------------------------------------------------- | -------------- | ------- | ------------------------------------- |
| Labelled icon           | Route mount   | `role=img`, `aria-label`, no `aria-hidden`.           | Same.          | matched | Unit test and browser SVG contract.   |
| Decorative icon         | Route mount   | `role=img`, `aria-hidden=true`, no label.             | Same.          | matched | Unit test and browser SVG contract.   |
| Skeleton icon           | Loading mount | Skeleton loading classes and inert behavior apply.    | Same.          | matched | Browser SVG contract and strict diff. |
| Button-context icon     | Button mount  | Context styles apply; explicit slot renders.          | Same.          | matched | Browser SVG contract and strict diff. |
| Labelled illustration   | Route mount   | `size` reaches custom component but not SVG DOM.      | Same.          | matched | Unit test and browser SVG contract.   |
| Decorative illustration | Route mount   | Hidden decorative SVG with S2 M sizing.               | Same.          | matched | Unit test and browser SVG contract.   |
| Skeleton illustration   | Loading mount | No `SkeletonWrapper`; normal illustration remains.    | Same.          | matched | Browser SVG contract and strict diff. |
| Explicit slot           | Package mount | Only explicit `slot` becomes `data-slot`; no default. | Same.          | matched | Unit tests for icon and illustration. |

## Accessibility And I18n

| Surface                                             | Upstream/current React                                             | Solid | Status  | Evidence                                      |
| --------------------------------------------------- | ------------------------------------------------------------------ | ----- | ------- | --------------------------------------------- |
| Role/name/description/value                         | SVGs use `role=img`; labelled variants expose names.               | Same. | matched | Unit and browser SVG contracts.               |
| ARIA references and generated IDs                   | No generated IDs or ARIA references.                               | Same. | n/a     | Source map.                                   |
| Keyboard and focus                                  | SVGs are not interactive and render `focusable=false`.             | Same. | matched | Unit and browser SVG contracts.               |
| Disabled/readonly/required/invalid/hidden semantics | Decorative variants use `aria-hidden=true`; no form-field states.  | Same. | matched | Unit and browser SVG contracts.               |
| Form labels/help/error/reset/submit                 | Not form fields.                                                   | Same. | n/a     | Source map.                                   |
| Live announcements and cleanup                      | No live region behavior; skeleton icon owns inert/loading styling. | Same. | matched | Source and browser skeleton branch evidence.  |
| Forced colors/reduced motion/contrast/target size   | Static SVG geometry and currentColor/iconPrimary styling.          | Same. | matched | Strict visual pair diffs and computed styles. |
| Locale/direction/formatting/messages                | No localized component strings.                                    | Same. | n/a     | Source map.                                   |
| Multiple instances                                  | No generated IDs; SVG instances are independent.                   | Same. | matched | Route renders multiple instances per side.    |

## Style Source-To-Computed

| Style branch           | Upstream declaration                            | Solid owner                                 | Observable proof                                      | Status  |
| ---------------------- | ----------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- | ------- |
| Icon base geometry     | 20px width/height and `flex-shrink: 0` classes  | `iconBaseStyles` plus generated CSS         | Browser exact contract for computed and box geometry. | matched |
| Illustration S size    | 48px width/height and `flex-shrink: 0` classes  | `illustrationBaseStyles` plus generated CSS | Browser exact contract for computed and box geometry. | matched |
| Illustration M size    | 96px width/height and `flex-shrink: 0` classes  | `illustrationBaseStyles` plus generated CSS | Unit class assertions and browser contract.           | matched |
| Illustration L size    | 160px width/height and `flex-shrink: 0` classes | `illustrationBaseStyles` plus generated CSS | Unit class assertions and browser contract.           | matched |
| Unsafe/style overrides | React S2 style macro allowed overrides          | `style(..., iconAllowedOverrides)`          | Typecheck and existing S2 style helper coverage.      | matched |

## Known Defects And Regression Protection

| Finding source | Defect or risk                                                                | Class    | Blocking? | Regression evidence or owner                                                    |
| -------------- | ----------------------------------------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------- |
| Current pass   | `createIcon` used legacy `iconStyle` and lacked React S2 base classes.        | port bug | no        | Generated CSS and browser computed contracts cover width/height/flex.           |
| Current pass   | Solid defaulted `data-slot` to `icon`; React only emits explicit `slot`.      | port bug | no        | Unit tests assert no default `data-slot` and explicit slot output.              |
| Current pass   | Illustration leaked `size` as an SVG DOM attribute in Solid fixtures/tests.   | port bug | no        | Unit and browser contracts assert no DOM `size` while custom component sees it. |
| Current pass   | Solid wrapped illustrations in skeleton loading styling; React S2 does not.   | port bug | no        | Browser skeleton illustration contract and strict pair diff cover this branch.  |
| Current pass   | Icons fixture used unsupported `size` props, masking true React/Solid parity. | harness  | no        | React and Solid fixtures remove unsupported icon `size` props.                  |

Canonical scenario smoke:

| Scenario                      | React result                                     | Solid result | Status  | Evidence                     |
| ----------------------------- | ------------------------------------------------ | ------------ | ------- | ---------------------------- |
| Icons gallery default         | Labelled/decorative/loading/context SVGs render. | Same.        | matched | Strict Playwright pair diff. |
| Illustrations gallery default | Labelled/decorative/loading SVGs render.         | Same.        | matched | Strict Playwright pair diff. |
| Packaged primitive unit smoke | SVG attributes and size handling match source.   | Same.        | matched | Focused package tests.       |

Composition smoke:

| Composition context   | Upstream expectation                                        | Solid result | Status  | Evidence                          |
| --------------------- | ----------------------------------------------------------- | ------------ | ------- | --------------------------------- |
| Button icon context   | Context styles can apply while DOM `data-slot` is explicit. | Same.        | matched | Browser contract and strict diff. |
| Skeleton icon         | Icon receives Skeleton loading/inert behavior.              | Same.        | matched | Browser contract and strict diff. |
| Skeleton illustration | Illustration is not skeleton-wrapped by React S2.           | Same.        | matched | Browser contract and strict diff. |

## Evidence

- `vp test run packages/solid-spectrum/test/Icon.test.tsx packages/solid-spectrum/test/IllustratedMessage.test.tsx`
  - `13` focused tests passed.
- `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/icon-illustration-visual.spec.ts --reporter=line`
  - `2` browser tests passed.
- `vp run --filter @proyecto-viviana/comparison build`
  - comparison build passed and generated all 70 static pages.
- `vp run comparison:report:gaps`
  - `69` official S2 entries, `69` entries in comparison app, `69` live on both sides, `0` missing/gap.
- `vp run comparison:typecheck`
  - Astro check passed with `0` errors, `0` warnings, `0` hints.
- `vp run check`
  - formatting, lint, and root typecheck passed.
- `git diff --check`
  - no whitespace errors.

## Blockers

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
| none  | none | none    | none              |

## Handoff

- Status after this pass: accepted as of 2026-05-25.
- Remaining gaps: none owned by Icons or Illustrations.
- Next ordered task: continue strict evidence passes for remaining
  comparison-live components listed by `comparison:report:gaps`.
- Risks or skipped checks with reason: no screen-reader transcript tooling
  exists in this repo; semantic SVG attributes, decorative hiding, focusability,
  computed geometry, and strict browser pair diffs cover the in-scope
  obligations.
