# Switch Validation Notes

Date: 2026-06-01
Status: accepted

## Scope

- Component: `Switch`
- Family or direct subcomponents: S2 `Switch`, React Aria switch behavior,
  Solid Spectrum `Switch`, Solidaria Components `Switch`, and Solidaria
  `createSwitch`.
- Source owner touched: no Switch runtime source changes in this pass.
- Comparison owner touched:
  `apps/comparison/e2e/switch-visual.spec.ts`,
  `apps/comparison/src/data/visual-state-matrix.ts`, and this note.

## Acceptance Gate Checklist

| Gate                                     | Status  | Evidence                                                                    | Notes                                                                                                                                   |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Official Docs And Viewer Parity          | passing | S2 docs route, `switch-demo.ts`, component controls, styled fixtures.       | Viewer drives content, size, selected, emphasized, disabled, and read-only states into both stacks.                                     |
| External Authority And Standards         | passing | React Aria switch behavior and installed React Spectrum S2 output.          | Solid keeps checkbox-backed switch semantics, role exposure, checked state, disabled suppression, read-only suppression, and focus.     |
| Upstream React Source Parity             | passing | React/Solid route comparison and package tests.                             | Current evidence covers default and selected emphasized XL rendering, track/thumb geometry, color, transform, and motion-node behavior. |
| Solid Idiomatic Implementation           | passing | Existing Solid Spectrum, Solidaria Components, and Solidaria Switch tests.  | The pass did not add wrapper complexity; behavior remains owned by existing Solid state and lower-layer hooks.                          |
| Accessibility And I18n                   | passing | Package tests and `e2e/switch-visual.spec.ts`.                              | Covered accessible switch name, focus retention after keyboard activation, disabled state, read-only state, and checked state.          |
| Behavior State Machine                   | passing | Switch package tests and browser e2e.                                       | Covered uncontrolled/controlled selection, click toggle, Enter toggle, Space toggle, disabled suppression, read-only suppression.       |
| Style Source-To-Computed Parity          | passing | `e2e/switch-visual.spec.ts`.                                                | Browser proof compares track/thumb dimensions, offsets, colors, transform, will-change, and centerline against current React Spectrum.  |
| React-Vs-Solid Comparison Harness Parity | passing | React/Solid styled fixtures, serialized control props, visual-state matrix. | Both stacks receive the same route props and expose the same selected marker used by route-control assertions.                          |
| Known Defects And Regression Protection  | passing | Focused browser tests and package tests.                                    | Fixed the route-control helper to click the visible label instead of the hidden input when toggling side-panel Switch controls.         |
| Evidence And Handoff                     | passing | Verification commands below plus parity reports.                            | Switch is accepted for this component pass; no component-owned blocker remains.                                                         |

## Agent Workflow

- Reviewed current route coverage, package tests, and the visual-state matrix
  before adding missing current-gate validation notes.
- Added default React-vs-Solid screenshot-pair coverage so both default and
  selected emphasized XL rows have current visual evidence.
- Reworked the side-panel helper to toggle the visible label, matching how a
  user interacts with the modeled control and avoiding hidden-input click
  interception.
- Re-ran focused package, browser, gap, and strict parity reports.

## Behavior State Machine

- Default branch: switch starts unchecked and reports `data-comparison-selected`
  as `false`.
- Pointer branch: clicking the visible label toggles selection and updates the
  route marker on both stacks.
- Keyboard branch: Enter selects, Space clears, focus remains on the switch,
  and thumb offset changes in the expected direction.
- Disabled branch: side-panel disabled state reaches the actual input and
  prevents interaction.
- Read-only branch: side-panel read-only state reaches the actual control and
  suppresses selection changes.
- Motion branch: the track and thumb nodes are preserved during toggle so CSS
  transition state is not reset by DOM replacement.

## Accessibility And I18n

- Switch exposes an accessible name from visible content.
- Disabled and read-only states are reflected on the actual control state used
  by assistive technology.
- Keyboard activation works through the native/focusable control path.
- No locale-sensitive formatting or translation catalogs are introduced in this
  component pass.

## Style Source-To-Computed

- Default and selected emphasized XL states have current React-vs-Solid
  screenshot-pair evidence.
- Selected emphasized XL computed assertions compare track width/height,
  thumb width/height, thumb offset, thumb centerline, track background, track
  border, thumb background, label color, transform, and will-change.
- Motion assertions verify the thumb transform changes while the same DOM node
  remains mounted.

## Known Defects And Regression Protection

- Fixed during this pass: the side-panel Switch control helper attempted to
  click a hidden checkbox input. It now clicks the ancestor label and asserts
  the resulting checked state.
- No component-owned blockers remain for Switch acceptance.

## Verification

- `vp test run packages/solidaria/test/createSwitch.test.tsx packages/solidaria-components/test/Switch.test.tsx packages/solid-spectrum/test/Switch.test.tsx`
  - `3` files, `62` tests passed.
- `COMPARISON_BASE_URL=http://127.0.0.1:4321 vp exec --filter @proyecto-viviana/comparison playwright test e2e/switch-visual.spec.ts e2e/textfield-visual.spec.ts e2e/textarea-visual.spec.ts e2e/picker-visual.spec.ts --project=chromium --reporter=line`
  - `24` Chromium tests passed.
- `vp run comparison:report:parity` and
  `vp run comparison:report:parity:strict`
  - Passed with validation notes and current visual/asserted evidence at
    `69/69`.

## Handoff

- Status after this pass: accepted.
- No component-owned blockers remain for Switch in the current gate.
