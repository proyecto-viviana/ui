import { registerAxTreeDriver } from "../drivers/ax";
import { registerContrastDriver } from "../drivers/contrast";
import { registerEventSequenceDriver, standardPressGestures } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerMotionDriver } from "../drivers/motion";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";
import { registerTargetSizeDriver } from "../drivers/target-size";
import { clearPointer } from "../visual-diff";

/**
 * Recertification march unit (Tier 1): Link — the first navigational
 * primitive (a native `<a role="link">`, not a `<button>`). Prop cases mirror
 * the S2 Link docs matrix: the `variant` (primary/secondary) axis, the
 * `isStandalone` block treatment (ui font + medium weight), the standalone
 * `isQuiet` decoration axis (no underline until hover/focus), and the two
 * `staticColor` overlays. Link has no `size` and — matching S2 — no
 * `isDisabled`, so those axes are intentionally absent.
 *
 * Every case pins `href="#"` so the D4 press gestures activate the anchor as a
 * same-document fragment navigation (no unload) — the event log survives the
 * click, and `href` does not affect any captured style, AX, or geometry.
 *
 * Default label is "View project"; the anchor keeps role "link" across every
 * treatment, so `getByRole("link", { name: "View project" })` resolves each case.
 */
const linkScenario: DriverScenario = {
  slug: "link",
  title: "Link",
  target: ({ canvas }) => canvas.getByRole("link", { name: "View project" }),
  cases: [
    { id: "default", params: { href: "#" } },
    { id: "secondary", params: { variant: "secondary", href: "#" } },
    { id: "standalone", params: { isStandalone: "true", href: "#" } },
    {
      id: "standalone-quiet",
      params: { isStandalone: "true", isQuiet: "true", href: "#" },
    },
    { id: "static-white", params: { staticColor: "white", href: "#" } },
    { id: "static-black", params: { staticColor: "black", href: "#" } },
  ],
  // D4: the anchor press. On the canonical case a mouse-click and keyboard-Enter
  // must fire the same ordered press/click log in both stacks (RAC `useLink`
  // does NOT preventDefault without a router, so native fragment nav proceeds),
  // and — the parity point — keyboard-Space must NOT activate a link in either
  // stack (Space scrolls; only Enter follows an anchor). Any divergence in how
  // the port threads `useLink`'s press handling surfaces here.
  events: {
    cases: ["default"],
    gestures: standardPressGestures,
  },
  // D5: Tab enters/leaves the single anchor identically in both panels;
  // everything beyond the canvas collapses to the outside sentinel.
  focus: {
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] }],
  },
  // D2: `transition: 'default'` on the link style animates color (baseColor
  // accent has hover/down variants) and, for the standalone-quiet treatment,
  // the text-decoration. Port and upstream carry the same token, so the
  // captured hover transition must match — a positive control.
  motion: {
    cases: ["default"],
    triggers: [
      {
        id: "hover-transition",
        scopes: ["panel"],
        run: async ({ target }) => {
          await target.hover();
        },
        cleanup: async ({ page }) => {
          await clearPointer(page);
        },
        settleMs: 160,
      },
    ],
  },
  // D6: the anchor AX node. The resting node is `link "View project"`; the
  // standalone treatment changes only the visual block/weight, so its AX node
  // must stay the identical `link "View project"` — proof the standalone path
  // does not leak a role or naming divergence.
  ax: {
    cases: ["default", "standalone"],
  },
  // D7: the "View project" label's contrast against its background across the
  // primary (accent) and secondary (neutral) variants, plus the white
  // staticColor overlay on its backdrop — all four gesture states, both themes.
  // Positive control: identical color tokens must match to 2dp.
  contrast: {
    cases: ["default", "secondary", "static-white"],
  },
  // D8: the anchor hit box for the inline (default) and standalone treatments.
  // Inline text links are legitimately below the 24px target floor in S2 (they
  // are inline content, exempt from the pointer-target minimum), so the floor is
  // only reported — the hard assertion is the pair diff: both stacks must render
  // the identical anchor border-box.
  targetSize: {
    cases: ["default", "standalone"],
  },
};

registerStateMatrixDriver(linkScenario);
registerPixelDriver(linkScenario);
registerEventSequenceDriver(linkScenario);
registerFocusTrailDriver(linkScenario);
registerMotionDriver(linkScenario);
registerAxTreeDriver(linkScenario);
registerContrastDriver(linkScenario);
registerTargetSizeDriver(linkScenario);
