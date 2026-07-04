import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import type { ScreenshotDiffThreshold } from "../visual-diff";

/**
 * Recertification march unit (Tier 2, layout + context container): Form. Upstream S2
 * `Form.tsx` is a thin wrapper over RAC `<Form>` (a `<form>` element) that does exactly
 * two things: (1) applies a CSS grid — `display:grid`, `grid-template-columns` by
 * `labelPosition` (top → `[field] 1fr`, side → `[label] auto [field] 1fr`), `row-gap` by
 * `size` (S 20 / M 24 / L 32 / XL 40), and a fixed `column-gap:text-to-control`; and
 * (2) publishes a `FormContext.Provider` carrying `{size, labelPosition, labelAlign,
 * necessityIndicator, isRequired, isDisabled, isEmphasized}` that every descendant field
 * (and Button, via `useFormProps`) inherits for any prop it leaves undefined.
 *
 * The Solid port (`packages/solid-spectrum/src/form/index.tsx`) mirrors both faithfully:
 * `formStyles` is byte-identical to upstream's grid style() (upstream also lists a dead
 * `XS` row-gap branch the `S|M|L|XL` type never reaches — omitted here), and `useFormProps`
 * merges context into undefined props with Skeleton forcing `isDisabled`. The one benign
 * structural difference: the port nests `<FormContext.Provider>` OUTSIDE `<form>` while
 * upstream nests it inside — invisible in the DOM (a provider renders nothing) and children
 * resolve the same value either way, so it is a no-op for parity and not "fixed".
 *
 * DOM shape (demo default: label "Project name", value "Quarterly report", size M, top):
 *
 *   <form data-comparison-control-root="form">   ← the grid + FormContext source
 *     <div>…TextField…</div>                      ← inherits size/labelPosition/… from ctx
 *     <button type="submit">Submit</button>       ← inherits size/isDisabled via useFormProps
 *   </form>
 *
 * WHAT THIS UNIT CERTIFIES. Form owns no visual chrome of its own beyond the grid, so the
 * cert asserts the two things Form contributes and nothing the children already own:
 *   - D1 `target` = the `<form>` grid: `display`, `grid-template-columns` (labelPosition),
 *     `row-gap` (size), `column-gap`. This is the whole of Form's own styling.
 *   - D1 `field` / `submit` parts = the child TextField root + submit `<button>`. These are
 *     already certified in their own units; capturing them HERE proves context PROPAGATION
 *     — the child's size-driven font/metrics and its disabled/required/emphasized/align
 *     state must equal React's, which only happens if the Form threads the same context
 *     values down. A mismatch here is a Form propagation defect, not a child-styling one.
 *   - D3 pixel = the composed form end-to-end: the strongest propagation oracle (a dropped
 *     context value shifts the rendered children). TextField and Button both certify D3
 *     clean, so nine of ten cases are byte-exact. The `label-side` case carries a tight,
 *     documented waiver — see below.
 *   - D7 contrast = the label + description + input value + button text.
 *
 * SIDE-LABEL HALF-PIXEL WAIVER (`label-side`, both themes). This is the first cert to
 * pixel-test `labelPosition:"side"` (TextField's own cert only exercises `top`). In side
 * layout the field grid baseline-aligns the 18px-tall label against the 32px input row, so
 * S2 parks the label's box at a HALF-PIXEL Y (measured: label top 505.5, wrapper 504.5 —
 * identical in React and Solid). Two independent Playwright probes proved the port
 * reproduces upstream's geometry byte-for-byte: identical atomic class strings, identical
 * computed font/transform surface, identical text ink-range (505.5→520.5), identical
 * live AND cloned bounding rects (label at 40.5 inside the pixel-driver clone for both).
 * The residual is a deterministic 1px PURE TRANSLATION of the label glyphs (the per-row
 * ink histogram is identical, only shifted down one row) — a rasterizer baseline-rounding
 * of the half-pixel Y that lands one row apart between the two frameworks' subtrees, stable
 * across three repeats. Nothing in the port's DOM/CSS can move it without diverging from
 * upstream's baseline-alignment design, so it is waived rather than "fixed". The waiver is
 * scoped to `label-side` only, allows ≤0.6% area (worst observed 468/95400 = 0.49%), and
 * keeps `maxDimensionDelta:0` so any real size regression still trips; D1 independently
 * asserts the exact side-layout grid template. Tracked: `form-side-label-halfpixel-baseline`.
 *
 * SCOPE — D6 (AX tree) is intentionally NOT registered. A `<form>` with no accessible name
 * is a generic container that adds zero AX semantics; the only nodes in its subtree are the
 * child textbox + button, whose AX trees are certified in TextField/Button. Registering D6
 * here would re-assert that child coverage and re-hit the deferred field-family D6 items
 * (`ui-icon-decorative-ax-node`, `intl-roledescription-hardcodes`) with no Form-specific
 * signal. D5/D8/D4/D2 are likewise child/gesture concerns, out of scope for a static grid.
 *
 * All cases run at `states:["default"]` (no gesture changes the grid or the resting
 * children). Each case past `default` exercises a DISTINCT context→child path: `size-*`
 * (row-gap + child metrics), `label-side` (grid columns + child side layout), `align-end`
 * (child label text-align), `disabled` / `required` / `required-label` / `emphasized`
 * (the boolean/enum context props flowing to the field + button).
 */

