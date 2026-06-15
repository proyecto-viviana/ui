/**
 * Tests for createCalendarState
 *
 * Ported from @react-stately/calendar's useCalendarState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
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

        expect(state.value()).toEqual(controlledDate);

        dispose();
      });
    });

    it("should handle controlled null state", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
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
        const state = createCalendarState();
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
        const state = createCalendarState({
          defaultFocusedValue: focusDate,
        });

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

        expect(state.focusedDate()).toEqual(minValue);
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
        expect(onChange).toHaveBeenCalledWith(date);
        expect(onChange).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("should select date and update focus", () => {
      createRoot((dispose) => {
        const state = createCalendarState();
        const date = new CalendarDate(2024, 6, 15);

        state.selectDate(date);
        expect(state.value()).toEqual(date);
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
        expect(state.value()).toEqual(focusDate);

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
        expect(state.focusedDate().month).toBe(5);
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
        expect(state.focusedDate().month).toBe(7);
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
        expect(state.focusedDate().year).toBe(2023);
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
        expect(state.focusedDate().year).toBe(2025);
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
        expect(state.focusedDate()).toEqual(maxDate);

        dispose();
      });
    });

    it("should report date as disabled when before minValue", () => {
      createRoot((dispose) => {
        const minDate = new CalendarDate(2024, 6, 10);
        const state = createCalendarState({
          minValue: minDate,
        });

        expect(state.isCellDisabled(new CalendarDate(2024, 6, 5))).toBe(true);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(false);

        dispose();
      });
    });

    it("should report date as disabled when after maxValue", () => {
      createRoot((dispose) => {
        const maxDate = new CalendarDate(2024, 6, 20);
        const state = createCalendarState({
          maxValue: maxDate,
        });

        expect(state.isCellDisabled(new CalendarDate(2024, 6, 25))).toBe(true);
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

        expect(state.isSelected(date)).toBe(true);
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

        expect(state.isCellFocused(focusDate)).toBe(true);
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

        expect(state.isCellUnavailable(unavailableDate)).toBe(true);
        expect(state.isCellUnavailable(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify disabled dates with isDateDisabled", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          isDateDisabled: (date) => date.day === 15,
        });

        expect(state.isCellDisabled(new CalendarDate(2024, 6, 15))).toBe(true);
        expect(state.isCellDisabled(new CalendarDate(2024, 6, 16))).toBe(false);

        dispose();
      });
    });

    it("should correctly identify invalid dates", () => {
      createRoot((dispose) => {
        const state = createCalendarState({
          isDateDisabled: (date) => date.day === 15,
          isDateUnavailable: (date) => date.day === 16,
        });

        expect(state.isInvalid(new CalendarDate(2024, 6, 15))).toBe(true);
        expect(state.isInvalid(new CalendarDate(2024, 6, 16))).toBe(true);
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

        const range = state.visibleRange();
        expect(range.start.day).toBe(1);
        expect(range.start.month).toBe(6);
        expect(range.end.day).toBe(30);
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

        const range = state.visibleRange();
        expect(range.start).toEqual(new CalendarDate(2024, 5, 1));
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

        const range = state.visibleRange();
        expect(range.start).toEqual(new CalendarDate(2024, 6, 1));
        expect(range.end).toEqual(new CalendarDate(2024, 8, 31));

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createCalendarState();

        expect(state.isFocused()).toBe(false);

        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        state.setFocused(false);
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

        expect(snapshots).toHaveLength(1);
        expect(snapshots[0].date).toEqual(new CalendarDate(2024, 8, 15));
        expect(snapshots[0].focusedDate).toEqual(new CalendarDate(2024, 8, 15));
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

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 6, 20));
      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].date).toEqual(new CalendarDate(2024, 6, 20));
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
        expect(state.value()).toEqual(controlledDate);
        // But onChange should still be called
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

        expect(state.value()).toBe(null);
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

        expect(state.value()).toBe(null);

        const date = new CalendarDate(2024, 6, 15);
        setValue(date);
        expect(state.value()).toEqual(date);

        setValue(null);
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

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 2, 15));

      setFocusedValue(new CalendarDate(2024, 5, 15));
      await flushEffects();

      expect(state.focusedDate()).toEqual(new CalendarDate(2024, 5, 15));
      expect(state.visibleRange().start).toEqual(new CalendarDate(2024, 5, 1));
      expect(onFocusChange).not.toHaveBeenCalled();

      dispose();
    });
  });

  describe("week days", () => {
    it("should return 7 week day names", () => {
      createRoot((dispose) => {
        const state = createCalendarState();

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

        const title = state.title();
        expect(title).toContain("June");
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

        expect(state.focusedDate().calendar.identifier).toBe("indian");
        expect(state.focusedDate().era).toBe("saka");
        expect(state.focusedDate().year).toBe(1946);
        expect(state.focusedDate().month).toBe(11);
        expect(state.focusedDate().day).toBe(14);
        expect(state.value()?.calendar.identifier).toBe("indian");
        expect(state.title()).toContain("1946");
        expect(state.title()).not.toContain("2025");

        state.selectDate(state.focusedDate().add({ days: 1 }));

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange.mock.calls[0][0].calendar.identifier).toBe("gregory");
        expect(String(onChange.mock.calls[0][0])).toBe("2025-02-04");
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

        expect(createCalendar).toHaveBeenCalledWith("indian");
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

        const weeks = state.getWeeksInMonth();
        expect(weeks).toBeGreaterThanOrEqual(4);
        expect(weeks).toBeLessThanOrEqual(6);

        dispose();
      });
    });
  });
});
