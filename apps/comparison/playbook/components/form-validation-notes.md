# Form Validation Notes

Date: 2026-05-20
Status: accepted

Form has now been normalized against the current acceptance gates. Historical
evidence from the original 2026-05-15 pass remains below; this closeout records
the current React Spectrum S2 API correction, React Aria Form root ref and ARIA
description forwarding, the styled root DOM contract, and refreshed Form gates.

## Current-Gate Closeout

- Scope: direct styled S2 `Form`, plus the Solidaria Form root behavior needed
  for documented native form props, validation behavior, ARIA descriptions, and
  refs.
- Sources rechecked: React Spectrum S2 Form docs/API, React Aria Form docs/API,
  `@react-spectrum/s2/src/Form.tsx`, RAC `Form` source, Solidaria Form source,
  Solid Spectrum Form source, comparison route controls, and Form visual specs.
- Result: accepted for Form. Solid now exposes the documented S2 Form size API
  (`S`, `M`, `L`, `XL`) without legacy lowercase aliases or a styled `class`
  alias; forwards documented ARIA description props and refs through the Form
  stack; keeps S2 visual props class/context-driven instead of leaking
  Solid-only root marker attributes; and retains strict default visual parity,
  full option-matrix coverage, forced-colors coverage, native/ARIA validation,
  and Skeleton disabled precedence.

## Acceptance Gate Checklist

- [x] Public API: comparison controls and the public contract include the
      documented Form API: native form props, `validationBehavior`,
      `labelPosition`, `labelAlign`, `necessityIndicator`, S/M/L/XL `size`,
      `isRequired`, `isDisabled`, `isEmphasized`, `styles`,
      `UNSAFE_className`, `UNSAFE_style`, ARIA description props, and `ref`.
- [x] Styled public type: `FormProps` now follows S2 source intent by hiding
      headless `class`, raw `style`, and legacy lowercase size aliases from the
      styled root surface.
- [x] DOM/accessibility contract: native form attributes/events,
      `aria-describedby`, `aria-details`, validation behavior, and root refs
      pass through Solidaria and Solid Spectrum Form layers.
- [x] Style source-to-computed: Form root layout remains driven by the S2 style
      macro and FormContext; visual props do not leak root `data-*` marker
      attributes for size, label placement, required, disabled, or emphasized
      state.
- [x] Harness contract: route controls match the docs-style option surface, the
      computed contract compares layout/inherited state output against React
      Spectrum, and the visual-state matrix includes a root DOM contract row.
- [x] Evidence handoff: focused unit tests, package builds, comparison build,
      Form Playwright, reports, guards, README status, and this note are
      refreshed for the current gate.

## Agent Workflow

| Step                    | Status | Evidence                                                                |
| ----------------------- | ------ | ----------------------------------------------------------------------- |
| Research                | done   | S2 Form API, React Aria Form API/source, RAC Form source                |
| Baseline and source map | done   | Existing Form note plus current source/API recheck                      |
| Implementation          | done   | Form type narrowing, Solidaria ref forwarding, ARIA/root DOM assertions |
| Harness                 | done   | Root DOM contract added to Form e2e and visual-state matrix             |
| Verification            | done   | Focused unit tests, package builds, comparison build, Form visual e2e   |
| Handoff                 | done   | README normalization status, closeout note, commit                      |

## Behavior State Machine

- Stable states: default top-label native Form; S/M/L/XL sizes; top and side
  label position; side-label start/end alignment; icon and label necessity
  indicators; native and ARIA validation behavior; required, disabled,
  emphasized, and combined inherited descendant states.
- Environment states: forced-colors active resolves to the same computed layout
  and accessibility contract as React Spectrum.
- Transient states: submit and reset events dispatch through the native form
  pipeline; `validationBehavior` changes native required handling versus ARIA
  required semantics on descendants.
- Context states: local form-aware child props override Form context outside
  Skeleton; Skeleton loading wins over local disabled opt-out after local and
  context props merge.
- Cleanup contract: Form owns no timers, observers, portals, global listeners,
  or subscriptions.

## Accessibility And I18n

- Form uses React Aria Components Form semantics: `native` validation leaves
  native constraint validation active, and `aria` validation sets `noValidate`
  while descendants expose ARIA-required semantics.
- `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-details`, and `id`
  pass through the Form root; description props are covered at headless and
  styled layers.
- Root refs resolve to the underlying `HTMLFormElement`.
- No locale-specific formatting, generated IDs, live-region announcements, or
  bidirectional text behavior is introduced by Form itself.

## Style Source-To-Computed

- React S2 Form source drives grid layout through `labelPosition`, row gaps
  through S/M/L/XL `size`, and descendant field/button styling through
  FormContext.
