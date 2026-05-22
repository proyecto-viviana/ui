# ColorField Validation Notes

Date: 2026-05-22
Status: accepted

## Target

- Component: ColorField
- Slug: `colorfield`
- Family or direct subcomponents: `ColorField`, `ColorFieldContext`, hidden
  channel form input, `createColorField`, and `createColorFieldState`.
- Pass goal: accept ColorField under the current full gate model with parity for
  S2 field layout, official viewer controls, hex and channel editing,
  controlled/default values, labels/help/error text, form forwarding,
  validation, channel keyboard behavior, and public package exports.

## Task Status

| Task                   | Status   | Evidence                                                                                                                       |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 0 Research             | complete | React Spectrum S2 and React Aria ColorField docs/source; installed S2/RAC source.                                              |
| 1 Baseline             | complete | `comparison:report:gaps`, `comparison:report:exports`, current route and color package tests.                                  |
| 2 Route harness        | complete | `apps/comparison/e2e/colorfield-visual.spec.ts` and `e2e/modeled-controls-contract.spec.ts`.                                   |
| 3 Source map/API       | complete | S2 `ColorField.tsx`, RAC ColorField source, React Aria/Stately color source, and Solid owner files below.                      |
| 4 Cross-layer audit    | complete | State, ARIA hook, headless component, styled wrapper, fixtures, controls, and reports mapped.                                  |
| 5 Transitions          | complete | Hex input, channel textbox keyboard updates, disabled/read-only/invalid/required, form, labeling, and route controls covered.  |
| 6 State                | complete | `packages/solid-stately/test/color.test.ts`.                                                                                   |
| 7 ARIA hooks           | complete | `packages/solidaria/src/color/createColorField.ts` and color tests, including hex explicit role vs channel implicit role.      |
| 8 Headless             | complete | `packages/solidaria-components/src/Color.tsx` and component tests, including active help/error ids and hidden input placement. |
| 9 Styled S2            | complete | `packages/solid-spectrum/src/color/index.tsx`, public subpath/export, and browser contracts.                                   |
| 10 Runtime lifecycle   | complete | Controlled/default remount keys, live provider values, and control event listeners audited.                                    |
| 11 Harness integrity   | complete | React fixture imports real S2 ColorField; Solid fixture imports public S2 package/subpath.                                     |
| 12 Comparison evidence | complete | Focused browser, package, typecheck, build, report, and root check gates listed below.                                         |
| 13 Acceptance          | complete | No accepted ColorField blockers remain; unrelated existing regression snapshot failures are documented below.                  |

## Agent Workflow

No subagents were used for this component pass.

| Agent role | Files read                                                                                                         | Files changed                                                                                                                                  | Evidence added                                                                                                             | Commands run | Blockers | Next owner |
| ---------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------ | -------- | ---------- |
| main       | S2/React Aria docs through MCP; installed S2/RAC source; color state/headless/styled source; route fixtures/tests. | Color state/hook/headless/styled files, ColorField public exports, comparison route data/fixtures/tests/reports, package tests, and this note. | Hex/channel state, hidden input contracts, field layout/style, textbox keyboard behavior, validation, and export coverage. | See below.   | none     | none       |

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

| Gate                                     | Outcome  | Evidence                                                                                                                                                                                                                                                                    | Blockers/owner |
| ---------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| Official Docs And Viewer Parity          | complete | S2 ColorField page sections checked on 2026-05-22: Value, Channel, Forms, API, Related Types. Route controls cover value/defaultValue, channel/colorSpace, name/form, label/help/error, validation, size, label alignment, necessity, ARIA, id, slot.                       | none           |
| External Authority And Standards         | complete | React Aria ColorField docs/source define hex and channel textbox mode, channel keyboard adjustment behavior, hidden channel form input, and color parsing/validation expectations. Native input/form behavior is asserted in browser tests.                                 | none           |
| Upstream React Source Parity             | complete | Installed S2 `ColorField.tsx`, React Aria Components ColorField source, React Aria/Stately color hooks, and Solid owner files were mapped across state, ARIA, headless, and styled layers. React channel mode hidden-input placement and implicit textbox role are covered. | none           |
| Solid Idiomatic Implementation           | complete | Solid props remain accessor-backed through providers and fixtures; controlled/default modes remount only when needed; event listeners clean up; render/context values remain live.                                                                                          | none           |
| Accessibility And I18n                   | complete | Browser contract compares root ids/slot/data states, labels/help/error text, textbox accessibility, ARIA references/details/invalid/required attributes, disabled/read-only state, and hidden input name/form/value/placement.                                              | none           |
| Behavior State Machine                   | complete | Package and browser tests cover valid/invalid hex, missing `#`, empty commit, channel normalization, percent channels, textbox keyboard increments, controlled/default value, hidden input sync, validation, and disabled/read-only behavior.                               | none           |
| Style Source-To-Computed Parity          | complete | Browser contract and screenshot pair compare S2 field grid/group/input dimensions, group radius/background/min-height, label/help/error presence, and default visual pair parity against React Spectrum.                                                                    | none           |
| React-Vs-Solid Comparison Harness Parity | complete | React fixture imports `@react-spectrum/s2/ColorField`; Solid fixture imports `@proyecto-viviana/solid-spectrum`; both receive shared serialized route props and provider theme/locale.                                                                                      | none           |
| Known Defects And Regression Protection  | complete | Fixed and covered: invalid hex parsing, hex/channel state behavior, ARIA/form hidden input forwarding, S2 public export/subpath, side-panel controls, and ColorField route visual contracts.                                                                                | none           |
| Evidence And Handoff                     | complete | Commands below are green for ColorField. A full unrelated `solid-spectrum` regression snapshot run still has pre-existing failures in other components and is not ColorField acceptance evidence.                                                                           | none           |

