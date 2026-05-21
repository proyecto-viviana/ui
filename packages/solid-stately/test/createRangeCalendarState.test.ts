/**
 * Tests for createRangeCalendarState
 *
 * Ported from @react-stately/calendar's useRangeCalendarState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import {
  createRangeCalendarState,
  type RangeValue,
} from "../src/calendar/createRangeCalendarState";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  createCalendar as createIntlCalendar,
} from "@internationalized/date";

describe("createRangeCalendarState", () => {
  const timeZone = getLocalTimeZone();
  const flushEffects = () => Promise.resolve();

  describe("basic state management", () => {
    it("should return null by default", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const defaultRange = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          defaultValue: defaultRange,
        });

        expect(state.value()?.start).toEqual(defaultRange.start);
        expect(state.value()?.end).toEqual(defaultRange.end);

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const controlledRange = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          value: controlledRange,
        });

        expect(state.value()?.start).toEqual(controlledRange.start);
        expect(state.value()?.end).toEqual(controlledRange.end);

        dispose();
      });
    });

    it("should handle controlled null state", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          value: null,
        });

        expect(state.value()).toBe(null);

        dispose();
      });
    });
  });

  describe("focused date", () => {
    it("should default to today when no value or focusedValue is provided", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const todayDate = today(timeZone);

        expect(state.focusedDate().year).toBe(todayDate.year);
        expect(state.focusedDate().month).toBe(todayDate.month);
        expect(state.focusedDate().day).toBe(todayDate.day);

        dispose();
      });
    });

    it("should use defaultFocusedValue for initial focus", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 3, 10);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        expect(state.focusedDate()).toEqual(focusDate);

        dispose();
      });
    });

    it("should use focusedValue for controlled focus", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 3, 10);
        const state = createRangeCalendarState({
          focusedValue: focusDate,
        });

        expect(state.focusedDate()).toEqual(focusDate);

        dispose();
      });
    });

    it("should use range start as initial focused date when no focused value provided", () => {
      createRoot((dispose) => {
        const range = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          defaultValue: range,
        });

        expect(state.focusedDate()).toEqual(range.start);

        dispose();
      });
    });

    it("should constrain the initial focused date without firing onFocusChange", () => {
      createRoot((dispose) => {
        const onFocusChange = vi.fn();
        const minValue = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 5),
          minValue,
          onFocusChange,
        });

        expect(state.focusedDate()).toEqual(minValue);
        expect(onFocusChange).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe("range selection", () => {
    it("should set anchor date on first click", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const date = new CalendarDate(2024, 6, 15);

        expect(state.anchorDate()).toBe(null);

        state.selectDate(date);

        expect(state.anchorDate()).toEqual(date);
        expect(state.isDragging()).toBe(true);
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should complete range on second click", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const startDate = new CalendarDate(2024, 6, 10);
        const endDate = new CalendarDate(2024, 6, 20);

        state.selectDate(startDate);
        state.selectDate(endDate);

        expect(state.anchorDate()).toBe(null);
        expect(state.isDragging()).toBe(false);
        expect(state.value()?.start).toEqual(startDate);
        expect(state.value()?.end).toEqual(endDate);

        dispose();
      });
    });

    it("should swap dates if end is before start", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const laterDate = new CalendarDate(2024, 6, 20);
        const earlierDate = new CalendarDate(2024, 6, 10);

        // Click later date first
        state.selectDate(laterDate);
        // Then click earlier date
        state.selectDate(earlierDate);

        // Should swap so start is before end
        expect(state.value()?.start).toEqual(earlierDate);
        expect(state.value()?.end).toEqual(laterDate);

        dispose();
      });
    });

    it("should update highlighted range during selection", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const startDate = new CalendarDate(2024, 6, 10);
        const hoverDate = new CalendarDate(2024, 6, 15);

        state.selectDate(startDate);
        state.setFocusedDate(hoverDate);

        const highlighted = state.highlightedRange();
        expect(highlighted?.start).toEqual(startDate);
        expect(highlighted?.end).toEqual(hoverDate);

        dispose();
      });
    });

    it("should call onChange when range is completed", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createRangeCalendarState({ onChange });
        const startDate = new CalendarDate(2024, 6, 10);
        const endDate = new CalendarDate(2024, 6, 20);

        state.selectDate(startDate);
        expect(onChange).not.toHaveBeenCalled();

        state.selectDate(endDate);
        expect(onChange).toHaveBeenCalledWith({
          start: startDate,
          end: endDate,
        });

        dispose();
      });
    });

    it("should select focused date", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        state.selectFocusedDate();

        expect(state.anchorDate()).toEqual(focusDate);
        expect(state.isDragging()).toBe(true);

        dispose();
      });
    });
  });

  describe("readonly and disabled behavior", () => {
    it("should ignore selection when disabled", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDisabled: true,
        });
        const date = new CalendarDate(2024, 6, 15);

        state.selectDate(date);
        expect(state.anchorDate()).toBe(null);
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should ignore selection when readonly", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isReadOnly: true,
        });
        const date = new CalendarDate(2024, 6, 15);

        state.selectDate(date);
        expect(state.anchorDate()).toBe(null);
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should not complete range when disabled", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const startDate = new CalendarDate(2024, 6, 10);

        // Start selection
        state.selectDate(startDate);
        expect(state.anchorDate()).toEqual(startDate);

        // Dynamically disable - simulated by creating new state
        const disabledState = createRangeCalendarState({
          isDisabled: true,
        });
        disabledState.setAnchorDate(startDate);

        // Try to complete
        const endDate = new CalendarDate(2024, 6, 20);
        disabledState.selectDate(endDate);

        expect(disabledState.value()).toBe(null);

        dispose();
      });
    });
  });

  describe("navigation", () => {
    it("should move to previous month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPreviousPage();
        expect(state.focusedDate().month).toBe(5);
        expect(state.focusedDate().year).toBe(2024);

        dispose();
      });
    });

    it("should move to next month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusNextPage();
        expect(state.focusedDate().month).toBe(7);
        expect(state.focusedDate().year).toBe(2024);

        dispose();
      });
    });

    it("should page by one month when pageBehavior is a single accessor", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const [pageBehavior] = createSignal<"single" | "visible">("single");
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
          visibleMonths: 2,
          pageBehavior,
        });

        state.focusNextPage();
        expect(state.focusedDate().month).toBe(7);
        expect(state.focusedDate().year).toBe(2024);

        dispose();
      });
    });

    it("should move to previous year", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPreviousSection();
        expect(state.focusedDate().year).toBe(2023);
        expect(state.focusedDate().month).toBe(6);

        dispose();
      });
    });

    it("should move to next year", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusNextSection();
        expect(state.focusedDate().year).toBe(2025);
        expect(state.focusedDate().month).toBe(6);

        dispose();
      });
    });

    it("should move to previous day", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPreviousDay();
        expect(state.focusedDate().day).toBe(14);

        dispose();
      });
    });

    it("should move to next day", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusNextDay();
        expect(state.focusedDate().day).toBe(16);

        dispose();
      });
    });

    it("should move to previous week", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPreviousWeek();
        expect(state.focusedDate().day).toBe(8);

        dispose();
      });
    });

    it("should move to next week", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusNextWeek();
        expect(state.focusedDate().day).toBe(22);

        dispose();
      });
    });

    it("should move to start of month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPageStart();
        expect(state.focusedDate().day).toBe(1);
        expect(state.focusedDate().month).toBe(6);

        dispose();
      });
    });

    it("should move to end of month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPageEnd();
        expect(state.focusedDate().day).toBe(30);
        expect(state.focusedDate().month).toBe(6);

        dispose();
      });
    });
  });

  describe("min/max constraints", () => {
    it("should constrain focus to min date", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          minValue: minDate,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        // Try to focus before min
        state.setFocusedDate(new CalendarDate(2024, 6, 5));
        expect(state.focusedDate()).toEqual(minDate);

        dispose();
      });
    });

    it("should constrain focus to max date", () => {
      createRoot((dispose) => {
        const maxDate = new CalendarDate(2024, 6, 20);
        const state = createRangeCalendarState({
          maxValue: maxDate,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        // Try to focus after max
        state.setFocusedDate(new CalendarDate(2024, 6, 25));
        expect(state.focusedDate()).toEqual(maxDate);

        dispose();
      });
    });

    it("should mark dates before min as disabled", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          minValue: minDate,
        });

        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(true);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 10))).toBe(false);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });

    it("should mark dates after max as disabled", () => {
      createRoot((dispose) => {
        const maxDate = new CalendarDate(2024, 6, 20);
        const state = createRangeCalendarState({
          maxValue: maxDate,
        });

        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(true);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 20))).toBe(false);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });

    it("should not select disabled dates", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          minValue: minDate,
        });

        const disabledDate = new CalendarDate(2024, 6, 5);
        state.selectDate(disabledDate);

        expect(state.anchorDate()).toBe(null);

        dispose();
      });
    });
  });

  describe("cell state checks", () => {
    it("should check if date is selected (in range)", () => {
      createRoot((dispose) => {
        const range = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          defaultValue: range,
        });

        expect(state.isSelected(new CalendarDate(2024, 6, 5))).toBe(false);
        expect(state.isSelected(new CalendarDate(2024, 6, 10))).toBe(true);
        expect(state.isSelected(new CalendarDate(2024, 6, 15))).toBe(true);
        expect(state.isSelected(new CalendarDate(2024, 6, 20))).toBe(true);
        expect(state.isSelected(new CalendarDate(2024, 6, 25))).toBe(false);

        dispose();
      });
    });

    it("should check if date is selection start", () => {
      createRoot((dispose) => {
        const range = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          defaultValue: range,
        });

        expect(state.isSelectionStart(new CalendarDate(2024, 6, 10))).toBe(true);
        expect(state.isSelectionStart(new CalendarDate(2024, 6, 15))).toBe(false);
        expect(state.isSelectionStart(new CalendarDate(2024, 6, 20))).toBe(false);

        dispose();
      });
    });

    it("should check if date is selection end", () => {
      createRoot((dispose) => {
        const range = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const state = createRangeCalendarState({
          defaultValue: range,
        });

        expect(state.isSelectionEnd(new CalendarDate(2024, 6, 10))).toBe(false);
        expect(state.isSelectionEnd(new CalendarDate(2024, 6, 15))).toBe(false);
        expect(state.isSelectionEnd(new CalendarDate(2024, 6, 20))).toBe(true);

        dispose();
      });
    });

    it("should check if date is focused", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        expect(state.isCellFocused(new CalendarDate(2024, 6, 14))).toBe(false);
        expect(state.isCellFocused(new CalendarDate(2024, 6, 15))).toBe(true);
        expect(state.isCellFocused(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should check if date is unavailable", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDateUnavailable: (date) => {
            const calDate = date as CalendarDate;
            return calDate.day === 15;
          },
        });

        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 14))).toBe(false);
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 15))).toBe(true);
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should mark unavailable dates as invalid", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDateUnavailable: (date) => {
            const calDate = date as CalendarDate;
            return calDate.day === 15;
          },
        });

        expect(state.isInvalid(new CalendarDate(2024, 6, 14))).toBe(false);
        expect(state.isInvalid(new CalendarDate(2024, 6, 15))).toBe(true);

        dispose();
      });
    });

    it("should not select unavailable dates", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDateUnavailable: (date) => {
            const calDate = date as CalendarDate;
            return calDate.day === 15;
          },
        });

        const unavailableDate = new CalendarDate(2024, 6, 15);
        state.selectDate(unavailableDate);

        expect(state.anchorDate()).toBe(null);

        dispose();
      });
    });
  });

  describe("visible range", () => {
    it("should return correct visible range for single month", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        const range = state.visibleRange();
        expect(range.start.year).toBe(2024);
        expect(range.start.month).toBe(6);
        expect(range.start.day).toBe(1);
        expect(range.end.year).toBe(2024);
        expect(range.end.month).toBe(6);
        expect(range.end.day).toBe(30);

        dispose();
      });
    });

    it("should extend visible range for multiple months", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
          visibleMonths: 2,
        });

        const range = state.visibleRange();
        expect(range.start.month).toBe(6);
        expect(range.end.month).toBe(7);
        expect(range.end.day).toBe(31);

        dispose();
      });
    });

    it("should check if date is outside visible range", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 5, 15))).toBe(true);
        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 6, 15))).toBe(false);
        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 7, 15))).toBe(true);

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        expect(state.isFocused()).toBe(false);

        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        state.setFocused(false);
        expect(state.isFocused()).toBe(false);

        dispose();
      });
    });

    it("should call onFocusChange when focus changes", () => {
      createRoot((dispose) => {
        const onFocusChange = vi.fn();
        const state = createRangeCalendarState({
          onFocusChange,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        const newDate = new CalendarDate(2024, 6, 20);
        state.setFocusedDate(newDate);

        expect(onFocusChange).toHaveBeenCalledWith(newDate);

        dispose();
      });
    });

    it("should not call onFocusChange when setting the same focused date object", () => {
      createRoot((dispose) => {
        const onFocusChange = vi.fn();
        const focusedDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusedDate,
          onFocusChange,
        });

        state.setFocusedDate(state.focusedDate());

        expect(onFocusChange).not.toHaveBeenCalled();

        dispose();
      });
    });

    it("should constrain focused date when minValue changes and then call onFocusChange", async () => {
      let dispose!: () => void;
      const [minValue, setMinValue] = createSignal<CalendarDate | undefined>();
      let state!: ReturnType<typeof createRangeCalendarState>;
      const snapshots: Array<{ date: CalendarDate; focusedDate: CalendarDate }> = [];

      state = createRoot((disposeRoot) => {
        dispose = disposeRoot;
        return createRangeCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          get minValue() {
            return minValue();
          },
          onFocusChange: (date) => {
            snapshots.push({ date, focusedDate: state.focusedDate() });
          },
        });
      });

      setMinValue(new CalendarDate(2024, 6, 20));
      await flushEffects();

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 6, 20));
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].date).toEqual(new CalendarDate(2024, 6, 20));
      expect(snapshots[0].focusedDate).toEqual(new CalendarDate(2024, 6, 20));

      dispose();
    });
  });

  describe("controlled vs uncontrolled modes", () => {
    it("should not change internal state in controlled mode", () => {
      createRoot((dispose) => {
        const range = {
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        };
        const onChange = vi.fn();
        const state = createRangeCalendarState({
          value: range,
          onChange,
        });

        // Try to set new value
        state.setValue({
          start: new CalendarDate(2024, 7, 1),
          end: new CalendarDate(2024, 7, 10),
        });

        // Value should NOT change in controlled mode
        expect(state.value()?.start).toEqual(range.start);
        expect(state.value()?.end).toEqual(range.end);

        // But onChange should be called
        expect(onChange).toHaveBeenCalled();

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<RangeValue<CalendarDate> | null>({
          start: new CalendarDate(2024, 6, 10),
          end: new CalendarDate(2024, 6, 20),
        });
        const state = createRangeCalendarState({
          get value() {
            return value();
          },
        });

        expect(state.value()?.start.day).toBe(10);
        expect(state.value()?.end.day).toBe(20);

        setValue({
          start: new CalendarDate(2024, 7, 5),
          end: new CalendarDate(2024, 7, 15),
        });

        expect(state.value()?.start.month).toBe(7);
        expect(state.value()?.start.day).toBe(5);
        expect(state.value()?.end.day).toBe(15);

        dispose();
      });
    });

    it("should call onChange with null when clearing an uncontrolled value", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createRangeCalendarState({
          defaultValue: {
            start: new CalendarDate(2024, 6, 10),
            end: new CalendarDate(2024, 6, 20),
          },
          onChange,
        });

        state.setValue(null);

        expect(state.value()).toBe(null);
        expect(onChange).toHaveBeenCalledWith(null);

        dispose();
      });
    });

    it("should sync controlled focusedValue changes without calling onFocusChange", async () => {
      let dispose!: () => void;
      const [focusedValue, setFocusedValue] = createSignal<CalendarDate | null>(
        new CalendarDate(2024, 2, 15),
      );
      const onFocusChange = vi.fn();
      const state = createRoot((disposeRoot) => {
        dispose = disposeRoot;
        return createRangeCalendarState({
          get focusedValue() {
            return focusedValue();
          },
          onFocusChange,
        });
      });

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 2, 15));

      setFocusedValue(new CalendarDate(2024, 5, 15));
      await flushEffects();

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 5, 15));
      expect(onFocusChange).not.toHaveBeenCalled();

      dispose();
    });

    it("should update in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const startDate = new CalendarDate(2024, 6, 10);
        const endDate = new CalendarDate(2024, 6, 20);

        state.selectDate(startDate);
        state.selectDate(endDate);

        expect(state.value()?.start).toEqual(startDate);
        expect(state.value()?.end).toEqual(endDate);

        dispose();
      });
    });
  });

  describe("week days", () => {
    it("should return week day names", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({ locale: "en-US" });

        const days = state.weekDays();
        expect(days).toHaveLength(7);

        dispose();
      });
    });
  });

  describe("title", () => {
    it("should return formatted title", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
          locale: "en-US",
        });

        expect(state.title()).toBe("June 2024");

        dispose();
      });
    });

    it("should update title when focused date changes", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
          locale: "en-US",
        });

        expect(state.title()).toBe("June 2024");

        state.focusNextPage();
        expect(state.title()).toBe("July 2024");

        dispose();
      });
    });

    it("should display ranges in the locale calendar system and emit original calendars", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createRangeCalendarState({
          defaultValue: {
            start: new CalendarDate(2025, 2, 3),
            end: new CalendarDate(2025, 2, 5),
          },
          locale: "hi-IN-u-ca-indian",
          onChange,
        });

        expect(state.focusedDate().calendar.identifier).toBe("indian");
        expect(state.focusedDate().year).toBe(1946);
        expect(state.value()?.start.calendar.identifier).toBe("indian");
        expect(state.highlightedRange()?.end.calendar.identifier).toBe("indian");
        expect(state.title()).toContain("1946");
        expect(state.title()).not.toContain("2025");

        state.selectDate(state.focusedDate().add({ days: 3 }));
        state.selectDate(state.focusedDate().add({ days: 5 }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].start.calendar.identifier).toBe("gregory");
        expect(onChange.mock.calls[0][0].end.calendar.identifier).toBe("gregory");

        dispose();
      });
    });

    it("should create the range display calendar through createCalendar", () => {
      createRoot((dispose) => {
        const createCalendar = vi.fn((identifier) => createIntlCalendar(identifier));
        const state = createRangeCalendarState({
          defaultFocusedValue: new CalendarDate(2025, 2, 3),
          locale: "hi-IN-u-ca-indian",
          createCalendar,
        });

        expect(createCalendar).toHaveBeenCalledWith("indian");
        expect(state.focusedDate().calendar.identifier).toBe("indian");

        dispose();
      });
    });
  });

  describe("getDatesInWeek", () => {
    it("should return dates for a week", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        const week = state.getDatesInWeek(0);
        expect(week).toHaveLength(7);

        dispose();
      });
    });
  });

  describe("getWeeksInMonth", () => {
    it("should return correct number of weeks", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          defaultFocusedValue: focusDate,
        });

        const weeks = state.getWeeksInMonth();
        expect(weeks).toBeGreaterThanOrEqual(4);
        expect(weeks).toBeLessThanOrEqual(6);

        dispose();
      });
    });
  });

  describe("dragging state", () => {
    it("should track dragging state during selection", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        expect(state.isDragging()).toBe(false);

        // First click starts dragging
        state.selectDate(new CalendarDate(2024, 6, 10));
        expect(state.isDragging()).toBe(true);

        // Second click ends dragging
        state.selectDate(new CalendarDate(2024, 6, 20));
        expect(state.isDragging()).toBe(false);

        dispose();
      });
    });

    it("should allow manual dragging control", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        state.setDragging(true);
        expect(state.isDragging()).toBe(true);

        state.setDragging(false);
        expect(state.isDragging()).toBe(false);

        dispose();
      });
    });
  });

  describe("anchor date", () => {
    it("should allow manual anchor date control", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();
        const anchorDate = new CalendarDate(2024, 6, 15);

        state.setAnchorDate(anchorDate);
        expect(state.anchorDate()).toEqual(anchorDate);

        state.setAnchorDate(null);
        expect(state.anchorDate()).toBe(null);

        dispose();
      });
    });
  });
});
