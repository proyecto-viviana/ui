import { mouseClickGesture, registerEventSequenceDriver, touchTapGesture } from "../drivers/events";
import { registerFocusTrailDriver } from "../drivers/focus";
import { registerPixelDriver } from "../drivers/pixel";
import type { DriverScenario } from "../drivers/scenario";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

/**
 * Recertification pilot: Tabs. The gesture target is the initially
 * unselected "Parity" tab so hover/press drive real state transitions
 * (pressing selects it — in both panels alike, which is exactly what the
 * pair oracle compares). Parts cover the tablist container, the initially
 * selected tab, and the active tabpanel; part locators re-resolve on every
 * capture, so the tabpanel swap after selection is handled naturally.
 */
const tabsScenario: DriverScenario = {
  slug: "tabs",
  title: "Tabs",
  target: ({ canvas }) => canvas.getByRole("tab", { name: "Parity" }),
  parts: {
    tablist: ({ canvas }) => canvas.getByRole("tablist"),
    "selected-tab": ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
    tabpanel: ({ canvas }) => canvas.getByRole("tabpanel"),
  },
  cases: [
    { id: "horizontal-regular" },
    { id: "vertical-compact", params: { orientation: "vertical", density: "compact" } },
    { id: "disabled-all", params: { isDisabled: "true" }, states: ["default"] },
  ],
  // D4: pointer and touch selection of an unselected tab, plus arrow-key
  // roving from the selected tab (automatic activation: the arrow both moves
  // focus and selects, so onSelectionChange must interleave identically).
  events: {
    cases: ["horizontal-regular"],
    gestures: [
      mouseClickGesture,
      touchTapGesture,
      {
        id: "arrow-next-from-selected",
        target: ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
        run: async ({ page, target }) => {
          await target.focus();
          await page.keyboard.press("ArrowRight");
        },
      },
    ],
  },
  // D5: the roving-tabindex walk — arrows, Home, End across the tablist; the
  // roving snapshot must show exactly one tab at tabindex=0 after every key.
  focus: {
    cases: ["horizontal-regular"],
    walks: [
      {
        id: "arrow-roving",
        start: ({ canvas }) => canvas.getByRole("tab", { name: "Overview" }),
        keys: ["ArrowRight", "ArrowRight", "ArrowLeft", "Home", "End"],
      },
    ],
  },
};

registerStateMatrixDriver(tabsScenario);
registerPixelDriver(tabsScenario);
registerEventSequenceDriver(tabsScenario);
registerFocusTrailDriver(tabsScenario);
