import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collections): TreeView — the expandable
 * `role="treegrid"` collection. This cert pins the D5 REAL-ROVING-FOCUS spine and
 * the D6 ACCESSIBILITY-TREE contract of `@proyecto-viviana/solid-spectrum`
 * `TreeView` against the `@react-spectrum/s2` `TreeView` oracle. Both render the
 * "Files" treegrid (Documents ▸ Project ▸ Weekly Report / Budget, Client Notes;
 * Photos; Archive) with `documents`/`project` expanded by default, prop-driven via
 * `treeview-demo.ts` URL params.
 *
 * WHY D5 IS CERTIFIABLE HERE (unlike its sibling TableView) — the tag test.
 * TableView was certified on D6 ALONE because our port renders a SEMANTIC NATIVE
 * `<table>`/`<tr>`/`<td>` tree while S2 renders a `<div role="grid">`; the D5
 * focus-trail descriptor pins `tag`, and `table`/`tr`/`td` ≠ `div` can never
 * reconcile (tech-debt `tableview-div-grid-paint`). TreeView has NO such split:
 * S2's `TreeView` and our port BOTH build on react-aria-components' `Tree`, which
 * emits a `<div role="treegrid">` → `<div role="row">` → `<div role="gridcell">`
 * subtree on both stacks (RAC `Tree.tsx` + `@react-aria/tree` `useTree`/
 * `useTreeItem`; our `createTree.ts:291` / `createTreeItem.ts:158,195`). Tags,
 * roles, and the roving model all match, so the D5 trail — the ROW element itself
 * becoming `document.activeElement`, the roving `tabIndex` rolling, and NO
 * `aria-activedescendant` — pair-diffs entry-for-entry. This is the same
 * browser-only roving-focus certification proven for ListBox (`7030e518`) and
 * GridList, now on the tree collection: jsdom sees only the `data-key` roving
 * proxy; the real `activeElement` move to the row is observable in Chromium alone.
 *
 * WHY PAINT (D1/D3/D7/D8) IS SCOPED OUT — the virtualization geometry split.
 * S2's `TreeView` is ALWAYS virtualized: it wraps its collection in a
 * `Virtualizer` + `S2ListLayout` (absolutely-positioned rows on a 2D `visibleRect`),
 * whereas our port renders the tree in natural document flow (the semantic default,
 * faithful to RAC's non-virtualized `Tree`). That makes the two DOMs structurally
 * incomparable at every pixel/geometry dimension — computed `position`/`transform`,
 * row box model, and hit-area all derive from the divergent layout foundation, an
 * exact-string diff that can never be waived — exactly as for TableView. Reaching
 * S2 paint parity would mean reversing the foundation to adopt the absolutely-
 * positioned `Virtualizer`; tracked as tech-debt `treeview-div-grid-paint`. Crucially
 * the AX tree AND the focus trail are BOTH structure-of-layout-agnostic (they read
 * role/name/state and the `activeElement` chain, never `position`/`transform`), so a
 * naturally-flowed treegrid still pair-diffs faithfully against S2's virtualized one
 * on D5 + D6.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 / D3 / D7 / D8 (paint) — the virtualization geometry split above.
 *   - D10 (RTL) — the meaningful TreeView RTL surface is the ArrowLeft/ArrowRight
 *     EXPAND/COLLAPSE flip, which mutates the row set mid-walk and is sensitive to
 *     the S2 `Virtualizer`'s async re-layout; certifying it wants locale plumbing on
 *     both fixtures plus an expand/collapse walk, deferred as a follow-up. Vertical
 *     roving (this cert's walk) is DOM-order-stable and does not flip under RTL.
 *   - D2 (motion) / D4 (events) — no enter/exit animation; the selection/expansion
 *     event model is certified through the shared interaction-hook family.
 *   - D9 (forced colors) — a paint concern, deferred with the paint dimensions.
 *
 * FIXTURE (`treeview-demo.ts`) — a `Before` button, the `role="treegrid"` labelled
 * "Files", and an `After` button. The boundary buttons let the D5 walk cross the
 * treegrid's tab-boundary in both directions so the trampoline's entry-direction
 * logic is exercised faithfully (forward Tab → first row; backward Shift+Tab → the
 * `compareDocumentPosition` last-row branch).
 */

/** The `role="treegrid"` in THIS panel's canvas, resolved by its accessible name
 *  (stable across selection mode / expansion). */
const tree: TargetResolver = ({ canvas }) => canvas.getByRole("treegrid", { name: "Files" });

/** The boundary button BEFORE the tree in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/** The boundary button AFTER the tree in DOM order (backward Shift+Tab entry). */
const afterButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "After" });

/**
 * TreeView scenario — D5 real-roving-focus across the tree's tab-boundary in both
 * directions, and D6 the `role="treegrid"` subtree (roles / names / `aria-level` /
 * `aria-expanded` / `aria-selected` / `aria-disabled`) across selection modes, the
 * highlight style, the no-selection mode, and a disabled row.
 */
const scenario: DriverScenario = {
  slug: "treeview",
  title: "TreeView",
  target: tree,
  states: ["default"],
  cases: [
    {
      id: "default",
      params: {
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "weekly-report",
      },
    },
    {
      id: "single",
      params: {
        selectionMode: "single",
        selectionStyle: "checkbox",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "weekly-report",
      },
    },
    {
      id: "highlight",
      params: {
        selectionMode: "multiple",
        selectionStyle: "highlight",
        selectionSource: "defaultSelectedKeys",
        defaultSelectedKeys: "weekly-report",
      },
    },
    { id: "none", params: { selectionMode: "none" } },
    {
      id: "disabled",
      params: {
        selectionMode: "multiple",
        selectionStyle: "checkbox",
        disabledItem: "project",
      },
    },
  ],
  // D5 — real-roving-focus, scoped to the `role="treegrid"` subtree so the
  // Before/After boundary buttons collapse to the outside-root sentinel. Run on
  // the default (multiple/checkbox) case; roving order is selection-mode-independent.
  focus: {
    cases: ["default"],
    root: tree,
    walks: [
      // Forward: Tab in from the preceding button → trampoline → FIRST row
      // ("Documents"); ArrowDown steps into the expanded children ("Project",
      // "Weekly Report"), ArrowUp roves back, Home/End jump the visible ends.
      {
        id: "tab-forward",
        start: beforeButton,
        keys: ["Tab", "ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"],
      },
      // Backward: Shift+Tab in from the following button → trampoline detects the
      // relatedTarget FOLLOWS the tree → LAST visible row ("Archive").
      {
        id: "tab-backward",
        start: afterButton,
        keys: ["Shift+Tab"],
      },
    ],
  },
  // D6 — the `role="treegrid"` subtree roles/names/states across selection modes,
  // the highlight style, no-selection, and a disabled row.
  ax: {
    cases: ["default", "single", "highlight", "none", "disabled"],
    roots: {
      tree,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
