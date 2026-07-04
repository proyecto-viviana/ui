import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, single-input field composite): TextField.
 * This certifies the FIELD COMPOSITE the S2 TextField builds around its `<input>`
 * — the `FieldLabel` wrapper + label, the bordered `FieldGroup` that wraps the
 * input, the `<input>` itself, and the `HelpText` description — against upstream
 * S2 `TextField.tsx` (`TextFieldBase`) + `Field.tsx`.
 *
 * Unlike the CheckboxGroup/RadioGroup hand-rolls, the port here is already largely
 * faithful: it drives a headless `TextField`/`Label`/`Input` and reads the
 * description/error id off the headless TextField context (the RAC context-slot
 * model), so the id wiring was already single-source. Byte-copied `style()` macro
 * objects (`fieldGroupStyles`, the input style, `helpTextStyles`, `fieldLabel`)
 * already matched upstream's computed styles. The march closed the two structural
 * DOM divergences the hand-roll still carried, both realigning the OUTPUT to
 * upstream (the shared FieldLabel/HelpText/FieldGroup *extraction* stays tracked as
 * `helptext-fielderror-visual-port`):
 *
 *   (1) the help text rendered a `<p>`, forcing a hand-roll-only `margin:0` in
 *       `helpTextStyles` to zero out the paragraph's UA margin. Upstream's
 *       `HelpText` renders `<Text slot="description">` (a `<span>`, no UA margin);
 *       upstream's `helpTextStyles` has no `margin`. Reverted: the description now
 *       renders `<span slot="description">` (and the error `<span slot=
 *       "errorMessage">`, a RAC `<FieldError>`), and the stray `margin:0` is gone.
 *       A `<p>` also carries an implicit `paragraph` role that a `<span>` does not,
 *       so this is both a computed-style and an AX-tree revert. → D1 on the
 *       `description` part (margin longhands + display), D6 (the described element).
 *   (2) the `FieldGroup` (the bordered input container) rendered a plain `<div>`
 *       with no `role`. Upstream's `FieldGroup` renders a RAC `<Group>`. RAC's
 *       `Group` defaults to `role={props.role ?? 'group'}`, but RAC's `TextField`
 *       seeds `GroupContext` with `{role: 'presentation'}` (TextField.mjs) — the
 *       input is directly labeled, so the visual wrapper is marked PRESENTATION to
 *       keep the AX tree flat (the textbox is a direct child of the field, with no
 *       redundant group wrapper around it). Verified against the rendered React DOM
 *       (`<div role="presentation" data-rac="">`) and against this cert's own D6:
 *       React exposes NO group node. The port's `<div>` now carries
 *       `role="presentation"` to match both the DOM role attribute and the AX tree.
 *       → D6, both cases below (the textbox appears un-wrapped on both stacks).
 *
 * NOT a divergence (verified, left as-is): the label wrapper's `contain` computes
 * `inline-size` on BOTH stacks. The `contain` style carries an `isQuiet:'none'`
 * branch, but `TextFieldBase` (unlike RadioGroup/CheckboxGroup) does NOT render its
 * `FieldLabel` with `isQuiet`, so the branch never triggers and `labelPosition:top`
 * resolves `inline-size` on both — no isQuiet threading needed here.
 *
 * DOM shape (demo default: label "Name", value, description "Use a descriptive
 * project label.", size M), verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="textfield">              ← fixture wrapper
 *     <div field>                                               ← AriaTextField grid
 *       <div labelWrapper><label -label>Name</label></div>      ← FieldLabel
 *       <div group role="group"><input …></div>                 ← FieldGroup + input
 *       <span slot="description">Use a descriptive…</span>      ← HelpText (revert 1)
 *     </div>
 *   </div>
 *
 * D1 TARGET = the `field` grid `<div>` (comprehensive: label + group + input +
 * description geometry). Parts capture each composite surface the port hand-rolls.
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the param-driven rest matrix): the
 * focusable element (the `<input>`) is NOT the primary styled surface (that is the
 * separate `FieldGroup` `<div>`, whose border reacts to focus-within via a
 * render-prop-applied class), so no single element is focusable-and-styled and a
 * per-gesture style capture on the group is not expressible — the same split-control
 * justification as Checkbox/Switch. Everything that varies (size / disabled /
 * required / read-only) is prop-driven and captured at rest across the cases below.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D5 (focus/keyboard
 * — the single input is one tab stop; the `tab-cycle` walk certifies focus lands on
 * the input and Tab/Shift+Tab exit and return, mirroring the Checkbox/Switch field
 * pattern), D6 (AX: the input's textbox role + name-from-label + description-from-
 * `aria-describedby`, wrapped in the `role="group"` FieldGroup — revert 2), D7
 * (contrast: label + input value + description text). NOT registered:
 *   - D4 events: the container has no event contract of its own; the input's
 *     change/input ordering is a per-control concern and the two fixtures differ in
 *     which callback they wire (onInput vs onChange), so it is out of scope here.
 *   - D8 target size: the input is the hit target; the composite adds no new target.
 *   - D2 motion: the only motion is the border-color `transition` longhands, already
 *     pinned by D1; there is no enter/mount animation.
 *
 * D6 uses `default` + `disabled`. The `required` case is intentionally excluded from
 * D6 (not D1/D3): the necessity indicator is an `AsteriskIcon` ui-icon `<svg>`, and
 * decorative ui-icon AX exposure is the tracked `ui-icon-decorative-ax-node`
 * divergence — the same reason the Checkbox unit kept its decorative-svg cases out
 * of D6. D1/D3 keep `required` so the asterisk's rendered geometry/pixels are still
 * certified.
 *
 * DEFERRED — the `isInvalid` state (the `<span slot="errorMessage">` error row + its
 * `FieldErrorIcon` inside the group + the group's `aria-invalid` re-flowing the
 * field grid), held to `helptext-fielderror-visual-port` for the identical reason
 * the Checkbox/CheckboxGroup/RadioGroup units deferred it. The `<span>`/`slot`
 * error markup is landed in source now so it is faithful when that unit certifies
 * the invalid cases; this unit certifies the valid (description) composite where
 * reverts (1) and (2) live.
 */

