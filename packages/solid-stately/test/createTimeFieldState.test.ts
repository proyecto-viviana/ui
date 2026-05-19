import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { Time } from "@internationalized/date";
import { createTimeFieldState } from "../src/calendar/createTimeFieldState";

describe("createTimeFieldState", () => {
  it("reflects explicit invalid validation state without a value", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        validationState: "invalid",
      });

      expect(state.value()).toBeNull();
      expect(state.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("marks values outside min and max as invalid", () => {
    createRoot((dispose) => {
      const tooEarly = createTimeFieldState({
        defaultValue: new Time(7, 30),
        minValue: new Time(8, 0),
      });
      const tooLate = createTimeFieldState({
        defaultValue: new Time(18, 30),
        maxValue: new Time(18, 0),
      });

      expect(tooEarly.isInvalid()).toBe(true);
      expect(tooLate.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("keeps in-range values valid", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(9, 30),
        minValue: new Time(8, 0),
        maxValue: new Time(18, 0),
      });

      expect(state.isInvalid()).toBe(false);

      dispose();
    });
  });
});
