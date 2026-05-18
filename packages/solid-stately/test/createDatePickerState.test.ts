import { describe, it, expect, vi } from "vitest";
import { createDatePickerState } from "../src/calendar/createDatePickerState";
import {
  CalendarDate,
  CalendarDateTime,
  ZonedDateTime,
  Time,
  toZoned,
} from "@internationalized/date";

describe("createDatePickerState", () => {
  it("supports controlled value", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      value: new CalendarDate(2024, 6, 15),
      onChange,
    });

    expect(state.value()?.toString()).toBe("2024-06-15");
    state.setValue(new CalendarDate(2024, 7, 1));
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2024, 7, 1));
  });

  it("supports uncontrolled value with defaultValue", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 3, 20),
      onChange,
    });

    expect(state.value()?.toString()).toBe("2024-03-20");
    state.setValue(new CalendarDate(2024, 4, 10));
    expect(onChange).toHaveBeenCalledWith(new CalendarDate(2024, 4, 10));
  });

  it("preserves ZonedDateTime timezone on commit", () => {
    const onChange = vi.fn();
    const zoned = toZoned(new CalendarDateTime(2024, 6, 15, 10, 30), "America/New_York");
    const state = createDatePickerState({
      defaultValue: zoned,
      onChange,
    });

    state.setDateValue(new CalendarDate(2024, 7, 1));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall).toBeInstanceOf(ZonedDateTime);
    expect((lastCall as ZonedDateTime).timeZone).toBe("America/New_York");
  });

  it("preserves existing time when setting date value", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      defaultValue: new CalendarDateTime(2024, 6, 15, 14, 30),
      onChange,
    });

    state.setDateValue(new CalendarDate(2024, 7, 1));
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.hour).toBe(14);
    expect(lastCall.minute).toBe(30);
  });

  it("auto-detects granularity from CalendarDateTime value", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDateTime(2024, 6, 15, 10, 0),
    });

    expect(state.granularity).toBe("second");
    expect(state.hasTime).toBe(true);
  });

  it("auto-detects granularity from CalendarDate value", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
    });

    expect(state.granularity).toBe("day");
    expect(state.hasTime).toBe(false);
  });

  it("respects explicit granularity over auto-detect", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
      granularity: "second",
    });

    expect(state.granularity).toBe("second");
    expect(state.hasTime).toBe(true);
  });

  it("shouldCloseOnSelect function variant works", () => {
    const shouldClose = vi.fn(() => false);
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
      shouldCloseOnSelect: shouldClose,
    });

    state.setOpen(true);
    expect(state.isOpen()).toBe(true);

    state.setDateValue(new CalendarDate(2024, 7, 1));
    expect(shouldClose).toHaveBeenCalled();
    expect(state.isOpen()).toBe(true); // Did not close because function returned false
  });

  it("shouldCloseOnSelect defaults to true", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
    });

    state.setOpen(true);
    state.setDateValue(new CalendarDate(2024, 7, 1));
    expect(state.isOpen()).toBe(false);
  });

  it("supports uncontrolled defaultOpen", () => {
    const state = createDatePickerState({
      defaultOpen: true,
    });

    expect(state.isOpen()).toBe(true);
    state.close();
    expect(state.isOpen()).toBe(false);
  });

  it("supports controlled open state and onOpenChange", () => {
    const onOpenChange = vi.fn();
    const state = createDatePickerState({
      isOpen: false,
      onOpenChange,
    });

    expect(state.isOpen()).toBe(false);
    state.open();
    expect(state.isOpen()).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("showEra is false for AD dates", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 1, 1),
    });

    expect(state.showEra()).toBe(false);
  });

  it("formatValue returns localized string", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
    });

    const formatted = state.formatValue("en-US");
    expect(formatted).toContain("2024");
    expect(formatted).toContain("15");
  });

  it("builtinValidation respects minValue", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 1, 1),
      minValue: new CalendarDate(2024, 6, 1),
    });

    expect(state.builtinValidation().isInvalid).toBe(true);
    expect(state.isInvalid()).toBe(true);
  });

  it("builtinValidation respects maxValue", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 12, 1),
      maxValue: new CalendarDate(2024, 6, 1),
    });

    expect(state.builtinValidation().isInvalid).toBe(true);
  });

  it("builtinValidation respects isDateUnavailable", () => {
    const state = createDatePickerState({
      defaultValue: new CalendarDate(2024, 6, 15),
      isDateUnavailable: (date) => date.day === 15,
    });

    expect(state.builtinValidation().isInvalid).toBe(true);
  });

  it("commits with placeholder time when shouldCloseOnSelect is true and no explicit time", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      onChange,
      granularity: "minute",
      shouldCloseOnSelect: true,
    });

    state.setOpen(true);
    state.setDateValue(new CalendarDate(2024, 7, 1));
    // Commits immediately with placeholder time (midnight) because shouldCloseOnSelect is true
    expect(onChange).toHaveBeenCalled();
    expect(state.value()).not.toBeNull();
    expect(state.isOpen()).toBe(false);
  });

  it("stores date transiently when shouldCloseOnSelect is false and no explicit time", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      onChange,
      granularity: "minute",
      shouldCloseOnSelect: false,
    });

    state.setOpen(true);
    state.setDateValue(new CalendarDate(2024, 7, 1));
    // Does not commit yet — waits for time selection
    expect(onChange).not.toHaveBeenCalled();
    expect(state.isOpen()).toBe(true);

    state.setTimeValue(new Time(14, 30));
    // Now commits combined date + time
    expect(onChange).toHaveBeenCalled();
    expect(state.value()).not.toBeNull();
  });

  it("commits when both date and time are explicitly selected", () => {
    const onChange = vi.fn();
    const state = createDatePickerState({
      onChange,
      granularity: "minute",
    });

    state.setOpen(true);
    state.setDateValue(new CalendarDate(2024, 7, 1));
    state.setTimeValue(new Time(14, 30));
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.hour).toBe(14);
    expect(lastCall.minute).toBe(30);
  });
});