- Solid S2 Form now follows that contract without accepting legacy `sm` /
  `md` / `lg` size aliases or a legacy styled `class` alias.
- The browser contract asserts root class/context-driven styling, grid columns,
  row/column gaps, descendant inherited states, forced-colors parity, and the
  absence of Solid-only root marker attributes for S2 visual props.

## Target

- Component: Form
- Slug: form
- Family or direct subcomponents: TextField, Button
- Pass goal: S2 styled Form root parity, native form forwarding, inherited
  field props, Skeleton disabled semantics, native/ARIA validation behavior,
  route-control integrity, forced-colors coverage, and strict default visual
  evidence
- Date: 2026-05-15

## Task Status

| Task                   | Status | Evidence                                                                                                   | Blocker or next action |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------- | ---------------------- |
| 0 Research             | done   | S2 Form docs/source, React Aria Form source, Solid Form/TextField/Button/Skeleton sources                  | None                   |
| 1 Baseline             | done   | `comparison:report:gaps`, `comparison:report:exports`, RAC guards                                          | None                   |
| 2 Route harness        | done   | Form controls, route defaults, React/Solid fixtures, visible control assertions                            | None                   |
| 3 Source map/API       | done   | Source map and public contract below                                                                       | None                   |
| 4 Cross-layer audit    | done   | Branch ledger covers root styles, native Form props, validation behavior, TextField/Button, Skeleton merge | None                   |
| 5 Transitions          | done   | Native/ARIA validation, enabled/disabled, required/optional, label placement, forced-colors states         | None                   |
| 6 State                | n/a    | Form has no separate state package owner                                                                   | None                   |
| 7 ARIA hooks           | done   | Headless Solidaria Form and text field validation behavior align with RAC/S2 observable behavior           | None                   |
| 8 Headless             | done   | Native form attributes/events and validation contexts covered                                              | None                   |
| 9 Styled S2            | done   | Root grid, spacing, label inheritance, TextField/Button inherited states, forced-colors                    | None                   |
| 10 Runtime lifecycle   | done   | submit/reset events, form context laziness, Skeleton override over local child props                       | None                   |
| 11 Harness integrity   | done   | Exact default pair diff, route-control UI assertions, full option matrix, forced-colors check              | None                   |
| 12 Comparison evidence | done   | Form Playwright suite `4 passed`; current reports and guards refreshed                                     | None                   |
| 13 Acceptance          | done   | Focused tests, builds, browser evidence, report/guard refresh, full check                                  | None                   |

## Source Packet

| Source                   | Files or docs                                                    | Finding                                                                                                                                                          |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S2 docs MCP              | `Form` page                                                      | Public API covers native form props, `validationBehavior`, label placement/alignment, necessity indicator, size, required, disabled, and emphasized inheritance. |
| React Spectrum S2 source | `@react-spectrum/s2/src/Form.tsx`, `TextField.tsx`, `Button.tsx` | Form is a grid wrapper over React Aria Form and provides S2 style props through internal form context to form-aware descendants.                                 |
| React Spectrum S2 source | `@react-spectrum/s2/src/Skeleton.tsx`                            | `useFormProps` applies Skeleton disabled state after local/context merging so Skeleton wins over child `isDisabled={false}`.                                     |
| Solid source after pass  | `packages/solid-spectrum/src/form`, `src/button`, `src/skeleton` | Solid matches S2 grid/inheritance, Skeleton disabled precedence, Button merge precedence, and defensive reduced-motion handling.                                 |
| Headless Solid source    | `packages/solidaria-components/src/Form.tsx`                     | Headless Form forwards native form attributes/events and exposes validation contexts to descendants.                                                             |
| Comparison harness       | manifest, styled fixtures, controls, visual matrix               | Form is live on both stacks with strict default evidence, route-control checks, full option matrix, and forced-colors coverage.                                  |

## Official Docs And Viewer Parity

| Docs item             | Official setting/example        | Route/control or API                                     | Status  | Evidence                   |
| --------------------- | ------------------------------- | -------------------------------------------------------- | ------- | -------------------------- |
| `size`                | `S`, `M`, `L`, `XL`             | radio options, default `M`                               | matched | unit and e2e matrix        |
| `labelPosition`       | `top`, `side`                   | radio options, default `top`                             | matched | e2e computed contract      |
| `labelAlign`          | `start`, `end`                  | radio options, default `start`                           | matched | e2e computed contract      |
| `necessityIndicator`  | `icon`, `label`                 | radio options, default `icon`                            | matched | unit and e2e tests         |
| `validationBehavior`  | `native`, `aria`                | radio options, default `native`                          | matched | unit and e2e tests         |
| `isRequired`          | descendant required state       | checkbox default off                                     | matched | unit and e2e tests         |
| `isDisabled`          | descendant disabled state       | checkbox default off                                     | matched | unit and e2e tests         |
| `isEmphasized`        | descendant emphasized styling   | checkbox default off                                     | matched | e2e computed contract      |
| native Form props     | action/method/target/encoding   | API forwarding                                           | matched | headless and S2 unit tests |
| submit/reset events   | native form events              | API forwarding                                           | matched | headless and S2 unit tests |
| Skeleton interaction  | loading descendants disabled    | Skeleton-wrapped Form with child opt-out                 | matched | unit test                  |
| route control surface | labels, values, selected states | visible controls and serialized React/Solid fixture data | matched | e2e route-control test     |
| forced-colors branch  | accessibility media             | XL side-label required/disabled/emphasized ARIA route    | matched | e2e forced-colors test     |

