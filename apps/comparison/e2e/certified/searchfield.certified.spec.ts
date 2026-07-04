import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, input + adornments field composite): SearchField.
 * SearchField is a TextField-shaped composite (upstream S2 `SearchField.tsx` →
 * `AriaSearchField` + shared `FieldLabel`/`FieldGroup`/`HelpText`) whose FieldGroup
 * additionally holds a LEADING search icon and a TRAILING clear button:
 *
 *   FieldGroup(role="group")  ->  [ SearchIcon svg | <input type="search"> | ClearButton ]
 *
 * The port's separate `searchfield/index.tsx` hand-roll carried the SAME help-text
 * divergence the field family did (help text as `<p>` + a hand-roll-only `margin:0`
 * in `helpTextStyles`). That is reverted to `<span slot="description">` /
 * `<span slot="errorMessage">` (RAC `<Text>` / `<FieldError>` render `<span>`, no UA
 * margin), and the stray `margin:0` is dropped (upstream `helpTextStyles` has none) —
 * a computed-style AND an AX revert (a `<p>` carries an implicit `paragraph` role a
 * `<span>` does not). The shared FieldLabel/HelpText *extraction* stays tracked as
 * `helptext-fielderror-visual-port`.
 *
 * KEY — the FieldGroup role divergence does NOT apply here (this is the important
 * correction to the "whole input family = presentation" note from the TextField unit):
 * SearchField's group IS `role="group"`, NOT `role="presentation"`. TextField's group
 * is presentation because RAC's `TextField` seeds `GroupContext` with
 * `{role:'presentation'}`; RAC's `SearchField` seeds `GroupContext` with only
 * `{isInvalid, isDisabled}` — NO role — (react-aria-components `SearchField.mjs`), so
 * the inner `<Group>` falls back to its default `role ?? 'group'`. The lesson: verify
 * per RAC component whether the role is seeded — do not assume it transfers. The port's
 * hand-roll already renders `role="group"` (correct); D6 (below) certifies the rendered
 * React AX tree DOES expose a `group` node here, unlike TextField.
 *
 * The CLEAR BUTTON is NOT a divergence: upstream mounts it only when
 * `!isEmpty && !isReadOnly`; the port renders `<HeadlessSearchFieldClearButton>` when
 * `!isReadOnly`, and the headless button itself renders nothing under `<Show
 * when={!isEmpty()}>`. So the rendered DOM matches for every value/read-only combo
 * (empty → no button on both; non-empty & not-read-only → button on both; read-only →
 * no button on both). The demo default value is `"status"` (non-empty), so every case
 * below except `read-only` shows the button, and `read-only` hides it on both stacks.
 *
 * DOM shape (demo default: label "Search", value "status", description, size M):
 *
 *   <div searchfield role=... class="field grid">            ← AriaSearchField grid (root)
 *     <div labelWrapper><label -label>Search</label></div>   ← FieldLabel
 *     <div group role="group">                               ← FieldGroup
 *       <div slot="icon"><svg SearchIcon/></div>
 *       <input type="search" value="status">
 *       <button ClearButton><svg Cross/></button>            ← only when !isEmpty && !readOnly
 *     </div>
 *     <span slot="description">Search by name…</span>        ← HelpText (revert)
 *   </div>
 *
 * FIXTURE SYMMETRY: both fixtures place `data-comparison-control-root="searchfield"`
 * directly on the component (React `SpectrumSearchField`, Solid `SolidSpectrumSearchField`),
 * so it lands on the field-grid root at equal depth on both stacks — the root selector
 * IS the grid (no wrapper hop, unlike TextField/TextArea whose React fixture wraps).
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the split-control justification shared by
 * TextField/TextArea/Checkbox/Switch): the focusable `<input>` is not the primary styled
 * surface (that is the separate `FieldGroup` `<div>`, whose border reacts to focus-within
 * via a render-prop class), so no single element is focusable-and-styled. Everything that
 * varies (size / disabled / required / read-only) is prop-driven and captured at rest.
 *
 * D1 parts are the always-present set (labelWrapper, label, group, input, description);
 * the leading search icon and trailing clear button are deliberately NOT D1 parts because
 * the clear button vanishes in the `read-only` case (a part locator that resolves to zero
 * elements would throw). Their pixels are certified by D3 (whole-field diff), their focus
 * order by D5, and the clear button's role+name by D6.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel — incl. icon + clear button),
 * D5 (focus/keyboard — the input and the clear button are TWO tab stops; `tab-cycle`
 * certifies focus lands on the input, Tab advances to the clear button, Shift+Tab returns),
 * D6 (AX: the searchbox role + name-from-label + description; the `role="group"` FieldGroup
 * node), D7 (contrast: label + description). NOT registered:
 * D4 events (the input/clear callback ordering is a per-control concern the two fixtures
 * wire differently), D8 target size (the input + clear button are the hit targets; the
 * composite adds none), D2 motion (the only motion is the border-color `transition`, pinned
 * by D1).
 *
 * D6 uses the `read-only` case ONLY — the sole case whose clear button is absent, routing
 * D6 around the tracked `ui-icon-decorative-ax-node` divergence (the clear-button Cross is a
 * ui-icon: bare `<svg>` → unnamed `img` on React, decorative `aria-hidden` on the port; the
 * global icon policy is the `ui-icon` unit's, not this commit's). `default`/`disabled` (clear
 * button) and `required` (decorative AsteriskIcon svg) are the held-out decorative-node cases;
 * their non-AX facets stay covered by D1/D3/D5/D7. See the `ax` config below for the full note.
 *
 * DEFERRED — the `isInvalid` state (the `<span slot="errorMessage">` error row + its
 * `AlertTriangleIcon` + `aria-invalid` re-flowing the field grid), held to
 * `helptext-fielderror-visual-port` as with the other Tier-2 units; the `<span>`/`slot`
 * markup is landed so it is faithful when that unit certifies invalid.
 */

