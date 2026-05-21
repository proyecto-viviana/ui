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
        validationBehavior: "aria",
      });
      const tooLate = createTimeFieldState({
        defaultValue: new Time(18, 30),
        maxValue: new Time(18, 0),
        validationBehavior: "aria",
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

  it("does not force leading zeroes for default 12-hour time segments", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(9, 30),
        hourCycle: 12,
      });

      const segmentText = Object.fromEntries(
        state.segments().map((segment) => [segment.type, segment.text]),
      );

      expect(segmentText.hour).toBe("9");
      expect(segmentText.minute).toBe("30");

      dispose();
    });
  });

  it("forces leading zeroes for the hour segment when requested", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(9, 30),
        hourCycle: 12,
        shouldForceLeadingZeros: true,
      });

      const segmentText = Object.fromEntries(
        state.segments().map((segment) => [segment.type, segment.text]),
      );

      expect(segmentText.hour).toBe("09");
      expect(segmentText.minute).toBe("30");

      dispose();
    });
  });

  it("tracks range errors in realtime without displaying them for native validation", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(7, 30),
        minValue: new Time(8, 0),
      });

      expect(state.isInvalid()).toBe(false);
      expect(state.realtimeValidation().isInvalid).toBe(true);

      state.commitValidation();
      expect(state.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("displays range errors immediately for aria validation", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(7, 30),
        minValue: new Time(8, 0),
        validationBehavior: "aria",
      });

      expect(state.isInvalid()).toBe(true);
      expect(state.displayValidation().validationErrors).toContain(
        "Value is below the minimum time.",
      );

      dispose();
    });
  });

  it("tracks custom validation errors in realtime without displaying them for native validation", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(9, 30),
        validate: () => "Unavailable time",
      });

      expect(state.isInvalid()).toBe(false);
      expect(state.realtimeValidation().isInvalid).toBe(true);

      state.commitValidation();
      expect(state.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("displays custom validation errors immediately for aria validation", () => {
    createRoot((dispose) => {
      const state = createTimeFieldState({
        defaultValue: new Time(9, 30),
        validationBehavior: "aria",
        validate: () => "Unavailable time",
      });

      expect(state.isInvalid()).toBe(true);
      expect(state.displayValidation().validationErrors).toContain("Unavailable time");

      dispose();
    });
  });
});
