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
 * Recertification march unit (Tier 1): ToggleButton — a selectable
 * ActionButton. Prop cases mirror the S2 ToggleButton docs matrix. The
 * defining axis over plain Button is the toggle state: pressing flips
 * `isSelected`, which drives `aria-pressed` (surfaced by D6 as `[pressed]`)
 * and the selected fill treatment (surfaced by D1/D3). The `emphasized`,
 * `quiet`, and `staticColor` treatments only differ meaningfully once
 * selected, so the selected cases carry them.
 *
 * Default label is "Pin"; the button keeps role "button" regardless of
 * selection, so `getByRole("button", { name: "Pin" })` resolves every case.
 */
const toggleButtonScenario: DriverScenario = {
  slug: "togglebutton",
  title: "ToggleButton",
  target: ({ canvas }) => canvas.getByRole("button", { name: "Pin" }),
  cases: [
    { id: "default" },
    { id: "selected", params: { isSelected: "true" } },
    { id: "emphasized-selected", params: { isEmphasized: "true", isSelected: "true" } },
    { id: "quiet", params: { isQuiet: "true" } },
    { id: "quiet-selected", params: { isQuiet: "true", isSelected: "true" } },
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    { id: "disabled", params: { isDisabled: "true" }, states: ["default"] },
    {
      id: "disabled-selected",
      params: { isDisabled: "true", isSelected: "true" },
      states: ["default"],
    },
  ],
  // D4: the toggle press. On the canonical case a full press cycle flips
  // selection, so the log must show press events AND onChange at the same
  // ordered position in both stacks. On the disabled case the whole point is
  // which events do NOT fire (no press callbacks, no click, no onChange).
  events: {
    cases: ["default", "disabled"],
    gestures: standardPressGestures,
  },
  // D5: Tab enters/leaves the toggle button identically in both panels;
  // everything beyond the canvas collapses to the outside sentinel.
  focus: {
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] }],
  },
  // D2: `transition: 'default'` on the action-button style (shared by
  // ToggleButton) animates the background/color on hover. Port and upstream
  // carry the same token, so the captured transition must match — a positive
  // control that proves matching motion reports green.
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
  // D6: the toggle AX node. The resting node is `button "Pin"`; the selected
  // case must add `[pressed]` (aria-pressed), and the disabled case `[disabled]`
  // — the toggle-state semantics that distinguish this from a plain button. Any
  // divergence in how the port threads `aria-pressed` surfaces here.
  ax: {
    cases: ["default", "selected", "disabled"],
  },
  // D7: the "Pin" label's contrast on the resting (unselected neutral) fill,
  // the selected fill, and the disabled fill — all four gesture states, both
  // themes. Positive control: identical color tokens must match to 2dp.
  contrast: {
    cases: ["default", "selected", "disabled"],
  },
  // D8: the toggle hit box across the M (default), S, and XL sizes, plus the
  // disabled case. A single button per canvas; both stacks must render the
  // identical border-box, and the 24px/44px floors are reported.
  targetSize: {
    cases: ["default", "size-s", "size-xl", "disabled"],
  },
};

registerStateMatrixDriver(toggleButtonScenario);
registerPixelDriver(toggleButtonScenario);
registerEventSequenceDriver(toggleButtonScenario);
registerFocusTrailDriver(toggleButtonScenario);
registerMotionDriver(toggleButtonScenario);
registerAxTreeDriver(toggleButtonScenario);
registerContrastDriver(toggleButtonScenario);
registerTargetSizeDriver(toggleButtonScenario);
