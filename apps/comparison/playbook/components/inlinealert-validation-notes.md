# InlineAlert Validation Notes

Date: 2026-05-24
Status: accepted

## Target

- Component: InlineAlert
- Slug: `inlinealert`
- Family or direct subcomponents: `InlineAlert`, `InlineAlertContext`,
  `Heading`, `Content`, and semantic S2 icons.
- Pass goal: accept InlineAlert under the current full gate model with the
  official docs composition, `variant`, `fillStyle`, `autoFocus`, role/focus
  behavior, DOM-prop filtering, icon labels, S2 styling, public export parity,
  comparison controls, and strict React-vs-Solid visual evidence.

## Task Status

| Task                   | Status   | Evidence                                                                                        |
| ---------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| 0 Research             | complete | S2 MCP docs and installed `@react-spectrum/s2/src/InlineAlert.tsx` source mapped.               |
| 1 Baseline             | complete | Reports refreshed; InlineAlert moved from missing/gap to live on both sides.                    |
| 2 Route harness        | complete | React/Solid fixtures, demo controls, manifest entry, visual matrix, and Playwright spec added.  |
| 3 Source map/API       | complete | Public props/defaults/context/export/icon/i18n contract mapped to Solid owner files.            |
| 4 Cross-layer audit    | complete | DOM filtering, root role, focus, child contexts, icon branch, and unsafe/style merges covered.  |
| 5 Transitions          | complete | Route updates cover variant/fillStyle matrices and autofocus mount behavior.                    |
| 6 State                | n/a      | No independent state machine beyond prop-driven branches and autofocus mount effect.            |
| 7 ARIA hooks           | complete | `useFocusRing`/`createFocusRing`, `filterDOMProps`, role, labels, and tab index parity covered. |
| 8 Headless             | n/a      | No separate headless component exists upstream.                                                 |
| 9 Styled S2            | complete | Source token branches, computed styles, icon geometry, and strict pair diffs covered.           |
| 10 Runtime lifecycle   | complete | Autofocus effect, refs, Solid accessors, and event-prop filtering covered by focused tests.     |
| 11 Harness integrity   | complete | React imports current S2; Solid imports the public package API; both receive identical props.   |
| 12 Comparison evidence | complete | Focused unit, typecheck/build, Playwright, reports, RAC guard, check, and diff check passed.    |
| 13 Acceptance          | complete | No InlineAlert-owned blockers remain.                                                           |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                        | Files changed                                                                                                                                                                                                                                                                                              | Evidence added                                                                                           | Commands run                                                                                  | Blockers | Next owner |
| ---------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- | ---------- |
| main       | S2 MCP docs, installed S2 source, Solid icon/text/context/style owners, comparison harness files. | `packages/solid-spectrum/src/inlinealert/index.tsx`, public exports, intl strings, `spectrum-icon.tsx`, AlertTriangle asset/generated icon, unit test, React/Solid fixtures, `inlinealert-demo.ts`, controls, manifest, visual matrix, comparison CSS, Playwright spec, generated S2 CSS, and these notes. | DOM-prop boundary, icon labels/slot suppression, autofocus, style matrix, controls, exports, pair diffs. | Focused package test, comparison typecheck/build, Playwright, gaps/exports, RAC guard, check. | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                | Blockers/owner |
| ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 MCP docs checked on 2026-05-24. Route renders the docs composition and exposes the official `variant`, `fillStyle`, and `autoFocus` controls.        | none           |
| External Authority And Standards         | complete | Relevant authority is installed React Spectrum S2 source plus React Aria DOM filtering/focus behavior; no APG standalone widget applies beyond `alert`. | none           |
| Upstream React Source Parity             | complete | Source defaults, public props, context, role, focus, icon variants, labels, and style branches are ported and asserted.                                 | none           |
| Solid Idiomatic Implementation           | complete | Props remain accessor-backed, children stay lazy through providers, refs compose, and autofocus is handled with Solid mount semantics.                  | none           |
| Accessibility And I18n                   | complete | Root `role="alert"`, `tabIndex=-1` only with autofocus, filtered labelable ARIA, semantic icon labels, neutral no-icon path, and en/es strings covered. | none           |
| Behavior State Machine                   | complete | Prop matrix, controls, autofocus, context/local overrides, refs, unsafe merges, neutral branch, and event filtering have focused evidence.              | none           |
| Style Source-To-Computed Parity          | complete | Root, icon, heading, and content S2 style branches compare against React computed styles and strict screenshot pairs.                                   | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports real S2; Solid fixture imports public API; controls update both; serialized props plus DOM/style/a11y contracts are asserted.     | none           |
| Known Defects And Regression Protection  | complete | Fixed old Alert alias, missing controls, missing export, Solid-only icon `data-slot`, notice label mismatch, and AlertTriangle antialiasing mismatch.   | none           |
| Evidence And Handoff                     | complete | Focused unit, typecheck/build, Playwright, reports, RAC guard, `vp check --fix`, and `git diff --check` passed.                                         | none           |

