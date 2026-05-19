import { describe, it, expect } from "vitest";
import { createRoot } from "solid-js";
import { CalendarDate } from "@internationalized/date";
import { createDateFieldState } from "../src/calendar/createDateFieldState";

describe("createDateFieldState", () => {
  it("constrains placeholder commit to minValue on confirm", () => {
    createRoot((dispose) => {
      const minValue = new CalendarDate(2024, 6, 10);
      const state = createDateFieldState({
        placeholderValue: new CalendarDate(2024, 6, 15),
        minValue,
      });

      state.setSegment("year", 2024);
      state.setSegment("month", 6);
      state.setSegment("day", 5);
      state.confirmPlaceholder();

      const value = state.value();
      expect(value).toBeTruthy();
      expect(value?.compare(minValue)).toBe(0);

      dispose();
    });
  });

  it("constrains placeholder commit to maxValue on confirm", () => {
    createRoot((dispose) => {
      const maxValue = new CalendarDate(2024, 6, 20);
      const state = createDateFieldState({
        placeholderValue: new CalendarDate(2024, 6, 15),
        maxValue,
      });

      state.setSegment("year", 2024);
      state.setSegment("month", 6);
      state.setSegment("day", 25);
      state.confirmPlaceholder();

      const value = state.value();
      expect(value).toBeTruthy();
      expect(value?.compare(maxValue)).toBe(0);

      dispose();
    });
  });

  it("constrains existing edited value to minValue on confirm", () => {
    createRoot((dispose) => {
      const minValue = new CalendarDate(2024, 6, 10);
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2024, 6, 15),
        minValue,
      });

      state.setSegment("day", 1);
      expect(state.value()?.day).toBe(1);

      state.confirmPlaceholder();
      expect(state.value()?.compare(minValue)).toBe(0);

      dispose();
    });
  });

  it("does not modify value on confirm when already in range", () => {
    createRoot((dispose) => {
      const minValue = new CalendarDate(2024, 6, 10);
      const maxValue = new CalendarDate(2024, 6, 20);
      const initialValue = new CalendarDate(2024, 6, 15);
      const state = createDateFieldState({
        defaultValue: initialValue,
        minValue,
        maxValue,
      });

      state.confirmPlaceholder();
      expect(state.value()?.compare(initialValue)).toBe(0);

      dispose();
    });
  });

  it("does not force leading zeroes for default month and day segments", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 3),
      });

      const segmentText = Object.fromEntries(
        state.segments().map((segment) => [segment.type, segment.text]),
      );

      expect(segmentText.month).toBe("2");
      expect(segmentText.day).toBe("3");
      expect(segmentText.year).toBe("2025");

      dispose();
    });
  });
});
