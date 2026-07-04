import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, field composite): CheckboxGroup. Where the
 * Checkbox/Switch units certified a single split control, this unit certifies the
 * FIELD COMPOSITE the group builds around its children — the `FieldLabel` wrapper,
 * the label element, the items row, and the `HelpText` — against upstream S2
 * `CheckboxGroup.tsx`. That composite had THREE self-inflicted divergences from
 * upstream, all reverted in this march (the group hand-rolls the Field pieces
 * rather than importing a shared `FieldLabel`/`HelpText`; the reverts realign the
 * hand-roll's OUTPUT with upstream byte-for-byte, which is what the pair-oracle
 * certifies — the shared-component extraction that would produce this same output
 * internally remains tracked as `helptext-fielderror-visual-port`):
 *
 *   (1) items `flexWrap` was an unconditional `"wrap"`; upstream wraps only a
 *       HORIZONTAL group (`{orientation:{horizontal:'wrap'}}`). A vertical group
 *       (the demo default) must compute `flex-wrap:nowrap`. → D1 on the `items`
 *       part, across the `default` (vertical) and `horizontal` cases.
 *   (2) the label wrapper `contain` was missing the `isQuiet:'none'` branch.
 *       Upstream's FieldLabel is rendered by CheckboxGroup with `isQuiet` ("Make
 *       the label affect the width of the group" — upstream's own comment), so
 *       under last-match-wins the wrapper computes `contain:none`, letting the
 *       label's intrinsic width feed the group's grid. The old port computed
 *       `contain:inline-size` (size-contained → label width decoupled from the
 *       group), a LAYOUT divergence. → D1 on the `labelWrapper` part (`contain`)
 *       AND the `field` grid geometry (`grid-template-columns`), plus D3 pixels.
 *   (3) description/error rendered `<div>`s (the error with `role="alert"`);
 *       upstream renders RAC `<Text slot="description">` / `<Text
 *       slot="errorMessage">` (both `<span>`s, and RAC FieldError carries NO alert
 *       role). Description → `<span slot="description">` is a DOM-faithfulness
 *       revert with no computed-style delta (both are `display:flex`, same tokens);
 *       the `role="alert"` removal only changes the AX tree in the INVALID state,
 *       which is deferred (see DEFERRED). The port also dropped a hand-roll-only
 *       `margin:0` from `checkboxGroupHelpText` (absent from upstream
 *       `helpTextStyles`; computed margin stays `0`).
 *
 *       As part of this revert the description/error ids were made SINGLE-SOURCE,
 *       matching upstream exactly. Upstream `useCheckboxGroup` mints the ids and
 *       stores them so `useCheckboxGroupItem` can thread the group's description
 *       onto EVERY child input's `aria-describedby` (`useCheckboxGroupItem.ts`:
 *       `[...inputDescribedBy, isInvalid ? errorMessageId : null, descriptionId]`).
 *       The port's headless layer already replicates that (`checkboxGroupData`),
 *       but the S2 wrapper had been minting its OWN `${idBase}-description` for the
 *       visible `<Text>`, so the wrapper's id and the headless/item id diverged and
 *       the child inputs lost the group description. Fixed faithfully: the wrapper
 *       now passes `description`/`errorMessage` DOWN to the headless (the single
 *       source that mints the id + threads it onto the group and every item) with
 *       `renderHelpText={false}` (the headless suppresses its own plain `<div>`;
 *       the visible node is our styled `<Text>`, reading the id back from
 *       `checkboxGroupData`). Group node, every item input, and the `<Text>` now
 *       resolve to one id — byte-identical to upstream. → D6, both cases below.
 *
 * NOT a divergence (verified, left as-is): the group label is a `<span>`. RAC
 * `Label` is a `<label>` only for a single labelable control; RAC CheckboxGroup
 * supplies `LabelContext` with `elementType:'span'` (`CheckboxGroup.tsx:319`), so
 * upstream's group label renders a `<span>` associated by `aria-labelledby` — which
 * the port already matched. (An earlier pass briefly "reverted" this to a `<label>`;
 * that WOULD have been the divergence, and it was undone.)
 *
 * DOM shape (demo default: vertical, label top, description, "email" checked),
 * verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="checkboxgroup">     ← fixture wrapper
 *     <div field role="group">                             ← AriaCheckboxGroup grid
 *       <div labelWrapper>                                 ← FieldLabel outer div
 *         <span -label>Notifications</span>                ← the group label (span)
 *       </div>
 *       <div items>                                        ← the checkbox row/column
 *         <label>…Email…</label> <label>…SMS…</label> <label>…Push…</label>
 *       </div>
 *       <span slot="description">Select notification channels.</span>  ← (revert 3)
 *     </div>
 *   </div>
 *
 * D1 TARGET = the `field` grid `<div>` — its `grid-template-columns`/areas + gaps +
 * width are where revert (2)'s label-width-feeds-the-group effect surfaces. Parts
 * capture the composite surfaces the reverts touch.
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the param-driven rest matrix): a
 * CheckboxGroup is a static layout container with no container-level hover/press
 * state; everything that varies (orientation / labelPosition / labelAlign /
 * necessity / disabled / size) is prop-driven and captured at rest below. The
 * per-child checkbox press/focus-ring behavior is already certified by the
 * Checkbox unit and is not re-litigated here.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D5 (focus order
 * through the children — certifies the group did NOT introduce roving tabindex),
 * D6 (AX: the group's role + name-from-label + description-from-`aria-describedby`
 * + the child checkboxes), D7 (contrast: label + description + option text). NOT
 * registered:
 *   - D4 events: the group has no container-level event contract; per-checkbox
 *     toggle (native change/click ordering) is certified by the Checkbox unit.
 *   - D8 target size: the checkboxes are the hit targets, sized + certified by the
 *     Checkbox unit; the group adds no new target.
 *   - D2 motion: no enter/mount animation; the only motion is the per-checkbox
 *     `transition` already pinned by the Checkbox unit's D1.
 *
 * D6 uses `selectedValues:"none"` cases (no option matches → every checkbox
 * unchecked) so the group's semantics are certified WITHOUT the checked "email"
 * box's decorative Checkmark `<svg>`, whose AX exposure (bare `img` on React vs
 * `aria-hidden` on the port) is the tracked `ui-icon-decorative-ax-node`
 * divergence, deferred to the ui-icon unit exactly as in the Checkbox unit. D6
 * asserts the FULL described-element set under the group, so it certifies both the
 * group node's own `{role:'group', name, description}` AND the description
 * propagation onto each of the three child inputs (revert 3's single-source fix) —
 * byte-identical to upstream in both the enabled and disabled cases.
 *
 * DEFERRED — the `isInvalid` state (the `<Text slot="errorMessage">` error row +
 * its AlertIcon sizing + the group's `aria-invalid`), held to the shared
 * HelpText/FieldError port (`helptext-fielderror-visual-port`) for the identical
 * reason the Checkbox unit deferred it: the error row re-flows the `field` grid
 * and the port does not yet size the alert glyph via the upstream size ramp. The
 * `role="alert"` removal (revert 3) is landed in source now so the markup is
 * faithful when that unit certifies the invalid cases; this unit certifies the
 * valid (description) composite, where reverts (1) and (2) live.
 */

const root = '[data-comparison-control-root="checkboxgroup"]';

/** The `field` grid `<div role="group">` — the D1 target (composite geometry). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>` — carries revert (2)'s `contain`. */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The group's label `<span>` — direct child of the label wrapper. Upstream
 *  renders the group label as a `<span>` (RAC CheckboxGroup supplies LabelContext
 *  `elementType:'span'` — a group is not a labelable element), which the port
 *  already matched; this part pins its `fieldLabel()` color/font/cursor. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > span`);
/** The checkbox row/column `<div>` — carries revert (1)'s `flex-wrap`. */
const itemsTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The HelpText `<span slot="description">` (revert 3). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);
/** The first checkbox `<input>` — the D5 focus-walk start. */
const firstInputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`).first();

const checkboxGroupScenario: DriverScenario = {
  slug: "checkboxgroup",
  title: "CheckboxGroup",
  target: fieldTarget,
  parts: {
    // FieldLabel outer div — `contain` (revert 2: `none`, not `inline-size`),
    // `text-align` (labelAlign), `padding-bottom` (labelPosition top), gridArea.
    labelWrapper: labelWrapperTarget,
    // The group label `<span>` (faithful, not a revert) — fieldLabel()
    // color/font/cursor + inline.
    label: labelTarget,
    // The items row — `flex-wrap` (revert 1: conditional), `flex-direction`
    // (orientation), gaps, gridArea input.
    items: itemsTarget,
    // The HelpText span (revert 3) — helpTextStyles: display:flex + font + color +
    // padding-top:--field-gap + gap + align-items:baseline + gridArea helptext.
    description: descriptionTarget,
  },
  cases: [
    // Rest matrix — every visually distinct composite treatment, prop-driven.
    { id: "default" },
    // orientation:horizontal — revert (1): `items` must compute `flex-wrap:wrap`
    // + `flex-direction:row` here (and `nowrap`/`column` in `default`).
    { id: "horizontal", params: { orientation: "horizontal" } },
    // labelPosition:side — the label moves into its own grid column; the wrapper
    // drops the top `padding-bottom` and (revert 2) still computes `contain:none`.
    { id: "label-side", params: { labelPosition: "side" } },
    // labelAlign:end — `text-align:end` on the label wrapper.
    { id: "label-end", params: { labelAlign: "end" } },
    // necessityIndicator:label — renders the "(optional)" necessity span next to
    // the label (the label-variant necessity branch).
    { id: "necessity-label", params: { necessityIndicator: "label" } },
    // Disabled — label + help-text colors switch to the disabled token; every
    // child checkbox inherits disabled.
    { id: "disabled", params: { isDisabled: "true" } },
    // Size scale — font ramp + `--field-gap` row gap scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
    // D6-only (see below): all-unchecked variants keep the decorative Checkmark
    // out of the AX tree so the group's own semantics can be certified clean.
    { id: "unchecked", params: { selectedValues: "none" }, steadyState: false },
    {
      id: "disabled-unchecked",
      params: { selectedValues: "none", isDisabled: "true" },
      steadyState: false,
    },
  ],
  // A layout container has no container-level gesture state; the rest matrix is
  // the whole styled surface.
  states: ["default"],
  // Default allowlist already covers color/border/font/padding/margin/gap/width/
  // height/display/align-items/cursor. Add the composite's grid + flow props:
  // `contain` (revert 2), `flex-wrap` (revert 1), `flex-direction`, `text-align`,
  // and the field grid template + `box-sizing`.
  styleProps: {
    add: [
      "contain",
      "flex-wrap",
      "flex-direction",
      "text-align",
      "grid-template-columns",
      "grid-template-areas",
      "grid-template-rows",
      "box-sizing",
    ],
  },
  // D5: Tab walks the three checkboxes in DOM order (email → sms → push) and back
  // identically on both stacks — a CheckboxGroup is NOT roving; each box is its
  // own tab stop. Starting on the first input certifies no port-introduced
  // tabindex management.
  focus: {
    walks: [{ id: "tab-through", start: firstInputTarget, keys: ["Tab", "Tab", "Shift+Tab"] }],
  },
  // D6: the group node's role (`group`) + accessible name (from the label
  // `<span>` via aria-labelledby) + accessible description (from the `<span
  // slot="description">` via aria-describedby — revert 3), plus the three child
  // checkboxes (role/name/checked/disabled). Rooted at the `field` grid so the
  // whole composite tree is asserted. Uses the all-unchecked cases to keep the
  // tracked decorative-Checkmark img/aria-hidden divergence out of scope.
  ax: {
    cases: ["unchecked", "disabled-unchecked"],
    roots: {
      group: fieldTarget,
    },
  },
  // D7: the label + description + option-label contrast, resting and disabled,
  // both themes. Positive control — identical tokens must match to 2dp.
  contrast: {
    cases: ["default", "disabled"],
  },
};

registerStateMatrixDriver(checkboxGroupScenario);
registerPixelDriver(checkboxGroupScenario);
registerFocusTrailDriver(checkboxGroupScenario);
registerAxTreeDriver(checkboxGroupScenario);
registerContrastDriver(checkboxGroupScenario);