## Research

- S2 docs: InlineAlert MCP page checked on 2026-05-24. Public API lists
  `children`, `autoFocus`, `fillStyle='border'`, `variant='neutral'`,
  `styles`, `UNSAFE_className`, `UNSAFE_style`, `id`, and `slot`.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/InlineAlert.tsx`
  - `apps/comparison/node_modules/@react-spectrum/s2/icons/AlertTriangle.mjs`
  - `apps/comparison/node_modules/@react-spectrum/s2/icons/AlertDiamond.mjs`
- React Aria/S2 behavior: default `filterDOMProps`, `useFocusRing`, and
  `focus()` on mount when `autoFocus` is set.
- APG/W3C/ARIA-AT: no composite widget pattern applies. The root is a
  non-interactive `alert` region with optional programmatic focus.
- Source disagreements resolved:
  - The docs describe the notice variant, but installed runtime labels the
    notice icon `Warning`; installed source/runtime is the chosen authority.
  - The local vendored AlertTriangle SVG had older three-path geometry; the
    installed S2 icon bundle's normalized two-path shape is the chosen authority
    for pixel parity.

## Official Docs And Viewer Parity

| Docs item   | Official setting/example                                 | Route/control                                            | Status  |
| ----------- | -------------------------------------------------------- | -------------------------------------------------------- | ------- |
| Composition | `<InlineAlert><Heading/><Content/></InlineAlert>`        | Default route renders heading/content child composition. | passing |
| Variant     | `informative`, `positive`, `notice`, `negative`, neutral | Variant radios in official order, default `neutral`.     | passing |
| Fill style  | `border`, `subtleFill`, `boldFill`                       | Fill style radios in official order, default `border`.   | passing |
| Autofocus   | Optional autofocus example                               | `autoFocus` checkbox drives both roots.                  | passing |
| DOM props   | Source uses default `filterDOMProps`                     | Route passes id/data/ARIA and asserts output boundary.   | passing |
| Viewer      | Same provider/canvas/theme for both sides                | Strict pair diffs cover default and negative bold fill.  | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                     | Solid files                                                                                                | Status                                                                 |
| ------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| State               | none                                               | none                                                                                                       | Not applicable beyond prop-driven branches and mount autofocus.        |
| ARIA hooks          | `filterDOMProps`, `useFocusRing`                   | Solid `filterDOMProps`, `createFocusRing`, `focusSafely`                                                   | Matched role, tab index, focus-visible inputs, and DOM filtering.      |
| Headless components | none                                               | none                                                                                                       | Not applicable; no headless layer.                                     |
| Styled S2           | `@react-spectrum/s2/src/InlineAlert.tsx`, S2 icons | `src/inlinealert/index.tsx`, `macro-emitted package CSS`, S2 icon assets, fixtures, demo data, visual spec | Matched root styles, child contexts, semantic icon branch, and tokens. |

- Public props/defaults: `children`, `autoFocus`, `variant='neutral'`,
  `fillStyle='border'`, `styles`, `UNSAFE_className`, `UNSAFE_style`, `id`,
  `data-*`, context slot props, and refs.
- Slots/subcomponents: child `Heading`, `Content`, and semantic icons receive
  S2 context styles. Neutral intentionally renders no icon.
- Contexts/providers: `InlineAlertContext` is exported and supports slotted
  context props with local prop precedence.
- Refs/imperative methods: root ref composes context and local refs; no
  imperative API beyond DOM focus.
- Unsupported or intentionally different branches: `UNSAFE_suppressDataSlot` is
  an internal icon escape hatch used here so the Solid icon DOM matches React
  Spectrum's no-`data-slot` InlineAlert icons.

## Behavior State Machine

| State/input           | Trigger                           | Expected React                                             | Expected Solid | Status  | Evidence                                  |
| --------------------- | --------------------------------- | ---------------------------------------------------------- | -------------- | ------- | ----------------------------------------- |
| Docs default          | Route mount                       | Neutral border alert, heading/content, no icon.            | Same.          | matched | Default strict pair diff and contract.    |
| Semantic variants     | Route/control variant changes     | Informative/success/warning/error icon or neutral no icon. | Same.          | matched | Browser matrix and package tests.         |
| Fill style branches   | Route/control fill style changes  | Border, subtle fill, or bold fill colors update.           | Same.          | matched | Browser computed contract and pair diffs. |
| Autofocus false       | Route mount                       | No `tabIndex`; root is not forcibly focused.               | Same.          | matched | Contract matrix.                          |
| Autofocus true        | Route/control `autoFocus=true`    | `tabIndex=-1`; an alert root receives programmatic focus.  | Same.          | matched | Browser autofocus test and package test.  |
| Context slot override | Context provider plus local props | Local props win; refs compose; `slot` does not leak.       | Same.          | matched | Package context/ref test.                 |
| DOM prop boundary     | Route passes id/data/ARIA/events  | `id` and `data-*` forward; labelable ARIA/events do not.   | Same.          | matched | Package and browser contract.             |
| Icon context          | Icon renders inside InlineAlert   | S2 icon has role/name/styles and no `data-slot`.           | Same.          | matched | Package assertion and browser contract.   |

## Accessibility And I18n

| Surface                                             | Upstream/current React                                              | Solid | Status  | Evidence                                |
| --------------------------------------------------- | ------------------------------------------------------------------- | ----- | ------- | --------------------------------------- |
| Role/name/description/value                         | Root `div` has `role="alert"`; labelable ARIA is filtered.          | Same. | matched | Package and browser root contract.      |
| ARIA references and generated IDs                   | Consumer `id` and `data-*` forward; ARIA label/description do not.  | Same. | matched | Package and browser root contract.      |
| Keyboard and focus                                  | No keyboard model; `autoFocus` makes root focusable via `tabIndex`. | Same. | matched | Autofocus package and browser tests.    |
| Disabled/readonly/required/invalid/hidden semantics | Not supported by InlineAlert root.                                  | Same. | n/a     | Source map.                             |
| Form labels/help/error/reset/submit                 | Not a form field.                                                   | Same. | n/a     | Source map.                             |
| Live announcements and cleanup                      | `role="alert"` is the live-region behavior; no timers/listeners.    | Same. | matched | Source map and root contract.           |
| Forced colors/reduced motion/contrast/target size   | Static S2 styling; no motion or target-size affordance.             | Same. | matched | Computed styles and strict pair diffs.  |
| Locale/direction/formatting/messages                | Icon labels are localized semantic names.                           | Same. | matched | en/es strings and browser label checks. |
| Multiple instances                                  | No generated IDs; consumer-owned ids only.                          | Same. | matched | Package context/ref test.               |

## Style Source-To-Computed

| Style branch      | Upstream declaration                                                   | Solid owner                                  | Observable proof                               | Status  |
| ----------------- | ---------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------- | ------- |
| Root layout       | `inline-block`, `relative`, border box, `padding: 24`, radius, border. | `inlineAlert` style macro                    | Browser computed style contract.               | matched |
| Border colors     | Variant-specific border tokens for `fillStyle="border"`.               | `inlineAlert` token branches                 | Browser matrix contract.                       | matched |
| Background colors | Border/subtle/bold fill token branches by variant.                     | `inlineAlert` token branches                 | Browser matrix contract and pair diffs.        | matched |
| Icon style        | `float: inline-end`; `--iconPrimary` by variant/fill style.            | `IconContext` plus `icon` style macro        | Browser icon float/size/CSS-variable contract. | matched |
| Heading/content   | `HeadingContext` title/body styles and bold fill color branch.         | `HeadingContext` and `ContentContext`        | Browser text typography/color contract.        | matched |
| Focus ring        | S2 focus ring driven by `isFocusVisible`.                              | `createFocusRing` and root class generation  | Autofocus and computed outline contract.       | matched |
| Icon geometry     | S2 AlertTriangle/AlertDiamond/Info/Checkmark icons.                    | Vendored S2 icon assets/generated components | Strict screenshot and icon contract.           | matched |
| Unsafe overrides  | `UNSAFE_className`, `UNSAFE_style`, `styles` allowed overrides.        | context/local merge helpers                  | Package context/override test.                 | matched |

## Known Defects And Regression Protection

| Finding source       | Defect or risk                                                               | Class       | Blocking? | Regression evidence or owner                                             |
| -------------------- | ---------------------------------------------------------------------------- | ----------- | --------- | ------------------------------------------------------------------------ |
| Baseline report      | InlineAlert was tracked as a missing/gap official entry.                     | route gap   | no        | Manifest, fixtures, controls, matrix, and Playwright spec added.         |
| Baseline export      | `InlineAlertContext` was missing from public support exports.                | API gap     | no        | Export report now shows no missing catalogue root exports.               |
| Current pass         | Solid used the old `Alert` alias instead of direct S2 InlineAlert behavior.  | port bug    | no        | Direct implementation plus source/DOM/style tests.                       |
| Current pass         | Interactive viewer lacked official controls.                                 | harness gap | no        | Controls assert exact options/defaults and drive both stacks.            |
| Browser contract     | Solid icons leaked `data-slot` inside InlineAlert; React icons do not.       | DOM bug     | no        | Internal suppressor plus package/browser assertions.                     |
| Browser contract     | Solid notice icon label differed from React runtime `Warning`.               | i18n bug    | no        | en/es strings updated; browser icon-name contract covers notice.         |
| Strict screenshot    | Local AlertTriangle SVG antialiasing differed from installed S2 icon bundle. | style bug   | no        | Vendored source/generated icon normalized; negative bold fill pair diff. |
| Current-gate reports | Remaining catalogue gaps could be confused with this pass.                   | report risk | no        | Reports list remaining gaps outside InlineAlert ownership.               |

Canonical scenario smoke:

| Scenario           | React result                                   | Solid result | Status  | Evidence                    |
| ------------------ | ---------------------------------------------- | ------------ | ------- | --------------------------- |
| Docs default       | Neutral border alert with heading/content.     | Same.        | matched | Default pair diff.          |
| Negative bold fill | Error icon, bold negative surface, white text. | Same.        | matched | Strict pair diff.           |
| Control updates    | Controls update serialized and rendered props. | Same.        | matched | Route-control browser test. |
| Autofocus          | Root is focusable and focused after mount.     | Same.        | matched | Browser autofocus test.     |

Composition smoke:

| Composition context   | Upstream expectation                                | Solid result | Status  | Evidence                   |
| --------------------- | --------------------------------------------------- | ------------ | ------- | -------------------------- |
| Child composition     | Heading/content receive S2 context styles.          | Same.        | matched | Package and browser tests. |
| Semantic icon branch  | Variant icons render with localized labels.         | Same.        | matched | Browser matrix contract.   |
| Slotted context props | Slot props merge with local props and refs compose. | Same.        | matched | Package context/ref test.  |

## Evidence

- `vp test run packages/solid-spectrum/test/InlineAlert.test.tsx`
  - `3` focused tests passed.
- `vp run comparison:typecheck`
  - comparison Astro check passed with `0` errors, `0` warnings, `0` hints.
- `vp run comparison:build`
  - comparison build passed and generated the InlineAlert static route.
- `vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/inline-alert-visual.spec.ts --reporter=line`
  - `5` browser tests passed.
- `vp run comparison:report:gaps`
  - report passed with `69` official entries, `58` live styled entries on both
    sides, and `11` remaining missing/gap entries outside this pass.
- `vp run comparison:report:exports`
  - report passed with `0` missing catalogue root exports and no
    `InlineAlertContext` support-export gap.
- `vp exec tsx scripts/check-rac-export-gap.ts`
  - report-only guard passed with `0` missing RAC named exports.
- `vp check --fix`
  - precommit hook passed.
- `git diff --check`
  - no whitespace errors.

## Blockers

| Label | Gate | Blocker | Owner/next action |
| ----- | ---- | ------- | ----------------- |
| none  | none | none    | none              |

## Handoff

- Status after this pass: accepted as of 2026-05-24.
- Remaining gaps: none owned by InlineAlert.
- Next ordered task: continue with the next remaining comparison-live component
  gap.
- Risks or skipped checks with reason: no screen-reader transcript tooling
  exists in this repo; semantic DOM, ARIA filtering, localized icon names,
  autofocus behavior, computed styles, and strict visual parity cover the
  in-scope obligations.