## Baseline

- Before the support sweep, Form was an official catalogue gap with no live
  React/Solid route and no Form-specific strict visual assertion.
- The initial Form pass made Form live, but left hidden retro-audit debt in
  native form forwarding, route-control assertions, full branch coverage,
  Skeleton disabled precedence, forced-colors, and current report evidence.
- Current reports after current-gate normalization list:
  - official entries in comparison app: `69`;
  - live entries: `47`;
  - missing/gap entries: `22`;
  - visual states tracked: `261`;
  - visual evidence states: `76`;
  - strict pair-diff states: `46`;
  - blocked visual states: `22`;
  - `solid-spectrum` public value exports: `157`;
  - missing S2 value exports: `57`;
  - extra Solid value exports: `6`.

## Source Map And Public Contract

| Layer            | Upstream files                       | Solid files                                                              | Status  |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------ | ------- |
| State            | none                                 | none                                                                     | n/a     |
| ARIA/headless    | React Aria Components Form/TextField | `solidaria-components/src/Form.tsx`, TextField, Button                   | matched |
| Styled S2        | `@react-spectrum/s2/src/Form.tsx`    | `solid-spectrum/src/form`, `src/textfield`, `src/button`, `src/skeleton` | matched |
| Comparison route | S2 docs/viewer and React S2 fixture  | demo data, controls, fixtures, visual matrix, e2e                        | matched |

- Public props/defaults:
  - `size`: defaults to `M`; documented values are `S`, `M`, `L`, and `XL`.
    Legacy lowercase aliases are not accepted by the styled S2 Form root.
  - `labelPosition`: defaults to `top`.
  - `labelAlign`: defaults to `start`.
  - `necessityIndicator`: defaults to `icon`.
  - `validationBehavior`: defaults to `native`; `aria` sets `noValidate` and
    uses ARIA-required semantics on descendants.
  - `isRequired`, `isDisabled`, and `isEmphasized`: inherited by form-aware S2
    descendants unless locally overridden.
  - Skeleton loading forces `isDisabled=true` after local Form/TextField/Button
    props are merged, matching upstream S2 precedence.
  - Native form props/events including `action`, `method`, `target`,
    `autocomplete`/`autoComplete`, `enctype`/`encType`, `name`, `rel`,
    `onSubmit`, and `onReset` forward to the root form.
  - `aria-describedby`, `aria-details`, `aria-label`, `aria-labelledby`, `id`,
    and root `ref` forward to the underlying `HTMLFormElement`.
  - `styles`, `UNSAFE_className`, and `UNSAFE_style` apply to the S2 root.
    Legacy styled `class` is not accepted by the S2 Form API.
- Contexts/providers:
  - `FormContext` provides S2 field props to styled descendants.
  - Headless `FormContext` and `FormValidationContext` provide validation
    behavior and server validation errors.
  - `SkeletonContext` disables form-aware descendants during loading.

## Source Branch Coverage

