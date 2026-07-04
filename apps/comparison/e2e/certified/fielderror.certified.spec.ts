import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, field-annotation composite): FieldError / HelpText —
 * the invalid branch. Upstream S2 `Field.tsx` `HelpText()` renders exactly one of two rows
 * under a field's input, in the same `gridArea:'helptext'` slot:
 *   - valid + description → `<Text slot="description">` (a `<span>`), styled `helpTextStyles`.
 *   - invalid            → a RAC `<FieldError>` whose child is `<span>{errorMessage}</span>`,
 *                          styled with the SAME `helpTextStyles` but the `isInvalid` color
 *                          branch (`negative`), plus a separate `FieldErrorIcon` (an
 *                          `AlertTriangle` `<svg>`) rendered INSIDE the input FieldGroup.
 *
 * The DESCRIPTION branch is already certified by the TextField unit (its `description` part +
 * D1/D3/D6/D7 on the valid composite). That unit explicitly DEFERRED the invalid branch —
 * "the `<span slot="errorMessage">` error row + its `FieldErrorIcon` inside the group + the
 * group's `aria-invalid` re-flowing the field grid" — to `helptext-fielderror-visual-port`.
 * THIS unit certifies that deferred invalid composite. It drives the same TextField fixture
 * (`slug:"textfield"`, so the route + fixture are shared) with `?isInvalid=true`, which flips
 * the fixture from the description row to the error row on both stacks.
 *
 * DOM shape (demo default, invalid: label "Name", value, errorMessage "Name is required."):
 *
 *   <div class={field()}>                              ← the field grid (D1 target)
 *     <div class={fieldLabelWrapper}>                  ← FieldLabel wrapper (gridArea label)
 *       <label class={fieldLabel(isInvalid)}>Name</label>   ← label goes `negative` when invalid
 *     </div>
 *     <div role="presentation" data-invalid="true">    ← FieldGroup: border → negative token
 *       <input aria-invalid="true" aria-describedby=…/>
 *       <CenterBaseline><svg class={fieldErrorIcon}/></CenterBaseline>  ← error icon (¬disabled)
 *     </div>
 *     <span slot="errorMessage" class={helpTextStyles(isInvalid)}>Name is required.</span>
 *   </div>
 *
 * The port (`packages/solid-spectrum/src/textfield/index.tsx`) is verified byte-faithful to
 * upstream here: `helpTextStyles` (185-212) is identical to upstream `Field.tsx` `helpTextStyles`
 * (378-405) incl. the `isInvalid → negative` color branch; `fieldErrorIcon` (214-226) matches
 * upstream `FieldErrorIcon` (471-503) — `size:fontRelative(20)`, `marginStart:'text-to-visual'`,
 * `marginEnd:fontRelative(-2)`, `flexShrink:0`, `--iconPrimary` fill `negative`; the icon is
 * gated `isInvalid && !isDisabled` (upstream `!props.isDisabled && <AlertIcon/>`); and the error
 * row is a `<span slot="errorMessage">` (RAC `<FieldError>` → `<span>`), NOT a `<p>` (no UA
 * margin to zero out).
 *
 * WHAT THIS UNIT CERTIFIES (the invalid composite, which TextField's cert never exercises):
 *   - D1 `target` = the field grid re-flowed with the error row (grid template + gaps).
 *   - D1 `label` part = the label color switching to `negative` under `isInvalid` (propagation
 *     of the invalid flag into `fieldLabel()`).
 *   - D1 `group` part = the FieldGroup's `data-invalid` border/background switching to the
 *     negative token — the most condition-dependent surface.
 *   - D1 `errortext` part = the `<span slot="errorMessage">` row: `helpTextStyles` with the
 *     `isInvalid` color branch (`negative`), `paddingTop:--field-gap`, `display:flex`,
 *     `align-items:baseline`, `contain:inline-size`, `gridArea:helptext`.
 *   - D3 pixel = the whole invalid composite end-to-end — the strongest oracle for the error
 *     ICON (its size/margins/negative fill are only asserted as rendered pixels here).
 *   - D6 AX = the invalid input's `aria-invalid` + accessible error description wiring
 *     (`aria-describedby`/`aria-errormessage` → the error `<span>`), rooted at the field grid.
 *   - D7 contrast = the error text (`negative`) + label + input value, resting-invalid and
 *     invalid+disabled, both themes. Pair-diff (React must equal Solid to the last decimal),
 *     and the descriptor doubles as a text-content oracle on the error `<span>`.
 *
 * CASES are all invalid (the description branch is TextField's job): base `invalid`, the
 * `size-*` ramp (row font/metrics + the fixed-size icon), `invalid-required` (necessity
 * asterisk + error together), and `invalid-disabled` (colors → `disabled`, the group error
 * icon SUPPRESSED via `!isDisabled` while the error `<span>` still renders — the upstream
 * edge where invalid and disabled compose).
 *
 * SCOPE — D5 not registered: an invalid text input is the same single tab stop the TextField
 * unit already certifies (`tab-cycle`); `isInvalid` adds no in-widget navigation. D8/D4/D2 are
 * likewise unchanged by the invalid flag.
 */

const root = '[data-comparison-control-root="textfield"]';

/** The `field` grid `<div>` re-flowed with the error row — the D1 target + D3/D6 root. */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The `<label>` — `fieldLabel()` color switches to `negative` under `isInvalid`. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div>` — `data-invalid` flips its border to the negative token
 *  and it holds the `AlertTriangle` error icon (when not disabled). */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The `<span slot="errorMessage">` FieldError row — `helpTextStyles` `isInvalid` branch. */
const errorTextTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="errorMessage"]`);

const fieldErrorScenario: DriverScenario = {
  slug: "textfield",
  title: "FieldError",
  target: fieldTarget,
  parts: {
    // Label — proves the `isInvalid` flag propagates into `fieldLabel()`'s color branch.
    label: labelTarget,
    // FieldGroup — the `data-invalid` border/background switches to the negative token.
    group: groupTarget,
    // The FieldError row — helpTextStyles with the negative color branch, gridArea helptext,
    // paddingTop --field-gap, display:flex, align-items:baseline, contain:inline-size.
    errortext: errorTextTarget,
  },
  cases: [
    // Base invalid — error row + group border + error icon at size M.
    { id: "invalid", params: { isInvalid: "true" } },
    // Size ramp — the error-row font/metrics track `controlFont()` by size; the group icon
    // stays a fixed `fontRelative(20)`, and the --field-gap row gap scales.
    { id: "invalid-s", params: { isInvalid: "true", size: "S" } },
    { id: "invalid-l", params: { isInvalid: "true", size: "L" } },
    { id: "invalid-xl", params: { isInvalid: "true", size: "XL" } },
    // Necessity + error — the required asterisk in the label composes with the error row.
    { id: "invalid-required", params: { isInvalid: "true", isRequired: "true" } },
    // Invalid + disabled — colors switch to the `disabled` token (which wins over `isInvalid`
    // in helpTextStyles' color order) and the group error icon is SUPPRESSED (`!isDisabled`),
    // while the error `<span>` still renders. The upstream invalid∧disabled composition.
    { id: "invalid-disabled", params: { isInvalid: "true", isDisabled: "true" } },
  ],
  // A field composite has no container-level gesture state; the rest matrix of the invalid
  // treatments is the whole certifiable surface.
  states: ["default"],
  // Default allowlist covers color/border/outline/box-shadow/font/padding/margin/gap/width/
  // height/display/align-items/cursor. Add the composite's grid + containment + input flow.
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
    ],
  },
  // D6: the invalid input's textbox role + `aria-invalid` + accessible error wiring
  // (`aria-describedby`/`aria-errormessage` → the error `<span>`), plus the group role, rooted
  // at the field grid so the whole invalid composite tree is asserted. `invalid` +
  // `invalid-disabled` (the disabled edge suppresses the error icon).
  ax: {
    cases: ["invalid", "invalid-disabled"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: error text (`negative`) + label + input value contrast, resting-invalid and
  // invalid+disabled, both themes. Pair-diff; the descriptor is also a text oracle.
  contrast: {
    cases: ["invalid", "invalid-disabled"],
  },
};

registerStateMatrixDriver(fieldErrorScenario);
registerPixelDriver(fieldErrorScenario);
registerAxTreeDriver(fieldErrorScenario);
registerContrastDriver(fieldErrorScenario);
