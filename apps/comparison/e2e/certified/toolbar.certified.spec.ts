import { registerAxTreeDriver } from "../drivers/ax";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerRtlDriver } from "../drivers/rtl";
import type { DriverScenario, TargetResolver } from "../drivers/scenario";

/**
 * Recertification march unit (Tier 4): Toolbar.
 *
 * SCOPING — why the oracle is react-aria-components `Toolbar`. React Spectrum S2
 * 1.5.1 ships Toolbar as a bare passthrough — literally
 * `export function Toolbar(props) { return <RACToolbar {...props} />; }` with no
 * styling, no variant, no size (see `@react-spectrum/s2/src/Toolbar.tsx`). So the
 * pair oracle is the react-aria-components `Toolbar` it forwards to — a real
 * component (unlike ActionGroup's hand-wired hooks), a thin wrapper over
 * react-aria 3.50 `useToolbar`, the direct upstream of our solidaria-components
 * Toolbar / `createToolbar` port. The Solid solid-spectrum Toolbar mirrors S2 as
 * a passthrough over that base, so this fixture drives `createToolbar` directly.
 * This is a BEHAVIOR cert (D5 focus + D6 AX + D10 RTL); paint is scoped out
 * (there is no styled oracle to pixel-diff — S2 adds none).
 *
 * WHAT THIS CERTIFIES — the arrow-nav + dynamic-role contract of `useToolbar`,
 * clause for clause (`useToolbar.ts`):
 *   1. NO text-input guard. `useToolbar.onKeyDown` moves focus on the arrow keys
 *      unconditionally — a native text input placed inside the toolbar loses its
 *      caret keys to toolbar navigation. The port had invented an
 *      `isTextInputLikeElement` guard (createToolbar.ts) that swallowed arrows
 *      while a text input was focused; the flat walk drives focus ONTO the "Size"
 *      input and presses an arrow, so the browser trail pins the divergence
 *      (oracle moves off the input; guarded port stays put).
 *   2. Orientation-GATED arrows. Horizontal handles ArrowLeft/ArrowRight only,
 *      vertical ArrowUp/ArrowDown only (`orientation === 'horizontal' && ...`).
 *      The off-axis arrow in each walk is a no-op — UNLIKE ActionGroup, whose
 *      arrows are orientation-agnostic. Both walks press the off-axis key to
 *      certify the gate.
 *   3. No roving tabindex / no Home/End. `useToolbar` sets no tabindex on its
 *      children (every control stays natively tabbable) and handles only the four
 *      arrows + Tab; Home/End fall through to the browser. The "(start)" snapshot
 *      and the trailing Home/End no-ops pin both.
 *   4. Tab escapes the whole toolbar. Tab → `focusLast` (shift → `focusFirst`)
 *      then the browser's own Tab carries focus OUT — exercised implicitly by the
 *      boundary buttons, asserted through the roving contract.
 *   5. Dynamic role + ALWAYS-on orientation (D6). Root is `role="toolbar"`; a
 *      nested toolbar downgrades to `role="group"` but STILL emits
 *      `aria-orientation` (`'aria-orientation': orientation`, unconditional). The
 *      port suppressed `aria-orientation` when nested (`isInToolbar() ? undefined
 *      : orientation()`); the nested-h AX case pins it.
 *   6. RTL flip (D10). `shouldReverse = rtl && orientation === 'horizontal'` swaps
 *      ArrowRight/ArrowLeft (vertical + Up/Down never flip). The D10 re-run of the
 *      horizontal walk under `ar-AE` certifies both stacks flip identically.
 *
 * jsdom can only observe the container props; the REAL `document.activeElement`
 * move through the input and the RTL arrow flip are browser-only, so these e2e
 * trails are the artifact that pins the behavior against the `useToolbar` oracle.
 *
 * DRIVERS REGISTERED:
 *   - D5 (focus trail) — the crux. `flat-h` (horizontal) and `flat-v` (vertical)
 *     each entered via a Tab trampoline from the Before button, then walked
 *     across the on-axis arrows THROUGH the Size text input + the off-axis arrow
 *     + Home/End, so the absent guard, the gated arrows, and the absent Home/End
 *     all pair-diff.
 *   - D6 (AX tree) — the toolbar subtree roles/names/orientation across
 *     `flat-h`, `flat-v`, and `nested-h` (the nested role=group + orientation
 *     case).
 *   - D10 (RTL) — re-runs the `flat-h` D5 walk under `ar-AE`, so ArrowRight moves
 *     PREVIOUS and ArrowLeft NEXT; certifies both stacks flip identically.
 *
 * DRIVERS SCOPED OUT (documented, not silent):
 *   - D1 (state-matrix) / D3 (pixel) / D7 (contrast) / D8 (target size) / D9
 *     (forced colors) — no styled S2 Toolbar oracle exists (S2 adds zero style),
 *     so there is nothing to pixel-diff. This unit stripped the solid-spectrum
 *     Toolbar to a bare passthrough, matching S2 (tickets #46 and #59).
 *   - D2 (motion) — no enter/exit animation.
 *   - D4 (events) — the press/focus event model is exercised through the shared
 *     interaction-hook family (createButton / focus manager), per the hook-family
 *     rule.
 *
 * FIXTURE (`toolbar-demo.ts`) — a `Before` button, a Toolbar labelled "Text
 * formatting", and an `After` button. "flat" content places Bold / Italic / a
 * native Size text input / Underline directly in the toolbar (the input is the
 * D5 probe); "nested" wraps the controls in child toolbars (role=group).
 * `orientation` and `content` are prop-driven; the boundary buttons let the walk
 * cross the toolbar's Tab boundary so the trampoline entry is exercised.
 */

