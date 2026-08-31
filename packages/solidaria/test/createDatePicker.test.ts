import { describe, it, expect, vi } from "vite-plus/test";
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

  it("label click routes through focusManager.focusFirst", () => {
    const aria = createDatePicker({}, fieldState, overlayState, calendarState);
    // Mirrors RAC useDatePicker: labelProps.onClick calls focusManager.focusFirst().
    // The focus manager is a real createFocusManager(ref); with no ref element it is
    // a no-op, so we assert the wiring exists and the handler does not throw.
    const fm = aria.focusManager as { focusFirst: () => void; focusLast: () => void };
    expect(fm.focusFirst).toBeTypeOf("function");
    expect(fm.focusLast).toBeTypeOf("function");
    expect(aria.labelProps.onClick).toBeTypeOf("function");
    expect(() => (aria.labelProps.onClick as () => void)()).not.toThrow();
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
