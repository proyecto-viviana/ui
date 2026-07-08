import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification march unit (Tier 4, collections): TagGroup.
 *
 * WHY THIS UNIT IS DIFFERENT FROM GridList/ListView. GridList split into a base
 * cert (RAC oracle, roving focus + AX) and a styled ListView cert (S2 oracle,
 * paint) because S2 leaves the base GridList unstyled. TagGroup has NO such split:
 * S2 ships a single, publicly-styled `TagGroup`/`Tag` (its own style macro) AND it
 * IS the base — upstream `useTagGroup` builds the collection on top of `useGridList`
 * (a `ListKeyboardDelegate({orientation:'horizontal', direction})` +
 * `keyboardNavigationBehavior:'tab'`), and `useTag` is a thin `useGridListItem`
 * wrapper whose only extra keydown is Delete/Backspace removal. So this ONE unit
 * owns both surfaces; they are certified across TWO checkpoints, BOTH in this file:
 *   - CP9.44a (paint drivers below): styled S2 PAINT — D1/D3/D7/D8.
 *   - CP9.44b (behavior drivers below): roving-focus + AX + RTL BEHAVIOR —
 *     D5/D6/D10, plus the `createTag` fixes those drivers surface (direction-aware
 *     nav + row/gridcell accessible-name parity + the remove-icon `img` exposure).
 * The React panel renders `@react-spectrum/s2` `TagGroup`/`Tag`; the Solid panel
 * renders `@proyecto-viviana/solid-spectrum` `TagGroup`/`Tag` (its port of the same
 * macro). Both are the labelled "Photo categories" removable tag collection.
 *
 * CP9.44a DRIVER SCOPING (documented, not silent). This pass certifies the S2 PAINT:
 * D1 (state-matrix computed styles), D3 (strict pixel), D7 (contrast), D8 (target
 * size) — the tag treatment (fill / text colour / radius / control shape across
 * selection · emphasized · disabled · size), the grid container, the label slot,
 * and the remove button. CP9.44b (behavior drivers, further below) adds:
 *   - D6 (AX tree) — `role="grid"` rows/gridcells + the remove-button role/name.
 *     The divergences it surfaces (tag ROW named from contents "Landscape Remove"
 *     vs upstream's "Landscape"; the remove icon hidden vs S2's exposed `img`) are
 *     `createTag`/styled-icon fixes that live alongside the same-file RTL nav fix.
 *   - D5 (focus trail) + D10 (RTL) — real roving DOM focus + the inline-axis
 *     Left/Right flip (the port's `createTag` hand-rolls ArrowRight=next with no
 *     `direction`); use the Before/After boundary buttons + `?locale` fixture
 *     plumbing.
 * DEFERRED past CP9.44b: D2 (motion) — no enter/exit animation (only the
 * `transition` longhands D1 pins). D4 (events) — selection/removal event model via
 * the shared interaction-hook family. D9 (forced colors) — deferred with the paint
 * follow-ups.
 *
 * D1/D3 SCOPE — `states: ["default"]`. A tag is itself a selectable/pressable
 * target, so driving a `pressed`/`hover` gesture on it would TOGGLE selection
 * mid-capture and desync the two panels (the same reason the ListView row cert is
 * rest-only). The styling that actually varies — selected / emphasized / disabled /
 * size — is prop-driven (URL params) and captured in full at rest across the case
 * matrix, which is where a port condition-threading bug surfaces. The focus ring is
 * an aria-hidden `focusRing()` layer keyed on `isFocusVisible`; its FOCUS behavior
 * is pinned by the CP9.44b D5 walk.
 *
 * D1 TARGET = the first TAG (`role="row"`). It carries the tag-level treatment
 * (inline-flex control shape, fill/colour, radius, the `pressScale` `will-change`
 * layer hint, the `transition` longhands) and its render-prop conditions
 * (`isSelected`/`isDisabled`/`isEmphasized`) key the whole tag. Parts diffed
 * alongside it: the `grid` container (field layout + label/help grid areas), the
 * `label` slot (`<span>` colour + font), and the tag's REMOVE BUTTON
 * (`<button aria-label="Remove …">` — its round hit target sized to `controlSize()`
 * and the `CrossIcon` fill). Selection is pinned per case via the controlled
 * `selectedKeys` param so the first tag is a known, stable state (RAC/S2 both apply
 * the identical `selectedKeys`).
 */

