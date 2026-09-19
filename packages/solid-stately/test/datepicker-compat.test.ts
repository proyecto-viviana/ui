import { describe, it, expect } from "vite-plus/test"; import { flush, createRoot } from "solid-js";
import { CalendarDate } from "@internationalized/date";
import {
  useDateFieldState,
  useDatePickerState,
  useDateRangePickerState,
  useTimeFieldState,
} from "../src";

describe("datepicker module compatibility aliases", () => {
  it("useDatePickerState provides overlay trigger state", () => {
    createRoot((dispose) => {
      flush();
      const state = useDatePickerState();
      expect(state.isOpen()).toBe(false);
      state.open();
      flush();
      expect(state.isOpen()).toBe(true);
      state.close();
      flush();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("useDateFieldState maps to date field state", () => {
    createRoot((dispose) => {
      const state = useDateFieldState({
        defaultValue: new CalendarDate(2026, 2, 15),
      });
      flush();
      expect(state.value()?.year).toBe(2026);
      dispose();
    });
  });

  it("useTimeFieldState maps to time field state", () => {
    createRoot((dispose) => {
      flush();
      const state = useTimeFieldState({});
      expect(state.segments().length).toBeGreaterThan(0);
      dispose();
    });
  });

  it("useDateRangePickerState maps to range calendar state", () => {
    createRoot((dispose) => {
      flush();
      const state = useDateRangePickerState({});
      expect(state.value()).toBeNull();
      flush();
      expect(state.focusedDate()).toBeTruthy();
      dispose();
    });
  });
});
