import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 5, the hex/channel text-input field): ColorField.
 * A TextField-shaped composite — upstream S2 `ColorField.tsx` → `AriaColorField`
 * (react-aria-components/ColorField) rendering the SAME shared `FieldLabel` /
 * `FieldGroup` / `Input` / `HelpText` / `FieldErrorIcon` from `./Field` that
 * NumberField/TextField/SearchField use:
 *
 *   AriaColorField(field grid, data-channel)  ->  FieldLabel | FieldGroup | HelpText
 *   FieldGroup(role="presentation")           ->  [ <input type="text"> | FieldErrorIcon? ]
 *
 * The port's `solid-spectrum/src/color` styled ColorField carried the SAME field-family
 * `<p>` help-text divergence the rest of the input family did, reverted here to realign
 * the OUTPUT to upstream (the shared FieldLabel/HelpText *extraction* stays tracked as
 * `helptext-fielderror-visual-port`):
 *
 *   (1) help text rendered a `<p>` + a hand-roll-only `margin:0` in the `helpText`
 *       style. Upstream's shared `HelpText` renders `<Text slot="description">` (a
 *       `<span>`, no UA margin) — and, when invalid, `<FieldError>` → a
 *       `<span slot="errorMessage">` — and its `helpTextStyles` declares no `margin`.
 *       Reverted: description now `<span slot="description">`, error
 *       `<span slot="errorMessage">`, and the stray `margin:0` is gone. A `<p>` also
 *       carries an implicit `paragraph` role a `<span>` does not → both a computed-style
 *       AND an AX revert. → D1 `description` part, D6. (Identical revert to
 *       NumberField/DateField/DatePicker.)
 *
 * FAITHFUL AS-FOUND (verified against RAC `ColorField.mjs` + S2 `Field.tsx`, NOT
 * changed): the root `data-channel` (always `"hex"` or the channel) + the
 * `data-disabled`/`data-invalid`/`data-readonly`/`data-required` render-prop attrs are
 * exactly what RAC's `ColorField` emits on its root `<div>`; and the FieldGroup is
 * `role="presentation"` because RAC's `ColorField` seeds `GroupContext` with
 * `{role:'presentation'}` — UNLIKE NumberField/SearchField (whose `useNumberField`/
 * `useSearchField` seed `role:'group'`), LIKE TextField/TextArea. The lesson (again):
 * verify the FieldGroup role per RAC component; it does not transfer. Consequence for
 * D6: the presentation group is TRANSPARENT in the accessibility tree — the input
 * textbox sits directly under the field, with NO `group` node (the opposite of the
 * NumberField cert, which certifies a real `group` node).
 *
 * DOM shape (demo default: label "Color", hex value "#336699", description "Enter a hex
 * color", size M), verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="colorfield">          ← fixture wrapper
 *     <div field data-channel="hex">                         ← AriaColorField grid
 *       <div labelWrapper><label -label>Color</label></div>  ← FieldLabel
 *       <div group role="presentation">                       ← FieldGroup (presentation!)
 *         <input type="text" value="#336699">
 *       </div>
 *       <span slot="description">Enter a hex color</span>     ← HelpText (revert 1)
 *     </div>
 *   </div>
 *
 * Both fixtures wrap the component in the `data-comparison-control-root="colorfield"`
 * `<div>`, so the field grid is `${root} > div` (a wrapper hop, like NumberField/
 * TextField/TextArea).
 *
 * HEX vs CHANNEL — ColorField's defining duality (hex mode = `<input role="textbox">`
 * with the hex string on a form-bearing visible input; channel mode = a roleless
 * numeric channel field whose form value moves to a sibling `<input type="hidden">`) is
 * a DOM-ATTRIBUTE concern that does NOT surface as a pixel/focus/AX-tree/contrast
 * difference: a native `<input type="text">` is a `textbox` in the browser AX tree
 * whether or not `role="textbox"` is also set, and the hidden input is out of the AX
 * tree entirely. That duality is fully owned by the unit suite
 * (`solid-spectrum/test/ColorField.test.tsx` asserts the hex textbox name/value/
 * data-channel, the channel-mode role absence + hidden input name/form/value, and the
 * prefix labelling). This certified spec owns the DEFAULT hex field's paint / focus /
 * AX-tree / contrast parity. Channel-mode i18n (the hook's `getChannelName` currently
 * hardcodes `"en-US"`, tracked alongside `intl-roledescription-hardcodes`) is out of
 * this hex-scoped cert.
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the split-control justification shared by
 * the whole input family): the focusable `<input>` is not the primary styled surface
 * (that is the separate `FieldGroup` `<div>`, whose border reacts to focus-within via a
 * signal-backed class), so no single element is focusable-and-styled. Everything that
 * varies (size / disabled / required / read-only) is prop-driven and captured at rest.
 *
 * D1 parts are the always-present set (labelWrapper, label, group, input, description).
 * ColorField's default field carries NO trailing decoration (no stepper, no prefix), so
 * — unlike NumberField — every part is present in every non-invalid case.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel — whole-field diff), D5
 * (focus/keyboard — the input is the SOLE tab stop; `tab-cycle` certifies focus lands on
 * the input and Tab/Shift+Tab exit and return, mirroring TextField), D6 (AX: the textbox
 * role + name-from-label + description via aria-describedby, with NO intervening `group`
 * node — the presentation FieldGroup), D7 (contrast: label + description). NOT registered:
 *   - D4 events: the input's change/input ordering is a per-control concern the two
 *     fixtures wire differently (onInput vs onChange); out of scope here.
 *   - D8 target size: the input is the sole hit target; the composite adds none of its own.
 *   - D2 motion: the only motion is the border-color `transition` (pinned by D1).
 *
 * D6 uses the `default` case — ColorField's default field has NO decorative ui-icons at
 * all (no stepper glyphs, no prefix), so it is already the clean textbox + presentation-
 * group + description tree; no `hide-stepper`-style routing is needed (contrast the
 * NumberField cert). `required` (the necessity AsteriskIcon svg in the label) is the ONE
 * held-out decorative-node case, excluded from D6 exactly as elsewhere — the port's
 * `createUIIcon` marks it `role="img"` + decorative `aria-hidden` (no child node) while
 * upstream's bare `<svg>` exposes an unnamed `img` child; that is the GLOBAL
 * `ui-icon-decorative-ax-node` policy owned by the future `ui-icon` unit, not flippable
 * per-component. Its geometry + pixels stay covered by D1/D3, its tab exclusion by D5.
 *
 * DEFERRED — the `isInvalid` state (the `<span slot="errorMessage">` error row + its
 * `AlertTriangleIcon` inside the group + `aria-invalid` re-flowing the field grid), held
 * to `helptext-fielderror-visual-port` as with the other input-family units; the
 * `<span>`/`slot` markup is landed so it is faithful when that unit certifies invalid.
 */