/** The Toolbar root in THIS panel's canvas, located by the stable control-root
 *  marker both stacks stamp on the toolbar element. */
const toolbar: TargetResolver = ({ canvas }) =>
  canvas.locator('[data-comparison-control-root="toolbar"]');

/** The boundary button BEFORE the toolbar in DOM order (forward Tab entry). */
const beforeButton: TargetResolver = ({ canvas }) => canvas.getByRole("button", { name: "Before" });

/**
 * Horizontal scenario. Walk: Tab in → FIRST control ("Bold"); ArrowRight steps
 * NEXT through Italic → Size(input) → Underline (the input→Underline step is the
 * guard probe: oracle moves, guarded port would stay); ArrowLeft steps back
 * Underline → Size(input) → Italic (the Size→Italic step probes the guard the
 * other direction); ArrowDown is the OFF-axis no-op (horizontal ignores it);
 * Home/End fall through. Scoped to the toolbar subtree so the Before/After
 * boundary buttons collapse to the outside-root sentinel.
 */
const scenario: DriverScenario = {
  slug: "toolbar",
  title: "Toolbar",
  target: toolbar,
  states: ["default"],
  cases: [
    { id: "flat-h", params: { orientation: "horizontal", content: "flat" } },
    { id: "flat-v", params: { orientation: "vertical", content: "flat" } },
    { id: "nested-h", params: { orientation: "horizontal", content: "nested" } },
  ],
  focus: {
    cases: ["flat-h"],
    root: toolbar,
    walks: [
      {
        id: "horizontal",
        start: beforeButton,
        keys: [
          "Tab",
          "ArrowRight",
          "ArrowRight",
          "ArrowRight",
          "ArrowLeft",
          "ArrowLeft",
          "ArrowDown",
          "Home",
          "End",
        ],
      },
    ],
  },
  // D6 — the toolbar subtree roles/names/orientation across both orientations and
  // the nested role=group case.
  ax: {
    cases: ["flat-h", "flat-v", "nested-h"],
    roots: {
      toolbar,
    },
  },
};

/**
 * Vertical D5 scenario (`flat-v`). ArrowDown/Up are the primary axis and
 * ArrowRight is the off-axis no-op. Same slug/route; a separate scenario so this
 * walk pairs only with the `flat-v` case (the focus driver runs every walk on
 * every listed case).
 */
const verticalFocusScenario: DriverScenario = {
  slug: "toolbar",
  title: "Toolbar (vertical)",
  target: toolbar,
  states: ["default"],
  cases: [{ id: "flat-v", params: { orientation: "vertical", content: "flat" } }],
  focus: {
    cases: ["flat-v"],
    root: toolbar,
    walks: [
      {
        id: "vertical",
        start: beforeButton,
        keys: [
          "Tab",
          "ArrowDown",
          "ArrowDown",
          "ArrowDown",
          "ArrowUp",
          "ArrowUp",
          "ArrowRight",
          "Home",
          "End",
        ],
      },
    ],
  },
};

registerFocusTrailDriver(scenario);
registerAxTreeDriver(scenario);
registerFocusTrailDriver(verticalFocusScenario);
// D10 — re-run the horizontal (`flat-h`) D5 walk under `ar-AE`, certifying the
// RTL-flipped ArrowRight/ArrowLeft navigation.
registerRtlDriver(scenario, { cases: ["flat-h"] });
