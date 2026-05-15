# Form Validation Notes

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
- Current reports list:
  - official entries in comparison app: `69`;
  - live entries: `33`;
  - missing/gap entries: `36`;
  - visual states tracked: `181`;
  - visual evidence states: `49`;
  - strict pair-diff states: `32`;
  - blocked visual states: `35`;
  - missing S2 value exports: `80`;
  - extra Solid value exports: `3`.

## Source Map And Public Contract

| Layer            | Upstream files                       | Solid files                                                              | Status  |
| ---------------- | ------------------------------------ | ------------------------------------------------------------------------ | ------- |
| State            | none                                 | none                                                                     | n/a     |
| ARIA/headless    | React Aria Components Form/TextField | `solidaria-components/src/Form.tsx`, TextField, Button                   | matched |
| Styled S2        | `@react-spectrum/s2/src/Form.tsx`    | `solid-spectrum/src/form`, `src/textfield`, `src/button`, `src/skeleton` | matched |
| Comparison route | S2 docs/viewer and React S2 fixture  | demo data, controls, fixtures, visual matrix, e2e                        | matched |

- Public props/defaults:
  - `size`: defaults to `M`; legacy Solid aliases `sm`, `md`, `lg` normalize to
    `S`, `M`, `L`.
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
  - `styles`, `UNSAFE_className`, `UNSAFE_style`, and the legacy `class` alias
    apply to the S2 root.
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
| Headless | submit/reset events           | Solidaria Form event forwarding | runtime           | event handlers receive native form events             | matched | unit tests             |
| Headless | native validation behavior    | Form/TextField validation merge | semantics         | native `required` vs ARIA `aria-required`             | matched | focused tests          |
| Context  | local child override          | `useFormProps` proxy            | composition       | child `isDisabled={false}` can override Form disabled | matched | unit test              |
| Context  | Skeleton disabled precedence  | `useFormProps` + Button merge   | composition       | Skeleton wins over local child opt-out                | matched | unit test              |
| Runtime  | child/provider laziness       | Form wraps headless render path | lifecycle/context | descendants are created under active contexts         | matched | unit and e2e tests     |
| Runtime  | reduced-motion media fallback | Skeleton animation helper       | lifecycle         | missing/broken `matchMedia` falls back safely         | matched | focused Button test    |
| Harness  | route control surface         | comparison route                | route integrity   | visible labels/order/defaults and changed props       | matched | e2e route-control test |
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
    matrix, and forced-colors rows.

## Evidence

```bash
vp test run packages/solidaria-components/test/Form.test.tsx packages/solid-spectrum/test/Form.test.tsx packages/solidaria/test/createTextField.test.tsx packages/solidaria-components/test/TextField.test.tsx packages/solid-spectrum/test/Skeleton.test.tsx packages/solid-spectrum/test/Button.test.tsx
vp run --filter @proyecto-viviana/solid-spectrum build
vp run --filter @proyecto-viviana/comparison build
vp exec --filter @proyecto-viviana/comparison playwright test e2e/form-visual.spec.ts --reporter=line
vp run comparison:report:gaps
vp run comparison:report:exports
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run check
```

Results:

- Focused Solidaria/Solid Spectrum Form/TextField/Skeleton/Button tests:
  `107 passed`.
- Solid Spectrum build: passed after dependency packages were built.
- Comparison build: passed and generated `/components/form/`.
- Form Playwright suite: `4 passed`.
- Current gap report lists official styled entries live on both sides at `33`,
  missing/gap entries at `36`, visual states tracked at `181`, visual evidence
  states at `49`, strict pair-diff states at `32`, and blocked visual states at
  `35`.
- Current export report lists missing React S2 value exports at `80` of `208`
  and extra Solid value exports at `3`.
- RAC export and tracked-symbol guards report no missing Solid names.
- Full repo check: passed.

## Handoff

- Form is playbook-accepted for owned behavior.
- Current Form evidence owns the TextField and Button inherited-state fixture.
  Remaining form-aware components should still validate their own FormContext
  consumption during their component passes.
- The support-component sweep is closed for the currently live support set;
  continue with the next styled S2 gap from the report.
