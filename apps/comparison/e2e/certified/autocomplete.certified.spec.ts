import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, CROSS-COMPONENT virtual focus): Autocomplete.
 *
 * SCOPING — why the oracle is react-aria-components, not S2. React Spectrum S2
 * ships NO publicly-styled standalone Autocomplete, so — exactly like the
 * standalone ListBox cert — there is no styled S2 reference to pixel/style-diff.
 * The correct oracle is RAC's OWN `Autocomplete` (the direct upstream of the
 * Solid port's `createAutocomplete` bridge), composed of a `SearchField` +
 * `Input` and a `ListBox`, rendered in the React panel
 * (`react-aria-components@1.19.0`, the pinned version). Both panels are the
 * UNSTYLED base layer (RAC `Autocomplete`/`SearchField`/`Input`/`ListBox` vs our
 * headless `@proyecto-viviana/solidaria-components` equivalents), so the
 * certified surface is STRUCTURE + FILTER + VIRTUAL-FOCUS BEHAVIOR, not paint.
 *
 * WHAT THIS CERTIFIES — the Autocomplete collection bridge (`e0dedd1a`).
 * Autocomplete is the one composite where the input and the collection are
 * SEPARATE components: real DOM focus NEVER leaves the input, and the active
 * option is tracked purely via the input's `aria-activedescendant`. The bridge
 * is a pair of synthetic-DOM-event channels the port wires through the ListBox
 * (gated on `AutocompleteCollectionContext`, so `createListBox` — and thus
 * ComboBox/Picker — stay untouched):
 *   - FORWARD (input → collection): the input re-dispatches its key events plus
 *     `react-aria-focus` / `react-aria-clear-focus` onto the collection, which
 *     moves `focusedKey` and, on forward typing, focuses the first filtered row.
 *   - REVERSE (collection → input): the focused option fires a bubbling synthetic
 *     `focusin` that the input's listener mirrors into `aria-activedescendant`.
 * Filtering runs through the SAME typed-value path: the SearchField input is
 * controlled by the autocomplete state, so a keystroke drives
 * `createFilteredListState` (locale-collated `contains`, `createFilter({
 * sensitivity: "base" })` — the port of react-aria `useFilter`, matched on the
 * React side). jsdom cannot observe real `document.activeElement` staying on the
 * input while a synthetic `focusin` walks the activedescendant, so this browser
 * D5 trail is the artifact that pins the bridge against the RAC oracle.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux. `snapshotFocus` records the active element
 *     (stays the `input[type="search"]`) AND resolves its `aria-activedescendant`
 *     to a descriptor, so the two stacks' virtual focus + filtering are pair-
 *     diffed entry-for-entry. `root: listbox` scopes the roving-tabindex snapshot
 *     to the option subtree (which, being virtual-focus, must carry NO roving
 *     tabindex — a stray option `tabindex` would surface here as a divergence).
 *     Three walks:
 *       · `virtual-filter-nav` — type "a" (filters to Apple/Banana/Grape/Mango/
 *         Orange/Peach and focuses the FIRST filtered row via activedescendant),
 *         then ArrowDown/ArrowDown/ArrowUp/Home/End walk the filtered list.
 *       · `filter-then-clear` — type "a" (focus first) then Backspace to empty
 *         (the `react-aria-clear-focus` path: deleting does NOT auto-focus first,
 *         so the activedescendant clears).
 *       · `tab-order` — Tab from the Before button through the input to the After
 *         button: the options are virtual-focus, so they are OUTSIDE the tab
 *         order and Tab skips straight over the list (a stray option tab stop
 *         would land `active` on an option instead of After).
 *   - D6 (AX tree) — the input's searchbox semantics + the `role="listbox"`
 *     subtree (roles/names/states), pair-diffed against RAC.
 *
 * DRIVERS SCOPED OUT (documented, not silent), mirroring the ListBox base cert:
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — no
 *     styled S2 oracle exists; both panels are the unstyled base layer, so a
 *     paint/hit-area pair-diff would compare two near-empty base surfaces.
 *   - D9 (forced colors) / D10 (RTL) — the bridge is DOM-order + collation based,
 *     not visual; RTL/forced-colors are a styled-layer follow-up.
 *   - D2 (motion) — the inline listbox has no enter/exit animation of its own.
 *   - D4 (events) — selection commit / onAction / escape behaviors are collection
 *     interaction contracts certified through the collection hosts.
 *   - D6 ANNOUNCEMENTS — the filter live-region transcript is the deferred
 *     announce channel (same deferral as ComboBox CP9.45b).
 *
 * FIXTURE (`autocomplete-demo.ts`) — a `Before` button, a `SearchField` labelled
 * "Search fruits" over a `ListBox` labelled "Fruits" (eight fruit options,
 * `selectionMode: none`), and an `After` button, wrapped in an `Autocomplete`
 * whose `filter` is a base-sensitivity `contains`. The boundary buttons let the
 * `tab-order` walk cross the widget tab-boundary; the fruit list is chosen so a
 * single typed "a" yields a stable six-item filtered subset in DOM order.
 */

/** The `input[type="search"]` — the real focus owner and every walk's anchor.
 *  Resolved by the native type (not by computed role) so the resolver is robust
 *  whether Chromium computes searchbox or combobox; D6 pair-diffs the role. */
const input: TargetResolver = ({ canvas }) => canvas.locator('input[type="search"]').first();

/** The inline `role="listbox"` (a standalone autocomplete renders in place — the
 *  collection is not portaled), resolved by its accessible name. */
const listbox: TargetResolver = ({ canvas }) => canvas.getByRole("listbox", { name: "Fruits" });

/** The boundary button BEFORE the widget in DOM order (forward Tab entry). The
 *  fixture also renders an `After` button so the `tab-order` walk has somewhere
 *  to land past the virtual-focus list; it is reached via Tab, not resolved. */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

const scenario: DriverScenario = {
  slug: "autocomplete",
  title: "Autocomplete",
  target: input,
  states: ["default"],
  cases: [{ id: "none", params: { selectionMode: "none" } }],
  // D5 — the cross-component virtual-focus + filter certification. `root:
  // listbox` scopes the roving-tabindex snapshot to the option subtree; the
  // active element (the input) and its resolved `aria-activedescendant` are
  // captured globally, so the trail is exactly the virtual-focus channel.
  focus: {
    cases: ["none"],
    root: listbox,
    walks: [
      {
        id: "virtual-filter-nav",
        start: input,
        keys: ["a", "ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"],
      },
      {
        id: "filter-then-clear",
        start: input,
        keys: ["a", "Backspace"],
      },
      {
        id: "tab-order",
        start: beforeButton,
        keys: ["Tab", "Tab", "Shift+Tab"],
      },
    ],
  },
  // D6 — the input's searchbox semantics + the `role="listbox"` subtree
  // (roles/names/states), pair-diffed vs RAC.
  ax: {
    cases: ["none"],
    roots: {
      input: input,
      listbox: listbox,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
