import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, disclosure family): Disclosure.
 *
 * ORACLE — the STYLED S2 Disclosure. Like Tabs/ListView (and unlike ListBox,
 * whose S2 export is an unstyled RAC pass-through), `@react-spectrum/s2` ships a
 * REAL styled `Disclosure`, and the comparison surface renders it in the React
 * panel against our styled `solid-spectrum` `Disclosure` in the Solid panel.
 * Both panels are therefore the STYLED layer, and the property this unit
 * certifies is STRUCTURE / ACCESSIBILITY-TREE, not paint (the pixel/contrast/
 * target-size drivers are already carried by `disclosure-visual.spec.ts`).
 *
 * WHAT THIS CERTIFIES — the disclosure's full a11y-tree shape, pair-diffed vs
 * styled S2 across the semantic axes the port passes through from S2 props:
 *   · the HEADING wrapper — S2's `DisclosureTitle` renders `<Heading level>`
 *     (`<h{level}>`); the port renders `<Dynamic h{level}>`. The AX tree must
 *     expose `heading "System Requirements" [level=N]` with the button as its
 *     only interactive child (chevron is an `aria-hidden` svg → AX-invisible on
 *     both stacks; S2 additionally wraps it in a role-less `CenterBaseline` span
 *     the port omits — also AX-invisible, so the trees stay pair-identical).
 *   · the TRIGGER button — `aria-expanded` reflects the open state, and the
 *     button's accessible name is the title text (NOT the chevron).
 *   · the PANEL — `role` is ALWAYS `group`, `aria-labelledby` points at the
 *     trigger so the panel inherits the title name, and when collapsed the panel
 *     is `aria-hidden` and drops out of the tree entirely. The `role` stays
 *     `group` even when a `region` override is supplied: S2's `DisclosurePanel`
 *     runs its props through `filterDOMProps(otherProps)` (no `propNames`) before
 *     handing them to RAC, and that allowlist (id + data- & aria- attrs) EXCLUDES
 *     `role`, so the `group`/`region` opt-in is silently discarded upstream (S2
 *     `Disclosure.tsx:387`). The port matches by dropping `role` in its own styled
 *     `DisclosurePanel`. All of this is certified across the `standard`/
 *     `collapsed`/`region`/`heading-level` cases.
 *   · the HEADER ACTION — `withHeaderAction` renders a SECOND button
 *     ("Edit system requirements") as a SIBLING of the trigger inside the
 *     header, never nested inside the trigger button (an AX-tree restatement of
 *     the `actionNestedInTrigger === false` contract).
 *
 * DRIVERS REGISTERED:
 *   - D6 (AX tree) — the CRUX. The `[data-comparison-control-root="disclosure"]`
 *     subtree (roles/names/states via `ariaSnapshot`) is pair-diffed vs styled
 *     S2 for four cases: `standard` (expanded, group panel, level-3 heading,
 *     header action), `collapsed` (`aria-expanded=false`, panel gone from the
 *     tree), `region` (a `panelRole="region"` override that BOTH stacks discard —
 *     S2 strips `role` via `filterDOMProps`, so the panel stays `group`; this case
 *     certifies the port matches that suppression rather than honouring the
 *     override), and `heading-level` (level-2 heading — certifies the `level`
 *     passthrough + the port's `min(6, max(1, level))` clamp agrees with S2).
 *   - D5 (focus trail) — one forward walk on `standard`. Disclosure is NOT a
 *     roving composite: the trigger and the header action are INDEPENDENT native
 *     tab stops, and the (expanded) panel's body text is not focusable. Starting
 *     on the trigger, Tab lands on the header action, and a second Tab LEAVES the
 *     disclosure (active collapses to the outside-root sentinel in both stacks) —
 *     certifying the two-tab-stop order and that no roving tabindex is applied.
 *     `root` scopes the snapshot to the disclosure subtree so docs chrome cannot
 *     leak in.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1/D3/D7/D8 (paint) — the styled-paint surface (size × density × quiet ×
 *     disabled × RTL × forced-colors, the chevron geometry, the header action
 *     hit box) is already certified exhaustively by `disclosure-visual.spec.ts`
 *     (computed-style pair contract + exact screenshot pairs). This unit adds the
 *     AX/focus lens that the style contract cannot see.
 *   - D2 (motion) — the panel's height transition is a `[height]` animation into
 *     `--disclosure-panel-height`; its metadata/reduced-motion parity is asserted
 *     by `disclosure-visual.spec.ts` (`transition-property`/`-duration` + the
 *     reduced-motion `none` assertion). No enter/exit indicator of its own.
 *   - D4 (events) — the press-to-toggle model, `onExpandedChange` payloads,
 *     header-action isolation, and disabled-press suppression are exercised by
 *     `disclosure-visual.spec.ts` (semantics/callback contract) and the
 *     `accordion-contract.spec.ts` group form.
 *   - D10 (RTL) — the chevron's direction-aware rotate/flip is covered by
 *     `disclosure-visual.spec.ts`'s RTL screenshot pair; the AX tree is
 *     direction-independent.
 *
 * FIXTURE (`disclosure-demo.ts`) — the styled disclosure titled "System
 * Requirements" with a header action "Edit system requirements" and a panel of
 * requirement lines. Default is expanded, `group` panel, level-3 heading.
 */

/** The disclosure demo subtree (the styled root + its panel) in THIS panel. */
const disclosureRoot: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="disclosure"]').first();

/** The trigger button, by its title text — the D5 walk's entry tab stop. */
const trigger: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: "System Requirements", exact: true });

const scenario: DriverScenario = {
  slug: "disclosure",
  title: "Disclosure",
  target: trigger,
  states: ["default"],
  cases: [
    { id: "standard", params: {} },
    { id: "collapsed", params: { isExpanded: "false" } },
    { id: "region", params: { panelRole: "region" } },
    { id: "heading-level", params: { titleLevel: "2" } },
  ],
  // D5 — the not-a-roving-composite certification. `root` scopes the
  // roving-tabindex snapshot to the disclosure subtree; Tab from the trigger
  // lands on the header action (a native sibling tab stop), and a second Tab
  // exits (panel body text is not focusable), so active collapses to `(outside)`
  // in both stacks. No tabindex is managed on either button.
  focus: {
    cases: ["standard"],
    root: disclosureRoot,
    walks: [
      {
        id: "tab-through",
        start: trigger,
        keys: ["Tab", "Tab"],
      },
    ],
  },
  // D6 — the disclosure subtree roles/names/states, pair-diffed vs styled S2
  // across expanded/collapsed, the `region` landmark opt-in, and a non-default
  // heading level.
  ax: {
    cases: ["standard", "collapsed", "region", "heading-level"],
    roots: {
      disclosure: disclosureRoot,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
