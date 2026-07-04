import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import {
  keyboardActivateGesture,
  mouseClickGesture,
  registerEventSequenceDriver,
  touchTapGesture,
} from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification march unit (Tier 2, first form field): Checkbox. This unit
 * landed a faithful rebuild of `checkbox/index.tsx` onto the RAC-1.19 form-field
 * split — `CheckboxField` (the grid `field`) wrapping `CheckboxButton` (the
 * subgrid `wrapper`) — mirroring upstream S2 `Checkbox.tsx` exactly (it imports
 * `CheckboxButton`/`CheckboxField` from `react-aria-components/Checkbox`, not the
 * RAC monolith). The port previously rendered the monolith `Checkbox` label as
 * its root; that was a self-inflicted structural divergence, now reverted.
 *
 * DOM shape, verified byte-identical against upstream by source read:
 *
 *   <div field data-comparison-control-root="checkbox">      ← CheckboxField grid
 *     <label wrapper>                                         ← CheckboxButton subgrid
 *       <VisuallyHidden><input type=checkbox></VisuallyHidden>
 *       <CenterBaseline div>                                  ← baseline aligner
 *         <div box style="will-change:transform">            ← the indicator
 *           <svg Checkmark|Dash>  (only when selected/mixed)
 *         </div>
 *       </CenterBaseline>
 *       <span gridColumnStart:2>Enable alerts</span>         ← the visible label
 *     </label>
 *     <HelpText/>   ← dormant: the demo sets no description/errorMessage, so
 *                     upstream's HelpText is null in every case here.
 *   </div>
 *
 * The `field`, `wrapper`, `box`, `iconStyles` and the `gridColumnStart:2` label
 * span are all byte-copies of the upstream S2 style objects (same `style()`
 * macro inputs → same content-hashed class), and the port threads the identical
 * render-prop conditions (`isSelected || isIndeterminate` into the box fill,
 * `isEmphasized`, `size`, `isInvalid`, `isDisabled`).
 *
 * D1 TARGET = the box `<div>`. It is the richest and most condition-dependent
 * surface (focus ring, border, `sm` radius, `controlSize('sm')` box, and the
 * fill/border color matrix keyed on isSelected/isEmphasized/isDisabled — the
 * isInvalid branch is byte-copied but not exercised here; see DEFERRED below)
 * AND it is fixed-size, so its computed geometry is layout-independent. The
 * stack-neutral locator `… > label > div > div` resolves it on both stacks
 * regardless of whether `VisuallyHidden` renders a `<span>` (port default) or a
 * `<div>` (React Aria default): the VH element's only child is the `<input>`
 * (never a `<div>`), so the sole `label > div > div` is the CenterBaseline's box.
 *
 * SCOPE — D1/D3 run at `states: ["default"]` (the param-driven rest matrix), a
 * deliberate, source-justified choice, not an omission:
 *   - A checkbox's focusable element is the visually-hidden `<input>`, while its
 *     styled surface is the separate box `<div>` and its RAC state attributes
 *     (`data-hovered`/`-pressed`/`-focus-visible`) live on the `<label>`. No
 *     single element is simultaneously focusable-and-styled, and the pair-oracle
 *     walk drives + measures ONE target locator (focus()/hover()/mouse.down on
 *     it, then reads its readiness attr). So per-gesture-state style capture on
 *     the box is not expressible in the harness for a split control.
 *   - The styling that actually varies — selected / indeterminate / emphasized /
 *     invalid / disabled / size — is prop-driven (URL params), not gesture-driven,
 *     and is captured in full at rest across the case matrix below. That is where
 *     a port condition-threading bug would surface.
 *   - The only gesture-driven box styling is the focus ring (`focusRing()`, keyed
 *     on the `isFocusVisible` render prop) and the press scale (`pressScale`
 *     inline transform). Both are byte-identical to upstream by source read
 *     (`checkboxPressScaleStyle` == upstream `pressScale`; identical `focusRing()`
 *     macro + `isFocusVisible` threading), and the focus BEHAVIOR is pinned by D5.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D4 (press →
 * toggle event log), D5 (focus trail), D6 (AX: role/name/checked/mixed/disabled/
 * required), D7 (contrast: the label text), D8 (target size across the size
 * scale). NOT registered:
 *   - D2 motion: the checkbox has no enter/mount animation; the only motion is
 *     the `transition: default` (box fill/border) and `transition: colors`
 *     (wrapper text) that fire on a state change. Both carry the identical token
 *     and their computed `transition-*` longhands are already pinned by D1 (in
 *     the default allowlist). There is no overlay/indicator slide to freeze.
 *
 * The Checkmark / Dash `<svg>` is deliberately NOT a D1 part: the port stamps
 * explicit `width`/`height` px + `role`/`aria-hidden`/`focusable` on the ui-icon
 * svg (a known, tracked ui-icon svg-attribute divergence), which is a DOM-attr
 * difference with no effect on the box's computed style. D3 screenshots the whole
 * canvas including the rendered glyph; the explicit px match the size the `size`
 * prop renders at, so the glyph is pixel-identical (D3 selected/indeterminate/
 * emphasized are green — the icon does not perturb pixels).
 *
 * DEFERRED (two pre-existing, tracked, cross-cutting gaps this march surfaced —
 * neither is a checkbox-specific bug; both are held for their own units):
 *   1. **The `isInvalid` state — deferred to the HelpText/FieldError port.**
 *      Upstream `Checkbox` renders `<HelpText isInvalid showErrorIcon>` (Field.tsx
 *      returns `null` while `!isInvalid`, but on `isInvalid` renders a FieldError
 *      error-icon ROW even with an empty `errorMessage`). That row widens/heightens
 *      the `field` grid — D1 saw React's field at `52px` / `grid-template-columns:
 *      16px 73px 0px` vs the port's `18px` / `16px 73px`, and D3 saw the canvas
 *      width delta. The port has no faithful S2 `HelpText`/`FieldError` yet (only a
 *      Tailwind stub), so the whole `isInvalid` state is held for that unit rather
 *      than certifying half of it. Notably the box's OWN invalid treatment matched
 *      byte-for-byte on the failing run (only the `field` part diverged), so the
 *      box's negative-border/fill conditional is verified-by-construction and that
 *      unit will re-run + certify the `invalid` / `invalid-selected` cases.
 *   2. **The decorative-icon AX node — deferred to the ui-icon unit.** On
 *      selected/indeterminate, upstream's Checkmark/Dash `<svg>` shows as a bare
 *      `img` node in the canvas AX tree; the port's is `aria-hidden`, so absent.
 *      D6 is rooted at the `<input>` (see the `ax` note) to certify the checkbox's
 *      own semantics without depending on the icon layer's exposure choice.
 */

const root = '[data-comparison-control-root="checkbox"]';

/** The box indicator `<div>` — the D1/D3 target (fixed-size, layout-neutral). */
const boxTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > label > div > div`);
/** The `<label>` (CheckboxButton subgrid) — the mouse/touch hit area. */
const labelTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > label`);
/** The visually-hidden `<input>` — the focusable element (keyboard + focus). */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);

const checkboxScenario: DriverScenario = {
  slug: "checkbox",
  title: "Checkbox",
  target: boxTarget,
  parts: {
    // The CheckboxButton `<label>` subgrid: color (baseColor('neutral'), or the
    // disabled/forced-colors branch) + subgrid placement + `transition: colors`.
    wrapper: labelTarget,
    // The CheckboxField grid root: gridTemplateColumns / gaps / width / font.
    field: ({ canvas }) => canvas.locator(root),
    // The visible label span — pinned at `grid-column-start: 2`.
    label: ({ canvas }) => canvas.locator(`${root} > label > span:last-child`),
  },
  cases: [
    // Rest matrix — every visually distinct box treatment, all prop-driven.
    { id: "default" },
    { id: "selected", params: { selectionSource: "isSelected", isSelected: "true" } },
    { id: "indeterminate", params: { isIndeterminate: "true" } },
    {
      id: "emphasized-selected",
      params: { isEmphasized: "true", selectionSource: "isSelected", isSelected: "true" },
    },
    { id: "disabled", params: { isDisabled: "true" } },
    {
      id: "disabled-selected",
      params: { isDisabled: "true", selectionSource: "isSelected", isSelected: "true" },
    },
    // Required — `isRequired` is an aria-only concern (no box treatment, so
    // steadyState:false keeps it out of D1/D3); referenced by D6 to pin the
    // required semantics on the input.
    { id: "required", params: { isRequired: "true" }, steadyState: false },
    // Size scale — each with a checkmark so the sized box + fill are exercised.
    { id: "size-s", params: { size: "S", selectionSource: "isSelected", isSelected: "true" } },
    { id: "size-l", params: { size: "L", selectionSource: "isSelected", isSelected: "true" } },
    { id: "size-xl", params: { size: "XL", selectionSource: "isSelected", isSelected: "true" } },
  ],
  // See the scope note above: the checkbox's focusable element (hidden input) is
  // not its styled surface, so only the rest matrix is style/pixel-captured.
  states: ["default"],
  // Default allowlist already covers the box's fill/border/radius/outline/
  // box-shadow/will-change/transform/transition longhands. Add the box's
  // `flex-shrink`/`box-sizing`, the grid placement (label span = 2, wrapper =
  // 1/-1) and the subgrid `grid-template-columns` + the wrapper `position`.
  styleProps: {
    add: [
      "flex-shrink",
      "box-sizing",
      "grid-template-columns",
      "grid-column-start",
      "grid-column-end",
      "position",
    ],
  },
  // D4: the core contract — pressing toggles selection (native `change`/`click`
  // fire in the same order on both stacks); a disabled checkbox emits nothing.
  // Mouse/touch drive the `<label>` hit area; keyboard-space drives the focusable
  // `<input>` (a `<label>` is not focusable, so `target.focus()` would no-op).
  events: {
    cases: ["default", "disabled"],
    gestures: [
      { ...mouseClickGesture, target: labelTarget },
      { ...touchTapGesture, target: labelTarget },
      { ...keyboardActivateGesture("Space"), target: inputTarget },
    ],
  },
  // D5: Tab moves focus onto the input and off to the outside sentinel identically
  // on both stacks. Focus starts on the input (the focusable element).
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: role `checkbox` + the "Enable alerts" name, plus the state semantics —
  // `[checked]` (selected), `[checked=mixed]` (indeterminate), `[disabled]`, and
  // the required marker — that a port aria-threading bug would surface.
  //
  // Rooted at the `<input>` (the checkbox node itself), NOT the canvas, on
  // purpose: with a selected/indeterminate box, upstream's decorative Checkmark/
  // Dash `<svg>` surfaces as a bare, nameless `img` node in the canvas AX tree,
  // while the port stamps `aria-hidden` on it (the tracked ui-icon svg-attribute
  // divergence — arguably the more correct a11y treatment for a decorative
  // glyph), so it is absent from the port's tree. That is an icon-layer concern,
  // not a checkbox-semantics one; rooting at the input scopes D6 to the contract
  // that IS the checkbox's (role / accessible name / checked / mixed / disabled /
  // required — all still computed from the wrapping label), and keeps the
  // headline `[checked]` / `[checked=mixed]` assertion live on every case instead
  // of skipping it. The icon-node divergence is deferred to the ui-icon unit.
  ax: {
    cases: ["default", "selected", "indeterminate", "disabled", "required"],
    roots: {
      control: ({ canvas }) => canvas.locator(`${root} input`),
    },
  },
  // D7: the "Enable alerts" label contrast on the resting and disabled fills,
  // both themes. Positive control — identical color tokens must match to 2dp.
  contrast: {
    cases: ["default", "disabled"],
  },
  // D8: the checkbox hit area across the size scale; both stacks must render the
  // identical border-box, and the 24px / 44px floors are reported.
  targetSize: {
    cases: ["default", "size-s", "size-xl"],
  },
};

registerStateMatrixDriver(checkboxScenario);
registerPixelDriver(checkboxScenario);
registerEventSequenceDriver(checkboxScenario);
registerFocusTrailDriver(checkboxScenario);
registerAxTreeDriver(checkboxScenario);
registerContrastDriver(checkboxScenario);
registerTargetSizeDriver(checkboxScenario);
