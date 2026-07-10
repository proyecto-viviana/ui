import { registerScrollWindowDriver } from "../drivers/scroll-window";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";
import {
  virtualizerItemCount,
  virtualizerRowHeight,
  virtualizerViewportHeight,
} from "@comparison/data/virtualizer-demo";

/**
 * Recertification march unit (Tier 4, collection): Virtualizer, certified
 * through its ListBox host.
 *
 * SCOPING — why the oracle is react-aria-components, and why "scroll-window
 * behavior" not "DOM windowing". React Spectrum S2 keeps its Virtualizer
 * PRIVATE (no public styled export), so there is no S2 reference to pixel/style
 * diff against. The correct oracle is RAC's OWN `Virtualizer` + `ListLayout`
 * wrapping a base `ListBox` — the direct upstream of our Solid
 * `@proyecto-viviana/solidaria-components` `Virtualizer` + `ListLayout`. Both
 * panels are the UNSTYLED base layer, so the certified surface is virtualization
 * BEHAVIOR, not visual paint.
 *
 * The two ports diverge BY DESIGN in HOW they window (an architectural
 * React→Solid decomposition difference, not a defect): RAC positions rows via
 * absolute layout rects inside a single full-height scroller, while our port
 * slices the collection and pads the scroll extent with top/bottom spacer divs.
 * So the windowed DOM STRUCTURE is intentionally different and is NOT
 * certifiable. What IS certifiable — and is what a user and a screen reader
 * actually observe — is the scroll-window behavior, which the D-scroll driver
 * pins against the RAC oracle:
 *
 *   1. VISIBLE KEY-SET — the options strictly visible at each scroll offset.
 *      Geometry-determined (scrollTop × viewport height × row height, all pinned
 *      identical across the two stacks via the shared `virtualizer-demo`
 *      constants + a forced per-row height), hence overscan-buffer-independent.
 *   2. WINDOWED AX — each visible option's `aria-posinset`/`aria-setsize`
 *      (reflecting the FULL 60-item collection, the positional info a screen
 *      reader needs precisely because the DOM is windowed) + `aria-selected`.
 *   3. SCROLL EXTENT — `scrollHeight` = itemCount × rowHeight in both stacks.
 *   4. FOCUS SURVIVAL — a focused row keeps DOM focus after being scrolled out of
 *      the window and back (both stacks persist the focused key via their
 *      DnD/focus persistence set, so the recycled row stays rendered off-screen).
 *
 * The separate invariant that virtualization actually happened (rendered option
 * count < full itemCount) is asserted PER STACK inside the driver, not
 * cross-diffed, because the overscan buffer legitimately differs by design.
 *
 * DRIVERS REGISTERED:
 *   - D-scroll (scroll-window) — items 1–4 above. Offsets are row-height
 *     multiples so every in-window row is fully visible (no partial-row
 *     ambiguity between the absolute-rect and spacer-slice renderers).
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D6 (whole-subtree AX snapshot) — a full `ariaSnapshot` of the listbox would
 *     capture each stack's overscan rows, which differ by design, so it would
 *     compare unequal DOM windows. The windowed AX that IS certifiable (per
 *     visible option's posinset/setsize/selected) is captured by the D-scroll
 *     driver instead. The base ListBox roles/names/roving focus are already
 *     certified un-virtualized in the ListBox unit (CP9.41).
 *   - D1/D3/D7/D8 (paint) — no styled S2 oracle; both panels are the unstyled
 *     base layer (same rationale as the ListBox unit).
 *   - D2 (motion) / D4 (events) — the Virtualizer has no enter/exit animation and
 *     no selection/typeahead model of its own; those are certified through the
 *     collection hosts.
 *   - HORIZONTAL orientation — this unit certifies the vertical scroll axis (the
 *     canonical host geometry); the horizontal axis is a follow-up.
 *
 * FIXTURE (`virtualizer-demo.ts`) — a `Before` button, a `role="listbox"`
 * labelled "Files" virtualizing 60 fixed rows (`Item 0`…`Item 59`) inside a
 * fixed-height scroller (viewport 240px, row 40px → 2400px content, 6 rows
 * visible), and an `After` button. The React panel wires RAC
 * `Virtualizer`+`ListLayout({rowSize})`; the Solid panel wires our
 * `Virtualizer`+`ListLayout({itemSize})` — same viewport + content extent so the
 * strictly-visible window is geometry-identical across stacks.
 */

/** The inline virtualized `role="listbox"` in this panel's canvas. */
const listbox: TargetResolver = ({ canvas }) => canvas.getByRole("listbox", { name: "Files" });

// Content = itemCount × rowHeight; max scrollTop = content − viewport. Offsets are
// row-height multiples (and the last is the exact bottom) so each captured window
// holds fully-visible rows with no partial-row edge ambiguity.
const maxScroll = virtualizerItemCount * virtualizerRowHeight - virtualizerViewportHeight;
const offsets = [0, 20 * virtualizerRowHeight, 40 * virtualizerRowHeight, maxScroll];

const scenario: DriverScenario = {
  slug: "virtualizer",
  title: "Virtualizer",
  target: listbox,
  states: ["default"],
  cases: [{ id: "single", params: { selectionMode: "single" } }],
};

registerScrollWindowDriver(scenario, {
  cases: ["single"],
  offsets,
  itemCount: virtualizerItemCount,
});
