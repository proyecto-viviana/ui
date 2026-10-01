/**
 * A calendar keeps its visible-range name when aria-labelledby is also set.
 * useLabels prepends the element's own id, matching useCalendarBase / useCalendarGrid.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import {
  CalendarDate,
  DateFormatter,
  endOfMonth,
  isSameDay,
  startOfMonth,
} from "@internationalized/date";
import { createCalendarState, createRangeCalendarState } from "@proyecto-viviana/solid-stately";
import { createCalendar } from "../src/calendar/createCalendar";
import { createCalendarGrid } from "../src/calendar/createCalendarGrid";
import { createRangeCalendar } from "../src/calendar/createRangeCalendar";

function decemberCalendar() {
  return createCalendarState({
    locale: "en-US",
    defaultFocusedValue: new CalendarDate(2024, 12, 1),
  });
}

describe("createCalendar labels", () => {
  it("prepends its id to aria-labelledby when the visible range names it", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar({ id: "cal", "aria-labelledby": "heading" }, state);
      flush();

      expect(calendar.calendarProps.id).toBe("cal");
      expect(calendar.calendarProps.role).toBe("application");
      expect(calendar.calendarProps["aria-label"]).toContain("December 2024");
      expect(calendar.calendarProps["aria-labelledby"]).toBe("cal heading");

      const grid = createCalendarGrid({}, state);
      const gridId = grid.gridProps.id as string;
      expect(gridId).toEqual(expect.any(String));
      expect(gridId.length).toBeGreaterThan(0);
      expect(grid.gridProps["aria-label"]).toContain("December 2024");
      expect(grid.gridProps["aria-labelledby"]).toBe(`${gridId} heading`);

      dispose();
    });
  });

  it("joins an explicit aria-label with the visible range before merging", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar(
        { id: "cal", "aria-label": "Birth date", "aria-labelledby": "heading" },
        state,
      );
      flush();

      expect(calendar.calendarProps["aria-label"]).toBe("Birth date, December 2024");
      expect(calendar.calendarProps["aria-labelledby"]).toBe("cal heading");

      const grid = createCalendarGrid({}, state);
      const gridId = grid.gridProps.id as string;
      expect(grid.gridProps["aria-label"]).toBe("Birth date, December 2024");
      expect(grid.gridProps["aria-labelledby"]).toBe(`${gridId} heading`);

      dispose();
    });
  });

  it("normalizes a spaced labelledby list and keeps the calendar id first", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar(
        { id: "cal", "aria-labelledby": "  heading   extra  " },
        state,
      );
      flush();

      expect(calendar.calendarProps["aria-labelledby"]).toBe("cal heading extra");
      dispose();
    });
  });

  it("does not invent aria-labelledby when only the range names the calendar", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar({ id: "cal", "aria-label": "Birth date" }, state);
      flush();

      expect(calendar.calendarProps.id).toBe("cal");
      expect(calendar.calendarProps["aria-label"]).toBe("Birth date, December 2024");
      expect(calendar.calendarProps["aria-labelledby"]).toBeUndefined();

      const grid = createCalendarGrid({}, state);
      expect(grid.gridProps["aria-label"]).toBe("Birth date, December 2024");
      expect(grid.gridProps["aria-labelledby"]).toBeUndefined();
      expect(grid.gridProps.id).toBeUndefined();

      dispose();
    });
  });

  it("keeps an empty aria-labelledby from merging", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar({ id: "cal", "aria-labelledby": "" }, state);
      flush();

      expect(calendar.calendarProps["aria-label"]).toContain("December 2024");
      expect(calendar.calendarProps["aria-labelledby"]).toBe("");
      dispose();
    });
  });

  it("merges a range calendar the same way", () => {
    createRoot((dispose) => {
      const state = createRangeCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 12, 1),
      });
      flush();
      const calendar = createRangeCalendar({ id: "range", "aria-labelledby": "heading" }, state);
      flush();

      expect(calendar.calendarProps.id).toBe("range");
      expect(calendar.calendarProps.role).toBe("application");
      expect(calendar.calendarProps["aria-label"]).toContain("December 2024");
      expect(calendar.calendarProps["aria-labelledby"]).toBe("range heading");

      const grid = createCalendarGrid({}, state);
      const gridId = grid.gridProps.id as string;
      expect(grid.gridProps["aria-labelledby"]).toBe(`${gridId} heading`);

      dispose();
    });
  });
});

function nativeVisibleMonthRange(
  start: CalendarDate,
  end: CalendarDate,
  timeZone: string,
  locale: string,
): string {
  const formatter = new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    calendar: start.calendar.identifier,
    timeZone,
  });
  const startMonth = start.calendar.getFormattableMonth?.(start) ?? start;
  const endMonth = end.calendar.getFormattableMonth?.(end) ?? end;
  return formatter.formatRange(startMonth.toDate(timeZone), endMonth.toDate(timeZone));
}

describe("createCalendar title", () => {
  it("names one visible month from that month", () => {
    createRoot((dispose) => {
      const state = decemberCalendar();
      flush();
      const calendar = createCalendar({}, state);
      flush();

      expect(calendar.title).toBe(state.title());
      expect(calendar.title).toContain("December 2024");
      dispose();
    });
  });

  it("names a multi-month window with the native month range", () => {
    createRoot((dispose) => {
      const state = createCalendarState({
        locale: "en-US",
        visibleMonths: 3,
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
      });
      flush();
      const calendar = createCalendar({}, state);
      flush();
      const range = state.visibleRange();

      expect(isSameDay(range.start, startOfMonth(range.start))).toBe(true);
      expect(isSameDay(range.end, endOfMonth(range.end))).toBe(true);
      expect(range.start.month).not.toBe(range.end.month);

      const expected = nativeVisibleMonthRange(range.start, range.end, state.timeZone, "en-US");
      expect(calendar.title).toBe(expected);
      expect(String(calendar.calendarProps["aria-label"])).toContain("to");
      dispose();
    });
  });

  it("names a multi-month range calendar with the native month range", () => {
    createRoot((dispose) => {
      const state = createRangeCalendarState({
        locale: "en-US",
        visibleMonths: 3,
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
      });
      flush();
      const calendar = createRangeCalendar({}, state);
      flush();
      const range = state.visibleRange();

      expect(isSameDay(range.start, startOfMonth(range.start))).toBe(true);
      expect(isSameDay(range.end, endOfMonth(range.end))).toBe(true);
      expect(range.start.month).not.toBe(range.end.month);

      const expected = nativeVisibleMonthRange(range.start, range.end, state.timeZone, "en-US");
      expect(calendar.title).toBe(expected);
      expect(String(calendar.calendarProps["aria-label"])).toContain("to");
      dispose();
    });
  });
});

function focusButton(props: Record<string, unknown>, focused: boolean) {
  const onFocusChange = props.onFocusChange as ((focused: boolean) => void) | undefined;
  onFocusChange?.(focused);
}

describe("createCalendar paging focus", () => {
  it("focuses the calendar when Next becomes disabled while that button is focused", () => {
    createRoot((dispose) => {
      const state = createCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
        maxValue: new CalendarDate(2024, 7, 10),
      });
      flush();
      const calendar = createCalendar({ "aria-label": "Event date" }, state);
      flush();

      expect(state.isNextVisibleRangeInvalid()).toBe(false);
      focusButton(calendar.nextButtonProps, true);
      flush();
      expect(state.isFocused()).toBe(false);

      const click = calendar.nextButtonProps.onClick as () => void;
      click();
      flush();

      expect(state.isNextVisibleRangeInvalid()).toBe(true);
      expect(state.isFocused()).toBe(true);
      dispose();
    });
  });

  it("keeps calendar focus cleared when Next stays enabled", () => {
    createRoot((dispose) => {
      const state = createCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
        maxValue: new CalendarDate(2025, 6, 15),
      });
      flush();
      const calendar = createCalendar({ "aria-label": "Event date" }, state);
      flush();

      focusButton(calendar.nextButtonProps, true);
      flush();
      const click = calendar.nextButtonProps.onClick as () => void;
      click();
      flush();

      expect(state.isNextVisibleRangeInvalid()).toBe(false);
      expect(state.isFocused()).toBe(false);
      dispose();
    });
  });

  it("focuses the calendar when Previous becomes disabled while that button is focused", () => {
    createRoot((dispose) => {
      const state = createCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
        minValue: new CalendarDate(2024, 5, 10),
      });
      flush();
      const calendar = createCalendar({ "aria-label": "Event date" }, state);
      flush();

      expect(state.isPreviousVisibleRangeInvalid()).toBe(false);
      focusButton(calendar.prevButtonProps, true);
      flush();

      const click = calendar.prevButtonProps.onClick as () => void;
      click();
      flush();

      expect(state.isPreviousVisibleRangeInvalid()).toBe(true);
      expect(state.isFocused()).toBe(true);
      dispose();
    });
  });

  it("focuses a range calendar when Next becomes disabled while that button is focused", () => {
    createRoot((dispose) => {
      const state = createRangeCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
        maxValue: new CalendarDate(2024, 7, 10),
      });
      flush();
      const calendar = createRangeCalendar({ "aria-label": "Trip dates" }, state);
      flush();

      expect(state.isNextVisibleRangeInvalid()).toBe(false);
      focusButton(calendar.nextButtonProps, true);
      flush();

      const click = calendar.nextButtonProps.onClick as () => void;
      click();
      flush();

      expect(state.isNextVisibleRangeInvalid()).toBe(true);
      expect(state.isFocused()).toBe(true);
      dispose();
    });
  });
});
