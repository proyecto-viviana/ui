/**
 * A calendar keeps its visible-range name when aria-labelledby is also set.
 * useLabels prepends the element's own id, matching useCalendarBase / useCalendarGrid.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import { CalendarDate } from "@internationalized/date";
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
