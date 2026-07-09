import { registerAxTreeDriver } from "../drivers/ax";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collections): TableView — the 2D data
 * grid. This cert certifies the D6 ACCESSIBILITY-TREE contract (roles, names,
 * states, and `aria-describedby` descriptions) of `@proyecto-viviana/solid-spectrum`
 * TableView against the `@react-spectrum/s2` `TableView` oracle. Both render the
 * "Project documents" grid (Name[rowheader] / Type / Owner / Status columns,
 * three document rows), prop-driven via `tableview-demo.ts` URL params.
 *
 * WHY D6 ONLY (the paint + focus-trail dimensions are deliberately scoped out):
 * S2's `TableView` is *always* virtualized — it wraps its collection in a
 * `Virtualizer` + `S2TableLayout` (react-spectrum/…/s2/src/TableView.tsx:97,336),
 * and RAC's `Table` renders a `<div role="grid">` tree (absolutely-positioned
 * rows/cells, `display: grid`/`flex`) whenever `isVirtualized` is set
 * (react-aria-components/src/Table.tsx:670-675). Our port instead renders a
 * SEMANTIC NATIVE `<table>`/`<thead>`/`<tbody>`/`<tr>`/`<th>`/`<td>` tree with a
 * SPACER-BASED virtualizer (our Virtualizer windows by slice + spacer rows on a
 * 1D scroll axis, not a 2D `visibleRect` of absolutely-positioned tiles — the
 * deliberate, project-established design recorded in the `virtualizer-decomposition`
 * note). That is faithful to RAC's *non-virtualized* `<table>` default and is the
 * more semantic DOM, but it makes the two stacks structurally incomparable at:
 *
 *   - D1 state-matrix / D7 contrast — cell/row computed `display` is
 *     `table-cell`/`table-row` here vs `flex`/`grid` in S2 (an exact-string diff
 *     that can never be waived), plus native-table border/column-width layout.
 *   - D3 pixel — the native table lays out columns via table-layout, not S2's
 *     grid-template tiles; sub-structures raster differently.
 *   - D5 focus trail / D10 RTL focus trail — the D5 oracle descriptor is
 *     `{tag, role, name, tabindex}` (dom-oracle.ts): the ROLE/NAME/tabindex order
 *     matches, but every `tag` differs (`table`/`tr`/`td`/`th` here vs `div`
 *     there), which the strict trail equality cannot reconcile.
 *   - D8 target size — derived from the same divergent box model.
 *
 * These are not port bugs; they are the downstream shadow of one deliberate
 * architecture choice (native `<table>` + spacer virtualizer). Reaching S2 paint
 * parity would require reversing that foundation to adopt RAC's absolutely-
 * positioned `Virtualizer`/`TableLayout` — tracked as tech-debt
 * `tableview-div-grid-paint`, out of scope for this recertification unit. (A
 * future BEHAVIOR cert could instead pair-diff against RAC's *non-virtualized*
 * `Table`, whose native-`<table>` DOM matches this port tag-for-tag, restoring
 * D5/D10; that wants new RAC-Table comparison fixtures and is deferred.)
 *
 * The D6 AX tree IS structure-agnostic — it compares the accessibility tree
 * (`role` / accessible name / state / description), never the tag or box model —
 * so it is the one dimension that meaningfully pair-diffs a native-`<table>`
 * port against S2's div-grid. It is also where the real port contract lives:
 * this driver caught and drove four faithful fixes this unit — the grid's sort
 * live-region `aria-describedby` (was frozen by a destructured `gridProps`
 * snapshot), the column-header "sortable column" description, the
 * selection-checkbox `aria-labelledby` (own "Select" text + row header), and the
 * disabled-row selection checkbox (now `visibility: hidden` → pruned from the AX
 * tree, mirroring S2's `selectionCheckbox` style).
 */

/** The TableView grid in THIS panel's canvas, resolved by role+name (stable
 *  across selection/sort/quiet). */
const grid: TargetResolver = ({ canvas }) =>
  canvas.getByRole("grid", { name: "Project documents" });

/**
 * BEHAVIOR scenario — the D6 AX tree across selection modes, the sorted case
 * (`aria-sort` + sort description on the Name column header), and the disabled
 * case (the pruned selection checkbox). `target`/`states` exist only to satisfy
 * the shared `DriverScenario` shape; the AX driver reads `ax` below.
 */
const behaviorScenario: DriverScenario = {
  slug: "tableview",
  title: "TableView",
  target: grid,
  states: ["default"],
  cases: [
    {
      id: "default",
      params: {
        selectionMode: "multiple",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "project-brief",
      },
    },
    {
      id: "single",
      params: {
        selectionMode: "single",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "project-brief",
      },
    },
    {
      id: "sorted",
      params: {
        selectionMode: "multiple",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "project-brief",
        sortColumn: "name",
        sortDirection: "ascending",
      },
    },
    { id: "none", params: { selectionMode: "none" } },
    {
      id: "disabled",
      params: {
        selectionMode: "multiple",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "project-brief",
        disabledItem: "quarterly-report",
      },
    },
  ],
  // D6 — the grid subtree roles/names/states across selection modes, the sorted
  // case (`aria-sort` on the Name column header), and the disabled case.
  ax: {
    cases: ["default", "single", "sorted", "none", "disabled"],
    roots: {
      grid,
    },
    knownDivergences: {
      // The grid's sort live-region description ("sorted by column <name> in
      // <direction> order") reads the sorted column's `textValue` in both ports
      // (faithful to react-aria's `useTable`). They diverge on what that
      // `textValue` is: this data-driven TableView carries a real column
      // `textValue` (from the `name` field of its `columns` prop — "Name"),
      // while S2's JSX-driven `Column` passes a *render-function* child to
      // `RACColumn` and no explicit `textValue`, so RAC cannot derive one and
      // the node's `textValue` is empty (S2 TableView.tsx:777-808). The S2
      // oracle therefore announces "sorted by column  in ascending order"
      // (empty name) whereas our announcement is richer ("…column Name…"). This
      // is a data-model divergence, not a port bug — our column legitimately has
      // a name — so the sorted AX case is a documented known divergence.
      sorted:
        "grid sort-description columnName differs: data-driven TableView carries a real column textValue ('Name') while S2's JSX render-prop Column child erases it (empty name in the S2 oracle). Our announcement is richer but diverges from the S2 oracle.",
    },
  },
};

registerAxTreeDriver(behaviorScenario);
