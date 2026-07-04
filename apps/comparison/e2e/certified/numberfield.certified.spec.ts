import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, input + stepper buttons field composite):
 * NumberField. A TextField-shaped composite (upstream S2 `NumberField.tsx` →
 * `AriaNumberField` + shared `FieldLabel`/`FieldGroup`/`HelpText`) whose FieldGroup
 * holds the `<input>` PLUS a trailing two-button stepper (decrement / increment):
 *
 *   FieldGroup(role="group")  ->  [ <input type="text"> | Dash StepButton | Add StepButton ]
 *
 * The port's separate `numberfield/index.tsx` hand-roll carried the SAME field-family
 * divergences the rest of the input family did, all reverted here to realign the
 * OUTPUT to upstream (the shared FieldLabel/HelpText *extraction* stays tracked as
 * `helptext-fielderror-visual-port`):
 *
 *   (1) help text rendered a `<p>` + a hand-roll-only `margin:0` in `helpTextStyles`.
 *       Upstream's shared `HelpText` renders `<Text slot="description">` (a `<span>`,
 *       no UA margin) and its `helpTextStyles` has no `margin`. Reverted: description
 *       now `<span slot="description">`, error `<span slot="errorMessage">`, and the
 *       stray `margin:0` is gone. A `<p>` also carries an implicit `paragraph` role a
 *       `<span>` does not → both a computed-style AND an AX revert. → D1 `description`
 *       part, D6.
 *   (2) the root `style(field(), …)(…)` invocation spread the render-prop bag
 *       (`{...renderProps, …}`). Upstream passes ONLY `{ isInForm, labelPosition,
 *       size }` (NumberField.tsx) — `isDisabled`/`isFocused`/… are threaded DOWN to the
 *       FieldGroup/label/help text, not applied to the field grid. `field()` has no
 *       such conditions today so the computed root is unchanged either way, but the
 *       faithful arg set matches upstream and guards against a future condition being
 *       silently lit (the exact lesson from the SearchField root-color fix). → parity.
 *   (3) the input's `aria-roledescription` was a lowercase hand-roll `"number field"`.
 *       Upstream renders `stringFormatter.format('numberField')`, whose en-US value is
 *       `"Number field"` (capitalised). Corrected to match byte-for-byte; full locale
 *       routing via `createStringFormatter` is tracked as `intl-roledescription-
 *       hardcodes`. → D6 (the input node's roledescription).
 *
 * FieldGroup role — like SearchField (and UNLIKE TextField/TextArea, whose RAC seeds
 * `GroupContext` with `{role:'presentation'}`): RAC/react-aria `useNumberField` seeds
 * `groupProps` with `role:'group'` (+ mirrored `aria-disabled`/`aria-invalid`), so the
 * inner `<Group>` is a real `role="group"` node. The port's `createNumberField`
 * already produces the same `groupProps` (role:"group" + aria-disabled/invalid), so the
 * port's group is correct; D6 (below) certifies the React AX tree DOES expose a `group`
 * node here. The lesson (again): verify the role per RAC component; it does not transfer.
 *
 * DOM shape (demo default: label "Quantity", value 5, description "Enter a quantity.",
 * size M, steppers shown), verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="numberfield">          ← fixture wrapper
 *     <div field>                                             ← AriaNumberField grid
 *       <div labelWrapper><label -label>Quantity</label></div>← FieldLabel
 *       <div group role="group">                              ← FieldGroup
 *         <input type="text" inputmode="decimal" value="5">
 *         <div stepper><StepButton Dash/><StepButton Add/></div>  ← only !hideStepper
 *       </div>
 *       <span slot="description">Enter a quantity.</span>      ← HelpText (revert 1)
 *     </div>
 *   </div>
 *
 * Both fixtures wrap the component in the `data-comparison-control-root="numberfield"`
 * `<div>`, so the field grid is `${root} > div` (a wrapper hop, like TextField/TextArea
 * — NOT SearchField, whose fixture put the attr directly on the component).
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the split-control justification shared by
 * the whole input family): the focusable `<input>` is not the primary styled surface
 * (that is the separate `FieldGroup` `<div>`, whose border reacts to focus-within via a
 * render-prop class), so no single element is focusable-and-styled. Everything that
 * varies (size / disabled / required / read-only / hide-stepper) is prop-driven and
 * captured at rest.
 *
 * D1 parts are the always-present set (labelWrapper, label, group, input, description);
 * the trailing stepper buttons are deliberately NOT D1 parts because they vanish in the
 * `hide-stepper` case (a part locator resolving to zero elements would throw). Their
 * pixels — incl. the Dash/Add ui-icon glyphs — are certified by D3 (whole-field diff)
 * in every stepper-present case; their exclusion from the tab order by D5.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel — incl. the stepper
 * buttons + Dash/Add glyphs), D5 (focus/keyboard — the stepper buttons are
 * `excludeFromTabOrder`/`tabIndex:-1` on both stacks, so the input is the SOLE tab stop;
 * `tab-cycle` certifies focus lands on the input and Tab/Shift+Tab exit and return,
 * mirroring TextField), D6 (AX: the textbox role + `aria-roledescription="Number field"`
 * (revert 3) + name-from-label + description, wrapped in the `role="group"` FieldGroup),
 * D7 (contrast: label + description). NOT registered:
 *   - D4 events: the input's change/input + the stepper press ordering is a per-control
 *     concern the two fixtures wire differently (onInput vs onChange); out of scope here.
 *   - D8 target size: the input + stepper buttons are the hit targets; the composite
 *     adds none of its own.
 *   - D2 motion: the only motion is the border-color `transition` (pinned by D1) and the
 *     stepper press-scale transform (a per-gesture concern, not a mount animation).
 *
 * D6 uses the `hide-stepper` case ONLY — the sole demo case whose Dash/Add stepper
 * glyphs are absent, routing D6 around the tracked `ui-icon-decorative-ax-node`
 * divergence exactly as SearchField used `read-only` and Checkbox/RadioGroup used their
 * decoration-free variants: the Dash/Add stepper glyphs are UI-icons (bare `<svg>`
 * upstream → Chromium exposes an unnamed `img` child under each StepButton; the port's
 * `createUIIcon` marks them `role="img"` + decorative `aria-hidden` → no child node).
 * That is the GLOBAL icon-policy divergence (the port hides every ui-icon; arguably the
 * MORE correct a11y and it keeps our axe gate green), owned by the future `ui-icon` unit
 * — NOT flippable inside a per-component commit. With `hideStepper`, both stacks omit the
 * steppers entirely, so the hide-stepper tree is the clean textbox + group + description
 * structure. `default`/size/`disabled` (stepper glyphs) and `required` (decorative
 * AsteriskIcon svg) are the held-out decorative-node cases; their non-AX facets stay
 * covered by D1/D3/D5/D7.
 *
 * DEFERRED — the `isInvalid` state (the `<span slot="errorMessage">` error row + its
 * `AlertTriangleIcon` inside the group + `aria-invalid` re-flowing the field grid), held
 * to `helptext-fielderror-visual-port` as with the other Tier-2 units; the `<span>`/`slot`
 * markup is landed so it is faithful when that unit certifies invalid.
 */

