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
 * Recertification march unit (Tier 1): ActionButton — the neutral, icon-capable
 * command button that also backs ToggleButton and the ActionButtonGroup items.
 * The steady-state prop cases mirror the S2 ActionButton docs matrix (size,
 * quiet, disabled). The axis that distinguishes ActionButton from a plain
 * Button is `isPending`: a pending button stays focusable, flips to
 * `aria-disabled`, suppresses its press handlers, and — after a deliberate 1s
 * delay — swaps its label for a ProgressCircle.
 *
 * The pending spinner mounts on a wall-clock timer, so the two panels' captures
 * could straddle the 1s boundary and disagree; the `pending` case is therefore
 * marked `steadyState: false` (excluded from the D1/D3 style/pixel capture) and
 * certified only through the interaction drivers that read a deterministic
 * moment: D4 (press suppression, immediate) and D6 (the pre-spinner aria state
 * at the 120ms AX settle).
 *
 * Default label is "Inspect"; the button keeps role "button" in every case
 * (pending re-exposes the label via `aria-label`), so
 * `getByRole("button", { name: "Inspect" })` resolves every case.
 */
const actionButtonScenario: DriverScenario = {
  slug: "actionbutton",
  title: "ActionButton",
  target: ({ canvas }) => canvas.getByRole("button", { name: "Inspect" }),
  cases: [
    { id: "default" },
    { id: "quiet", params: { isQuiet: "true" } },
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    { id: "disabled", params: { isDisabled: "true" }, states: ["default"] },
    // Pending: focusable + aria-disabled + press-suppressed immediately, but its
    // ProgressCircle only mounts after a 1s delay. Kept out of the steady-state
    // capture (steadyState: false); exercised by D4 (no press callbacks fire)
    // and D6 (aria-disabled while still in tab order, pre-spinner).
    {
      id: "pending",
      params: { isPending: "true" },
      states: ["default"],
      steadyState: false,
    },
  ],
  // D4: the command press. On the canonical case a full press cycle fires the
  // ordered press callbacks + onPress at the same log position in both stacks.
  // On the disabled case, no press callbacks and no onPress. On the pending
  // case the native pointer/keyboard events still reach the focusable button,
  // but usePress must suppress every press callback and onPress in both stacks —
  // the defining pending contract.
  events: {
    cases: ["default", "disabled", "pending"],
    gestures: standardPressGestures,
  },
  // D5: Tab enters/leaves the action button identically in both panels;
  // everything beyond the canvas collapses to the outside sentinel.
  focus: {
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] }],
  },
  // D2: `transition: 'default'` on the action-button style animates the
  // background/color on hover. Port and upstream carry the same token, so the
  // captured transition must match — the positive control that proves matching
  // motion reports green.
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
  // D6: the AX node. Resting is `button "Inspect"`; disabled adds `[disabled]`;
  // pending must ALSO present `aria-disabled` (surfaced as `[disabled]`) while
  // keeping the button in the tab order (isPendingFocusable) and re-exposing the
  // accessible name via `aria-label`. Captured at the 120ms AX settle, before
  // the 1s ProgressCircle mounts, so the pending node is deterministic.
  ax: {
    cases: ["default", "disabled", "pending"],
  },
  // D7: the "Inspect" label's contrast on the resting neutral fill, the quiet
  // (transparent) fill, and the disabled fill — all four gesture states, both
  // themes. Positive control: identical color tokens must match to 2dp.
  contrast: {
    cases: ["default", "quiet", "disabled"],
  },
  // D8: the action-button hit box across M (default), S, and XL, plus disabled.
  // A single button per canvas; both stacks must render the identical
  // border-box, and the 24px/44px floors are reported.
  targetSize: {
    cases: ["default", "size-s", "size-xl", "disabled"],
  },
};

registerStateMatrixDriver(actionButtonScenario);
registerPixelDriver(actionButtonScenario);
registerEventSequenceDriver(actionButtonScenario);
registerFocusTrailDriver(actionButtonScenario);
registerMotionDriver(actionButtonScenario);
registerAxTreeDriver(actionButtonScenario);
registerContrastDriver(actionButtonScenario);
registerTargetSizeDriver(actionButtonScenario);
