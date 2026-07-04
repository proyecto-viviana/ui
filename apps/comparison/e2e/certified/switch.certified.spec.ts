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
 * Recertification march unit (Tier 2, Field-clean toggle): Switch. This unit
 * landed a faithful rebuild of `switch/ToggleSwitch.tsx` onto the RAC-1.19
 * form-field split — `SwitchField` (the grid `field`) wrapping `SwitchButton`
 * (the subgrid `wrapper`) — mirroring upstream S2 `Switch.tsx` exactly (it
 * imports `SwitchButton`/`SwitchField` from `react-aria-components/Switch`). The
 * port previously rendered a pre-split flex monolith (`<label>` with
 * `display:flex` as its root); that was a self-inflicted structural divergence,
 * now reverted. The same rebuild also reverted a second self-inflicted
 * divergence in the track: a custom `disabledSelectedTrackBackground` light-dark
 * value AND an `isDisabled`-before-`isEmphasized` condition order (which, under
 * last-match-wins, let disabled beat emphasized) — restored to upstream's exact
 * `{default, isEmphasized, forcedColors, isDisabled}` order + `gray-400`.
 *
 * DOM shape, verified byte-identical against upstream by source read (both stacks
 * mount the styled Switch inside a `<div data-comparison-control-root="switch">`
 * wrapper, so the SwitchField grid is one level below the root):
 *
 *   <div data-comparison-control-root="switch">           ← fixture wrapper
 *     <div field>                                          ← SwitchField grid
 *       <label wrapper>                                    ← SwitchButton subgrid
 *         <VisuallyHidden><input role=switch></VisuallyHidden>
 *         <CenterBaseline div>                             ← baseline aligner
 *           <div track>                                    ← the indicator track
 *             <div handle style="transform:…">            ← the sliding handle
 *           </div>
 *         </CenterBaseline>
 *         Wi-Fi                                            ← visible label (bare text)
 *       </label>
 *       <HelpText/>  ← dormant: the demo sets no description/errorMessage and is
 *                      never invalid, so upstream's HelpText is null in every case.
 *     </div>
 *   </div>
 *
 * The `field`, `wrapper`, `track`, and `handle` are byte-copies of the upstream
 * S2 style objects (same `style()` macro inputs → same content-hashed class), and
 * the port threads the identical render-prop conditions (`isSelected`,
 * `isEmphasized`, `isDisabled`, `size`) plus the identical inline handle transform
 * (`switchHandlePressStyle` == upstream `pressScale(handleRef, transformStyle)`).
 *
 * D1 TARGET = the track `<div>`. It is the richest, most condition-dependent
 * surface (focus ring, border, `full` radius, `fontRelative(26)` × `controlSize
 * ('sm')` fixed geometry, and the fill/border color matrix keyed on isSelected/
 * isEmphasized/isDisabled) AND it is fixed-size, so its computed geometry is
 * layout-independent. The stack-neutral locator `… > div > label > div > div`
 * resolves it on both stacks regardless of whether `VisuallyHidden` renders a
 * `<span>` (port default) or a `<div>` (React Aria default): the VH element's only
 * child is the `<input>` (never a `<div>`), so the sole `label > div > div` is the
 * CenterBaseline's track.
 *
 * SCOPE — D1/D3 run at `states: ["default"]` (the param-driven rest matrix), the
 * same source-justified choice made for Checkbox: a switch's focusable element is
 * the visually-hidden `<input>`, while its styled surface is the separate track
 * `<div>` and its RAC state attributes (`data-hovered`/`-pressed`/`-focus-visible`)
 * live on the `<label>`. No single element is simultaneously focusable-and-styled,
 * and the pair-oracle walk drives + measures ONE target locator, so per-gesture
 * style capture on the track is not expressible for a split control. The styling
 * that actually varies — selected / emphasized / disabled / size — is prop-driven
 * (URL params) and captured in full at rest across the case matrix below, which is
 * where a port condition-threading bug would surface. The only gesture-driven
 * track styling is the focus ring (`focusRing()`, keyed on `isFocusVisible`) and
 * the handle press scale, both byte-identical by source read; the focus BEHAVIOR
 * is pinned by D5 and the handle position by D3.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D4 (press →
 * toggle event log), D5 (focus trail), D6 (AX: role=switch/name/checked/disabled),
 * D7 (contrast: the label text), D8 (target size across the size scale). NOT
 * registered:
 *   - D2 motion: the switch has no enter/mount animation; the only motion is the
 *     `transition: default` (track/handle color + handle slide) and `transition:
 *     colors` (wrapper text) that fire on a state change. Their computed
 *     `transition-*` longhands are already pinned by D1 (default allowlist). There
 *     is no overlay/indicator to freeze on mount.
 */