## Research

- React Spectrum S2 docs: ColorField sections are Value, Channel, Forms, API,
  and Related Types.
- React Aria docs: ColorField sections are Vanilla CSS example, Tailwind
  example, Value, Channel, Forms, API, and Related Types.
- Installed upstream source:
  - `apps/comparison/node_modules/@react-spectrum/s2/src/ColorField.tsx`
  - React Aria Components ColorField source in the installed package.
  - React Aria and React Stately color field/color source in the installed
    packages.
- React source caveat resolved: hex mode uses `useColorField` and applies an
  explicit `role="textbox"` while channel mode uses
  `useColorChannelField -> useNumberField`, which removes the explicit role and
  numeric value ARIA from the visible native text input.
- React Aria Components channel mode renders the hidden form input as a sibling
  after the field root. Solid now matches that DOM shape rather than nesting the
  hidden input inside the visible field root.
- Source disagreement resolved: S2 exposes the styled `ColorField` wrapper, not
  separate group/input/help/error subcomponents. The Solid S2 package follows
  that public surface while the lower-level `solidaria-components` layer keeps
  composable headless pieces.

## Official Docs And Viewer Parity

| Docs item    | Official setting/example                     | Route/control                                                                      | Status  |
| ------------ | -------------------------------------------- | ---------------------------------------------------------------------------------- | ------- |
| Value        | Controlled and uncontrolled color value.     | `valueSource`, `value`, `defaultValue`.                                            | passing |
| Channel      | Optional `channel` and `colorSpace` editing. | `channel`, `colorSpace`, channel normalization, implicit textbox browser contract. | passing |
| Forms        | Channel fields submit a hidden input value.  | `name`, `form`, sibling hidden input browser assertions.                           | passing |
| Field chrome | S2 label, group input, help/error text.      | `label`, `description`, `errorMessage`, `size`, label/necessity controls.          | passing |
| ARIA         | Label/reference/detail/id/slot/state props.  | Side-panel controls and DOM contract.                                              | passing |
| Viewer state | Same props drive React and Solid examples.   | `colorfield-demo.ts`, React/Solid fixtures, controls contract.                     | passing |

## Source Map And Public Contract

| Layer               | Upstream files                                                       | Solid files                                                                        | Status                                                                                                                             |
| ------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| State               | React Stately color field state and color parsing/conversion source  | `packages/solid-stately/src/color/createColorFieldState.ts`, `Color.ts`            | Matched hex parsing, channel ranges, nullable values, commit rules, controlled/default state, and events.                          |
| ARIA hooks          | React Aria color field hook/source                                   | `packages/solidaria/src/color/createColorField.ts`, `types.ts`                     | Matched textbox props, keyboard/wheel handling, generated ids, labels, form/name, validation, and channel implicit role semantics. |
| Headless components | React Aria Components `ColorField`, `Input`, `Label`, `Text`, errors | `packages/solidaria-components/src/Color.tsx`                                      | Matched provider state, root data-channel, sibling hidden channel input, label/help/error composition.                             |
| Styled S2           | `@react-spectrum/s2/src/ColorField.tsx`                              | `packages/solid-spectrum/src/color/index.tsx`, `src/ColorField.ts`, `src/index.ts` | Matched public S2 wrapper API, FieldLabel/FieldGroup/Input/HelpText path, sizes, layout props, exports.                            |

## Behavior State Machine

