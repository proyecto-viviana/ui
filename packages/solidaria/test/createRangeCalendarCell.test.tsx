/**
 * Range cell day text follows `useCalendarCell`: the formattable day, not `date.day`.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import { CalendarDate, GregorianCalendar, type AnyCalendarDate } from "@internationalized/date";
import { createRangeCalendarState } from "@proyecto-viviana/solid-stately";
import { createRangeCalendarCell } from "../src/calendar/createRangeCalendarCell";

/** Gregorian instant, stored one day behind, so `date.day` is not the painted day. */
class DayBehindCalendar extends GregorianCalendar {
  isEqual(other: { identifier: string }): boolean {
    return other instanceof DayBehindCalendar;
  }

  fromJulianDay(jd: number): CalendarDate {
    const gregorian = super.fromJulianDay(jd);
    const behind = gregorian.subtract({ days: 1 });
    return new CalendarDate(this, behind.year, behind.month, behind.day);
  }

  toJulianDay(date: AnyCalendarDate): number {
    const gregorian = new CalendarDate(date.year, date.month, date.day).add({ days: 1 });
    return super.toJulianDay(gregorian);
  }
}

describe("createRangeCalendarCell", () => {
  it("paints the formattable day when the calendar day field differs", () => {
    createRoot((dispose) => {
      const state = createRangeCalendarState({
        locale: "en-US",
        createCalendar: () => new DayBehindCalendar(),
        defaultFocusedValue: new CalendarDate(2025, 2, 3),
      });
      flush();

      const focused = state.focusedDate();
      const cell = createRangeCalendarCell({ date: focused }, state);
      flush();

      expect(focused.day).toBe(2);
      expect(cell.formattedDate).toBe("3");
      expect(cell.buttonProps["aria-label"]).toContain("February 3");

      dispose();
    });
  });

  it("paints the Gregorian day number for a Gregory calendar", () => {
    createRoot((dispose) => {
      const state = createRangeCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2025, 2, 3),
      });
      flush();

      const cell = createRangeCalendarCell({ date: state.focusedDate() }, state);
      expect(state.focusedDate().day).toBe(3);
      expect(cell.formattedDate).toBe("3");

      dispose();
    });
  });
});
