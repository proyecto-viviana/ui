# NotificationBadge Validation Notes

Date: 2026-05-20
Status: accepted

NotificationBadge has now been normalized against the current
support-component gates. The original pre-pass note is superseded by this
closeout, which covers the S2 source model rather than a standalone catalogue
route: `NotificationBadge`, `NotificationBadgeContext`, ActionButton-provided
context, localized value labels, root DOM filtering, and focused support tests.

## Current-Gate Closeout

- Scope: React Spectrum S2 `NotificationBadge.tsx`, root package exports,
  ActionButton child context composition, shared S2 intl strings, and focused
  unit/build/report evidence.
- Sources rechecked: React Spectrum S2 package root exports, S2
  `NotificationBadge.tsx`, S2 `ActionButton.tsx` context provider, Solid
  NotificationBadge/ActionButton/intl sources, and existing Button-family
  context tests.
- Result: accepted for NotificationBadge. Solid now exposes the S2 public prop
  surface: `value`, `size`, label ARIA props, `id`, `slot`, `styles`,
  `UNSAFE_className`, `UNSAFE_style`, `data-*` harness attributes, and `ref`.
  `staticColor` and `isDisabled` remain context-only runtime props supplied by
  `NotificationBadgeContext`, matching the S2 source. The root export no longer
  exposes the local `NotificationBadgeSize` type alias.

## Acceptance Gate Checklist

- [x] Public API: root exports match S2 values for `NotificationBadge` and
      `NotificationBadgeContext`, plus type `NotificationBadgeProps`.
- [x] Styled public type: direct public props follow S2 `NotificationBadgeProps`;
      `staticColor` and `isDisabled` are available through context rather than
      the exported prop type.
- [x] DOM/accessibility contract: root renders a native `span`, formats
      positive integer values, caps overflow at localized `99+`, uses
      `role="img"` only when an aria label is available, and applies
      indicator-only localized labels.
- [x] Style source-to-computed: S2 style macro output covers size branches,
      indicator-only/single-digit/double-digit layout branches, disabled
      display state, static color, and forced-colors classes.
- [x] Harness contract: no standalone official NotificationBadge catalogue
      route exists; support behavior is validated through unit tests and
      Button-family ActionButton composition coverage.
- [x] Evidence handoff: focused tests, Solid package build, export/gap reports,
      README status, and this note are refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                              |
| ----------------------- | ------ | --------------------------------------------------------------------- |
| Research                | done   | S2 `NotificationBadge.tsx`, root exports, ActionButton context source |
| Baseline and source map | done   | Pre-pass note plus current Solid source/tests                         |
| Implementation          | done   | Prop boundary, DOM filtering, context-only props, intl interpolation  |
| Harness                 | done   | Focused NotificationBadge test plus Button-family context slice       |
| Verification            | done   | Focused unit slice, package build, gap/export reports                 |
| Handoff                 | done   | README normalization status, current-gate closeout note, commit       |

## Behavior State Machine

- Stable states: value badge; indicator-only badge; explicit aria label;
  labelled-by/described/details props; null value; default size `S`; every S2
  size branch.
- Value states: positive integer values render localized numbers; values above
  `99` render the localized plus message; zero, negative, and non-integer
  values throw the S2 errors.
- Context states: `NotificationBadgeContext` can provide value, size,
  `staticColor`, `isDisabled`, styles, unsafe class/style, label props, and
  refs; local value and unsafe props override context values where S2 does.
- Interaction states: NotificationBadge owns no direct interaction. Raw DOM
  event compatibility props are not part of the styled S2 API and are filtered
  from the root.
- Cleanup contract: NotificationBadge owns no timers, portals, observers,
  subscriptions, generated IDs, or async lifecycle.

## Accessibility And I18n

