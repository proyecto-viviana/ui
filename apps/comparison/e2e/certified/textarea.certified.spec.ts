import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, multiline field composite): TextArea.
 * TextArea is the multiline sibling of TextField — upstream `TextArea` (S2
 * `TextField.tsx`) composes the SAME `TextFieldBase` (→ `AriaTextField` + shared
 * `FieldLabel`/`FieldGroup`/`HelpText`) but swaps the `<Input>` for a
 * `<TextAreaInput>` (a `<textarea>` that auto-grows to its content) and overrides
 * the FieldGroup css with `{alignItems:'baseline', height:'auto'}` so the bordered
 * container hugs the grown textarea. The port keeps a separate `TextArea.tsx` with
 * its own copies of the composite styles.
 *
 * This unit closes the SAME two structural DOM divergences the TextField unit did
 * (the port's TextArea carried its own copies), both realigning OUTPUT to upstream
 * (the shared FieldLabel/HelpText/FieldGroup *extraction* stays tracked as
 * `helptext-fielderror-visual-port`):
 *
 *   (1) the help text rendered a `<p>` + a hand-roll-only `margin:0` in
 *       `helpTextStyles` (to zero the UA paragraph margin). Reverted to
 *       `<span slot="description">` / `<span slot="errorMessage">` (RAC `<Text>` /
 *       `<FieldError>` render `<span>`, no UA margin), and the stray `margin:0` is
 *       gone. Both a computed-style and an AX revert (`<p>` carries an implicit
 *       `paragraph` role a `<span>` does not).
 *   (2) the `FieldGroup` (the bordered textarea container) rendered a `<div>` with
 *       no `role`. It is `role="presentation"`, NOT `role="group"`: RAC's `Group`
 *       defaults to `role ?? 'group'`, but RAC's `TextField` — which TextArea
 *       composes via `TextFieldBase` → `AriaTextField` — seeds `GroupContext` with
 *       `{role:'presentation'}` (`react-aria-components/dist/private/
 *       TextField.mjs`), so the input's visual wrapper is marked presentation to
 *       keep the AX tree flat (the textbox stays a direct child of the field, no
 *       redundant group node). This is the reusable finding certified on TextField;
 *       the port's TextArea `<div>` now carries `role="presentation"` to match both
 *       the DOM role attribute and the AX tree. → D6, both cases below.
 *
 * NOT a divergence (verified, same as TextField): the label wrapper's `contain`
 * computes `inline-size` on BOTH stacks — `TextFieldBase` does NOT render its
 * `FieldLabel` with `isQuiet`, so the `isQuiet:'none'` branch never triggers.
 *
 * MULTILINE SPECIFICS:
 *   - The input part is a `<textarea>` (`${root} textarea`), not an `<input>`.
 *   - Auto-grow: both stacks size the textarea by setting an inline
 *     `height = scrollHeight + (offsetHeight - clientHeight)` on input/mount
 *     (upstream `onHeightChange`, port `resizeTextArea` — byte-identical formula).
 *     The demo default value is two lines (`"…notes\nFollow up…"`), so the textarea
 *     grows to 2 rows on both stacks; D1 pins the resulting `height` (+ `min-height`
 *     = `controlSize()`) and D3 pins the grown pixels are identical.
 *   - The FieldGroup override (`align-items:baseline`, `height:auto`) is captured by
 *     D1 on the `group` part (both in the default allowlist).
 *
 * DOM shape (demo default: label "Notes", 2-line value, description, size M):
 *
 *   <div data-comparison-control-root="textarea">              ← fixture wrapper
 *     <div field>                                              ← AriaTextField grid
 *       <div labelWrapper><label -label>Notes</label></div>    ← FieldLabel
 *       <div group role="presentation"><textarea …></div>      ← FieldGroup + textarea
 *       <span slot="description">Use a short…</span>           ← HelpText (revert 1)
 *     </div>
 *   </div>
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the split-control justification, as
 * TextField/Checkbox/Switch): the focusable `<textarea>` is not the primary styled
 * surface (that is the separate `FieldGroup` `<div>`, whose border reacts to
 * focus-within via a render-prop class), so no single element is
 * focusable-and-styled. Everything that varies (size / disabled / required /
 * read-only) is prop-driven and captured at rest across the cases below.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel — incl. the grown
 * 2-row height), D5 (focus/keyboard — the textarea is one tab stop; `tab-cycle`
 * certifies focus lands on it and Tab/Shift+Tab exit and return), D6 (AX: the
 * textarea's textbox role + name-from-label + description-from-`aria-describedby`,
 * wrapped in the `role="presentation"` FieldGroup), D7 (contrast: label + value +
 * description). NOT registered: D4 events (the input's change/input ordering is a
 * per-control concern; the two fixtures wire different callbacks), D8 target size
 * (the textarea is the hit target; the composite adds none), D2 motion (the only
 * motion is the border-color `transition`, pinned by D1; the auto-grow height is a
 * discrete layout step, not a timed animation).
 *
 * D6 uses `default` + `disabled`. `required` is excluded from D6 (kept in D1/D3):
 * the necessity indicator is a decorative `AsteriskIcon` `<svg>` (the tracked
 * `ui-icon-decorative-ax-node` divergence).
 *
 * DEFERRED — the `isInvalid` state (the `<span slot="errorMessage">` error row + its
 * `FieldErrorIcon` inside the group + `aria-invalid` re-flowing the field grid), held
 * to `helptext-fielderror-visual-port` as with the other Tier-2 units; the
 * `<span>`/`slot` markup is landed so it is faithful when that unit certifies invalid.
 */

