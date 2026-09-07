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
import { hoverLocator } from "../comparison-page";

/**
 * Recertification pilot: Button (Tier 1). Prop cases mirror the S2 docs
 * matrix; `isPending` is excluded here because the spinner animates
 * continuously — it enters through the motion driver (D2), not the
 * steady-state matrix.
 */
const buttonScenario: DriverScenario = {
  slug: "button",
  title: "Button",
  target: ({ canvas }) => canvas.getByRole("button", { name: "Save" }),
  cases: [
    { id: "accent-fill", params: { variant: "accent", fillStyle: "fill" } },
    { id: "primary-outline", params: { variant: "primary", fillStyle: "outline" } },
    { id: "negative-fill", params: { variant: "negative", fillStyle: "fill" } },
    { id: "size-s", params: { size: "S" } },
    { id: "disabled", params: { isDisabled: "true" }, states: ["default"] },
  ],
  // D4: full press-gesture matrix on the canonical case, plus the disabled
  // case, where the whole point is which events do NOT fire (no press
  // callbacks, no click, no focus on mousedown).
  events: {
    cases: ["accent-fill", "disabled"],
    gestures: standardPressGestures,
  },
  // D5: Tab enters/leaves the button identically in both panels; everything
  // beyond the canvas collapses to the outside sentinel.
  focus: {
    walks: [{ id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] }],
  },
  // D2: `transition: 'default'` on the button means hover animates the six
  // painted color properties. Normal motion remains an exact parity contract;
  // reduced motion records pinned upstream behavior separately from Viviana's
  // stricter owner accessibility budget.
  motion: {
    cases: ["primary-outline"],
    triggers: [
      {
        id: "hover-transition",
        scopes: ["panel"],
        expectedMotion: {
          normal: {
            transitionProperties: [
              "background-color",
              "border-bottom-color",
              "border-left-color",
              "border-right-color",
              "border-top-color",
              "color",
            ],
            durationMs: 150,
          },
          reduced: {
            // Pinned React Spectrum retains its normal transition set under
            // reduced motion. Record that upstream behavior without making it
            // Viviana's accessibility budget.
            react: {
              transitionProperties: [
                "background-color",
                "border-bottom-color",
                "border-left-color",
                "border-right-color",
                "border-top-color",
                "color",
              ],
              durationMs: 150,
            },
            // Viviana's owner contract removes nonessential Button transition
            // motion. A zero-duration CSS transition creates no WAAPI entry.
            solid: {
              transitionProperties: [],
              durationMs: 0,
              maxAnimationDurationMs: 0,
            },
          },
        },
        run: async ({ target }) => {
          await hoverLocator(target);
        },
        cleanup: async ({ page }) => {
          await clearPointer(page);
        },
        settleMs: 160,
      },
    ],
  },
  // D6: the button's resting AX node — role "button", accessible name "Save",
  // and the `[disabled]` state on the disabled case — must match. A plain
  // button emits no announcements, so no `announce` triggers here; the
  // announcement half is calibrated by ComboBox/Toast in the march.
  ax: {
    cases: ["accent-fill", "disabled"],
  },
  // D7: the "Save" label's contrast on the accent fill (white on accent-800),
  // the outline variant (accent text on the page background), and the disabled
  // fill — all four gesture states, both themes. Positive control: the port and
  // upstream carry identical color tokens, so every ratio must match to 2dp.
  contrast: {
    cases: ["accent-fill", "primary-outline", "disabled"],
  },
  // D8: the button hit box across the M (accent-fill) and S (size-s) sizes.
  // A single button per canvas; both stacks must render the identical
  // border-box, and the 24px/44px floors are reported.
  targetSize: {
    cases: ["accent-fill", "size-s", "disabled"],
  },
};

registerStateMatrixDriver(buttonScenario);
registerPixelDriver(buttonScenario);
registerEventSequenceDriver(buttonScenario);
registerFocusTrailDriver(buttonScenario);
registerMotionDriver(buttonScenario);
registerAxTreeDriver(buttonScenario);
registerContrastDriver(buttonScenario);
registerTargetSizeDriver(buttonScenario);
