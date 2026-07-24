import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4): ActionGroup.
 *
 * SCOPING — why the oracle is the react-aria HOOKS, not S2 or RAC. React
 * Spectrum S2 1.5.x ships NO ActionGroup (it was split into
 * `ActionButtonGroup` / `ToggleButtonGroup` / `SegmentedControl`), and
 * react-aria-components exposes no ActionGroup *component* either. The only
 * surviving upstream is the pinned react-aria (3.50.0) `useActionGroup` /
 * `useActionGroupItem` HOOKS — the direct source of our `createActionGroup` /
 * `createActionGroupItem` port. So the React panel here is those two hooks
 * hand-wired exactly as the vendored `@adobe/react-spectrum` ActionGroup wires
 * them (see `react/fixtures/styled.js` `ReactActionGroupDemo`), and the pair
 * diff certifies the port against its real upstream ("no S2 component" ≠ "no
 * oracle" — the ListBox precedent). This is a BEHAVIOR cert (D5 focus + D6 AX);
 * paint is scoped out (see below).
 *
 * WHAT THIS CERTIFIES — the roving-focus + dynamic-role contract of the two
 * hooks, entry for entry:
 *   1. At-rest roving tabIndex. `useActionGroupItem` makes EVERY enabled item
 *      tabbable until focus engages (`isFocused || focusedKey == null ? 0 : -1`)
 *      — there is NO single default tab stop, and NO selection bias. The port
 *      had invented a `getDefaultTabStopKey` (one tab stop, biased to the
 *      selected key); the "(start)" snapshot — taken before Tab enters the group
 *      — pins the difference the browser catches.
 *   2. Orientation-AGNOSTIC arrow nav. `useActionGroup.onKeyDown` moves NEXT on
 *      ArrowRight OR ArrowDown and PREVIOUS on ArrowLeft OR ArrowUp, regardless
 *      of `orientation` (orientation only drives `aria-orientation`). The port
 *      had gated each arrow to one axis; the walks press the OFF-axis arrow in
 *      each orientation to surface it.
 *   3. No Home/End handling. The hook handles ONLY those four arrows; Home/End
 *      fall through to the browser (no focus move). The port had added Home/End
 *      jumps; the walks press both to surface it.
 *   4. Dynamic roles / states (D6): group role `none→toolbar`,
 *      `single→radiogroup`, `multiple→toolbar`; item role `none→(button)`,
 *      `single→radio`, `multiple→checkbox`; `aria-checked` off the selection
 *      manager; `aria-orientation` only on `toolbar`; `aria-disabled` when every
 *      key is disabled.
 *   5. RTL flip (D10): `flipDirection = rtl && horizontal` swaps ArrowRight /
 *      ArrowLeft only (vertical and Up/Down never flip).
 *
 * jsdom can only observe the roving-tabindex proxy; the REAL `document.activeElement`
 * move and the RTL arrow flip are browser-only, so these e2e trails are the
 * artifact that pins the behavior against the hook oracle.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux. `none` (horizontal `toolbar`) and `single`
 *     (vertical `radiogroup`) each entered via a Tab trampoline from a boundary
 *     button, then walked across BOTH arrow axes + Home/End so the at-rest
 *     tabIndex, the agnostic arrows, and the absent Home/End all pair-diff.
 *   - D6 (AX tree) — the group subtree roles/names/states across all four cases
 *     (`none` / `single` / `multiple` / `disabled`).
 *   - D10 (RTL) — re-runs the `none` (horizontal) D5 walk under `ar-AE`, so
 *     ArrowRight now moves PREVIOUS and ArrowLeft NEXT; certifies both stacks
 *     flip identically.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) — there
 *     is no styled S2 ActionGroup oracle to pixel-diff against (S2 removed the
 *     component). The styled Solid layer is restyled off invented Tailwind onto
 *     the S2 macro as part of this unit (tailwind-removal.md Phase 0) and
 *     verified for self-containment, not pixel-diffed against a missing oracle.
 *   - D2 (motion) — no enter/exit animation.
 *   - D4 (events) — the press/selection event model is exercised through the
 *     shared interaction-hook family (createButton / selection manager), per the
 *     hook-family rule.
 *   - D9 (forced colors) — a paint concern, moot without a styled oracle.
 *
 * FIXTURE (`actiongroup-demo.ts`) — a `Before` button, an ActionGroup labelled
 * "Text style" with three items (Bold / Italic / Underline), and an `After`
 * button. `selectionMode`, `orientation`, `defaultSelectedKeys`, and
 * `disabledKeys` are prop-driven; the boundary buttons let the walk cross the
 * group's tab boundary so the trampoline entry is exercised faithfully.
 */