/** The tag collection in THIS panel's canvas, by its accessible name. */
const grid: TargetResolver = ({ canvas }) => canvas.getByRole("grid", { name: "Photo categories" });
/** The first tag (`role="row"`) — the D1/D3 tag target. */
const firstTag: TargetResolver = (ctx) => grid(ctx).getByRole("row").first();
/** The first tag's REMOVE button (`<button aria-label="Remove Landscape">`). */
const firstTagRemoveButton: TargetResolver = (ctx) => firstTag(ctx).getByRole("button").first();
/** The group's visible label slot (`<span>` → "Photo categories"). */
const groupLabel: TargetResolver = ({ canvas }) =>
  canvas.getByText("Photo categories", { exact: true });

/** Controlled-selection params that fix the first tag's (Landscape) state. */
const controlled = (selectedKeys: string, extra: Record<string, string> = {}) => ({
  selectionMode: "multiple",
  selectionSource: "selectedKeys",
  selectedKeys,
  ...extra,
});

const tagGroupScenario: DriverScenario = {
  slug: "taggroup",
  title: "TagGroup",
  target: firstTag,
  parts: {
    // The grid container — field/label/help grid layout.
    grid,
    // The label slot — colour + font, keyed on disabled.
    label: groupLabel,
    // The remove button — round hit target, size ramp, CrossIcon fill.
    remove: firstTagRemoveButton,
  },
  // D3 pixels the whole grid so every tag fill, the remove buttons, and the label
  // rasterize together (the tag-level D1 target cannot see a sibling tag's fill).
  pixelTarget: grid,
  cases: [
    // First tag (Landscape) UNSELECTED — resting tag fill (a sibling is selected so
    // the selected treatment still renders in the crop).
    { id: "default", params: controlled("travel") },
    // First tag SELECTED — the neutral selected fill + inverted text colour.
    { id: "selected", params: controlled("landscape") },
    // Two tags selected (first among them) — multi-select fill.
    { id: "multiple", params: controlled("landscape,travel") },
    // Emphasized selection — the accent fill replaces the neutral selected fill.
    { id: "emphasized", params: controlled("landscape", { isEmphasized: "true" }) },
    // First tag DISABLED — dimmed fill/text, disabled remove button.
    { id: "disabled", params: controlled("travel", { disabledItem: "landscape" }) },
    // Size ramp — S and L change the control height, padding, and remove-button box.
    { id: "size-s", params: controlled("travel", { size: "S" }) },
    { id: "size-l", params: controlled("travel", { size: "L" }) },
  ],
  states: ["default"],
  // Default allowlist covers fill/border/radius/outline/shadow/geometry/transition
  // longhands and the text colour/font. Add the control-shape longhands so a tag
  // padding/box regression surfaces.
  styleProps: {
    add: ["box-sizing", "padding-inline-start", "padding-inline-end", "column-gap"],
  },
  // D7 — label + tag text contrast on the resting, selected, and disabled colours,
  // both themes. Rooted at the grid so the label and tag text are both measured.
  contrast: {
    cases: ["default", "selected", "disabled"],
    root: grid,
  },
  // D8 — the tag hit targets (tags + remove buttons) across selection modes; both
  // stacks report identical border-boxes. Rooted at the grid.
  targetSize: {
    cases: ["default", "multiple"],
    root: grid,
  },
};

registerStateMatrixDriver(tagGroupScenario);
registerPixelDriver(tagGroupScenario);
registerContrastDriver(tagGroupScenario);
registerTargetSizeDriver(tagGroupScenario);

