import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collections family): ActionBar.
 *
 * ORACLE — the STYLED S2 `ActionBar`. `@react-spectrum/s2` ships a real styled
 * `ActionBar` (the selection action bar shown over a collection when items are
 * selected), and the comparison surface renders it in the React panel against
 * our styled `solid-spectrum` `ActionBar` in the Solid panel. Both panels are
 * the STYLED layer, so the property this unit certifies is STRUCTURE /
 * ACCESSIBILITY-TREE and FOCUS, not paint (pixel/computed-style/forced-colors
 * are already carried by `actionbar-visual.spec.ts`, and the selection/clear/
 * Escape/scroll-geometry/animation-lifecycle behaviour by
 * `actionbar-contract.spec.ts`).
 *
 * WHAT THIS CERTIFIES — the shape S2 gives the action bar (ActionBar.tsx:192):
 *   · the ROOT is a PLAIN container with NO `role`. S2 only spreads
 *     `keyboardProps` onto it (an Escape handler that clears the selection) — it
 *     is NOT itself a toolbar. Its two children are wrapped divs whose CSS
 *     `order` swaps their VISUAL order (`order:1 marginStart:auto` for actions,
 *     `order:0` for selection) while DOM order stays actions-FIRST,
 *     selection-SECOND.
 *   · the ACTIONS live in an `ActionButtonGroup`, which is the ONE and ONLY
 *     `toolbar` in the bar (`aria-label="Actions"`), rendering the action
 *     buttons (Edit / Copy / Delete) as its roving children.
 *   · the SELECTION cluster — the clear `CloseButton` (`aria-label="Clear
 *     selection"`) and the "{n} selected" count `<span>` (plain text, no role) —
 *     are SIBLINGS of the toolbar, OUTSIDE it. The close button is therefore an
 *     INDEPENDENT tab stop, not a member of the actions' roving set.
 *   · the count text is the selection axis: `selectedItemCount` 3 → "3
 *     selected", `all` → "All selected".
 *
 * DRIVERS REGISTERED:
 *   - D6 (AX tree) — the CRUX. The `[data-comparison-control-root="actionbar"]`
 *     subtree (roles/names/states via `ariaSnapshot`) is pair-diffed vs styled
 *     S2 for `standard` (3 selected), `all` ("All selected" text), and
 *     `emphasized` (the emphasized visual treatment must NOT perturb the tree).
 *     This is the witness for the toolbar placement: exactly one `toolbar`
 *     (the ActionButtonGroup), with the clear button and count as OUTSIDE
 *     siblings, in actions-first DOM order.
 *   - D5 (focus trail) — one roving walk on `standard`, `root`-scoped to the
 *     action-bar subtree. Starting on the first action ("Edit"), ArrowRight
 *     roves Edit → Copy → Delete and ArrowLeft returns to Copy, all WITHIN the
 *     single actions toolbar (one member at `tabindex=0`, the rest `-1`). The
 *     clear `CloseButton` carries its own explicit `tabindex` (react-aria's
 *     `useFocusable` always-tabindex) as a SEPARATE tab stop — never folded into
 *     the actions' roving set. The snapshot certifies both stacks manage exactly
 *     the same roving layout and the same two independent tab stops.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1/D3/D7/D8 (paint) — the size/emphasis/forced-colors/close-button hit box
 *     surface is certified by `actionbar-visual.spec.ts` (pixel-identical route
 *     states + computed-style pair contract + forced-colors). This unit adds the
 *     AX/focus lens the style contract cannot see.
 *   - D2 (motion) — the enter/exit `translateY` transition (only present with a
 *     `scrollRef`) and its reduced-motion completion are asserted by
 *     `actionbar-contract.spec.ts` (`transitionProperty`/`-duration` + the
 *     reduced-motion exit). The default (no-scrollRef) bar this cert renders has
 *     no enter/exit indicator of its own.
 *   - D4 (events) — Escape-to-clear, the clear-button press, child action
 *     callbacks, and collection-driven selection are exercised by
 *     `actionbar-contract.spec.ts`.
 *   - D10 (RTL) — the `order`/`insetInlineEnd` mirroring is direction-driven
 *     paint (covered by `actionbar-visual.spec.ts`); the AX tree and the
 *     horizontal roving are direction-independent (arrows already flip via the
 *     toolbar delegate, certified generically by `togglebuttongroup`).
 *
 * FIXTURE (`actionbar-demo.ts`) — the styled ActionBar with 3 selected items
 * and three actions (Edit / Copy / Delete), no scrollRef, not emphasized.
 */

/** The action-bar demo subtree in THIS panel. */
const actionBarRoot: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="actionbar"]').first();

/** The first action button — the D5 walk's roving entry point. */
const editAction: TargetResolver = ({ canvas }) =>
  canvas.getByRole("button", { name: "Edit", exact: true });

const scenario: DriverScenario = {
  slug: "actionbar",
  title: "ActionBar",
  target: editAction,
  states: ["default"],
  cases: [
    { id: "standard", params: {} },
    { id: "all", params: { selectedItemCount: "all" } },
    { id: "emphasized", params: { isEmphasized: "true" } },
  ],
  // D5 — the roving certification. `root` scopes the snapshot to the action-bar
  // subtree. Focus starts on the first action; ArrowRight/ArrowLeft rove within
  // the single actions toolbar (Edit ⇄ Copy ⇄ Delete), while the clear button
  // stays an independent tab stop outside the roving set.
  focus: {
    cases: ["standard"],
    root: actionBarRoot,
    walks: [
      {
        id: "roving",
        start: editAction,
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft"],
      },
    ],
  },
  // D6 — the action-bar subtree roles/names/states, pair-diffed vs styled S2
  // across the selection-count text axis and the emphasized treatment.
  ax: {
    cases: ["standard", "all", "emphasized"],
    roots: {
      actionbar: actionBarRoot,
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