- The root is a native `span`.
- A value badge without `aria-label` has no `role`, matching the S2 source.
- Indicator-only badges receive a localized `aria-label` and `role="img"`.
- Explicit `aria-label` also enables `role="img"`; `aria-labelledby`,
  `aria-describedby`, and `aria-details` are labelable DOM props but do not
  independently set the S2 image role.
- The localized plus message is now function-backed in the shared S2 intl
  bundle so `notificationbadge.plus` interpolates correctly. The same change
  also fixes the existing `actionbar.selected` variable-bearing message shape.

## Style Source-To-Computed

- React S2 `NotificationBadge.tsx` uses the S2 `badge` style macro with
  branches for size, indicator-only, single-digit, double-digit, disabled,
  static color, and forced-colors state.
- Solid keeps the same macro branches and class composition. Standalone visual
  defaults come entirely from the S2 macro, plus context-provided ActionButton
  positioning styles when composed as a child.
- Root inline styles come only from `UNSAFE_style`; legacy raw `style`, raw
  `class`, `hidden`, and DOM event props are filtered.

## Source Packet

| Source                   | Files or docs                                   | Finding                                                                                                                |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `NotificationBadge` docs lookup                 | There is no standalone S2 NotificationBadge docs page; source and exports are the contract.                            |
| React Spectrum S2 source | `@react-spectrum/s2/src/NotificationBadge.tsx`  | S2 formats positive integers, caps overflow, labels indicator-only badges, filters DOM props, and exports the context. |
| React Spectrum S2 source | `@react-spectrum/s2/src/ActionButton.tsx`       | ActionButton provides `staticColor`, size, disabled state, and absolute positioning styles through context.            |
| Solid source after pass  | `packages/solid-spectrum/src/notificationbadge` | Solid matches the S2 public prop boundary, root filtering, context merge, value formatting, and accessibility roles.   |
| Solid intl source        | `packages/solid-spectrum/src/intl/index.ts`     | Variable-bearing messages now interpolate through function-backed localized strings.                                   |
| Comparison reports       | gap/export scripts                              | Root value exports remain `158`, missing S2 value exports `53`, and extra Solid value exports `3`.                     |

## Official Docs And Viewer Parity

| Contract item       | Official source expectation                                  | Solid route/control                       | Status  | Evidence                            |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------- | ------- | ----------------------------------- |
| Standalone docs     | no official S2 NotificationBadge catalogue/docs page         | no standalone comparison route            | matched | S2 docs lookup and catalogue report |
| Root exports        | `NotificationBadge`, `NotificationBadgeContext`, props       | root exports the same support values/type | matched | export report and build             |
| `value`             | positive integer, capped at `99+`                            | unit tests                                | matched | `NotificationBadge.test.tsx`        |
| Indicator-only      | localized label and `role="img"`                             | unit tests                                | matched | `NotificationBadge.test.tsx`        |
| DOM filtering       | `filterDOMProps(..., {labelable: true})`                     | unit root DOM contract                    | matched | `NotificationBadge.test.tsx`        |
| Context composition | ActionButton provides size/staticColor/disabled/styles       | Button-family context tests and source    | matched | focused test slice and source audit |
| I18n interpolation  | localized plus message receives formatted notification count | shared S2 intl functions                  | matched | unit test                           |

## Baseline

- Before this pass, NotificationBadge was explicitly pre-pass only. The
  Button-family pass covered nested ActionButton composition and Spanish
  indicator-only labeling, but not standalone value formatting, DOM filtering,
  root export shape, or the context-only prop boundary.
- Solid NotificationBadge previously exposed `staticColor`, `isDisabled`, and
  `NotificationBadgeSize` as public root API, and it spread generic HTML
  attributes/events to the root instead of using S2 DOM filtering.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `266`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `158`;
  - missing S2 value exports: `53`;
  - extra Solid value exports: `3`.

## Source Map And Public Contract

