import { registerAxTreeDriver } from "../drivers/ax";
import { registerReorderDriver } from "../drivers/reorder";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collection host): keyboard drag-and-drop,
 * certified on a reorderable ListBox.
 *
 * SCOPING — why DnD is certified through the ListBox host, and why the oracle is
 * react-aria-components. Drag-and-drop is not a component with an ARIA contract
 * of its own; it is a behavior a collection host mounts (like the Virtualizer's
 * scroll-window, CP9.56). React Spectrum S2 ships no styled drag-and-drop
 * ListBox, so the oracle is RAC's OWN `useDragAndDrop` + `useListData`
 * reorderable ListBox (`react-aria-components@1.19.0`, pinned) — the direct
 * upstream of the Solid port's faithful `DragManager.ts` keyboard subsystem and
 * `createDroppableCollection` engine. Both panels are the unstyled base layer
 * (RAC `ListBox`/`ListBoxItem` + `useDragAndDrop` vs headless
 * `solidaria-components` `ListBox` + `useDragAndDrop`), so the certified surface
 * is BEHAVIOR + STRUCTURE, not visual paint.
 *
 * WHAT THIS CERTIFIES — the keyboard-DnD model. A keyboard drag is: focus a
 * draggable option (real roving focus, inherited from the ListBox cert) → Enter
 * picks it up (`createDraggableItem` onKeyUp → `beginDragging`, handing control
 * to the `DragManager` document-level keyboard session) → Arrow keys walk the
 * before/on/after drop positions of the collection (routed through the current
 * drop target's `onKeyDown` → the ported `navigate()`), the drop target moving
 * focus as it goes → Enter drops (`onReorder` → `moveBefore`/`moveAfter`) or
 * Escape cancels (order restored). The two stacks' DnD MACHINERY diverges by
 * design (framework-agnostic singleton on both, but different reactivity), so the
 * cert pins the two observable projections a user and a screen reader perceive:
 * the keyboard-drag focus trail, and the resulting item order (published on the
 * listbox root as `data-comparison-order`). Pointer drag is DEFERRED — native
 * HTML5 drag-and-drop cannot be driven by Playwright — and is tracked separately.
 *
 * DRIVERS REGISTERED:
 *   - D-reorder (keyboard DnD) — the crux. Two walks, each entered by keyboard
 *     (Tab from the Before button → first option):
 *       · `reorder-down` — Enter (pick up "Read") → ArrowDown ×2 (walk drop
 *         positions) → Enter (drop). The `active` (drop-target) trail AND the
 *         resulting order are pair-diffed after every key.
 *       · `cancel` — Enter (pick up) → ArrowDown → Escape (cancel). Certifies the
 *         cancel path leaves the order untouched and returns focus, on both stacks.
 *   - D6 (AX tree) — the resting `role="listbox"` subtree: roles/names/states AND
 *     the drag-affordance descriptions (`aria-describedby` → "press Enter to
 *     drag"), pair-diffed vs RAC so the accessible drag instructions match.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - Pointer drag (native HTML5 DnD) — undrivable by Playwright's synthetic
 *     input; deferred as a separate follow-up.
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — no
 *     styled S2 oracle; both panels are the unstyled base layer, so paint/hit-area
 *     pair-diffs would compare two near-empty base surfaces (same rationale as the
 *     standalone ListBox cert). The host ListBox's own roving focus/paint is
 *     certified at CP9.41.
 *   - D9 (forced colors) / D10 (RTL) — the drop-position walk is DOM-order based
 *     (not visual), so RTL reorder is order-stable; deferred with the paint pass.
 *   - D2 (motion) — the drag has no enter/exit animation of its own.
 *
 * FIXTURE (`dnd-listbox-demo.ts`) — a `Before` button, a reorderable
 * `role="listbox"` labelled "Permissions" with three draggable options
 * (Read / Write / Admin, `selectionMode: multiple`, `useDragAndDrop` getItems +
 * onReorder), and an `After` button. The listbox root publishes the live item
 * order as `data-comparison-order`.
 */

/** The reorderable `role="listbox"` in THIS panel's canvas, by accessible name. */
const listbox: TargetResolver = ({ canvas }) =>
  canvas.getByRole("listbox", { name: "Permissions" });

const scenario: DriverScenario = {
  slug: "dnd-listbox",
  title: "ListBox drag and drop",
  target: listbox,
  states: ["default"],
  cases: [{ id: "reorder", params: { selectionMode: "multiple" } }],
  // D6 — the resting listbox subtree (roles/names/states + drag-affordance
  // descriptions), pair-diffed vs the RAC reorderable oracle.
  ax: {
    cases: ["reorder"],
    roots: {
      listbox: listbox,
    },
  },
};

registerReorderDriver(scenario, {
  cases: ["reorder"],
  walks: [
    // Pick up the first option, walk two drop positions down, drop.
    { id: "reorder-down", keys: ["Enter", "ArrowDown", "ArrowDown", "Enter"] },
    // Pick up, navigate, then cancel — order must be left untouched.
    { id: "cancel", keys: ["Enter", "ArrowDown", "Escape"] },
  ],
});
registerAxTreeDriver(scenario);