const root = '[data-comparison-control-root="textarea"]';

/** The `field` grid `<div>` — the D1 target (composite geometry). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>`. */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The label `<label>` — a textarea IS a labelable element (upstream `<Label>` is a
 *  `<label>`), which the port already matched. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div role="presentation">` (revert 2) wrapping the
 *  textarea — border/background/focus ring + the `align-items:baseline`/`height:auto`
 *  multiline override. */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The `<textarea>` — flex-grow + transparent chrome + auto-grown inline height. */
const textareaTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} textarea`);
/** The HelpText `<span slot="description">` (revert 1). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);

const textAreaScenario: DriverScenario = {
  slug: "textarea",
  title: "TextArea",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element — fieldLabel() color/font + disabled color.
    label: labelTarget,
    // The bordered textarea container (revert 2) — border/background/radius/focus
    // ring + control() sizing + fieldInput() padding + the multiline
    // align-items:baseline / height:auto override + disabled/invalid tokens.
    group: groupTarget,
    // The textarea — paddingX:0/paddingY:centerPadding, min-height:controlSize,
    // box-sizing:border-box, transparent bg, inherit font, flex-grow:1, min-width:0,
    // and the JS-computed inline `height` (grown to the 2-line content).
    input: textareaTarget,
    // The HelpText span (revert 1) — helpTextStyles with NO margin (the stray
    // margin:0 is gone), display:flex + font + color + padding-top:--field-gap.
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
    // Read-only — RAC sets the textarea `readonly`; visually at rest it matches
    // default and this pins that the read-only attr does not leak into the styles.
    { id: "read-only", params: { isReadOnly: "true" } },
  ],
  states: ["default"],
  // Default allowlist covers color/border(longhands)/outline/box-shadow/font/
  // padding/margin/gap/width/height/display/align-items/cursor/transform/transition.
  // Add the composite's grid + containment + the textarea's flow props + min-height
  // (the textarea's `controlSize()` floor, not in the default allowlist).
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
      "min-height",
      "white-space",
    ],
  },
  // D5: a single textarea is one tab stop with no in-widget navigation.
  focus: {
    walks: [{ id: "tab-cycle", start: textareaTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the textarea's textbox role (multiline) + name (from the `<label>`) +
  // description (from the `<span slot="description">` via aria-describedby), wrapped
  // in the `role="presentation"` FieldGroup (revert 2 — the group is AX-flat on both
  // stacks). `required` excluded (decorative asterisk svg); default + disabled clean.
  ax: {
    cases: ["default", "disabled"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: label + textarea value + description contrast, resting + disabled, both themes.
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(textAreaScenario);
registerPixelDriver(textAreaScenario);
registerFocusTrailDriver(textAreaScenario);
registerAxTreeDriver(textAreaScenario);
registerContrastDriver(textAreaScenario);
