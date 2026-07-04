import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification march unit (Tier 2, field composite): RadioGroup. Like the
 * CheckboxGroup unit, this certifies the FIELD COMPOSITE the group builds around
 * its children — the `FieldLabel` wrapper, the label element, the items row, and
 * the `HelpText` — against upstream S2 `RadioGroup.tsx`. The port hand-rolls the
 * Field pieces (rather than importing a shared `FieldLabel`/`HelpText`), and the
 * hand-roll carried the SAME THREE self-inflicted divergences the CheckboxGroup
 * hand-roll did, all reverted in this march so the OUTPUT realigns with upstream
 * byte-for-byte (the shared-component extraction that would produce this output
 * internally remains tracked as `helptext-fielderror-visual-port`):
 *
 *   (1) items `flexWrap` was an unconditional `"wrap"`; upstream wraps only a
 *       HORIZONTAL group (`{orientation:{horizontal:'wrap'}}`). A vertical group
 *       (the demo default) must compute `flex-wrap:nowrap`. → D1 on the `items`
 *       part, across the `default` (vertical) and `horizontal` cases.
 *   (2) the label wrapper `contain` was missing the `isQuiet:'none'` branch.
 *       Upstream's FieldLabel is rendered by RadioGroup with `isQuiet` ("Make the
 *       label affect the width of the group" — upstream's own comment), so under
 *       last-match-wins the wrapper computes `contain:none`, letting the label's
 *       intrinsic width feed the group's grid. The old port computed
 *       `contain:inline-size` (size-contained → label width decoupled from the
 *       group), a LAYOUT divergence. → D1 on the `labelWrapper` part (`contain`)
 *       AND the `field` grid geometry (`grid-template-columns`), plus D3 pixels.
 *   (3) description/error rendered `<div>`s (the error with `role="alert"`);
 *       upstream renders RAC `<Text slot="description">` / `<Text
 *       slot="errorMessage">` (both `<span>`s, and RAC FieldError carries NO alert
 *       role). Description → `<span slot="description">` is a DOM-faithfulness
 *       revert with no computed-style delta (both `display:flex`, same tokens);
 *       the `role="alert"` removal only changes the AX tree in the INVALID state,
 *       which is deferred (see DEFERRED). The port also dropped a hand-roll-only
 *       `margin:0` from `radioGroupHelpText` (absent from upstream
 *       `helpTextStyles`; computed margin stays `0`).
 *
 *       As part of this revert the description/error ids were made SINGLE-SOURCE,
 *       matching upstream exactly. Upstream `useRadioGroup` mints the ids and
 *       stores them (`radioGroupData`) so `useRadio` can thread the group's
 *       description onto EVERY child radio's `aria-describedby` (`useRadio.ts`:
 *       `['aria-describedby', ownDescriptionId, groupDescriptionId]`). The port's
 *       headless layer already replicates that (`radioGroupData` +
 *       `createRadio`), but the S2 wrapper had been minting its OWN
 *       `${idBase}-description` for the visible node while NEVER passing the
 *       description down to the headless — so the headless minted no id at all and
 *       the child radios lost the group description entirely. Fixed faithfully:
 *       the wrapper now passes `description`/`errorMessage` DOWN to the headless
 *       (the single source that mints the id + threads it onto the group and every
 *       radio) with `renderHelpText={false}` (the headless suppresses its own
 *       plain `<div>`; the visible node is our styled `<Text>`, reading the id back
 *       from `radioGroupData`). Group node, every radio input, and the `<Text>`
 *       now resolve to one id — byte-identical to upstream. → D6, both cases below.
 *
 * NOT a divergence (verified, left as-is): the group label is a `<span>`. RAC
 * `Label` is a `<label>` only for a single labelable control; a radio group is not
 * labelable, so upstream's group label renders a `<span>` associated by
 * `aria-labelledby` — which the port already matched.
 *
 * DOM shape (demo default: vertical, label top, description, "starter" selected),
 * verified against upstream + the styled fixture:
 *
 *   <div data-comparison-control-root="radiogroup">          ← fixture wrapper
 *     <div field role="radiogroup">                          ← AriaRadioGroup grid
 *       <div labelWrapper>                                   ← FieldLabel outer div
 *         <span -label>Plan</span>                           ← the group label (span)
 *       </div>
 *       <div items>                                          ← the radio row/column
 *         <label>…Starter…</label> <label>…Pro…</label> <label>…Enterprise…</label>
 *       </div>
 *       <span slot="description">Select one plan.</span>     ← (revert 3)
 *     </div>
 *   </div>
 *
 * D1 TARGET = the `field` grid `<div>` — its `grid-template-columns`/areas + gaps +
 * width are where revert (2)'s label-width-feeds-the-group effect surfaces. Parts
 * capture the composite surfaces the reverts touch.
 *
 * SCOPE — D1/D3 run at `states:["default"]` (the param-driven rest matrix): a
 * RadioGroup is a static layout container with no container-level hover/press
 * state; everything that varies (orientation / labelPosition / labelAlign /
 * necessity / disabled / size) is prop-driven and captured at rest below. The
 * per-child radio press/focus-ring behavior is certified separately.
 *
 * Applicable drivers: D1 (rest-state style matrix), D3 (pixel), D5 (focus/keyboard
 * — here the group's ROVING TABINDEX + arrow navigation, which unlike the
 * CheckboxGroup unit is the WHOLE point: a radio group is a SINGLE tab stop and
 * ArrowDown/Up moves+selects within it; the trail certifies the port's roving
 * layout and arrow model match upstream entry-for-entry), D6 (AX: the group's
 * radiogroup role + name-from-label + description-from-`aria-describedby` + the
 * three child radios, each carrying the propagated group description), D7
 * (contrast: label + description + option text). NOT registered:
 *   - D4 events: the group has no container-level event contract; per-radio
 *     press/change ordering is a per-control concern.
 *   - D8 target size: the radios are the hit targets; the group adds no new target.
 *   - D2 motion: no enter/mount animation; the only motion is the per-radio
 *     circle `transition`/press-scale, a per-control concern.
 *
 * D6 uses the `default` (starter selected) + `disabled` cases. Unlike the checkbox
 * (whose CHECKED box renders a decorative Checkmark `<svg>` whose AX exposure is
 * the tracked `ui-icon-decorative-ax-node` divergence, forcing that unit onto
 * all-unchecked cases), a radio's selected indicator is a CSS-drawn `<div>` circle
 * — no decorative node enters the AX tree — so the realistic selected state is
 * certified directly. D6 asserts the FULL described-element set under the group,
 * so it certifies both the group node's own `{role:'radiogroup', name,
 * description}` AND the description propagation onto each of the three child radio
 * inputs (revert 3's single-source fix) — byte-identical to upstream.
 *
 * DEFERRED — the `isInvalid` state (the `<Text slot="errorMessage">` error row +
 * its AlertIcon sizing + the group's `aria-invalid`), held to the shared
 * HelpText/FieldError port (`helptext-fielderror-visual-port`) for the identical
 * reason the Checkbox/CheckboxGroup units deferred it: the error row re-flows the
 * `field` grid and the port does not yet size the alert glyph via the upstream size
 * ramp. The `role="alert"` removal (revert 3) is landed in source now so the markup
 * is faithful when that unit certifies the invalid cases; this unit certifies the
 * valid (description) composite, where reverts (1) and (2) live.
 */

const root = '[data-comparison-control-root="radiogroup"]';

/** The `field` grid `<div role="radiogroup">` — the D1 target (composite geometry). */
const fieldTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} > div`);
/** The FieldLabel outer wrapper `<div>` — carries revert (2)'s `contain`. */
const labelWrapperTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1)`);
/** The group's label `<span>` — direct child of the label wrapper. A radio group
 *  is not a labelable element, so upstream renders the group label as a `<span>`
 *  associated by `aria-labelledby`, which the port already matched; this part pins
 *  its `fieldLabel()` color/font/cursor. */
const labelTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(1) > span`);
/** The radio row/column `<div>` — carries revert (1)'s `flex-wrap`. */
const itemsTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} > div > div:nth-child(2)`);
/** The HelpText `<span slot="description">` (revert 3). */
const descriptionTarget: TargetResolver = ({ canvas }) =>
  canvas.locator(`${root} [slot="description"]`);
/** The first radio `<input>` — the D5 roving-walk start. */
const firstInputTarget: TargetResolver = ({ canvas }) => canvas.locator(`${root} input`).first();

const radioGroupScenario: DriverScenario = {
  slug: "radiogroup",
  title: "RadioGroup",
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
    // child radio inherits disabled.
    { id: "disabled", params: { isDisabled: "true" } },
    // Size scale — font ramp + `--field-gap` row gap scale.
    { id: "size-s", params: { size: "S" } },
    { id: "size-l", params: { size: "L" } },
    { id: "size-xl", params: { size: "XL" } },
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
  // D5: unlike a CheckboxGroup (three independent tab stops), a RadioGroup is a
  // SINGLE tab stop with roving tabindex — only the selected (or first) radio is
  // tabbable, and ArrowDown/ArrowUp move focus AND selection within the group.
  // Starting on the first radio and walking Down/Down/Up certifies the port's
  // roving-tabindex layout and arrow-navigation model match upstream entry for
  // entry (same active element, same `[tabindex]` layout after each key).
  focus: {
    walks: [
      { id: "arrow-nav", start: firstInputTarget, keys: ["ArrowDown", "ArrowDown", "ArrowUp"] },
    ],
  },
  // D6: the group node's role (`radiogroup`) + accessible name (from the label
  // `<span>` via aria-labelledby) + accessible description (from the `<span
  // slot="description">` via aria-describedby — revert 3), plus the three child
  // radios (role/name/checked/disabled), each carrying the propagated group
  // description. Rooted at the `field` grid so the whole composite tree is
  // asserted. The default (starter selected) case is clean because a radio's
  // selected indicator is a CSS `<div>` circle, not a decorative img/svg.
  ax: {
    cases: ["default", "disabled"],
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

registerStateMatrixDriver(radioGroupScenario);
registerPixelDriver(radioGroupScenario);
registerFocusTrailDriver(radioGroupScenario);
registerAxTreeDriver(radioGroupScenario);
registerContrastDriver(radioGroupScenario);