const root = '[data-comparison-control-root="numberfield"]';

/** The `field` grid `<div>` (first child of the fixture wrapper) — the D1 target. */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>` (first grid child). */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The label `<label>` — a number input IS a labelable element (RAC `<Label>` is a
 *  `<label>`). */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div role="group">` (second grid child) — border/background/
 *  focus ring + pill radius + the input/stepper flex row. */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The `<input type="text">` — transparent chrome + flex-grow + truncate. */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);
/** The HelpText `<span slot="description">` (revert 1). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);

const numberFieldScenario: DriverScenario = {
  slug: "numberfield",
  title: "NumberField",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element — fieldLabel() color/font + disabled color.
    label: labelTarget,
    // The bordered field shell (role="group") — border/background/pill radius/focus
    // ring + control() sizing + fieldInput() padding + the paddingEnd stepper branch
    // + disabled/invalid tokens.
    group: groupTarget,
    // The number input — padding:0, transparent bg, inherit font, flex-grow/shrink:1,
    // min-width:0, width:full, truncate, text-align:start, no outline/border.
    input: inputTarget,
    // The HelpText span (revert 1) — helpTextStyles with NO margin (the stray margin:0
    // is gone): display:flex + font + color + padding-top:--field-gap + gap + baseline.
    description: descriptionTarget,
  },
  cases: [
    { id: "default" },
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    { id: "disabled", params: { isDisabled: "true" } },
    // Required — the necessity AsteriskIcon renders in the label (geometry + pixels
    // certified here; its decorative AX node is excluded from D6 below).
    { id: "required", params: { isRequired: "true" } },
    // Read-only — RAC sets the input `readonly`; the steppers are disabled but still
    // rendered, so this pins that the read-only attr does not leak into the styles.
    { id: "read-only", params: { isReadOnly: "true" } },
    // Hide-stepper — omits the stepper row on both stacks (the `isStepperHidden`
    // paddingEnd:edge-to-text branch fires) and is the clean D6 case (no ui-icons).
    { id: "hide-stepper", params: { hideStepper: "true" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      "contain",
      "box-sizing",
      "text-align",
      "grid-template-columns",
      "grid-template-areas",
      "grid-template-rows",
      "flex-grow",
      "flex-shrink",
      "min-width",
      "white-space",
      "text-overflow",
    ],
  },
  // D5: the stepper buttons are excluded from the tab order on both stacks, so the input
  // is the sole tab stop — Tab exits, Shift+Tab returns (the TextField/Checkbox walk).
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the input's textbox role + `aria-roledescription="Number field"` (revert 3) +
  // accessible name (from the `<label>`) + description (via aria-describedby) + the
  // `role="group"` FieldGroup node (present here, like SearchField, unlike TextField).
  //
  // Scoped to `hide-stepper` — the ONE demo case whose Dash/Add stepper glyphs are
  // absent, routing D6 around the tracked `ui-icon-decorative-ax-node` divergence (the
  // stepper glyphs are UI-icons: bare `<svg>` upstream → unnamed `img` child on React;
  // the port's `createUIIcon` marks them decorative → no child node). That is the GLOBAL
  // icon policy owned by the future `ui-icon` unit, not flippable per-component. The
  // StepButtons' OWN role+name are not the divergence; only their decorative child `img`
  // differs, and with `hideStepper` both stacks omit them entirely — nothing NumberField-
  // specific is lost. `required` (decorative AsteriskIcon svg) and `default`/size/
  // `disabled` (stepper glyphs) are the held-out decorative-node cases; their non-AX
  // facets stay covered by D1/D3/D5/D7.
  ax: {
    cases: ["hide-stepper"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: label + description contrast, resting + disabled, both themes. (The input value
  // lives in `.value` with no child text node — like TextField, not measured; the
  // stepper glyphs are currentColor svgs with no text.)
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(numberFieldScenario);
registerPixelDriver(numberFieldScenario);
registerFocusTrailDriver(numberFieldScenario);
registerAxTreeDriver(numberFieldScenario);
registerContrastDriver(numberFieldScenario);
