/**
 * Tests for createCalendarState
 *
 * Ported from @react-stately/calendar's useCalendarState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";

import { flush, createRoot } from "solid-js";
import { createCalendarState } from "../src/calendar/createCalendarState";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  createCalendar as createIntlCalendar,
} from "@internationalized/date";

describe("createCalendarState", () => {
  const timeZone = getLocalTimeZone();
  const flushEffects = () => Promise.resolve();

  describe("basic state management", () => {
    it("should return null by default", () => {
      createRoot((dispose) => {
        const state = createCalendarState();

        flush();
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const defaultDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultValue: defaultDate,
        });

        flush();
        expect(state.value()).toEqual(defaultDate);

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const controlledDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          value: controlledDate,
        });

        flush();
        expect(state.value()).toEqual(controlledDate);

        dispose();
      });
    });

    it("should handle controlled null state", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
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
        const state = createCalendarState();
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
        const state = createCalendarState({
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
        const state = createCalendarState({
          focusedValue: focusDate,
        });

        flush();
        expect(state.focusedDate()).toEqual(focusDate);

        dispose();
      });
    });

    it("should use value as initial focused date when no focused value provided", () => {
      createRoot((dispose) => {
        const date = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultValue: date,
        });

        flush();
        expect(state.focusedDate()).toEqual(date);

        dispose();
      });
    });

    it("should constrain the initial focused date without firing onFocusChange", () => {
      createRoot((dispose) => {
        const onFocusChange = vi.fn();
        const minValue = new CalendarDate(2024, 6, 10);
        const state = createCalendarState({
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

  describe("selection methods", () => {
    it("should set value", () => {
      createRoot((dispose) => {
        const state = createCalendarState();
        const date = new CalendarDate(2024, 6, 15);

        state.setValue(date);
        flush();
        expect(state.value()).toEqual(date);

        dispose();
      });
    });

    it("should call onChange when value changes", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createCalendarState({ onChange });
        const date = new CalendarDate(2024, 6, 15);

        state.setValue(date);
        flush();
        expect(onChange).toHaveBeenCalledWith(date);
        flush();
        expect(onChange).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("should select date and update focus", () => {
      createRoot((dispose) => {
        const state = createCalendarState();
        const date = new CalendarDate(2024, 6, 15);

        state.selectDate(date);
        flush();
        expect(state.value()).toEqual(date);
        flush();
        expect(state.focusedDate()).toEqual(date);

        dispose();
      });
    });

    it("should select focused date", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
        });

        state.selectFocusedDate();
        flush();
        expect(state.value()).toEqual(focusDate);

        dispose();
      });
    });
  });

  describe("multiple selection", () => {
    it("defaults to single selection mode", () => {
      createRoot((dispose) => {
        flush();
        const state = createCalendarState();
        expect(state.selectionMode()).toBe("single");
        dispose();
      });
    });

    it("exposes the configured selection mode", () => {
      createRoot((dispose) => {
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
        });
        flush();
        expect(state.selectionMode()).toBe("multiple");
        dispose();
      });
    });

    it("accumulates selected dates as an array", () => {
      createRoot((dispose) => {
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
        });
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);

        state.selectDate(d1);
        flush();
        expect(state.value()).toEqual([d1]);

        state.selectDate(d2);
        flush();
        expect(state.value()).toEqual([d1, d2]);

        dispose();
      });
    });

    it("toggles a date off when it is selected again", () => {
      createRoot((dispose) => {
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
        });
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);

        state.selectDate(d1);
        state.selectDate(d2);
        state.selectDate(d1);

        flush();
        expect(state.value()).toEqual([d2]);
        flush();
        expect(state.isSelected(d1)).toBe(false);
        flush();
        expect(state.isSelected(d2)).toBe(true);

        dispose();
      });
    });

    it("reports every selected date via isSelected", () => {
      createRoot((dispose) => {
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          defaultValue: [d1, d2],
        });

        flush();
        expect(state.isSelected(d1)).toBe(true);
        flush();
        expect(state.isSelected(d2)).toBe(true);
        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 11))).toBe(false);

        dispose();
      });
    });

    it("initializes from a default array value and seeds focus from the first date", () => {
      createRoot((dispose) => {
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          defaultValue: [d1, d2],
        });

        flush();
        expect(state.value()).toEqual([d1, d2]);
        flush();
        expect(state.focusedDate()).toEqual(d1);

        dispose();
      });
    });

    it("calls onChange with the updated array on each toggle", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          onChange,
        });
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);

        state.selectDate(d1);
        flush();
        expect(onChange).toHaveBeenLastCalledWith([d1]);

        state.selectDate(d2);
        flush();
        expect(onChange).toHaveBeenLastCalledWith([d1, d2]);

        state.selectDate(d1);
        flush();
        expect(onChange).toHaveBeenLastCalledWith([d2]);

        dispose();
      });
    });

    it("clears to an empty array when set to null", () => {
      createRoot((dispose) => {
        const d1 = new CalendarDate(2024, 6, 10);
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          defaultValue: [d1],
        });

        state.setValue(null);
        flush();
        expect(state.value()).toEqual([]);

        dispose();
      });
    });

    it("supports a controlled array value", () => {
      createRoot((dispose) => {
        const d1 = new CalendarDate(2024, 6, 10);
        const d2 = new CalendarDate(2024, 6, 12);
        const [value, setValue] = createSignal<CalendarDate[]>([d1]);
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          get value() {
            return value();
          },
        });

        flush();
        expect(state.value()).toEqual([d1]);

        setValue([d1, d2]);
        flush();
        expect(state.value()).toEqual([d1, d2]);

        dispose();
      });
    });

    it("toggles the focused date through selectFocusedDate", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState<CalendarDate, "multiple">({
          selectionMode: "multiple",
          defaultFocusedValue: focusDate,
        });

        state.selectFocusedDate();
        flush();
        expect(state.value()).toEqual([focusDate]);

        state.selectFocusedDate();
        flush();
        expect(state.value()).toEqual([]);

        dispose();
      });
    });
  });

  describe("readonly and disabled behavior", () => {
    it("should ignore value changes when disabled", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          isDisabled: true,
        });
        const date = new CalendarDate(2024, 6, 15);

        state.setValue(date);
        flush();
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should ignore value changes when readonly", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          isReadOnly: true,
        });
        const date = new CalendarDate(2024, 6, 15);

        state.setValue(date);
        flush();
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should not select focused date when disabled", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
          isDisabled: true,
        });

        state.selectFocusedDate();
        flush();
        expect(state.value()).toBe(null);

        dispose();
      });
    });

    it("should not select date when readonly", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          isReadOnly: true,
        });
        const date = new CalendarDate(2024, 6, 15);

        state.selectDate(date);
        flush();
        expect(state.value()).toBe(null);

        dispose();
      });
    });
  });

  describe("navigation", () => {
    it("should move to previous month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
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
        const state = createCalendarState({
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

    it("should move to previous year", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
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
        const state = createCalendarState({
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
        const state = createCalendarState({
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
        const state = createCalendarState({
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
        const state = createCalendarState({
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
        const state = createCalendarState({
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
        const state = createCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPageStart();
        flush();
        expect(state.focusedDate().day).toBe(1);

        dispose();
      });
    });

    it("should move to end of month", () => {
      createRoot((dispose) => {
        const initialDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: initialDate,
        });

        state.focusPageEnd();
        flush();
        expect(state.focusedDate().day).toBe(30); // June has 30 days

        dispose();
      });
    });
  });

  describe("min/max constraints", () => {
    it("should constrain focused date to minValue", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          minValue: minDate,
        });

        state.setFocusedDate(new CalendarDate(2024, 6, 5));
        flush();
        expect(state.focusedDate()).toEqual(minDate);

        dispose();
      });
    });

    it("should constrain focused date to maxValue", () => {
      createRoot((dispose) => {
        const maxDate = new CalendarDate(2024, 6, 20);
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          maxValue: maxDate,
        });

        state.setFocusedDate(new CalendarDate(2024, 6, 25));
        flush();
        expect(state.focusedDate()).toEqual(maxDate);

        dispose();
      });
    });

    it("should report date as disabled when before minValue", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        // Align the visible range to the probed month. @react-stately/calendar
        // isCellDisabled reports any date outside the visible range as disabled
        // (the padding-cell contract), so probing min/max requires the range to
        // cover those dates — otherwise every June 2024 date reads disabled
        // regardless of minValue.
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          minValue: minDate,
        });

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(true);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });

    it("should report date as disabled when after maxValue", () => {
      createRoot((dispose) => {
        const maxDate = new CalendarDate(2024, 6, 20);
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          maxValue: maxDate,
        });

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(true);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });
  });

  describe("cell state checks", () => {
    it("should correctly identify selected date", () => {
      createRoot((dispose) => {
        const date = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultValue: date,
        });

        flush();
        expect(state.isSelected(date)).toBe(true);
        flush();
        expect(state.isSelected(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify focused date", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
        });

        // @react-stately/calendar gates isCellFocused on the calendar-level
        // isFocused flag (`isFocused && focusedDate && isSameDay(...)`), which
        // starts false. A cell only reads focused once the calendar itself is
        // focused, so raise the flag before asserting.
        state.setFocused(true);

        flush();
        expect(state.isCellFocused(focusDate)).toBe(true);
        flush();
        expect(state.isCellFocused(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify unavailable dates", () => {
      createRoot((dispose) => {
        const unavailableDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          isDateUnavailable: (date) => date.day === 15,
        });

        flush();
        expect(state.isCellUnavailable(unavailableDate)).toBe(true);
        flush();
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify disabled dates with isDateDisabled", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          isDateDisabled: (date) => date.day === 15,
        });

        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(true);
        flush();
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify invalid dates", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          isDateDisabled: (date) => date.day === 15,
          isDateUnavailable: (date) => date.day === 16,
        });

        flush();
        expect(state.isInvalid(new CalendarDate(2024, 6, 15))).toBe(true);
        flush();
        expect(state.isInvalid(new CalendarDate(2024, 6, 16))).toBe(true);
        flush();
        expect(state.isInvalid(new CalendarDate(2024, 6, 17))).toBe(false);

        dispose();
      });
    });
  });

  describe("visible range", () => {
    it("should return correct visible range for single month", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
        });

        flush();
        const range = state.visibleRange();
        expect(range.start.day).toBe(1);
        flush();
        expect(range.start.month).toBe(6);
        flush();
        expect(range.end.day).toBe(30);
        flush();
        expect(range.end.month).toBe(6);

        dispose();
      });
    });

    it("should default to centered alignment for multiple months", () => {
      // Mirrors @react-stately/calendar useCalendarState: when no
      // selectionAlignment is provided it defaults to 'center', so a 3-month
      // view focused on June centers on June (May–July), not June–August.
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
          visibleMonths: 3,
        });

        flush();
        const range = state.visibleRange();
        expect(range.start).toEqual(new CalendarDate(2024, 5, 1));
        flush();
        expect(range.end).toEqual(new CalendarDate(2024, 7, 31));

        dispose();
      });
    });

    it("should align to the start when selectionAlignment is 'start'", () => {
      createRoot((dispose) => {
        const focusDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
          visibleMonths: 3,
          selectionAlignment: "start",
        });

        flush();
        const range = state.visibleRange();
        expect(range.start).toEqual(new CalendarDate(2024, 6, 1));
        flush();
        expect(range.end).toEqual(new CalendarDate(2024, 8, 31));

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createCalendarState();

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
  });

  describe("onFocusChange callback", () => {
    it("should call onFocusChange when focused date changes", () => {
      createRoot((dispose) => {
        const onFocusChange = vi.fn();
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          onFocusChange,
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
        const state = createCalendarState({
          defaultFocusedValue: focusedDate,
          onFocusChange,
        });

        state.setFocusedDate(state.focusedDate());

        flush();
        expect(onFocusChange).not.toHaveBeenCalled();

        dispose();
      });
    });

    it("should update focused date and visible range before onFocusChange", () => {
      createRoot((dispose) => {
        let state!: ReturnType<typeof createCalendarState>;
        const snapshots: Array<{
          date: CalendarDate;
          focusedDate: CalendarDate;
          visibleRangeStart: CalendarDate;
        }> = [];

        state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          visibleMonths: 2,
          onFocusChange: (date) => {
            snapshots.push({
              date,
              focusedDate: state.focusedDate(),
              visibleRangeStart: state.visibleRange().start,
            });
          },
        });

        state.focusNextPage();

        flush();
        expect(snapshots).toHaveLength(1);
        flush();
        expect(snapshots[0].date).toEqual(new CalendarDate(2024, 8, 15));
        flush();
        expect(snapshots[0].focusedDate).toEqual(new CalendarDate(2024, 8, 15));
        flush();
        expect(snapshots[0].visibleRangeStart).toEqual(new CalendarDate(2024, 8, 1));

        dispose();
      });
    });

    it("should constrain focused date when minValue changes and then call onFocusChange", async () => {
      let dispose!: () => void;
      const [minValue, setMinValue] = createSignal<CalendarDate | undefined>();
      let state!: ReturnType<typeof createCalendarState>;
      const snapshots: Array<{ date: CalendarDate; focusedDate: CalendarDate }> = [];

      state = createRoot((disposeRoot) => {
        dispose = disposeRoot;
        return createCalendarState({
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

  describe("controlled vs uncontrolled", () => {
    it("should not change internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const controlledDate = new CalendarDate(2024, 6, 15);
        const state = createCalendarState({
          value: controlledDate,
          onChange,
        });

        const newDate = new CalendarDate(2024, 6, 20);
        state.setValue(newDate);

        // Value should NOT change in controlled mode
        flush();
        expect(state.value()).toEqual(controlledDate);
        // But onChange should still be called
        flush();
        expect(onChange).toHaveBeenCalledWith(newDate);

        dispose();
      });
    });

    it("should call onChange with null when clearing an uncontrolled value", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createCalendarState({
          defaultValue: new CalendarDate(2024, 6, 15),
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

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<CalendarDate | null>(null);
        const state = createCalendarState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.value()).toBe(null);

        const date = new CalendarDate(2024, 6, 15);
        setValue(date);
        flush();
        expect(state.value()).toEqual(date);

        setValue(null);
        flush();
        expect(state.value()).toBe(null);

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
        return createCalendarState({
          get focusedValue() {
            return focusedValue();
          },
          visibleMonths: 2,
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
      expect(state.visibleRange().start).toEqual(new CalendarDate(2024, 5, 1));
      flush();
      expect(onFocusChange).not.toHaveBeenCalled();

      dispose();
    });
  });

  describe("week days", () => {
    it("should return 7 week day names", () => {
      createRoot((dispose) => {
        const state = createCalendarState();

        flush();
        expect(state.weekDays().length).toBe(7);

        dispose();
      });
    });
  });

  describe("title", () => {
    it("should return formatted month and year", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
          locale: "en-US",
        });

        flush();
        const title = state.title();
        expect(title).toContain("June");
        flush();
        expect(title).toContain("2024");

        dispose();
      });
    });

    it("should display dates in the locale calendar system", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createCalendarState({
          defaultValue: new CalendarDate(2025, 2, 3),
          locale: "hi-IN-u-ca-indian",
          onChange,
        });

        flush();
        expect(state.focusedDate().calendar.identifier).toBe("indian");
        flush();
        expect(state.focusedDate().era).toBe("saka");
        flush();
        expect(state.focusedDate().year).toBe(1946);
        flush();
        expect(state.focusedDate().month).toBe(11);
        flush();
        expect(state.focusedDate().day).toBe(14);
        flush();
        expect(state.value()?.calendar.identifier).toBe("indian");
        flush();
        expect(state.title()).toContain("1946");
        flush();
        expect(state.title()).not.toContain("2025");

        state.selectDate(state.focusedDate().add({ days: 1 }));

        flush();
        expect(onChange).toHaveBeenCalledTimes(1);
        flush();
        expect(onChange.mock.calls[0][0].calendar.identifier).toBe("gregory");
        flush();
        expect(String(onChange.mock.calls[0][0])).toBe("2025-02-04");
        flush();
        expect(state.value()?.calendar.identifier).toBe("indian");

        dispose();
      });
    });

    it("should create the display calendar through createCalendar", () => {
      createRoot((dispose) => {
        const createCalendar = vi.fn((identifier) => createIntlCalendar(identifier));
        const state = createCalendarState({
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
    it("should return 7 dates for a week", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
        });

        flush();
        const week = state.getDatesInWeek(0);
        expect(week.length).toBe(7);

        dispose();
      });
    });
  });

  describe("getWeeksInMonth", () => {
    it("should return correct number of weeks", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2024, 6, 15),
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

  describe("selectDate with isDateUnavailable", () => {
    const focusedDate = new CalendarDate(2026, 4, 15);

    it("selects a date before the visible range when isDateUnavailable is provided", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: focusedDate,
          isDateUnavailable: () => false,
        });

        state.focusNextPage();
        state.selectDate(focusedDate);
        flush();
        expect(state.value()?.toString()).toBe(focusedDate.toString());

        state.selectDate(focusedDate.subtract({ months: 1 }));
        flush();
        expect(state.value()?.toString()).toBe(focusedDate.subtract({ months: 1 }).toString());

        dispose();
      });
    });

    it("selects a date after the visible range when isDateUnavailable is provided", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: focusedDate,
          isDateUnavailable: () => false,
        });

        state.focusPreviousPage();
        state.selectDate(focusedDate);
        flush();
        expect(state.value()?.toString()).toBe(focusedDate.toString());

        state.selectDate(focusedDate.add({ months: 1 }));
        flush();
        expect(state.value()?.toString()).toBe(focusedDate.add({ months: 1 }).toString());

        dispose();
      });
    });
  });

  describe("visible range invalid", () => {
    it("disables paging when the next page is outside min/max", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          defaultFocusedValue: new CalendarDate(2025, 2, 14),
          minValue: new CalendarDate(2025, 2, 3),
          maxValue: new CalendarDate(2025, 2, 20),
        });

        flush();
        expect(state.isPreviousVisibleRangeInvalid()).toBe(true);
        flush();
        expect(state.isNextVisibleRangeInvalid()).toBe(true);

        dispose();
      });
    });

    it("updates visibleRange and cell disabled states reactively when visibleMonths changes", async () => {
      let dispose!: () => void;
      const [visibleMonths, setVisibleMonths] = createSignal(1);
      const state = createRoot((disposeRoot) => {
        dispose = disposeRoot;
        return createCalendarState({
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
