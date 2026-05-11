import { describe, it, expect, vi } from "vitest";
import { createDatePicker } from "../src/datepicker/createDatePicker";
import { createDateFieldState, createCalendarState } from "@proyecto-viviana/solid-stately";
import { CalendarDate } from "@internationalized/date";

describe("createDatePicker", () => {
  const fieldState = createDateFieldState({
    defaultValue: new CalendarDate(2024, 6, 15),
  });

  const calendarState = createCalendarState({
    defaultValue: new CalendarDate(2024, 6, 15),
  });

  const overlayState = {
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
  };

  it("fieldProps is not empty", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    expect(aria.fieldProps.id).toBeTruthy();
    expect(aria.fieldProps["aria-describedby"]).toBeDefined();
    expect(aria.fieldProps.onChange).toBeTypeOf("function");
  });

  it("buttonProps has tabIndex 0", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    expect(aria.buttonProps.tabIndex).toBe(0);
  });

  it("buttonProps has aria-labelledby linking to label", () => {
    const aria = createDatePicker({ label: "Date" }, fieldState, overlayState, calendarState);
    expect(aria.buttonProps["aria-labelledby"]).toContain(aria.labelProps.id);
  });

  it("calendarProps has autoFocus, value, onChange", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    expect(aria.calendarProps.autoFocus).toBe(true);
    expect(aria.calendarProps.value).toBeDefined();
    expect(aria.calendarProps.onChange).toBeTypeOf("function");
  });

  it("label click focuses first segment via focusManager", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    const focusFirst = vi.fn();
    const focusLast = vi.fn();
    (
      aria.focusManager as unknown as { _register: (a: () => void, b: () => void) => void }
    )._register(focusFirst, focusLast);
    // Simulate label click
    if (typeof aria.labelProps.onClick === "function") {
      aria.labelProps.onClick();
    }
    expect(focusFirst).toHaveBeenCalled();
  });

  it("returns validation details", () => {
    const aria = createDatePicker(
      { minValue: new CalendarDate(2024, 1, 1), maxValue: new CalendarDate(2024, 12, 31) },
      fieldState,
      overlayState,
      calendarState,
    );
    expect(aria.validationDetails).toBeDefined();
    expect(aria.validationDetails.minValue).toBeDefined();
    expect(aria.validationDetails.maxValue).toBeDefined();
  });

  it("button is keyboard-activatable via createPress", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    // createPress adds onKeyDown handler for Enter/Space
    expect(aria.buttonProps.onKeyDown).toBeTypeOf("function");
  });

  it("groupProps contains aria-label and aria-labelledby from label", () => {
    const aria = createDatePicker({ label: "Due date" }, fieldState, overlayState, calendarState);
    expect(aria.groupProps.role).toBe("group");
    expect(aria.groupProps["aria-labelledby"]).toBeDefined();
  });
});
