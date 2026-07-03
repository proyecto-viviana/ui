import type { DriverScenario } from "../drivers/scenario";
import { registerPixelDriver } from "../drivers/pixel";
import { registerStateMatrixDriver } from "../drivers/state-matrix";

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
};

registerStateMatrixDriver(buttonScenario);
registerPixelDriver(buttonScenario);