const root = '[data-comparison-control-root="form"]';

/** The `<form>` grid root — Form's entire own contribution (display + template + gaps). */
const formTarget: TargetResolver = ({ canvas }) => canvas.locator(root);
/** The child TextField root — both fixtures mark it `data-comparison-form-field="name"`. */
const fieldTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [data-comparison-form-field="name"]`);
/** The submit `<button>` — both fixtures mark it `data-comparison-form-submit="true"`. */
const submitTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [data-comparison-form-submit="true"]`);

const formScenario: DriverScenario = {
  slug: "form",
  title: "Form",
  target: formTarget,
  parts: {
    // The inherited TextField root — its field grid + font track by the CONTEXT size /
    // labelPosition / labelAlign, and disabled/required/emphasized colors by context.
    field: fieldTarget,
    // The submit Button — S2 Button reads Form context via useFormProps, so its size +
    // disabled state must equal React's purely from propagation.
    submit: submitTarget,
  },
  cases: [
    { id: "default" },
    // row-gap S=20 / L=32 / XL=40; child fields + button take the inherited size track.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    // Side labels — grid-template-columns becomes `[label] auto [field] 1fr` and the child
    // field switches to its side layout from the inherited labelPosition.
    { id: "label-side", params: { labelPosition: "side" } },
    // labelAlign end — form grid unchanged; the child field label text-aligns end.
    { id: "align-end", params: { labelAlign: "end" } },
    // Disabled — inherited by the field + the submit button.
    { id: "disabled", params: { isDisabled: "true" } },
    // Required (icon) — the field shows its necessity indicator from inherited isRequired.
    { id: "required", params: { isRequired: "true" } },
    // Required (label) — necessityIndicator "label" renders the "(required)" text instead.
    { id: "required-label", params: { isRequired: "true", necessityIndicator: "label" } },
    // Emphasized — inherited isEmphasized flows to the field.
    { id: "emphasized", params: { isEmphasized: "true" } },
  ],
  states: ["default"],
  styleProps: {
    add: [
      "box-sizing",
      "grid-template-columns",
      "grid-template-rows",
      "grid-template-areas",
      "align-items",
      "text-align",
    ],
  },
  // D3: the composite is TextField + Button, both of which certify D3 byte-exact on their
  // own, so nine cases are exact. `label-side` carries the tight half-pixel-baseline waiver
  // documented in the header (proven byte-identical geometry; a 1px label-glyph translation
  // inherent to S2's side-label baseline alignment at a half-pixel Y).
  pixel: {
    waivers: [
      {
        caseId: "label-side",
        state: "*",
        theme: "*",
        threshold: {
          maxMismatchRatio: 0.006,
          maxDimensionDelta: 0,
          pixelThreshold: 0,
        } satisfies ScreenshotDiffThreshold,
        reason: "form-side-label-halfpixel-baseline",
      },
    ],
  },
  // D7: label + description + input value + button text, resting + disabled, both themes.
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(formScenario);
registerPixelDriver(formScenario);
registerContrastDriver(formScenario);
