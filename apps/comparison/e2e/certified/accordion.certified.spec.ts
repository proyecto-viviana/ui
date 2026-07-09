import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, disclosure family): Accordion.
 *
 * ORACLE — the STYLED S2 Accordion, which IS the S2 `DisclosureGroup` primitive
 * (the port exports `Accordion`/`AccordionItem`/… as thin aliases over
 * `DisclosureGroup`/`Disclosure`). The comparison surface renders
 * `@react-spectrum/s2` `Accordion` in the React panel against our styled
 * `solid-spectrum` `Accordion` in the Solid panel; both are the STYLED layer,
 * and this unit certifies STRUCTURE / ACCESSIBILITY-TREE (paint lives in
 * `accordion-visual.spec.ts`).
 *
 * WHAT THIS CERTIFIES — the group's a11y-tree shape as a SEQUENCE of
 * independent disclosures (this is the property Disclosure's own cert cannot
 * show):
 *   · The `DisclosureGroup` root carries NO ARIA role (neither S2 nor RAC add a
 *     landmark/group role) — the tree is just the two disclosures in DOM order.
 *   · Each item is a `heading "…" > button [expanded]` + a `group "…"` panel;
 *     one item starts expanded (`Personal Information`, panel in the tree) and
 *     one collapsed (`Billing Address`, panel `aria-hidden`, out of the tree),
 *     certifying mixed open/closed state within one group.
 *   · The second item uses a `DisclosureHeader` (`AccordionItemHeader`) so its
 *     header action ("More billing actions") is a SIBLING button of the trigger,
 *     never nested inside it.
 *   · `disabled` — `isDisabled` on the group flows `[disabled]` onto BOTH
 *     triggers while the header action stays enabled (an AX restatement of the
 *     `accordion-contract` disabled-suppression behavior).
 *
 * DRIVERS REGISTERED:
 *   - D6 (AX tree) — the CRUX. The `[data-comparison-control-root="accordion"]`
 *     subtree is pair-diffed vs styled S2 for `single` (default: personal
 *     expanded, billing collapsed, header action present) and `disabled` (both
 *     triggers `[disabled]`, action still enabled).
 *   - D5 (focus trail) — one forward walk on `single`. The group is NOT a roving
 *     composite (unlike a listbox/tablist): each disclosure trigger is its own
 *     native tab stop and there is no arrow-key delegate between items. Starting
 *     on the first trigger, Tab reaches the second trigger (the first item's
 *     panel body is not focusable), then the second item's header action, then
 *     exits — certifying the three-tab-stop DOM order and the absence of managed
 *     tabindex. `root` scopes the snapshot to the accordion subtree.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1/D3/D7/D8 (paint) — certified by `accordion-visual.spec.ts` (computed
 *     styles across size/density/quiet/disabled + exact screenshot pairs).
 *   - D2 (motion) — the per-item panel height transition is the same
 *     `[height]` animation certified on the Disclosure surface; no group-level
 *     animation of its own.
 *   - D4 (events) — `allowsMultipleExpanded` single-vs-multiple accordion
 *     behavior, `onExpandedChange` key payloads, header-action isolation, and
 *     disabled-press suppression are exercised exhaustively by
 *     `accordion-contract.spec.ts`. (This is why the AX matrix does not add a
 *     `multiple` case: `allowsMultipleExpanded` exposes NO resting ARIA — it only
 *     changes which keys a CLICK may add, and the resting demo opens exactly one
 *     item regardless, so its AX tree is identical to `single`.)
 *   - D10 (RTL) — direction-independent tree; the chevron flip is covered by the
 *     Disclosure/visual surfaces.
 *
 * FIXTURE (`accordion-demo.ts`) — the styled accordion with two items,
 * "Personal Information" (expanded by default) and "Billing Address" (collapsed,
 * with a "More billing actions" header action).
 */

/** The accordion demo subtree in THIS panel. */
const accordionRoot: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="accordion"]').first();

/** The first item's trigger button — the D5 walk's entry tab stop. */
const personalTrigger: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: "Personal Information", exact: true });

const scenario: DriverScenario = {
  slug: "accordion",
  title: "Accordion",
  target: personalTrigger,
  states: ["default"],
  cases: [
    { id: "single", params: {} },
    { id: "disabled", params: { isDisabled: "true" } },
  ],
  // D5 — the sequence-of-native-tab-stops certification. `root` scopes the
  // roving-tabindex snapshot to the accordion subtree; from the first trigger,
  // Tab reaches the second trigger (the expanded first panel's text is not
  // focusable), then the second item's header action, then exits. No managed
  // tabindex on any trigger — this is a group of independent disclosures, not a
  // roving composite.
  focus: {
    cases: ["single"],
    root: accordionRoot,
    walks: [
      {
        id: "tab-through",
        start: personalTrigger,
        keys: ["Tab", "Tab", "Tab"],
      },
    ],
  },
  // D6 — the accordion subtree roles/names/states, pair-diffed vs styled S2 for
  // the default mixed open/closed shape and the fully-disabled group.
  ax: {
    cases: ["single", "disabled"],
    roots: {
      accordion: accordionRoot,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
