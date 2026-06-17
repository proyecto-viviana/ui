import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { CalendarDate } from "@internationalized/date";
import { createDateFieldState } from "../src/calendar/createDateFieldState";

describe("createDateFieldState", () => {
  it("reflects explicit invalid validation state without a value", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        validationState: "invalid",
      });

      expect(state.value()).toBeNull();
      expect(state.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("keeps a typed value below minValue as-is and reports rangeUnderflow", () => {
    createRoot((dispose) => {
      const minValue = new CalendarDate(2024, 6, 10);
      const state = createDateFieldState({
        placeholderValue: new CalendarDate(2024, 6, 15),
        minValue,
      });

      state.setSegment("year", 2024);
      state.setSegment("month", 6);
      state.setSegment("day", 5);
      // Blurring must not snap an out-of-range value to the minimum (upstream parity).
      state.confirmPlaceholder();

      const value = state.value();
      expect(value).toBeTruthy();
      expect(value?.compare(new CalendarDate(2024, 6, 5))).toBe(0);
      expect(value?.compare(minValue)).toBeLessThan(0);
      expect(state.realtimeValidation().validationDetails.rangeUnderflow).toBe(true);

      dispose();
    });
  });

  it("keeps a typed value above maxValue as-is and reports rangeOverflow", () => {
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
      expect(value?.compare(new CalendarDate(2024, 6, 25))).toBe(0);
      expect(value?.compare(maxValue)).toBeGreaterThan(0);
      expect(state.realtimeValidation().validationDetails.rangeOverflow).toBe(true);

      dispose();
    });
  });

  it("keeps an existing edited value below minValue as-is and reports rangeUnderflow", () => {
    createRoot((dispose) => {
      const minValue = new CalendarDate(2024, 6, 10);
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2024, 6, 15),
        minValue,
      });

      state.setSegment("day", 1);
      expect(state.value()?.day).toBe(1);

      state.confirmPlaceholder();
      expect(state.value()?.compare(new CalendarDate(2024, 6, 1))).toBe(0);
      expect(state.value()?.compare(minValue)).toBeLessThan(0);
      expect(state.realtimeValidation().validationDetails.rangeUnderflow).toBe(true);

      dispose();
    });
  });

  it("holds an invalid day-of-month while typing and constrains it on blur", () => {
    createRoot((dispose) => {
      const onChange = vi.fn();
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2023, 1, 31),
        onChange,
      });

      // Editing the month to February yields an impossible February 31st. Upstream
      // holds the typed value (no onChange) until the field is blurred.
      state.setSegment("month", 2);

      expect(state.value()?.month).toBe(1);
      expect(state.value()?.day).toBe(31);
      expect(onChange).not.toHaveBeenCalled();

      const segmentText = Object.fromEntries(
        state.segments().map((segment) => [segment.type, segment.text]),
      );
      expect(segmentText.month).toBe("2");
      expect(segmentText.day).toBe("31");

      // Blur constrains February 31st to the last valid day of the month and commits.
      state.confirmPlaceholder();

      expect(state.value()?.compare(new CalendarDate(2023, 2, 28))).toBe(0);
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0][0]?.compare(new CalendarDate(2023, 2, 28))).toBe(0);

      dispose();
    });
  });

  it("commits a complete, valid edit eagerly", () => {
    createRoot((dispose) => {
      const onChange = vi.fn();
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2024, 6, 15),
        onChange,
      });

      state.setSegment("day", 20);

      expect(state.value()?.compare(new CalendarDate(2024, 6, 20))).toBe(0);
      expect(onChange).toHaveBeenCalledTimes(1);

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

  it("forces leading zeroes for month and day segments when requested", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 3),
        shouldForceLeadingZeros: true,
      });

      const segmentText = Object.fromEntries(
        state.segments().map((segment) => [segment.type, segment.text]),
      );

      expect(segmentText.month).toBe("02");
      expect(segmentText.day).toBe("03");
      expect(segmentText.year).toBe("2025");

      dispose();
    });
  });

  it("tracks unavailable dates in realtime without displaying them for native validation", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 10),
        isDateUnavailable: (date) => date.day === 10,
      });

      expect(state.isInvalid()).toBe(false);
      expect(state.realtimeValidation().isInvalid).toBe(true);

      state.commitValidation();
      expect(state.isInvalid()).toBe(true);

      dispose();
    });
  });

  it("displays unavailable dates immediately for aria validation", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 10),
        validationBehavior: "aria",
        isDateUnavailable: (date) => date.day === 10,
      });

      expect(state.isInvalid()).toBe(true);
      expect(state.displayValidation().validationErrors).toContain("Date is unavailable.");

      dispose();
    });
  });

  it("tracks custom validation errors in realtime without displaying them for native validation", () => {
    createRoot((dispose) => {
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 3),
        validate: () => "Unavailable date",
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
      const state = createDateFieldState({
        defaultValue: new CalendarDate(2025, 2, 3),
        validationBehavior: "aria",
        validate: () => "Unavailable date",
      });

      expect(state.isInvalid()).toBe(true);
      expect(state.displayValidation().validationErrors).toContain("Unavailable date");

      dispose();
    });
  });
});
