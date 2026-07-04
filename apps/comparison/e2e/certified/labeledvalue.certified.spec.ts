import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, read-only field display): LabeledValue.
 * This certifies the STATIC FIELD COMPOSITE the S2 `LabeledValue` builds — the
 * shared `field()` grid, a `FieldLabel` rendered as a `<span>` (no `<label>`, no
 * necessity indicator), and a value `<span>` styled with `fieldInput()` +
 * `controlFont()` — against upstream S2 `LabeledValue.tsx` + `Field.tsx`
 * (`FieldLabel`). It is the last Tier-2 queue unit.
 *
 * The port was a Tailwind stub (a self-inflicted divergence). Per the parity rule
 * it was rebuilt faithfully rather than recorded blocked: byte-copied `field()` /
 * `fieldLabel()` / `fieldInput()` `style()` objects, the same `fieldStyles` /
 * `valueStyles` composition as upstream, the same FieldLabel wrapper `<div>` +
 * `<span>` label markup, and Intl-backed value formatting (numbers via the
 * `@proyecto-viviana/solidaria` `NumberFormatter`, string lists via
 * `Intl.ListFormat`, mirroring upstream's `useNumberFormatter` /
 * `useListFormatter`). Both fixtures resolve the value through the SAME demo helper
 * (`resolveLabeledValueDemoValue`) so React and Solid format IDENTICAL input — a
 * formatter divergence surfaces as a pixel/text mismatch, not an input mismatch.
 *
 * DOM shape (demo default: label "Project name", string value "Quarterly report",
 * size M, labelPosition top), verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="labeledvalue">          ← fixture wrapper
 *     <div field>                                              ← fieldStyles grid
 *       <div labelWrapper><span label>Project name</span></div> ← FieldLabel (span)
 *       <span value>Quarterly report</span>                     ← valueStyles span
 *     </div>
 *   </div>
 *
 * D1 TARGET = the `field` grid `<div>` (comprehensive: label + value geometry).
 * Parts capture each surface the port hand-rolls.
 *
 * SCOPE — D1/D3 run at `states:["default"]`: LabeledValue is a read-only text
 * display with no focusable element, no gesture, and no state that mutates the
 * grid or the resting children. Everything that varies is prop-driven and captured
 * at rest across the cases below. The `number` / `list` cases exist to certify that
 * the two formatters produce BYTE-IDENTICAL output (the whole reason the value path
 * was ported over the stub).
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D7 (contrast:
 * label + value text). NOT registered:
 *   - D6 (AX tree): LabeledValue renders plain `<div>`/`<span>` text with NO role,
 *     accessible name, or ARIA wiring — the label is a `<span>` (not a `<label>`),
 *     the value a `<span>`. It contributes zero AX semantics, exactly like Form's
 *     generic `<form>` container. Registering D6 would assert an empty subtree.
 *   - D5/D8/D4/D2: no focusable element, no hit target, no event contract, and the
 *     only "motion" is none — a static grid. All child/gesture concerns, out of
 *     scope for a read-only display.
 */

const root = '[data-comparison-control-root="labeledvalue"]';

/** The `field` grid `<div>` — the D1 target (composite geometry). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>` — gridArea label + text-align + top padding
 *  + containment (labelPosition top ⇒ inline-size). */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The label `<span>` (elementType="span", NOT a `<label>` — LabeledValue's value is
 *  not a labelable form element) — fieldLabel() color/font. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > span`);
/** The value `<span>` — fieldInput() (gridArea input + min-width + contain) plus
 *  display:flex, align-items:center, min-height (in-form), and controlFont(). */
const valueTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div > span`);

const labeledValueScenario: DriverScenario = {
  slug: "labeledvalue",
  title: "LabeledValue",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align +
    // padding-bottom(--field-gap).
    labelWrapper: labelWrapperTarget,
    // The label span — fieldLabel() color (neutral-subdued) + control font by size.
    label: labelTarget,
    // The value span — fieldInput() min-width/contain + flex/center + control font.
    value: valueTarget,
  },
  cases: [
    // Rest matrix — every visually distinct composite treatment, prop-driven.
    { id: "default" },
    // Size scale — the fieldLabel/control font ramp + the value min-height + the
    // --field-gap row gap scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    // Side labels — grid-template-columns becomes the side layout; the label
    // wrapper drops the top padding + inline-size containment.
    { id: "label-side", params: { labelPosition: "side" } },
    // labelAlign end — the label wrapper text-aligns end.
    { id: "align-end", params: { labelAlign: "end" } },
    // Number value — certifies NumberFormatter output equals React's
    // useNumberFormatter (1,234,567.89) byte-for-byte.
    { id: "number", params: { valueType: "number" } },
    // List value — certifies Intl.ListFormat output equals React's useListFormatter
    // ("Adobe, Apple, and Google") byte-for-byte.
    { id: "list", params: { valueType: "list" } },
  ],
  // A read-only display has no gesture state; the rest matrix is the whole surface.
  states: ["default"],
  // Default allowlist covers color/border/outline/box-shadow/font/padding/margin/
  // gap/width/height/display/align-items/cursor/transform/transition. Add the field
  // grid + containment + the label/value flow props.
  styleProps: {
    add: [
      "box-sizing",
      "contain",
      "text-align",
      "grid-template-columns",
      "grid-template-areas",
      "grid-template-rows",
      "min-width",
      "min-height",
    ],
  },
  // D7: label + value text contrast, resting, both themes. LabeledValue exposes no
  // disabled prop of its own (disabled only flows from an enclosing Form, which the
  // Form unit certifies), so `default` is the whole contrast surface.
  contrast: {
    cases: ["default"],
  },
};

registerStateMatrixDriver(labeledValueScenario);
registerPixelDriver(labeledValueScenario);
registerContrastDriver(labeledValueScenario);
