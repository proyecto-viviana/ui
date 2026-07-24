import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collection): standalone ListBox.
 *
 * SCOPING — why the oracle is react-aria-components, not S2. React Spectrum S2
 * ships NO publicly-styled standalone ListBox: `@react-spectrum/s2`'s
 * `ListBox.tsx` is an unstyled pass-through to `react-aria-components`' ListBox,
 * is absent from the public `index.ts` barrel, and is imported by no S2
 * component. So there is no styled S2 reference to pixel/style-diff against. The
 * correct oracle is RAC's OWN `ListBox` — the direct upstream of our Solid
 * port's `createListBox`/`useSelectableCollection` — rendered in the React panel
 * (`react-aria-components@1.19.0`, the pinned version). Both panels are the
 * UNSTYLED base layer (RAC `ListBox`/`ListBoxItem` vs our headless
 * `@proyecto-viviana/solidaria-components` `ListBox`/`ListBoxOption`), so the
 * certified surface is STRUCTURE + FOCUS BEHAVIOR, not visual paint.
 *
 * WHAT THIS CERTIFIES — the standalone-ListBox real-roving-focus fix
 * (`7030e518`). A standalone ListBox uses REAL roving DOM focus: on entry the
 * option element itself becomes `document.activeElement` (via
 * `createSelectableItem`'s focus effect), the roving `tabIndex` rolls (option
 * 0/-1, container 0/-1), and `aria-activedescendant` is NEVER emitted
 * (activedescendant is the VIRTUAL-focus channel used only by ComboBox /
 * Autocomplete). The container is a FOCUS TRAMPOLINE: focused with
 * `focusedKey == null` it navigates to `firstSelectedKey ?? getFirstKey()`, or —
 * when focus arrives from AFTER the listbox in DOM order (Shift+Tab, detected via
 * `compareDocumentPosition(relatedTarget) & DOCUMENT_POSITION_FOLLOWING`) — to
 * `lastSelectedKey ?? getLastKey()`. jsdom can only observe the proxy
 * (`data-focused` + roving tabindex + no activedescendant); the REAL
 * `document.activeElement` move to the option is browser-only, so this e2e D5
 * trail is the artifact that pins the fix's defining property against the RAC
 * oracle — entry for entry.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux. Two walks certify BOTH trampoline directions:
 *       · `tab-forward`  — Tab from a preceding button enters the listbox and the
 *         trampoline lands on the FIRST key ("read"); arrows then rove and wrap.
 *       · `tab-backward` — Shift+Tab from a following button enters from below and
 *         the trampoline lands on the LAST key ("admin"), exercising the
 *         `compareDocumentPosition` direction branch. `root: listbox` scopes the
 *         roving-tabindex snapshot to the `role="listbox"` subtree so the
 *         Before/After boundary buttons collapse to the outside-root sentinel.
 *   - D6 (AX tree) — the `role="listbox"` subtree: roles/names/states, incl. the
 *     per-option semantics, pair-diffed against RAC.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) — no styled S2 oracle exists; both panels are
 *     the unstyled base layer, so a pixel/style pair-diff would compare two
 *     near-empty base surfaces (mirrors the Tier-6 "no upstream pair → D1/D3 out
 *     of scope" precedent). The styled solid-spectrum ListBox carries INVENTED
 *     Tailwind sizing with no S2 counterpart; its paint is a Tier-6-style
 *     self-certification concern, tracked separately — its roving focus is
 *     inherited from this same headless layer and is certified here.
 *   - D7 (contrast) / D8 (target size) — unstyled base has no paint/hit-area to
 *     measure against an oracle; deferred with the styled-layer self-cert.
 *   - D9 (forced colors) / D10 (RTL) — follow-ups. The trampoline direction logic
 *     is DOM-order based (not visual), so RTL roving is order-stable; wiring an
 *     I18nProvider locale into the headless fixture is deferred to a D10 pass.
 *   - D2 (motion) / D4 (events) — the listbox has no enter/exit animation of its
 *     own, and its selection/typeahead event model is certified through its hosts
 *     (Picker/Select/ComboBox D4 runs), per the interaction-hook-family rule.
 *
 * FIXTURE (`listbox-demo.ts`) — a `Before` button, a `role="listbox"` labelled
 * "Permissions" with three options (Read / Write / Admin, `selectionMode:
 * single`, no default selection), and an `After` button. The boundary buttons
 * let the walk cross the listbox tab-boundary in both directions so the
 * trampoline's entry-direction logic is exercised faithfully.
 */

/** The inline `role="listbox"` in THIS panel's canvas (not portaled — a
 *  standalone ListBox renders in place), resolved by its accessible name. */
const listbox: TargetResolver = ({ canvas }) =>
  canvas.getByRole("listbox", { name: "Permissions" });

/** The boundary button BEFORE the listbox in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/** The boundary button AFTER the listbox in DOM order (backward Shift+Tab entry). */
const afterButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "After" });

const scenario: DriverScenario = {
  slug: "listbox",
  title: "ListBox",
  target: listbox,
  states: ["default"],
  cases: [{ id: "single", params: { selectionMode: "single" } }],
  // D5 — the real-roving-focus certification. `root: listbox` keeps the trail
  // scoped to the `role="listbox"` subtree; the Before/After boundary buttons
  // (focused at the `(start)` snapshot) collapse to the outside-root sentinel in
  // both stacks, so only the in-listbox roving is compared.
  focus: {
    cases: ["single"],
    root: listbox,
    walks: [
      // Forward: Tab in from the preceding button → trampoline → FIRST key
      // ("read"); arrows rove down/up and Home/End jump the ends.
      {
        id: "tab-forward",
        start: beforeButton,
        keys: ["Tab", "ArrowDown", "ArrowDown", "ArrowUp", "Home", "End"],
      },
      // Backward: Shift+Tab in from the following button → trampoline detects the
      // relatedTarget FOLLOWS the listbox → LAST key ("admin").
      {
        id: "tab-backward",
        start: afterButton,
        keys: ["Shift+Tab"],
      },
    ],
  },
  // D6 — the `role="listbox"` subtree roles/names/states, pair-diffed vs RAC.
  ax: {
    cases: ["single"],
    roots: {
      listbox: listbox,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