const root = '[data-comparison-control-root="switch"]';

/** The track indicator `<div>` — the D1/D3 target (fixed-size, layout-neutral). */
const trackTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > label > div > div`);
/** The `<label>` (SwitchButton subgrid) — the mouse/touch hit area. */
const labelTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div > label`);
/** The visually-hidden `<input role=switch>` — the focusable element. */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);
/** The SwitchField grid root `<div>`. */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The sliding handle `<div>` — pins the fill matrix + rest transform. */
const handleTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > label > div > div > div`);

const switchScenario: DriverScenario = {
  slug: "switch",
  title: "Switch",
  target: trackTarget,
  parts: {
    // The SwitchButton `<label>` subgrid: color (baseColor('neutral') / disabled)
    // + subgrid placement + `transition: colors`.
    wrapper: labelTarget,
    // The SwitchField grid root: gridTemplateColumns / columnGap / width / font.
    field: fieldTarget,
    // The sliding handle: bg-color matrix (neutral / disabled gray-400 / selected
    // gray-25) + `full` radius + `square` aspect-ratio + the rest transform.
    handle: handleTarget,
  },
  cases: [
    // Rest matrix — every visually distinct track/handle treatment, prop-driven.
    { id: "default" },
    { id: "selected", params: { isSelected: "true" } },
    { id: "emphasized-selected", params: { isEmphasized: "true", isSelected: "true" } },
    { id: "disabled", params: { isDisabled: "true" } },
    // The case that surfaced the reverted divergence: disabled + selected. Upstream
    // resolves the track bg to `gray-400` (isDisabled wins, declared last); the old
    // port resolved it to the custom light-dark value (isDisabled declared first,
    // then overridden by isEmphasized/forcedColors). Now byte-identical.
    { id: "disabled-selected", params: { isDisabled: "true", isSelected: "true" } },
    // Size scale — each selected so the sized track + handle slide are exercised.
    { id: "size-s", params: { size: "S", isSelected: "true" } },
    { id: "size-l", params: { size: "L", isSelected: "true" } },
    { id: "size-xl", params: { size: "XL", isSelected: "true" } },
  ],
  // See the scope note: the switch's focusable element (hidden input) is not its
  // styled surface, so only the rest matrix is style/pixel-captured.
  states: ["default"],
  // Default allowlist covers the track's fill/border/radius/outline/box-shadow/
  // width/height/transform/will-change/transition longhands and the handle's
  // fill/radius/transform. Add box-sizing + aspect-ratio (handle square) and the
  // grid placement (field template columns, wrapper subgrid 1/-1).
  styleProps: {
    add: [
      "box-sizing",
      "aspect-ratio",
      "grid-template-columns",
      "grid-column-start",
      "grid-column-end",
    ],
  },
  // D4: the core contract — pressing toggles selection (native `change`/`click`
  // fire in the same order on both stacks); a disabled switch emits nothing.
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
  // D6: role `switch` + the "Wi-Fi" name, plus the state semantics — `[checked]`
  // (selected) and `[disabled]` — that a port aria-threading bug would surface.
  // Rooted at the `<input>` (the switch node itself), NOT the canvas: the switch
  // carries no decorative-icon AX node (the track/handle are bare `<div>`s), but
  // rooting at the input keeps D6 scoped precisely to the switch's own contract
  // (role / accessible name / checked / disabled — all computed from the wrapping
  // label) and mirrors the Checkbox unit's rooting for a consistent form-field AX
  // certification surface.
  ax: {
    cases: ["default", "selected", "disabled"],
    roots: {
      control: ({ canvas }) => canvas.locator(`${root} input`),
    },
  },
  // D7: the "Wi-Fi" label contrast on the resting and disabled label colors, both
  // themes. Positive control — identical color tokens must match to 2dp. No
  // explicit root: the walk defaults to the panel canvas and measures the
  // `<label>`'s direct "Wi-Fi" text (the label renders children as a bare text
  // node, matching upstream — its color is the wrapper's neutral/disabled token).
  contrast: {
    cases: ["default", "disabled"],
  },
  // D8: the switch hit target across the size scale; both stacks render the hidden
  // `<input role=switch>` at the identical (visually-hidden) border-box, and the
  // 24px / 44px floors are reported (an under-floor size present on BOTH stacks is
  // an upstream note, not a port defect — the pair diff is the hard gate).
  targetSize: {
    cases: ["default", "size-s", "size-xl"],
  },
};

registerStateMatrixDriver(switchScenario);
registerPixelDriver(switchScenario);
registerEventSequenceDriver(switchScenario);
registerFocusTrailDriver(switchScenario);
registerAxTreeDriver(switchScenario);
registerContrastDriver(switchScenario);
registerTargetSizeDriver(switchScenario);
