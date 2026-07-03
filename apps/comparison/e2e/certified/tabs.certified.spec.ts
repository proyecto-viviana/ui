import type { DriverScenario } from "../drivers/scenario";
import { registerPixelDriver } from "../drivers/pixel";
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
};

registerStateMatrixDriver(tabsScenario);
registerPixelDriver(tabsScenario);