| Layer               | Upstream files                               | Solid files                                          | Status  |
| ------------------- | -------------------------------------------- | ---------------------------------------------------- | ------- |
| State               | none                                         | none                                                 | n/a     |
| ARIA hooks          | `filterDOMProps`, localized string formatter | Solidaria `filterDOMProps`, shared S2 intl formatter | matched |
| Headless components | native `span`                                | native `span`                                        | matched |
| Styled S2           | `@react-spectrum/s2/src/NotificationBadge`   | `packages/solid-spectrum/src/notificationbadge`      | matched |
| Consumer route      | ActionButton child context                   | Solid ActionButton child context                     | matched |

- Public props/defaults:
  - `value?: number | null`; null/undefined is indicator-only.
  - `size?: "S" | "M" | "L" | "XL"` defaults to `S`.
  - `id`, label ARIA props, `slot`, `styles`, `UNSAFE_className`,
    `UNSAFE_style`, `data-*`, and `ref` are preserved.
  - `staticColor` and `isDisabled` are context-only runtime props.
  - The styled S2 surface intentionally omits raw `class`, raw `style`,
    arbitrary DOM events, `hidden`, and the extra root type alias.
- Contexts/providers:
  - `NotificationBadgeContext` is exported and consumed through the shared S2
    slotted context helper.
  - ActionButton supplies size, static color, disabled state, positioning
    styles, and visibility while pending.
- Refs/imperative behavior:
  - Ref merging includes context/local refs.

## Source Branch Coverage

| Layer   | Upstream branch            | Solid owner                | Class        | Observable                                      | Status  | Evidence                    |
| ------- | -------------------------- | -------------------------- | ------------ | ----------------------------------------------- | ------- | --------------------------- |
| Support | root support exports       | root barrel                | API          | no extra `NotificationBadgeSize` root type      | matched | build/source audit          |
| Support | value formatting           | NotificationBadge          | i18n/runtime | localized number and `99+` overflow             | matched | unit test                   |
| Support | invalid value errors       | NotificationBadge          | runtime      | zero/negative/non-integer throw S2 errors       | matched | unit test                   |
| Support | indicator-only label       | NotificationBadge + intl   | a11y/i18n    | localized label and `role="img"`                | matched | unit tests                  |
| Support | labelable DOM props        | Solidaria `filterDOMProps` | DOM/a11y     | id/data/label ARIA pass; hidden/events filtered | matched | unit test                   |
| Support | context-only visual props  | NotificationBadgeContext   | API/context  | staticColor/isDisabled from context             | matched | unit and source audit       |
| Support | ActionButton child context | ActionButton provider      | composition  | context styles and disabled/static color state  | matched | Button-family context tests |
| Support | unsafe escape hatches      | NotificationBadge          | style        | unsafe class merges; local style overrides      | matched | unit test                   |
| Harness | no catalogue route         | comparison catalogue       | route        | no standalone visual state required             | matched | gap report                  |

## Evidence

```bash
vp test run packages/solid-spectrum/test/NotificationBadge.test.tsx packages/solid-spectrum/test/ButtonFamilyContext.test.tsx packages/solid-spectrum/test/ActionMenu.test.tsx packages/solid-spectrum/test/ActionBar.test.tsx packages/solid-spectrum/test/Button.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/button-family-contract.spec.ts e2e/actionbutton-visual.spec.ts --reporter=line
vp run comparison:report:exports
vp run comparison:report:gaps
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused NotificationBadge and impacted unit slice: `106 passed`.
- Solid Spectrum build: passed.
- Comparison build: passed.
- Button-family and ActionButton browser suites: `72 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `266`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `158`,
  missing React S2 value exports at `53` of `208`, and extra Solid value
  exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Current-gate status: NotificationBadge is accepted as of 2026-05-20.
- NotificationBadge has no standalone comparison route because S2 exposes it as
  a support value, not a catalogue page.
- The current pre-pass list is now empty; choose the next component from the
  remaining current-gate backlog rather than from a pre-pass entry.
