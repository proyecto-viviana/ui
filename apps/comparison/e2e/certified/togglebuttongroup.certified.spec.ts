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
 * Recertification march unit (Tier 1): ToggleButtonGroup — three linked
 * ToggleButtons sharing one selection. The defining axes over a lone
 * ToggleButton are (a) the group container's layout treatments (orientation,
 * density, justified) and (b) the ARIA role polymorphism driven by
 * `selectionMode`:
 *   - `single`   → group `role="radiogroup"`, items `role="radio"` with
 *                  `aria-checked` (mutually-exclusive selection);
 *   - `multiple` → group `role="toolbar"`, items keep `role="button"` with
 *                  `aria-pressed` (independent toggles).
 * Both are built on `createToolbar`, so arrow keys ROVE focus without selecting;
 * a press/click is what flips selection. D6 is the primary witness of the
 * role/state polymorphism; D4 witnesses the press-driven selection change.
 *
 * Target strategy: `getByRole` cannot span the radio/button polymorphism, so
 * the gesture/measure target is the initially UNSELECTED "Center" item located
 * as a native `<button>` by its visible label — a real, symmetric selection
 * change on press in either mode, and a locator that resolves for every case.
 * The group container and the selected "Left" item ride along as D1 parts.
 * D3/D6/D7/D8 walk the whole canvas, so they are role-agnostic by construction.
 */
const toggleButtonGroupScenario: DriverScenario = {
  slug: "togglebuttongroup",
  title: "ToggleButtonGroup",
  target: ({ canvas }) => canvas.locator("button", { hasText: "Center" }),
  parts: {
    group: ({ canvas }) => canvas.locator('[data-comparison-group-root="togglebuttongroup"]'),
    "selected-item": ({ canvas }) => canvas.locator("button", { hasText: "Left" }),
  },
  cases: [
    { id: "default" },
    { id: "multiple", params: { selectionMode: "multiple" } },
    { id: "vertical", params: { orientation: "vertical" } },
    { id: "compact", params: { density: "compact" } },
    { id: "quiet", params: { isQuiet: "true" } },
    { id: "emphasized", params: { isEmphasized: "true" } },
    { id: "justified", params: { isJustified: "true" } },
    { id: "size-s", params: { size: "S" } },
    { id: "size-xl", params: { size: "XL" } },
    { id: "disabled", params: { isDisabled: "true" }, states: ["default"] },
  ],
  // D4: pressing an unselected item flips the shared selection. The canonical
  // `single` case must show press events AND onSelectionChange interleaved
  // identically; `multiple` proves the independent-toggle path (aria-pressed);
  // `disabled` proves the group-level disable suppresses every press callback.
  // This is also the driver that catches the fixture's memo-rebuild focus-loss
  // anti-pattern: a selection
  // change that unmounts the pressed button emits a trailing focusout the React
  // oracle never fires.
  events: {
    cases: ["default", "multiple", "disabled"],
    gestures: standardPressGestures,
  },
  // D5: Tab enters/leaves the group's single roving stop, and arrows rove focus
  // across the items (toolbar semantics — move focus, do NOT select). The roving
  // snapshot must show exactly one item at tabindex=0 after every key, matching
  // the oracle; Home/End jump to the ends.
  focus: {
    cases: ["default"],
    walks: [
      { id: "tab-cycle", keys: ["Tab", "Shift+Tab", "Shift+Tab"] },
      {
        id: "arrow-roving",
        start: ({ canvas }) => canvas.locator("button", { hasText: "Left" }),
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "Home", "End"],
      },
    ],
  },
  // D2: the shared `transition: 'default'` on the action-button style animates
  // the item background/color on hover. Port and upstream carry the same token,
  // so the captured transition must match — a positive control.
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
  // D6: the role polymorphism is the headline. `single` must show
  // `radiogroup` › `radio` with `[checked]` on the selected item; `multiple`
  // must show `toolbar` › `button` with `[pressed]`; `disabled` propagates
  // `[disabled]` to every item. Any drift in how the port threads
  // role/aria-checked/aria-pressed by selection mode surfaces here.
  ax: {
    cases: ["default", "multiple", "disabled"],
  },
  // D7: each item label's contrast on the resting, selected (default vs
  // emphasized fill), and disabled treatments, both themes. Positive control:
  // identical color tokens must match to 2dp.
  contrast: {
    cases: ["default", "emphasized", "disabled"],
  },
  // D8: every item hit box across M (default), S, XL, and compact density, plus
  // the disabled group. The canvas root measures all three native buttons; both
  // stacks must render identical border-boxes and report the 24/44px floors.
  targetSize: {
    cases: ["default", "size-s", "size-xl", "compact", "disabled"],
  },
};

registerStateMatrixDriver(toggleButtonGroupScenario);
registerPixelDriver(toggleButtonGroupScenario);
registerEventSequenceDriver(toggleButtonGroupScenario);
registerFocusTrailDriver(toggleButtonGroupScenario);
registerMotionDriver(toggleButtonGroupScenario);
registerAxTreeDriver(toggleButtonGroupScenario);
registerContrastDriver(toggleButtonGroupScenario);
registerTargetSizeDriver(toggleButtonGroupScenario);