const root = '[data-comparison-control-root="colorfield"]';

/** The `field` grid `<div>` (first child of the fixture wrapper) — the D1 target. */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>` (first grid child). */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The label `<label>` — a color field IS a labelable element (RAC `<Label>` is a
 *  `<label>`). */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div role="presentation">` (second grid child) — border/
 *  background/focus ring + pill radius + the input flex row. */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The `<input type="text">` — transparent chrome + flex-grow + truncate. */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);
/** The HelpText `<span slot="description">` (revert 1). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);

const colorFieldScenario: DriverScenario = {
  slug: "colorfield",
  title: "ColorField",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element — fieldLabel() color/font + disabled color.
    label: labelTarget,
    // The bordered field shell (role="presentation") — border/background/pill radius/
    // focus ring + control() sizing + fieldInput() padding + disabled/invalid tokens.
    group: groupTarget,
    // The color input — padding:0, transparent bg, inherit font, flex-grow/shrink:1,
    // min-width:0, width:full, truncate, no outline/border.
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
    // Read-only — RAC sets the input `readonly`; this pins that the read-only attr does
    // not leak into the styles.
    { id: "read-only", params: { isReadOnly: "true" } },
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
  // D5: the input is the sole tab stop — Tab exits, Shift+Tab returns (the TextField/
  // NumberField walk).
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the input's textbox role + accessible name (from the `<label>`) + description
  // (via aria-describedby). CRUCIALLY there is NO intervening `group` node — RAC's
  // ColorField seeds `GroupContext` with `role:'presentation'`, so the FieldGroup is
  // transparent in the AX tree (unlike the NumberField cert's real `group` node).
  //
  // Scoped to `default` — ColorField's default field has NO decorative ui-icons (no
  // stepper, no prefix), so it is already the clean tree. `required` (decorative
  // AsteriskIcon svg) is the held-out decorative-node case (the GLOBAL
  // `ui-icon-decorative-ax-node` policy owned by the future `ui-icon` unit); its non-AX
  // facets stay covered by D1/D3/D5/D7.
  ax: {
    cases: ["default"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: label + description contrast, resting + disabled, both themes. (The input value
  // lives in `.value` with no child text node — like TextField, not measured.)
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(colorFieldScenario);
registerPixelDriver(colorFieldScenario);
registerFocusTrailDriver(colorFieldScenario);
registerAxTreeDriver(colorFieldScenario);
registerContrastDriver(colorFieldScenario);