| State/input      | Trigger                                     | Expected React                                                                     | Expected Solid | Evidence                                               |
| ---------------- | ------------------------------------------- | ---------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------ |
| Official default | Route mount                                 | Hex textbox with label, placeholder, value, help text, and S2 field layout.        | Same.          | `colorfield-visual.spec.ts`.                           |
| Controlled hex   | Typing/commit                               | Valid hex updates color; partial/invalid input is handled by commit validation.    | Same.          | Package tests for state/headless layers.               |
| Empty hex        | Commit empty text                           | Color value becomes null where upstream allows no color.                           | Same.          | `packages/solid-stately/test/color.test.ts`.           |
| Channel mode     | `channel=red&colorSpace=rgb&name=...` mount | Visible native textbox without explicit role plus sibling hidden form input value. | Same.          | Browser channel contract.                              |
| Keyboard channel | ArrowUp on visible textbox                  | Channel increases and hidden input stays synchronized.                             | Same.          | Browser keyboard test.                                 |
| Invalid required | `isInvalid`, `isRequired`, aria validation  | ARIA invalid/required and error text are exposed.                                  | Same.          | Browser invalid/required contract and component tests. |
| Field controls   | Side-panel control event                    | React and Solid receive the same mounted props and DOM updates.                    | Same.          | Modeled controls contract.                             |

## Accessibility And I18n

- Hex and channel modes use visible native text inputs; channel mode also uses
  a sibling hidden input for form submission when `name` is set.
- Hex mode preserves React's explicit `role="textbox"`. Channel mode deliberately
  has no explicit `role` attribute on the visible input, matching React Aria's
  `useColorChannelField -> useNumberField` path while remaining discoverable by
  role through the native input semantics.
- Generated and explicit `id`, `aria-labelledby`, `aria-describedby`,
  `aria-details`, label text, description, error text, required, invalid,
  disabled, read-only, `name`, `form`, and `slot` are compared to React
  Spectrum.
- Invalid S2 help text follows the active slot: the input describes the error
  message when invalid and does not keep the description id alongside it.
- Channel keyboard increments use localized number semantics from the color
  field state and keep hidden form values synchronized.
- No component-local strings require translation beyond upstream label/help
  text supplied by props and color/number formatting from the state layer.

## Style Source-To-Computed Parity

- S2 root uses field layout classes with the same label/group/help/error
  structure as upstream.
- Field group radius, background, minimum height, input font/line-height, field
  grid display, width, and height are compared in the browser contract.
- Default visual screenshot pair is captured against the live React Spectrum
  implementation with bounded tolerance for browser text antialiasing.
- The comparison app does not patch ColorField component style or geometry.

## Known Defects And Regression Protection

| Finding source      | Defect or risk                                                                                                                                           | Class                    | Blocking? | Regression evidence or owner                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------- |
| Current pass        | Invalid hex strings could parse through to black instead of preserving invalid input semantics.                                                          | port bug                 | no        | State tests cover invalid hex and commit/reset behavior.                                                              |
| Current pass        | Channel fields exposed non-upstream spinbutton semantics and lacked hidden input form forwarding.                                                        | port bug                 | no        | Browser channel contract and component tests.                                                                         |
| Current pass        | Channel fields had an explicit textbox role and nested hidden form input, while React uses native implicit textbox semantics and a sibling hidden input. | port bug                 | no        | Browser channel contract and component tests.                                                                         |
| Current pass        | Invalid state kept both description and error ids in `aria-describedby`, unlike S2 active HelpText behavior.                                             | port bug                 | no        | Browser invalid/required contract and S2 component test.                                                              |
| Current pass        | S2 public package did not expose a ColorField subpath/root export.                                                                                       | API bug                  | no        | Export report and package entry updates.                                                                              |
| Current pass        | Comparison viewer lacked official ColorField controls and React-vs-Solid route evidence.                                                                 | harness bug              | no        | `colorfield-demo.ts`, side-panel controls, modeled-controls contract, and visual spec.                                |
| Baseline regression | Full `packages/solid-spectrum/test/regression.test.tsx` currently has unrelated stale snapshots.                                                         | unrelated family failure | no        | Failures are in Slider, Menu, ActionMenu, Tooltip, Toast, Breadcrumbs, DateField, and Meter; not ColorField-specific. |

## Commands

- `vp test run packages/solid-stately/test/color.test.ts packages/solidaria-components/test/Color.test.tsx packages/solid-spectrum/test/ColorField.test.tsx`
  - `3` files, `134` tests passed.
- `vp run comparison:typecheck`
  - comparison Astro check passed.
- `vp run comparison:build`
  - comparison build passed and generated the ColorField route.
- `vp exec --filter @proyecto-viviana/comparison playwright test e2e/colorfield-visual.spec.ts e2e/modeled-controls-contract.spec.ts --grep ColorField --reporter=line --workers=1`
  - focused ColorField browser tests passed.
- `vp run comparison:report:gaps`
  - report passed with ColorField listed as asserted visual evidence.
- `vp run comparison:report:exports`
  - report passed with no ColorField export gap.
- `vp check --fix`
  - formatting and lint passed.
- `git diff --check`
  - no whitespace errors.

## Remaining Gaps

- Dedicated assistive-technology transcript capture remains process-wide
  tooling debt; this pass includes semantic DOM, keyboard, and browser parity
  assertions but not a screen-reader transcript.
- Other color components (`ColorSlider`, `ColorSwatch`, `ColorSwatchPicker`,
  and `ColorWheel`) remain separate component passes.
