import { registerContrastDriver } from "../drivers/contrast";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";

/**
 * Recertification march unit (Tier 4, collections — the STYLED sibling of the
 * GridList base cert, CP9.42): ListView. Unlike the standalone ListBox — which
 * S2 leaves as an unstyled RAC passthrough — S2 ships a real, publicly-styled
 * `ListView` (its `gridlist` style macro), so this unit has a genuine S2 paint
 * oracle and an existing comparison surface. The React panel renders
 * `@react-spectrum/s2` `ListView`/`ListViewItem`; the Solid panel renders
 * `@proyecto-viviana/solid-spectrum` `ListView`/`ListViewItem` (its port of the
 * same S2 macro). Both are the "Documents" grid.
 *
 * ORACLE + DRIVER SCOPING (documented, not silent). ListView's ROVING FOCUS and
 * AX STRUCTURE (role=grid/row/gridcell, selection semantics, orientation-aware
 * keyboard nav) are the base RAC/GridList contract and were certified one layer
 * down in the GridList base cert (CP9.42 — RAC-oracle D5 focus trail + D6 AX
 * tree, plus a horizontal `tab`-nav walk and a D10 RTL pass). ListView is that
 * same base layer with the S2 style macro painted on top, so the NEW surface
 * here is PAINT: the row treatment (selection fill, quiet vs bordered list,
 * disabled dim, checkbox vs highlight selection style), the grid container, and
 * the label/description text slots. This cert therefore registers the four
 * paint drivers — D1 (state-matrix computed styles), D3 (strict pixel), D7
 * (contrast), D8 (target size) — and does NOT re-register D5/D6 (base layer) or
 * D10 (the ListView fixture threads no `?locale`; the D10 ask was scoped to
 * GridList's orientation nav). D2 motion: ListView has no enter/mount animation
 * (only the `transition` longhands that D1 already pins).
 *
 * D1 TARGET = the first ROW (`role=row`). It carries the row-level wrapper style
 * (grid placement, cursor, the `transition` longhands) and its render-prop
 * conditions (`isSelected`/`isDisabled`/`isQuiet`) key the whole row treatment.
 * The visible SELECTION FILL is painted by an absolutely-positioned aria-hidden
 * layer `<div>` inside the row (`listViewRowBackground`, mirroring S2), so the
 * row's own computed `background-color` is transparent on both stacks — the fill
 * itself is certified by the D3 pixel diff of the whole grid (which rasterizes
 * the layer, the checkbox, and the list borders together), not by a D1 property
 * on the row. Parts diffed alongside the row: the `grid` container (its
 * border/background/radius, which is where `isQuiet` actually shows — a quiet
 * list drops the border+radius), and the `label`/`description` text slots
 * (color + font, keyed on selection/disabled). Locating the two text slots by
 * their rendered content (`getByText`) keeps the locator stack-neutral (the port
 * tags them `data-rsp-slot`, S2 does not necessarily).
 *
 * SCOPE — D1/D3 run at `states: ["default"]` (the param-driven rest matrix). A
 * ListView row is itself a selectable target, so driving the `pressed` gesture
 * on it would TOGGLE selection mid-capture and desync the two panels; and the
 * only gesture-driven row paint is the hover tint and the focus ring
 * (`focusRing()`, an aria-hidden layer keyed on `isFocusVisible`), both
 * byte-identical S2 style objects whose FOCUS BEHAVIOR is already pinned by the
 * base GridList D5. The styling that actually varies — selected / multiple /
 * highlight / quiet / disabled — is prop-driven (URL params) and captured in
 * full at rest across the case matrix below, which is where a port
 * condition-threading bug surfaces.
 *
 * Selection is pinned per case via the controlled `selectedKeys` param so the
 * first row is a known, stable state (RAC/S2 both apply the identical
 * `selectedKeys`): `default` leaves the first row UNSELECTED (a sibling row is
 * selected so the checkbox column still renders), the rest select or disable it.
 */

const grid: TargetResolver = ({ canvas }) => canvas.getByRole("grid", { name: "Documents" });
/** The first row (`role=row`) — the D1/D3 row target. */
const firstRow: TargetResolver = (ctx) => grid(ctx).getByRole("row").first();
/** The first row's label text slot (`<Text slot="label">` → span). */
const firstRowLabel: TargetResolver = ({ canvas }) =>
  canvas.getByText("Project brief.pdf", { exact: true });
/** The first row's description text slot (`<Text slot="description">` → span). */
const firstRowDescription: TargetResolver = ({ canvas }) =>
  canvas.getByText("PDF document", { exact: true });

/** Controlled-selection params that fix the first row's state. */
const controlled = (selectedKeys: string, extra: Record<string, string> = {}) => ({
  selectionMode: "multiple",
  selectionStyle: "checkbox",
  selectionSource: "selectedKeys",
  selectedKeys,
  ...extra,
});

