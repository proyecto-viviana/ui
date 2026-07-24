import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4, collection): Breadcrumbs.
 *
 * ORACLE — the STYLED S2 Breadcrumbs. Unlike ListBox (whose S2 export is an
 * unstyled RAC pass-through, so its oracle was RAC itself), `@react-spectrum/s2`
 * ships a REAL styled `Breadcrumbs`, and the comparison surface renders it in
 * the React panel against our styled `solid-spectrum` `Breadcrumbs` in the Solid
 * panel. Both panels are therefore the STYLED layer — but the property this unit
 * certifies is STRUCTURE / ACCESSIBILITY-TREE, not paint (see the scoped-out
 * paint drivers below).
 *
 * WHAT THIS CERTIFIES — the current-item AX fix (CP9.48). The current (last)
 * breadcrumb must be a NON-INTERACTIVE plain element, exactly as upstream:
 *   · S2 renders the current crumb as a bare `<div className={currentStyles}>` —
 *     no role, no href, no `aria-disabled`, not a tab stop.
 *   · RAC-components composes the current crumb as a child that NEVER consumes
 *     the `Link` props (no `role="link"`, no `[disabled]`).
 * Before the fix, our headless `BreadcrumbItem` fed the current item through
 * `createLink` (href/role/tabindex/aria-disabled + press/focus data-attrs) and
 * resolved `elementType` to a `<span role="link">`, so the a11y tree exposed the
 * current page as `link "…" [disabled]` — an interactive, disabled control that
 * upstream never renders. The fix moves the whole decision into the headless
 * layer: `BreadcrumbItem` computes `isCurrent` for BOTH the static and the
 * collection forms and, when current, renders a bare element carrying ONLY
 * `aria-current="page"` + `data-current`, dropping every `createLink` prop and
 * the roving tab stop. The a11y tree then reads the current crumb as plain
 * `listitem` text — pair-identical to styled S2 (verified: both panels emit
 * `list "Project location": listitem[link "Home", img], listitem: Breadcrumbs`).
 *
 * This also certifies that Breadcrumbs exposes NO navigation landmark — S2 and
 * RAC both render a bare `<ol role="list">` (not a `<nav>`), which the port now
 * matches (the unit suites were realigned nav→list alongside this fix).
 *
 * DRIVERS REGISTERED:
 *   - D6 (AX tree) — the CRUX. The `list "Project location"` subtree
 *     (roles/names/states) is pair-diffed vs styled S2 for two cases:
 *       · `standard` — Home (link) + chevron (img) + current (bare listitem
 *         text). This is the case the fix is about: the current crumb must NOT
 *         carry a `link` role or `[disabled]`.
 *       · `overflow` — the 5-item set that collapses into a "More items" menu
 *         button. DEFERRED as a tracked `knownDivergence` (see `ax` below): the
 *         collapse SEMANTICS agree (root link + a closed `aria-haspopup` "More
 *         items" button), but the collapse POINT diverges oracle-side. Measured
 *         live, the inputs are byte-identical between stacks (hidden widths
 *         [51,43,62,61,91], gap 6, folder 32, container ~512) and the same S2
 *         algorithm on either stack's settled DOM computes tail = 2. Solid renders
 *         that (fits 255px of 512px, no spill); the S2 oracle renders a STALE
 *         tail = 0, having measured `visibleItems` during an initial narrow-layout
 *         window with a ResizeObserver that never re-fires in this fixed-width
 *         harness. Forcing byte-parity would mean regressing Solid's correct
 *         re-measurement to mimic React's stale state, so the case is tracked and
 *         visible in the report rather than passed or force-matched.
 *   - D5 (focus trail) — minimal, one forward walk on `standard`. Focus the
 *     "Home" link and press Tab. This certifies the defining consequence of the
 *     fix: the current crumb is NOT a tab stop, so Tab from the last link LEAVES
 *     the list (active collapses to the outside-root sentinel in BOTH stacks)
 *     instead of landing on a focusable current item. `root: list` scopes the
 *     roving-tabindex snapshot to the `role="list"` subtree, which also certifies
 *     that breadcrumb links are NATIVE per-link tab stops (each `tabindex="0"`),
 *     NOT a single-tab-stop roving composite like ListBox/GridList.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — PAINT.
 *     The CP9.48 divergence was a structural/AX defect, not a paint defect: the
 *     current crumb's visual styling (S2 `currentStyles`) was already mirrored —
 *     both stacks render the same styled element; only its ROLE/STATE diverged. A
 *     full styled-paint pass over Breadcrumbs (size M/L × states × themes, the
 *     chevron separator, the overflow menu button) is a follow-up burn-down, not
 *     gated by this structural cert.
 *   - D10 (RTL) — follow-up. The chevron separator is direction-aware (S2's
 *     `ChevronIcon` flips under RTL); a D10 walk needs locale plumbing wired into
 *     the breadcrumbs fixture (mirror `picker-demo` / `gridlist-demo`), deferred.
 *   - D2 (motion) — Breadcrumbs have no enter/exit animation of their own.
 *   - D4 (events) — the `onAction`/press model and the overflow-menu OPEN are
 *     exercised by `breadcrumbs-contract.spec.ts` (click → onAction key, menu
 *     collapse, responsive re-measure) and by the Menu family's own D4.
 *   - Overflow-menu D5 (Tab INTO the collapsed "More items" menu, arrowing the
 *     menu items) — a Menu-family focus concern certified via Menu's own D5, not
 *     re-run here; this unit's D5 stays on the breadcrumb list's own tab order.
 *
 * FIXTURE (`breadcrumbs-demo.ts`) — the styled breadcrumbs labelled "Project
 * location". `standard` = Home (link) + Breadcrumbs (current); `overflow` = a
 * 5-item set that collapses into a "More items" menu. Unlike the ListBox
 * fixture there are NO Before/After boundary buttons: the breadcrumb links are
 * themselves the tab stops, so the D5 walk starts on the first link and Tab
 * exits to certify the non-focusable current crumb.
 *
 * DIVERGENCE NOTE (documented, cert-invisible) — `createBreadcrumbs` injects a
 * default `aria-label="Breadcrumbs"` on the bare `<ol>` when the consumer
 * supplies none (RAC leaves the `<ol>` unnamed). It is cert-invisible because
 * the fixture always sets an explicit `aria-label="Project location"`, which
 * suppresses the default on both stacks.
 */

/** The styled breadcrumb `<ol role="list">` in THIS panel's canvas, by name. */
const list: TargetResolver = ({ canvas }) => canvas.getByRole("list", { name: "Project location" });

/** The first (non-current) breadcrumb link — the D5 walk's entry tab stop.
 *  Resolves uniquely: Playwright's role engine excludes the React panel's
 *  `inert` responsive-measurement copies (verified count === 1 on both stacks). */
const homeLink: TargetResolver = ({ canvas }) => canvas.getByRole("link", { name: "Home" });

const scenario: DriverScenario = {
  slug: "breadcrumbs",
  title: "Breadcrumbs",
  target: list,
  states: ["default"],
  cases: [
    { id: "standard", params: { size: "M", itemSet: "standard" } },
    { id: "overflow", params: { size: "M", itemSet: "overflow" } },
  ],
  // D5 — the non-focusable-current certification. `root: list` scopes the
  // roving-tabindex snapshot to the `role="list"` subtree so the docs chrome
  // never leaks; Tab from the last link exits the list (outside-root sentinel).
  focus: {
    cases: ["standard"],
    root: list,
    walks: [
      // Forward: focus the "Home" link, then Tab. The current crumb
      // ("Breadcrumbs") is a bare element with no tab stop, so focus leaves the
      // list entirely — active collapses to `(outside)` in both stacks. If the
      // current crumb were still a focusable `link`, focus would land on it here.
      {
        id: "tab-off-current",
        start: homeLink,
        keys: ["Tab"],
      },
    ],
  },
  // D6 — the `list "Project location"` subtree roles/names/states, pair-diffed
  // vs styled S2 for both the standard and the collapsed-overflow shapes.
  ax: {
    cases: ["standard", "overflow"],
    roots: {
      list: list,
    },
    // The overflow COLLAPSE POINT diverges — but oracle-side, not port-side, so
    // it is deferred (tracked, visible in the report) rather than forced to
    // byte-parity. Measured live in this harness: the collapse INPUTS are
    // byte-identical between stacks — hidden-item widths [51,43,62,61,91],
    // container gap 6px, folder 32px, container width ~512/506 — and both run the
    // SAME S2 algorithm, which on either stack's SETTLED DOM computes tail = 2.
    // Solid renders that (Home + "More items" + Reports + Annual report, filling
    // 255px of the 512px container, no spill). The S2 oracle instead renders a
    // STALE tail = 0 (Home + "More items"): its `visibleItems` was measured during
    // an initial narrow-layout window and its ResizeObserver — bound to a
    // fixed-width container that never resizes in the two-panel comparison harness
    // — never re-fires to correct it (verified stable across shrink→760→restore).
    // Byte-parity would require regressing Solid's correct re-measurement to mimic
    // React's stale state. The collapse SEMANTICS both DO agree on (root stays a
    // link; the collapsed group is a "More items" button with `aria-haspopup`,
    // closed) are certified by the `standard` D6 case + the D5 walk.
    knownDivergences: {
      overflow:
        "Overflow collapse point is an ORACLE-side measurement-timing artifact, " +
        "not a port divergence. Byte-identical inputs (hidden widths " +
        "[51,43,62,61,91], gap 6, folder 32, container ~512) + the byte-identical " +
        "S2 collapse algorithm compute tail=2 on either stack's settled DOM; Solid " +
        "renders that (fits 255px of 512px, no spill). The S2 oracle renders a stale " +
        "tail=0 — visibleItems measured in an initial narrow window, its " +
        "ResizeObserver (fixed-width container, never resizes in this harness) never " +
        "re-fires. Byte-parity would mean regressing Solid's correct re-measurement " +
        "to replicate React's stale state. Collapse semantics (root link + closed " +
        "'More items' aria-haspopup button) are certified by the standard D6 + D5.",
    },
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