/* ── CP9.44b — roving focus + AX + RTL behavior ──────────────────────────────
 *
 * Unlike GridList, TagGroup has NO orientation prop: upstream `useTagGroup`
 * ALWAYS builds `useGridList` with a `ListKeyboardDelegate({orientation:
 * 'horizontal', direction})` and `keyboardNavigationBehavior:'tab'`. So the
 * inline axis (Left/Right) is ALWAYS the primary row axis (ArrowRight=next /
 * ArrowLeft=prev in LTR, flipped under RTL) and the arrow-mode row-owns-Left/Right
 * split that complicated the GridList cert does not apply — one horizontal
 * behavior scenario owns D5/D6/D10.
 *
 * WHAT THIS CERTIFIES — real roving DOM focus on the tag grid (on entry the tag
 * ROW itself becomes `document.activeElement`; roving `tabIndex` rolls; no
 * `aria-activedescendant`), the `role="grid"` subtree roles/names/states incl.
 * the remove button, and the RTL-flipped inline nav.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — `tab-forward` (Tab in from Before → FIRST tag; ArrowRight
 *     NEXT / ArrowLeft PREV; Home/End jump) and `tab-backward` (Shift+Tab in from
 *     After → the entry-direction branch: RAC lands on the LAST tag via
 *     `compareDocumentPosition`, the `createListBox` trampoline's twin). Run on the
 *     `single` case with `allowsRemoving:"false"` so each row has no inner button and
 *     focus lands unambiguously on the ROW.
 *   - D6 (AX tree) — the `role="grid"` subtree across `single`/`multiple`
 *     (`aria-multiselectable`) and a `removable` case that adds the remove buttons
 *     so their role/name and the tag row's own accessible name are pinned.
 *   - D10 (RTL) — re-runs the D5 walk (and a grid-direction style check) under
 *     `ar-AE`; ArrowRight now moves PREVIOUS and ArrowLeft NEXT, matched entry for
 *     entry across both stacks.
 *
 * DRIVERS SCOPED OUT: D1/D3/D7/D8 own the paint above (CP9.44a); D2 (no
 * enter/exit animation), D4 (selection/removal events via the shared
 * interaction-hook family), D9 (forced colors, a paint follow-up) are deferred.
 */

/** The boundary button BEFORE the grid in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });
/** The boundary button AFTER the grid in DOM order (backward Shift+Tab entry). */
const afterButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "After" });

const tagGroupBehaviorScenario: DriverScenario = {
  slug: "taggroup",
  title: "TagGroup (behavior)",
  target: grid,
  states: ["default"],
  cases: [
    // Roving focus + AX with NO remove buttons, so each tag row is a single
    // focus target and the entry-direction walk is unambiguous.
    { id: "single", params: { selectionMode: "single", allowsRemoving: "false" } },
    // Multiple mode — certifies `aria-multiselectable` on the grid (D6).
    { id: "multiple", params: { selectionMode: "multiple", allowsRemoving: "false" } },
    // Removable — adds the `<button aria-label="Remove …">` per tag so D6 pins the
    // remove-button role/name AND the tag row's own accessible name (the row must
    // name from its label "Landscape", NOT fold in the remove button's "Remove").
    { id: "removable", params: { selectionMode: "single", allowsRemoving: "true" } },
  ],
  // D5 — real roving focus, scoped to the grid subtree so the Before/After
  // boundary buttons collapse to the outside-root sentinel.
  focus: {
    cases: ["single"],
    root: grid,
    walks: [
      // Forward: Tab in from Before → trampoline → FIRST tag ("Landscape");
      // ArrowRight moves NEXT and ArrowLeft PREVIOUS (LTR); Home/End jump the ends.
      // Under D10 (ar-AE) this same walk flips — ArrowRight PREVIOUS, ArrowLeft NEXT.
      {
        id: "tab-forward",
        start: beforeButton,
        keys: ["Tab", "ArrowRight", "ArrowRight", "ArrowLeft", "Home", "End"],
      },
      // Backward: Shift+Tab in from After → trampoline detects the relatedTarget
      // FOLLOWS the grid → LAST tag ("Night"), the entry-direction branch.
      {
        id: "tab-backward",
        start: afterButton,
        keys: ["Shift+Tab"],
      },
    ],
  },
  // D6 — the `role="grid"` subtree roles/names/states across selection modes and
  // the removable variant.
  ax: {
    cases: ["single", "multiple", "removable"],
    roots: {
      grid: grid,
    },
  },
};

registerFocusTrailDriver(tagGroupBehaviorScenario);
registerAxTreeDriver(tagGroupBehaviorScenario);
// D10 — re-run the D5 walk (+ a grid-direction style check) under `ar-AE`,
// certifying the RTL-flipped inline-axis navigation.
registerRtlDriver(tagGroupBehaviorScenario, { cases: ["single"] });
