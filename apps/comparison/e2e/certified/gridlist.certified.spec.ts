import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collection): standalone GridList.
 *
 * SCOPING — why the oracle is react-aria-components, not S2. GridList's styled
 * S2 manifestation is `ListView` (a distinct component with its own paint,
 * checkboxes, and slots), certified separately on its own pixel/style surface
 * (`listview.certified.spec.ts`). The BASE GridList — a `role="grid"` of
 * `role="row"`/`role="gridcell"` interactive rows with roving DOM focus — has no
 * separate styled S2 reference; its direct upstream is react-aria-components' own
 * `GridList`/`GridListItem` (the source of the Solid port's `createGridList` +
 * `useSelectableCollection`). Both panels here are the UNSTYLED base layer (RAC
 * `GridList`/`GridListItem` vs our headless `@proyecto-viviana/solidaria-components`
 * `GridList`/`GridListItem`), so the certified surface is STRUCTURE + FOCUS
 * BEHAVIOR + ORIENTATION, not visual paint (paint lives in the ListView cert).
 *
 * WHAT THIS CERTIFIES — the same REAL roving DOM focus model proven for ListBox
 * (`7030e518` / CP9.41), now on the grid collection: on entry the ROW element
 * itself becomes `document.activeElement` (via `createGridList`'s post-commit
 * focus effect looking up `[data-key]`), the roving `tabIndex` rolls, and
 * `aria-activedescendant` is never emitted. PLUS the two things ListBox lacks:
 *   1. Grid semantics — `role="grid"`/`row`/`gridcell`, `aria-multiselectable`
 *      in multiple mode (D6).
 *   2. ORIENTATION-AWARE navigation — the inline axis (Left/Right). Its ownership
 *      is split, faithfully mirroring RAC. Under the DEFAULT `arrow` navigation
 *      the ROW owns Left/Right (createGridListItem's onKeyDownCapture = intra-row
 *      focus, a no-op for text-only rows), so the container does NOT step between
 *      rows — matching useGridListItem. Only under `keyboardNavigationBehavior:
 *      "tab"` does the row stop intercepting and the event reach the collection
 *      (useSelectableCollection → ListKeyboardDelegate), where a HORIZONTAL stack
 *      promotes Left/Right to the primary row axis (Right=next / Left=prev in LTR,
 *      flipped under RTL). The horizontal scenario runs in `tab` mode precisely so
 *      the D5/D10 walks exercise that real orientation-aware ROW nav, rather than
 *      the inert (row-owned) arrow-mode axis. The browser driver CAUGHT the port
 *      inverting this: `createGridList` had invented an `arrow`-mode container
 *      Left/Right branch that RAC lacks (RAC leaves the axis to the row), so the
 *      port moved rows on Left/Right where RAC stayed put; gating the container
 *      branch to `tab` mode restores parity.
 *
 * jsdom can only observe the proxy (`data-key` roving tabindex + no
 * activedescendant); the REAL `document.activeElement` move to the row and the
 * RTL arrow flip are browser-only, so these e2e trails are the artifact that pins
 * the behavior against the RAC oracle — entry for entry.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux, on both orientations. Vertical: `tab-forward`
 *     (Tab in → trampoline → FIRST row; ArrowDown/Up rove; Home/End jump) and
 *     `tab-backward` (Shift+Tab in from below → trampoline → LAST row, the
 *     `compareDocumentPosition` entry-direction branch — the ListBox fix's twin).
 *     Horizontal (`tab` navigation): `tab-forward` with ArrowRight/ArrowLeft
 *     stepping between rows as the primary axis.
 *   - D6 (AX tree) — the `role="grid"` subtree roles/names/states (incl.
 *     `aria-selected`, `aria-multiselectable`), pair-diffed.
 *   - D10 (RTL) — re-runs the horizontal (`tab`-mode) D5 walk under `ar-AE` so
 *     ArrowRight now moves PREVIOUS and ArrowLeft NEXT; certifies both stacks flip
 *     identically.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — no
 *     styled S2 oracle at this base layer; both panels are unstyled, so paint /
 *     hit-area pair-diffs would compare two near-empty base surfaces. All four
 *     live in the ListView cert (`listview.certified.spec.ts`), whose styled S2
 *     ListView is the real paint oracle for this component family.
 *   - D2 (motion) / D4 (events) — the base grid has no enter/exit animation, and
 *     its selection/typeahead event model is certified through its styled host
 *     (ListView) and the shared interaction-hook family, per the hook-family rule.
 *   - D9 (forced colors) — a paint concern, deferred with the ListView styled cert.
 *
 * FIXTURE (`gridlist-demo.ts`) — a `Before` button, a `role="grid"` labelled
 * "Permissions" with three rows (Read / Write / Admin), and an `After` button.
 * `selectionMode`, `orientation`, and `keyboardNavigationBehavior` are prop-driven;
 * the boundary buttons let the walk cross the grid's tab-boundary in both
 * directions so the trampoline's entry-direction logic is exercised faithfully.
 */

/** The inline `role="grid"` in THIS panel's canvas (a standalone GridList
 *  renders in place, not portaled), resolved by its accessible name. */
const grid: TargetResolver = ({ canvas }) => canvas.getByRole("grid", { name: "Permissions" });

/** The boundary button BEFORE the grid in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/** The boundary button AFTER the grid in DOM order (backward Shift+Tab entry). */
const afterButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "After" });