/**
 * D3 waiver — ticket #66 tracks the checkbox-column sub-pixel AA. The bordered
 * checkbox cases leave a ≤5/255
 * anti-aliasing residual (≤26/136320 px, ~1.9e-4) confined to the selection checkbox
 * column (x≈45-60): the port renders ListView rows as DIRECT grid children, whereas S2
 * wraps every row in an absolutely-positioned `<Virtualizer layout={S2ListLayout}>`
 * presentation div. The absolute row-wrapper snaps the checkbox box + checkmark glyph to
 * a slightly different sub-pixel phase than the port's flow-positioned row, so their
 * edges rasterize with a 1-5/255 rounding delta — a measurement-layer artifact, not a
 * paint divergence: D1 pins every computed style byte-identical, and the `quiet` (no grid
 * border to shift the column) and `highlight` (no checkbox column at all) cases stay
 * byte-EXACT at zero tolerance below. Closing this to byte-exact means porting the
 * S2ListLayout/Virtualizer row-windowing (a multi-day structural port, out of a paint
 * cert's scope). Ceiling 5e-4 is ~2.6x the worst observed and stays TIGHTER than the
 * house glyphSubpixel precedents (contextualhelp 1.5e-3, toast 2e-3, tooltip 3e-3); a
 * real regression (wrong glyph size/colour, missing fill) is 100s-10,000s of px and
 * still trips it.
 */
const checkboxColumnSubpixel = {
  maxMismatchRatio: 0.0005,
  maxDimensionDelta: 0,
  pixelThreshold: 0,
};

const listViewScenario: DriverScenario = {
  slug: "listview",
  title: "ListView",
  target: firstRow,
  parts: {
    // The grid container — border/background/radius; where `isQuiet` shows.
    grid,
    // Text slots — color + font, keyed on selection/disabled.
    label: firstRowLabel,
    description: firstRowDescription,
  },
  // D3 pixels the whole grid so the selection-fill layer, the checkbox, and the
  // list separators are rasterized together (the row-level D1 target cannot see
  // the aria-hidden fill layer's colour, but the grid crop does).
  pixelTarget: grid,
  cases: [
    // First row UNSELECTED (a sibling is selected so the checkbox column renders).
    { id: "default", params: controlled("budget") },
    // First row SELECTED — checkbox checked + selection fill.
    { id: "selected", params: controlled("project-brief") },
    // Two rows selected (first among them) — multi-select fill continuity.
    { id: "multiple", params: controlled("project-brief,quarterly-report") },
    // Highlight selection style — the fill moves to the row highlight treatment,
    // no persistent checkbox column.
    {
      id: "highlight",
      params: controlled("project-brief", { selectionStyle: "highlight" }),
    },
    // Quiet list — the grid drops its border + radius; first row unselected.
    { id: "quiet", params: controlled("budget", { isQuiet: "true" }) },
    // First row disabled — the row dims and drops its hit/selection affordance.
    { id: "disabled", params: controlled("budget", { disabledItem: "project-brief" }) },
  ],
  // D3 waiver: the checkbox-column sub-pixel AA (see `checkboxColumnSubpixel`), scoped
  // ONLY to the four cases that render a bordered grid WITH a checkbox column. The
  // `highlight` case (no checkbox column) and `quiet` case (no grid border to shift the
  // column) are byte-EXACT and stay at strict zero tolerance — a regression there is
  // still caught.
  pixel: {
    waivers: (["default", "selected", "multiple", "disabled"] as const).map((caseId) => ({
      caseId,
      state: "*" as const,
      theme: "*" as const,
      threshold: checkboxColumnSubpixel,
      reason:
        "listview-virtualizer-subpixel: port rows are direct grid children (no S2ListLayout/Virtualizer row-wrapper), so the checkbox column rasterizes at a ≤5/255 sub-pixel AA phase vs S2's absolutely-positioned rows",
    })),
  },
  // See the scope note: a row is a selectable target, so only the prop-driven
  // rest matrix is style/pixel-captured (no gesture states).
  states: ["default"],
  // Default allowlist covers the row/grid fill/border/radius/outline/shadow/
  // geometry/transition longhands and the text color/font. Add the grid
  // placement so a row-template regression surfaces.
  styleProps: {
    add: ["box-sizing", "grid-template-columns", "grid-column-start", "grid-column-end"],
  },
  // D7: the label + description contrast on the resting, selected, and disabled
  // row colours, both themes. Rooted at the grid so both text slots are measured.
  contrast: {
    cases: ["default", "selected", "disabled"],
    root: grid,
  },
  // D8: the ListView hit targets (rows + selection checkboxes) across selection
  // modes; both stacks report the identical border-boxes (a shared under-floor
  // size is an upstream note, the pair diff is the hard gate). Rooted at the grid.
  targetSize: {
    cases: ["default", "multiple"],
    root: grid,
  },
};

registerStateMatrixDriver(listViewScenario);
registerPixelDriver(listViewScenario);
registerContrastDriver(listViewScenario);
registerTargetSizeDriver(listViewScenario);