/** The ActionGroup root in THIS panel's canvas. Its ROLE is prop-dependent
 *  (toolbar / radiogroup), so it is resolved by the stable control-root marker
 *  both stacks stamp on the group element rather than by role. */
const group: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="actiongroup"]');

/** The boundary button BEFORE the group in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/**
 * `none` — the default stack: role `toolbar`, `aria-orientation="horizontal"`,
 * items are plain buttons (item role `undefined`). Horizontal walk certifies the
 * agnostic arrows (ArrowDown is the off-axis key here) and absent Home/End.
 */
const scenario: DriverScenario = {
  slug: "actiongroup",
  title: "ActionGroup",
  target: group,
  states: ["default"],
  cases: [
    { id: "none", params: { selectionMode: "none", orientation: "horizontal" } },
    {
      id: "single",
      params: { selectionMode: "single", orientation: "vertical", defaultSelectedKeys: "italic" },
    },
    {
      id: "multiple",
      params: {
        selectionMode: "multiple",
        orientation: "horizontal",
        defaultSelectedKeys: "bold,underline",
      },
    },
    {
      id: "disabled",
      params: { selectionMode: "multiple", orientation: "horizontal", disabledKeys: "italic" },
    },
  ],
  // D5 (horizontal / `none`): Tab in → FIRST item ("bold"); ArrowRight NEXT,
  // ArrowDown NEXT (agnostic), wrap, ArrowLeft/ArrowUp PREVIOUS; Home/End are
  // no-ops (fall through to the browser). The "(start)" snapshot — before Tab —
  // pins the all-enabled-tabbable at-rest layout. Scoped to the group subtree so
  // the Before/After boundary buttons collapse to the outside-root sentinel.
  focus: {
    cases: ["none"],
    root: group,
    walks: [
      {
        id: "horizontal",
        start: beforeButton,
        keys: [
          "Tab",
          "ArrowRight",
          "ArrowDown",
          "ArrowRight",
          "ArrowLeft",
          "ArrowUp",
          "Home",
          "End",
        ],
      },
    ],
  },
  // D6 — the group subtree roles/names/states across every selection mode + the
  // all-relevant disabled case.
  ax: {
    cases: ["none", "single", "multiple", "disabled"],
    roots: {
      group,
    },
  },
};

/**
 * Vertical D5 scenario (`single` / `radiogroup`). Same slug/route; ArrowDown/Up
 * are the primary axis and ArrowRight is the off-axis key that still moves NEXT
 * (agnostic). `defaultSelectedKeys` biases neither the at-rest tab stops (all
 * enabled tabbable) nor focus on navigation. A separate scenario so this walk
 * pairs only with the `single` case (the focus driver runs every walk on every
 * listed case).
 */
const verticalFocusScenario: DriverScenario = {
  slug: "actiongroup",
  title: "ActionGroup (vertical)",
  target: group,
  states: ["default"],
  cases: [
    {
      id: "single",
      params: { selectionMode: "single", orientation: "vertical", defaultSelectedKeys: "italic" },
    },
  ],
  focus: {
    cases: ["single"],
    root: group,
    walks: [
      {
        id: "vertical",
        start: beforeButton,
        keys: ["Tab", "ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"],
      },
    ],
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
registerFocusTrailDriver(verticalFocusScenario);
// D10 — re-run the horizontal (`none`) D5 walk under `ar-AE`, certifying the
// RTL-flipped ArrowRight/ArrowLeft navigation. `focusOnly`: ActionGroup has no
// styled paint oracle (S2 removed the component, so the React reference is the
// unstyled react-aria hooks panel), so the RTL state-matrix half — a full
// computed-style diff — has nothing valid to diff against; the focus-trail half
// still asserts `direction: "rtl"`, keeping the "RTL actually applied" check.
registerRtlDriver(scenario, { cases: ["none"], focusOnly: true });