const root = '[data-comparison-control-root="searchfield"]';

/** The `field` grid `<div>` — the D1 target (and the root itself). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(root);
/** The FieldLabel outer wrapper `<div>` (first grid child). */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div:nth-child(1)`);
/** The label `<label>` — a searchbox IS labelable (RAC `<Label>` is a `<label>`). */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div:nth-child(1) > label`);
/** The bordered FieldGroup `<div role="group">` (second grid child) — border/background/
 *  focus ring + pill radius + the icon/input/clear-button flex row. */
const groupTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div:nth-child(2)`);
/** The `<input type="search">` — transparent chrome + flex-grow + truncate. */
const inputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`);
/** The HelpText `<span slot="description">` (revert). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);

const searchFieldScenario: DriverScenario = {
  slug: "searchfield",
  title: "SearchField",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — gridArea label + contain(inline-size) + text-align.
    labelWrapper: labelWrapperTarget,
    // The label element — fieldLabel() color/font + disabled color.
    label: labelTarget,
    // The bordered field shell (role="group") — border/background/pill radius/focus
    // ring + control() sizing + fieldInput() padding + disabled/invalid tokens.
    group: groupTarget,
    // The search input — padding:0, transparent bg, inherit font, flex-grow:1,
    // min-width:0, truncate (white-space:nowrap + text-overflow:ellipsis).
    input: inputTarget,
    // The HelpText span (revert) — helpTextStyles with NO margin (the stray margin:0
    // is gone), display:flex + font + color + padding-top:--field-gap.
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
    // Read-only — RAC sets the input `readonly` AND the clear button is hidden on both
    // stacks; this pins that the read-only attr does not otherwise leak into the styles.
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
  // D5: the input and the (non-empty) clear button are two tab stops — Tab advances
  // input → clear button, Shift+Tab returns. Certifies the clear button's tab position.
  focus: {
    walks: [{ id: "tab-cycle", start: inputTarget, keys: ["Tab", "Shift+Tab"] }],
  },
  // D6: the searchbox role + name (from the `<label>`) + description (via
  // aria-describedby) + the `role="group"` FieldGroup node (present here, unlike
  // TextField, whose group is presentation).
  //
  // Scoped to `read-only` — the ONE demo case whose clear button is absent (RAC
  // mounts it only when `!isEmpty && !isReadOnly`; the port `<Show when={!isReadOnly}>`s
  // it). That routes D6 around the tracked `ui-icon-decorative-ax-node` divergence
  // exactly as the Checkbox/RadioGroup units did (RadioGroup certifies its UNCHECKED
  // variant "so no decorative node enters the AX tree"): the clear button's Cross is a
  // UI-icon (bare `<svg>` upstream → Chromium exposes an unnamed `img` child; the port's
  // `createUIIcon` marks it `role="img"` + decorative `aria-hidden` → no child node).
  // That is a GLOBAL icon-policy divergence (the port hides every ui-icon; the
  // treatment is arguably the MORE correct a11y — a nameless `img` is screen-reader
  // noise — and keeps our axe gate green by not emitting image-alt violations), owned by
  // the future `ui-icon` unit, NOT flippable inside a per-component commit. The clear
  // button's own role+name is NOT the divergence (both stacks show `button "Clear
  // search"`); only its decorative child `img` differs, so nothing SearchField-specific
  // is lost by holding it out. The leading SearchIcon is a WORKFLOW icon (`createIcon`,
  // decorative-hidden on BOTH stacks), so it never enters the tree — the read-only tree
  // is the full, clean searchbox + group + description structure. `required` (decorative
  // AsteriskIcon svg) and `default`/`disabled` (clear-button Cross) are the held-out
  // decorative-node cases; their non-AX facets stay covered by D1/D3/D5/D7.
  ax: {
    cases: ["read-only"],
    roots: {
      field: fieldTarget,
    },
  },
  // D7: label + description contrast, resting + disabled, both themes. (The input value
  // lives in `.value` with no child text node — like TextField, not measured; the icon
  // and clear-button glyphs are currentColor svgs with no text.)
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(searchFieldScenario);
registerPixelDriver(searchFieldScenario);
registerFocusTrailDriver(searchFieldScenario);
registerAxTreeDriver(searchFieldScenario);
registerContrastDriver(searchFieldScenario);