/**
 * Vertical scenario — the default stack. Certifies real roving focus in both
 * trampoline directions (D5) and grid semantics incl. `aria-multiselectable`
 * (D6, both selection modes).
 */
const verticalScenario: DriverScenario = {
  slug: "gridlist",
  title: "GridList",
  target: grid,
  states: ["default"],
  cases: [
    { id: "single", params: { selectionMode: "single", orientation: "vertical" } },
    { id: "multiple", params: { selectionMode: "multiple", orientation: "vertical" } },
  ],
  // D5 — real-roving-focus certification, scoped to the `role="grid"` subtree so
  // the Before/After boundary buttons collapse to the outside-root sentinel.
  focus: {
    cases: ["single"],
    root: grid,
    walks: [
      // Forward: Tab in from the preceding button → trampoline → FIRST row
      // ("read"); ArrowDown/Up rove and Home/End jump the ends.
      {
        id: "tab-forward",
        start: beforeButton,
        keys: ["Tab", "ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"],
      },
      // Backward: Shift+Tab in from the following button → trampoline detects the
      // relatedTarget FOLLOWS the grid → LAST row ("admin").
      {
        id: "tab-backward",
        start: afterButton,
        keys: ["Shift+Tab"],
      },
    ],
  },
  // D6 — the `role="grid"` subtree roles/names/states in both selection modes.
  ax: {
    cases: ["single", "multiple"],
    roots: {
      grid: grid,
    },
  },
};

/**
 * Horizontal scenario — orientation promotes the inline axis to the primary ROW
 * axis, but only under `tab` navigation (under `arrow` the row owns Left/Right, so
 * they would be a no-op). This case therefore runs in `keyboardNavigationBehavior:
 * "tab"` so the D5 walk exercises real ArrowRight/ArrowLeft row navigation and D10
 * its RTL flip. Same slug/route as the vertical scenario; the fixture reads
 * `orientation` + `keyboardNavigationBehavior` from the case params.
 */
const horizontalScenario: DriverScenario = {
  slug: "gridlist",
  title: "GridList (horizontal)",
  target: grid,
  states: ["default"],
  cases: [
    {
      id: "horizontal",
      params: {
        selectionMode: "single",
        orientation: "horizontal",
        keyboardNavigationBehavior: "tab",
      },
    },
  ],
  focus: {
    cases: ["horizontal"],
    root: grid,
    walks: [
      // Forward: Tab in → FIRST row ("read"); ArrowRight moves NEXT and ArrowLeft
      // PREVIOUS (LTR); Home/End jump the ends. Under D10 (ar-AE) this same walk
      // flips — ArrowRight PREVIOUS, ArrowLeft NEXT — and must match entry for
      // entry across both stacks.
      {
        id: "tab-forward",
        start: beforeButton,
        keys: ["Tab", "ArrowRight", "ArrowRight", "ArrowLeft", "Home", "End"],
      },
    ],
  },
  ax: {
    cases: ["horizontal"],
    roots: {
      grid: grid,
    },
  },
};

registerFocusTrailDriver(verticalScenario);
registerAxTreeDriver(verticalScenario);

registerFocusTrailDriver(horizontalScenario);
registerAxTreeDriver(horizontalScenario);
// D10 — re-run the horizontal D5 walk (and a default-state RTL style check)
// under `ar-AE`, certifying the RTL-flipped Left/Right navigation.
registerRtlDriver(horizontalScenario, { cases: ["horizontal"] });
