# TextArea Validation Notes

Date: 2026-06-01
Status: accepted

## Scope

- Component: `TextArea`
- Family or direct subcomponents: S2 `TextArea`, React Aria textfield behavior
  for textarea inputs, Solid Spectrum `TextArea`, Solidaria Components
  `TextField` textarea mode, and Solidaria `createTextField`.
- Source owner touched:
  `packages/solidaria/src/textfield/createTextField.ts`,
  `packages/solid-spectrum/vite.config.ts`, package tests, and comparison e2e.
- Comparison owner touched:
  `apps/comparison/e2e/textarea-visual.spec.ts`,
  `apps/comparison/src/data/visual-state-matrix.ts`, and this note.

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                               | Notes                                                                                                                                                |
| ---------------------------------------- | ------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 docs route, `textarea-demo.ts`, component controls, styled fixtures.                | Viewer drives label, value, placeholder, size, description, error text, disabled, read-only, required, and invalid states.                           |
| External Authority And Standards         | passing | React Aria textfield behavior and installed React Spectrum S2 output.                  | Solid now defaults textfield validation to native, with `validationBehavior="aria"` as the explicit ARIA path.                                       |
| Upstream React Source Parity             | passing | React/Solid route comparison, package tests, generated CSS output.                     | Current evidence covers default and invalid required XL rendering, native required state, ARIA invalid state, resize, overflow, and auto-height.     |
| Solid Idiomatic Implementation           | passing | Solidaria lower hook, Solidaria Components field wrapper, Solid Spectrum wrapper.      | Shared lower hook owns validation attributes for input and textarea modes without duplicated TextArea wrapper logic.                                 |
| Accessibility And I18n                   | passing | Package tests and `e2e/textarea-visual.spec.ts`.                                       | Covered visible label, required semantics, invalid semantics, description/error association, disabled/read-only state, and controlled value updates. |
| Behavior State Machine                   | passing | Package tests and browser e2e.                                                         | Covered controlled multiline typing, height growth, settled auto-height, native required default, and explicit ARIA validation behavior.             |
| Style Source-To-Computed Parity          | passing | `e2e/textarea-visual.spec.ts` and generated `solid-spectrum` CSS through `styles.css`. | Browser proof compares field layout, group/input/help text geometry, invalid icon placement, colors, resize, overflow, and auto-height to React S2.  |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, serialized control props, visual-state matrix.            | Both stacks receive the same route props and expose matching value markers for controlled multiline behavior.                                        |
| Known Defects And Regression Protection  | passing | Focused package tests, browser tests, package build, and parity reports.               | Fixed native validation default and public CSS emission so generated S2 grid/layout rules reach comparison consumers.                                |
| Evidence And Handoff                     | passing | Verification commands below plus parity reports.                                       | TextArea is accepted for this component pass; no component-owned blocker remains.                                                                    |

## Agent Workflow

- Reviewed current route controls, package tests, generated CSS delivery, and
  the visual-state matrix before closing the missing validation note.
- Added default React-vs-Solid screenshot-pair coverage alongside the existing
  invalid required XL route proof.
- Aligned the lower `createTextField` default with React Aria native validation
  behavior and added explicit ARIA-validation tests for the alternate branch.
- Fixed the `solid-spectrum` package build so generated macro CSS is emitted as
  `styles.css` and imported through the public `components.css` path.
- Re-ran focused package, browser, build, gap, and strict parity reports.

## Behavior State Machine

- Default branch: textarea renders visible label, controlled multiline value,
  placeholder, description, and S2 field shell.
- Native validation branch: required TextArea uses the native `required`
  attribute by default and omits `aria-required`.
- ARIA validation branch: `validationBehavior="aria"` suppresses native
  required and exposes the required state through ARIA.
- Invalid branch: invalid required XL state exposes `aria-invalid`, error text,
  invalid icon, and matching S2 colors/geometry.
- Controlled branch: typing updates the actual textarea value and
  `data-comparison-value` marker on both stacks.
- Auto-height branch: multiline edits settle with textarea height matching
  scroll height and grow when content grows.

## Accessibility And I18n

- TextArea receives its accessible name from the visible label.
- Description and invalid error text are associated through the shared field
  helper.
- Disabled and read-only states reach the actual textarea element.
- Required state now matches React Aria's native-default validation behavior.
- No locale-sensitive formatting or translation catalogs are introduced in this
  component pass.

## Style Source-To-Computed

- Default and invalid required XL states have current React-vs-Solid
  screenshot-pair evidence.
- Invalid required XL computed assertions compare group width/height, textarea
  height, label-to-group gap, group-to-help gap, textarea centerline, invalid
  icon size/centerline, group border/background, textarea color, help color,
  resize, and overflow.
- The package build now keeps generated macro CSS in `dist/styles.css` instead
  of overwriting it with the source stub, so field grid-area classes reach
  comparison app consumers.

## Known Defects And Regression Protection

- Fixed during this pass: Solidaria textfield validation default used ARIA
  validation. It now defaults to native validation, matching React Aria and
  React Spectrum behavior.
- Fixed during this pass: public `solid-spectrum/components.css` imported a
  source `styles.css` stub instead of generated S2 macro CSS. The build now
  emits generated CSS as `styles.css` and copies only supporting CSS files.
- No component-owned blockers remain for TextArea acceptance.

## Verification

- `vp test run packages/solidaria/test/createTextField.test.tsx packages/solidaria-components/test/TextField.test.tsx packages/solid-spectrum/test/TextField.test.tsx packages/solid-spectrum/test/TextArea.test.tsx`
  - `4` files, `121` tests passed.
- `vp run comparison:build`
  - Passed and emitted generated Solid Spectrum CSS through `dist/styles.css`.
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec --filter @proyecto-viviana/comparison playwright test e2e/switch-visual.spec.ts e2e/textfield-visual.spec.ts e2e/textarea-visual.spec.ts e2e/picker-visual.spec.ts --project=chromium --reporter=line`
  - `24` Chromium tests passed.
- `vp run comparison:report:parity` and
  `vp run comparison:report:parity:strict`
  - Passed with validation notes and current visual/asserted evidence at
    `69/69`.

## Handoff

- Status after this pass: accepted.
- No component-owned blockers remain for TextArea in the current gate.
