/**
 * A truthy year-picker era option collapses to "short", matching useCalendarYearPicker.
 */

import { describe, it, expect } from "vite-plus/test";
import { createRoot, flush } from "solid-js";
import { CalendarDate } from "@internationalized/date";
import { createCalendarState } from "@proyecto-viviana/solid-stately";
import { createCalendarYearPicker } from "../src/calendar/createCalendarYearPicker";

describe("createCalendarYearPicker", () => {
  it("formats an explicit long era as short", () => {
    createRoot((dispose) => {
      const state = createCalendarState({
        locale: "en-US",
        defaultFocusedValue: new CalendarDate(2024, 6, 15),
      });
      flush();

      const picker = createCalendarYearPicker({ format: { era: "long" }, visibleYears: 1 }, state);

      const focused = picker.items.find((item) => item.id === picker.value);
      expect(focused?.formatted).toBe("2024 AD");

      dispose();
    });
  });
});