| Layer    | Upstream branch               | Solid owner                     | Class             | Observable                                            | Status  | Evidence               |
| -------- | ----------------------------- | ------------------------------- | ----------------- | ----------------------------------------------------- | ------- | ---------------------- |
| Styled   | root Form grid                | S2 `formStyles`                 | visual/layout     | grid columns, row/column gaps                         | matched | e2e computed contract  |
| Styled   | label placement/alignment     | FormContext + TextField styles  | visual/layout     | top/side and start/end label geometry                 | matched | e2e full option matrix |
| Styled   | size inheritance              | FormContext + TextField/Button  | visual/layout     | S/M/L/XL field and button sizing                      | matched | unit and e2e tests     |
| Styled   | necessity indicator           | TextField label render          | visual/content    | icon vs `(required)` label output                     | matched | unit and e2e tests     |
| Headless | native form attributes        | Solidaria Form forwarding       | API               | action/method/target/encoding/name/rel attrs          | matched | unit tests             |
| Headless | ARIA descriptions             | Solidaria Form forwarding       | accessibility/API | `aria-describedby` and `aria-details` root attrs      | matched | unit tests             |
| Headless | root ref forwarding           | Solidaria Form forwarding       | lifecycle/API     | root ref resolves to `HTMLFormElement`                | matched | unit tests             |
| Headless | submit/reset events           | Solidaria Form event forwarding | runtime           | event handlers receive native form events             | matched | unit tests             |
| Headless | native validation behavior    | Form/TextField validation merge | semantics         | native `required` vs ARIA `aria-required`             | matched | focused tests          |
| Context  | local child override          | `useFormProps` proxy            | composition       | child `isDisabled={false}` can override Form disabled | matched | unit test              |
| Context  | Skeleton disabled precedence  | `useFormProps` + Button merge   | composition       | Skeleton wins over local child opt-out                | matched | unit test              |
| Runtime  | child/provider laziness       | Form wraps headless render path | lifecycle/context | descendants are created under active contexts         | matched | unit and e2e tests     |
| Runtime  | reduced-motion media fallback | Skeleton animation helper       | lifecycle         | missing/broken `matchMedia` falls back safely         | matched | focused Button test    |
| Harness  | route control surface         | comparison route                | route integrity   | visible labels/order/defaults and changed props       | matched | e2e route-control test |
| Harness  | styled root DOM contract      | comparison route                | DOM/style         | no visual prop marker attrs leak to root form         | matched | e2e contract test      |
| Styled   | forced-colors environment     | generated S2 CSS                | visual/a11y       | computed contract matches React under forced colors   | matched | e2e forced-colors test |

## Transition Plan

- Static states:
  - default top-label native Form;
  - every size branch;
  - top and side label-position branches;
  - side label start/end alignment;
  - icon and label necessity indicators;
  - native and ARIA validation behavior;
  - disabled, emphasized, and combined XL required/disabled/emphasized route;
  - forced-colors active.
- Runtime timelines:
  - submit/reset native events dispatch and can be prevented;
  - `validationBehavior` changes required semantics on TextField descendants;
  - local child props override Form context outside Skeleton;
  - Skeleton loading overrides local disabled opt-out.
- Visual-state rows changed:
  - Form has strict default evidence plus asserted route-control, inheritance
    matrix, root DOM contract, and forced-colors rows.

## Runtime Semantics

- Native form contract:
  - native form attributes and event handlers forward through the headless Form
    root and the styled S2 Form wrapper.
  - `validationBehavior="native"` preserves browser validation; `aria` disables
    native validation and lets descendants expose ARIA validation state.
- Accessible name/description assertions:
  - ARIA label and description props pass through the Form root; unit tests
    assert `aria-describedby` and `aria-details` at headless and styled layers.
- Refs/imperative behavior:
  - root refs resolve to the underlying `HTMLFormElement` in both layers.
- Solid idiom regression assertions:
  - FormContext values remain reactive through the styled wrapper; local
    descendant props override Form context unless Skeleton loading is active.
- Portal/provider/global cleanup:
  - not applicable. Form owns no portals, document-level listeners, observers,
    subscriptions, or timers.
- SSR/hydration note:
  - Form adds no generated IDs or client-only lifecycle side effects.

## Evidence

```bash
vp test run packages/solidaria-components/test/Form.test.tsx packages/solid-spectrum/test/Form.test.tsx packages/solidaria/test/createTextField.test.tsx packages/solidaria-components/test/TextField.test.tsx packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/Button.test.tsx
vp run --filter @proyecto-viviana/solidaria-components build
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison -- playwright test e2e/form-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solidaria/Solid Spectrum Form/TextField/Skeleton/Button tests:
  `113 passed`.
- Solidaria Components build: passed.
- Solid Spectrum build: passed after dependency packages were built.
- Comparison build: passed and generated `/components/form/`.
- Form Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `47`,
  missing/gap entries at `22`, visual states tracked at `261`, visual evidence
  states at `76`, strict pair-diff states at `46`, and blocked visual states at
  `22`.
- Current export report lists `solid-spectrum` public value exports at `157`,
  missing React S2 value exports at `57` of `208`, and extra Solid value
  exports at `6`.
- RAC export and tracked-symbol guards still report no missing Solid names;
  `guard:rac-export-gap` reports `166` extra Solidaria Components exports and
  `guard:rac-parity` keeps the existing `TreeHeader` / `TreeSection` tracker
  warning.
- Full repo check: passed.

## Handoff

- Current-gate status: Form is accepted as of 2026-05-20.
- Current Form evidence owns the TextField and Button inherited-state fixture.
  Remaining form-aware components should still validate their own FormContext
  consumption during their component passes.
- The next current-gate normalization pass should continue with the remaining
  legacy accepted list in `apps/comparison/playbook/components/README.md`.
