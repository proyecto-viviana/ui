/**
 * Tests for createRangeCalendarState
 *
 * Ported from @react-stately/calendar's useRangeCalendarState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
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

        flush();
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

        flush();
        expect(state.value()?.start).toEqual(defaultRange.start);
        flush();
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

        flush();
        expect(state.value()?.start).toEqual(controlledRange.start);
        flush();
        expect(state.value()?.end).toEqual(controlledRange.end);

        dispose();
      });
    });

    it("should handle controlled null state", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          value: null,
        });

        flush();
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

        flush();
        expect(state.focusedDate().year).toBe(todayDate.year);
        flush();
        expect(state.focusedDate().month).toBe(todayDate.month);
        flush();
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

        flush();
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

        flush();
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

        flush();
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

        flush();
        expect(state.focusedDate()).toEqual(minValue);
        flush();
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

        flush();
        expect(state.anchorDate()).toBe(null);

        state.selectDate(date);

        flush();
        expect(state.anchorDate()).toEqual(date);
        flush();
        expect(state.isDragging()).toBe(true);
        flush();
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

        flush();
        expect(state.anchorDate()).toBe(null);
        flush();
        expect(state.isDragging()).toBe(false);
        flush();
        expect(state.value()?.start).toEqual(startDate);
        flush();
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
        flush();
        expect(state.value()?.start).toEqual(earlierDate);
        flush();
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

        flush();
        const highlighted = state.highlightedRange();
        expect(highlighted?.start).toEqual(startDate);
        flush();
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
        flush();
        expect(onChange).not.toHaveBeenCalled();

        state.selectDate(endDate);
        flush();
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

        flush();
        expect(state.anchorDate()).toEqual(focusDate);
        flush();
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
        flush();
        expect(state.anchorDate()).toBe(null);
        flush();
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
        flush();
        expect(state.anchorDate()).toBe(null);
        flush();
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
        flush();
        expect(state.anchorDate()).toEqual(startDate);

        // Dynamically disable - simulated by creating new state
        const disabledState = createRangeCalendarState({
          isDisabled: true,
        });
        disabledState.setAnchorDate(startDate);

        // Try to complete
        const endDate = new CalendarDate(2024, 6, 20);
        disabledState.selectDate(endDate);

        flush();
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
        flush();
        expect(state.focusedDate().month).toBe(5);
        flush();
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
        flush();
        expect(state.focusedDate().month).toBe(7);
        flush();
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
        flush();
        expect(state.focusedDate().month).toBe(7);
        flush();
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
        flush();
        expect(state.focusedDate().year).toBe(2023);
        flush();
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
        flush();
        expect(state.focusedDate().year).toBe(2025);
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
        expect(state.focusedDate().day).toBe(1);
        flush();
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
        flush();
        expect(state.focusedDate().day).toBe(30);
        flush();
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
        flush();
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
        flush();
        expect(state.focusedDate()).toEqual(maxDate);

        dispose();
      });
    });

    it("should mark dates before min as disabled", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          minValue: minDate,
          // Focus June 2024 so the tested dates are inside the visible range —
          // isCellDisabled bounds on the visible range (mirrors upstream
          // useCalendarState), so only the min/max boundary is under test here.
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(true);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 10))).toBe(false);
        flush();
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

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(true);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 20))).toBe(false);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });

    it("should clamp a below-min selection to the minimum date", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createRangeCalendarState({
          minValue: minDate,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        // Selecting a date before minValue clamps into [minValue, maxValue] and
        // anchors on the boundary (mirrors upstream useRangeCalendarState, which
        // runs selectDate through constrainValue rather than rejecting) — the
        // cell layer is what prevents clicking a disabled cell in the UI.
        const disabledDate = new CalendarDate(2024, 6, 5);
        state.selectDate(disabledDate);

        flush();
        expect(state.anchorDate()).toEqual(minDate);

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

        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 5))).toBe(false);
        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 10))).toBe(true);
        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 15))).toBe(true);
        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 20))).toBe(true);
        flush();
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

        flush();
        expect(state.isSelectionStart(new CalendarDate(2024, 6, 10))).toBe(true);
        flush();
        expect(state.isSelectionStart(new CalendarDate(2024, 6, 15))).toBe(false);
        flush();
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

        flush();
        expect(state.isSelectionEnd(new CalendarDate(2024, 6, 10))).toBe(false);
        flush();
        expect(state.isSelectionEnd(new CalendarDate(2024, 6, 15))).toBe(false);
        flush();
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

        // isCellFocused gates on the calendar-level isFocused flag (mirrors
        // upstream useCalendarState `isFocused && isSameDay`), so the calendar
        // must actually hold focus before any cell reports focused.
        state.setFocused(true);

        flush();
        expect(state.isCellFocused(new CalendarDate(2024, 6, 14))).toBe(false);
        flush();
        expect(state.isCellFocused(new CalendarDate(2024, 6, 15))).toBe(true);
        flush();
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

        flush();
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 14))).toBe(false);
        flush();
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 15))).toBe(true);
        flush();
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
          // Focus June 2024 so the tested dates are inside the visible range —
          // isInvalid folds isCellDisabled, which bounds on the visible range.
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        flush();
        expect(state.isInvalid(new CalendarDate(2024, 6, 14))).toBe(false);
        flush();
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

        flush();
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

        flush();
        const range = state.visibleRange();
        expect(range.start.year).toBe(2024);
        flush();
        expect(range.start.month).toBe(6);
        flush();
        expect(range.start.day).toBe(1);
        flush();
        expect(range.end.year).toBe(2024);
        flush();
        expect(range.end.month).toBe(6);
        flush();
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

        flush();
        const range = state.visibleRange();
        expect(range.start.month).toBe(6);
        flush();
        expect(range.end.month).toBe(7);
        flush();
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

        flush();
        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 5, 15))).toBe(true);
        flush();
        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 6, 15))).toBe(false);
        flush();
        expect(state.isOutsideVisibleRange(new CalendarDate(2024, 7, 15))).toBe(true);

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        flush();
        expect(state.isFocused()).toBe(false);

        state.setFocused(true);
        flush();
        expect(state.isFocused()).toBe(true);

        state.setFocused(false);
        flush();
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

        flush();
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

        flush();
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

      flush();
      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 6, 20));
      flush();
      expect(snapshots).toHaveLength(1);
      flush();
      expect(snapshots[0].date).toEqual(new CalendarDate(2024, 6, 20));
      flush();
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
        flush();
        expect(state.value()?.start).toEqual(range.start);
        flush();
        expect(state.value()?.end).toEqual(range.end);

        // But onChange should be called
        flush();
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

        flush();
        expect(state.value()?.start.day).toBe(10);
        flush();
        expect(state.value()?.end.day).toBe(20);

        setValue({
          start: new CalendarDate(2024, 7, 5),
          end: new CalendarDate(2024, 7, 15),
        });

        flush();
        expect(state.value()?.start.month).toBe(7);
        flush();
        expect(state.value()?.start.day).toBe(5);
        flush();
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

        flush();
        expect(state.value()).toBe(null);
        flush();
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

      flush();
      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 2, 15));

      setFocusedValue(new CalendarDate(2024, 5, 15));
      await flushEffects();

      flush();
      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 5, 15));
      flush();
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

        flush();
        expect(state.value()?.start).toEqual(startDate);
        flush();
        expect(state.value()?.end).toEqual(endDate);

        dispose();
      });
    });
  });

  describe("week days", () => {
    it("should return week day names", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({ locale: "en-US" });

        flush();
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

        flush();
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

        flush();
        expect(state.title()).toBe("June 2024");

        state.focusNextPage();
        flush();
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

        flush();
        expect(state.focusedDate().calendar.identifier).toBe("indian");
        flush();
        expect(state.focusedDate().year).toBe(1946);
        flush();
        expect(state.value()?.start.calendar.identifier).toBe("indian");
        flush();
        expect(state.highlightedRange()?.end.calendar.identifier).toBe("indian");
        flush();
        expect(state.title()).toContain("1946");
        flush();
        expect(state.title()).not.toContain("2025");

        state.selectDate(state.focusedDate().add({ days: 3 }));
        state.selectDate(state.focusedDate().add({ days: 5 }));

        flush();
        expect(onChange).toHaveBeenCalledTimes(1);
        flush();
        expect(onChange.mock.calls[0][0].start.calendar.identifier).toBe("gregory");
        flush();
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

        flush();
        expect(createCalendar).toHaveBeenCalledWith("indian");
        flush();
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

        flush();
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

        flush();
        const weeks = state.getWeeksInMonth();
        expect(weeks).toBeGreaterThanOrEqual(4);
        flush();
        expect(weeks).toBeLessThanOrEqual(6);

        dispose();
      });
    });
  });

  describe("dragging state", () => {
    it("should track dragging state during selection", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        flush();
        expect(state.isDragging()).toBe(false);

        // First click starts dragging
        state.selectDate(new CalendarDate(2024, 6, 10));
        flush();
        expect(state.isDragging()).toBe(true);

        // Second click ends dragging
        state.selectDate(new CalendarDate(2024, 6, 20));
        flush();
        expect(state.isDragging()).toBe(false);

        dispose();
      });
    });

    it("should allow manual dragging control", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState();

        state.setDragging(true);
        flush();
        expect(state.isDragging()).toBe(true);

        state.setDragging(false);
        flush();
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
        flush();
        expect(state.anchorDate()).toEqual(anchorDate);

        state.setAnchorDate(null);
        flush();
        expect(state.anchorDate()).toBe(null);

        dispose();
      });
    });
  });

  describe("available range (firstAvailableDate)", () => {
    // The 10th and 20th of June 2024 are unavailable.
    const isDateUnavailable = (date: CalendarDate) =>
      date.month === 6 && (date.day === 10 || date.day === 20);

    it("passes the current selection anchor to isDateUnavailable", () => {
      createRoot((dispose) => {
        const seen: (CalendarDate | null)[] = [];
        const anchor = new CalendarDate(2024, 6, 15);
        const state = createRangeCalendarState({
          isDateUnavailable: (date, anchorDate) => {
            seen.push(anchorDate);
            return false;
          },
        });

        state.setAnchorDate(anchor);
        state.isCellUnavailable(new CalendarDate(2024, 6, 16));

        flush();
        expect(seen.some((a) => a != null && a.compare(anchor) === 0)).toBe(true);

        dispose();
      });
    });

    it("narrows the selectable range to the contiguous span around the anchor", () => {
      createRoot((dispose) => {
        // Focus June 2024 so the tested dates are inside the visible range;
        // isCellDisabled bounds on the visible range, so the assertions below
        // isolate the available-range (contiguous span) narrowing.
        const state = createRangeCalendarState({
          isDateUnavailable,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        // No anchor yet: nothing outside the unavailable dates is narrowed.
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(false);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(false);

        // Anchor on the 15th: bounded by the 10th and 20th -> available span [11, 19].
        state.setAnchorDate(new CalendarDate(2024, 6, 15));

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false); // anchor
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 11))).toBe(false); // span start
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 19))).toBe(false); // span end
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(true); // before span
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(true); // after span
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 10))).toBe(true); // unavailable bound

        // Clearing the anchor removes the narrowing.
        state.setAnchorDate(null);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(false);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(false);

        dispose();
      });
    });

    it("does not narrow the range when allowsNonContiguousRanges is set", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDateUnavailable,
          allowsNonContiguousRanges: true,
          // Focus June 2024 so the tested dates are inside the visible range.
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        state.setAnchorDate(new CalendarDate(2024, 6, 15));

        // Unavailable dates remain individually unavailable...
        flush();
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 10))).toBe(true);
        // ...but dates beyond them stay reachable (not disabled).
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(false);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(false);

        dispose();
      });
    });

    it("invalidates page navigation outside the available span while anchored", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          isDateUnavailable,
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        // Visible month is June; without an anchor navigation is unconstrained.
        flush();
        expect(state.isPreviousVisibleRangeInvalid()).toBe(false);
        flush();
        expect(state.isNextVisibleRangeInvalid()).toBe(false);

        // Anchor narrows the span to [11, 19] (both within June), so paging out is invalid.
        state.setAnchorDate(new CalendarDate(2024, 6, 15));
        flush();
        expect(state.isPreviousVisibleRangeInvalid()).toBe(true);
        flush();
        expect(state.isNextVisibleRangeInvalid()).toBe(true);

        // Clearing the anchor restores free navigation.
        state.setAnchorDate(null);
        flush();
        expect(state.isPreviousVisibleRangeInvalid()).toBe(false);
        flush();
        expect(state.isNextVisibleRangeInvalid()).toBe(false);

        dispose();
      });
    });

    it("marks a committed range invalid when an endpoint is unavailable", () => {
      createRoot((dispose) => {
        const validState = createRangeCalendarState({
          isDateUnavailable,
          value: { start: new CalendarDate(2024, 6, 12), end: new CalendarDate(2024, 6, 18) },
        });
        flush();
        expect(validState.isValueInvalid()).toBe(false);

        const invalidState = createRangeCalendarState({
          isDateUnavailable,
          value: { start: new CalendarDate(2024, 6, 10), end: new CalendarDate(2024, 6, 18) },
        });
        flush();
        expect(invalidState.isValueInvalid()).toBe(true);

        dispose();
      });
    });

    it("marks a committed range invalid when an endpoint is outside min/max", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          minValue: new CalendarDate(2024, 6, 10),
          value: { start: new CalendarDate(2024, 6, 5), end: new CalendarDate(2024, 6, 18) },
        });
        flush();
        expect(state.isValueInvalid()).toBe(true);

        dispose();
      });
    });

    it("advances focus to the next day after a keyboard range-start selection", () => {
      createRoot((dispose) => {
        const state = createRangeCalendarState({
          defaultFocusedValue: new CalendarDate(2025, 2, 4),
        });

        flush();
        expect(state.anchorDate()).toBeNull();
        state.selectDate(new CalendarDate(2025, 2, 4));
        state.focusNearestAvailableDate(new CalendarDate(2025, 2, 4));
        flush();
        expect(state.focusedDate().toString()).toBe("2025-02-05");

        dispose();
      });
    });

    it("updates visibleRange and cell disabled states reactively when visibleMonths changes", async () => {
      let dispose!: () => void;
      const [visibleMonths, setVisibleMonths] = createSignal(1);
      const state = createRoot((disposeRoot) => {
        dispose = disposeRoot;
        return createRangeCalendarState({
          defaultFocusedValue: new CalendarDate(2025, 2, 15),
          get visibleMonths() {
            return visibleMonths();
          },
        });
      });

      flush();
      expect(state.visibleMonths).toBe(1);
      flush();
      expect(state.visibleRange().start).toEqual(new CalendarDate(2025, 2, 1));
      flush();
      expect(state.visibleRange().end).toEqual(new CalendarDate(2025, 2, 28));
      flush();
      expect(state.isCellDisabled(new CalendarDate(2025, 3, 15))).toBe(true);

      setVisibleMonths(2);
      await flushEffects();

      flush();
      expect(state.visibleMonths).toBe(2);
      flush();
      expect(state.visibleRange().start).toEqual(new CalendarDate(2025, 2, 1));
      flush();
      expect(state.visibleRange().end).toEqual(new CalendarDate(2025, 3, 31));
      flush();
      expect(state.isCellDisabled(new CalendarDate(2025, 3, 15))).toBe(false);

      dispose();
    });
  });
});