const root = '[data-comparison-control-root="textfield"]';

/** The `field` grid `<div>` — the D1 target (composite geometry). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>`. */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The label `<label>` — a text input IS a labelable element (upstream `<Label>` is
 *  a `<label>`, unlike a group's `<span>`), which the port already matched. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div role="group">` (revert 2) that wraps the input —
 *  the most condition-dependent surface (border/background/focus ring). */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The `<input>` — flex-grow/shrink + truncate + transparent chrome. */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);
/** The HelpText `<span slot="description">` (revert 1). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);

const textFieldScenario: DriverScenario = {
  slug: "textfield",
  title: "TextField",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element — fieldLabel() color/font + disabled color.
    label: labelTarget,
    // The bordered input container (revert 2) — border/background/radius/focus ring
    // + control() sizing + fieldInput() padding + the disabled/invalid tokens.
    group: groupTarget,
    // The input — padding:0, transparent bg, inherit font, flex-grow/shrink:1,
    // min-width:0, width:full, truncate, no outline/border.
    input: inputTarget,
    // The HelpText span (revert 1) — helpTextStyles: display:flex + font + color +
    // padding-top:--field-gap + gap + align-items:baseline + contain:inline-size +
    // gridArea helptext, and NO margin (the stray margin:0 is gone).
    description: descriptionTarget,
  },
  cases: [
    // Rest matrix — every visually distinct composite treatment, prop-driven.
    { id: "default" },
    // Size scale — the fieldLabel/control/input font + control height ramp and the
    // --field-gap row gap scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    // Disabled — label + input + help-text colors + the group border/background all
    // switch to the disabled token; cursor:default.
    { id: "disabled", params: { isDisabled: "true" } },
    // Required — the necessity AsteriskIcon renders in the label (its geometry +
    // pixels are certified here; its decorative AX node is excluded from D6 below).
    { id: "required", params: { isRequired: "true" } },
    // Read-only — RAC sets the input `readonly`; visually at rest it matches default
    // and this pins that the read-only attr does not leak into the styled surface.
    { id: "read-only", params: { isReadOnly: "true" } },
  ],
  // A field composite has no container-level gesture state; the focusable input is
  // not the styled surface. The rest matrix is the whole certifiable style surface.
  states: ["default"],
  // Default allowlist already covers color/border(longhands)/outline/box-shadow/
  // font/padding/margin/gap/width/height/display/align-items/cursor/transform/
  // transition. Add the composite's grid + containment + the input's flow props.
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
  // D5: a single text input is one tab stop with no in-widget navigation. The
  // `tab-cycle` walk certifies focus lands on the input, Tab exits, and Shift+Tab
  // returns — identical active-element + tabindex layout on both stacks (the same
  // walk the Checkbox/Switch field units use).
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the input's textbox role + accessible name (from the `<label>`) + accessible
  // description (from the `<span slot="description">` via aria-describedby), all
  // wrapped in the `role="group"` FieldGroup (revert 2). Rooted at the field grid so
  // the whole composite tree — group role included — is asserted. `required` is
  // excluded (decorative asterisk svg; see header); `default` + `disabled` are clean.
  ax: {
    cases: ["default", "disabled"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: label + input value + description contrast, resting + disabled, both themes.
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(textFieldScenario);
registerPixelDriver(textFieldScenario);
registerFocusTrailDriver(textFieldScenario);
registerAxTreeDriver(textFieldScenario);
registerContrastDriver(textFieldScenario);
