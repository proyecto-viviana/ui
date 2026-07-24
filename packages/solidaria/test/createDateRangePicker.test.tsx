import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createDateRangePicker } from "../src/datepicker/createDateRangePicker";
import { I18nProvider } from "../src/i18n";

// The hook reads a small slice of RangeCalendarState: the disabled/read-only
// flags, the selected value, and `formatValue` (for the selected-range SR
// description). Mirror exactly that surface — a bare mock throws at render,
// because the value-description memo runs eagerly.
function createMockRangeState(
  overrides: Partial<{
    isDisabled: () => boolean;
    isReadOnly: () => boolean;
    value: () => unknown;
    formatValue: () => { start: string; end: string } | null;
  }> = {},
) {
  return {
    isDisabled: () => false,
    isReadOnly: () => false,
    value: () => null,
    // Mirrors RangeCalendarState.formatValue: null when there is no value, so
    // createDateRangePicker publishes no "Selected Range" describedby.
    formatValue: () => null,
    ...overrides,
  };
}

function TestDateRangePickerAria(props: {
  "aria-label"?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  buttonAriaLabel?: string;
  dialogAriaLabel?: string;
  calendarAriaLabel?: string;
  stateIsDisabled?: boolean;
  stateIsReadOnly?: boolean;
  stateFormatValue?: () => { start: string; end: string } | null;
  isOpen?: boolean;
  onOpen?: () => void;
}) {
  const aria = createDateRangePicker(
    () => props,
    createMockRangeState({
      isDisabled: () => props.stateIsDisabled ?? false,
      isReadOnly: () => props.stateIsReadOnly ?? false,
      formatValue: props.stateFormatValue ?? (() => null),
    }) as any,
    {
      isOpen: props.isOpen ?? false,
      open: () => props.onOpen?.(),
      close: () => {},
      toggle: () => {},
    },
  );

  return (
    <>
      <div data-testid="group" {...aria.groupProps} />
      <div data-testid="start" {...aria.startFieldProps} />
      <div data-testid="end" {...aria.endFieldProps} />
      <button data-testid="button" {...aria.buttonProps} />
      <div data-testid="dialog" {...aria.dialogProps} />
      <div data-testid="calendar" {...aria.calendarProps} />
    </>
  );
}

describe("createDateRangePicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("honors button/calendar labels, keeps the dialog labelledby-only, and localizes the field defaults", () => {
    render(() => (
      <TestDateRangePickerAria
        aria-label="Range"
        buttonAriaLabel="Choose range"
        calendarAriaLabel="Range month grid"
      />
    ));

    // useDateRangePicker: buttonProps `aria-label` defaults to the "calendar"
    // string; the port exposes a buttonAriaLabel escape hatch over it.
    expect(screen.getByTestId("button")).toHaveAttribute("aria-label", "Choose range");
    // calendarProps upstream carries no aria-label; the port threads the
    // calendarAriaLabel escape hatch (largely vestigial — the popover calendar
    // reads its state via context).
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Range month grid");
    // Faithful RAC dialogProps = { id, aria-labelledby } only — never aria-label.
    const dialog = screen.getByTestId("dialog");
    expect(dialog).not.toHaveAttribute("aria-label");
    expect(dialog).toHaveAttribute("aria-labelledby");
    // The start/end fields always take the localized startDate/endDate labels —
    // there is no per-field override upstream.
    expect(screen.getByTestId("start")).toHaveAttribute("aria-label", "Start Date");
    expect(screen.getByTestId("end")).toHaveAttribute("aria-label", "End Date");
  });

  it("falls the dialog label back onto the calendar, never onto the dialog itself", () => {
    render(() => <TestDateRangePickerAria aria-label="Range" dialogAriaLabel="Range dialog" />);

    expect(screen.getByTestId("dialog")).not.toHaveAttribute("aria-label");
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Range dialog");
  });

  it("uses localized start/end/button defaults for spanish locale", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <TestDateRangePickerAria aria-label="Rango" />
      </I18nProvider>
    ));

    expect(screen.getByTestId("start")).toHaveAttribute("aria-label", "Fecha de inicio");
    expect(screen.getByTestId("end")).toHaveAttribute("aria-label", "Fecha final");
    expect(screen.getByTestId("button")).toHaveAttribute("aria-label", "Calendario");
    expect(screen.getByTestId("dialog")).not.toHaveAttribute("aria-label");
  });

  it("groupProps carries aria-disabled but not aria-required/aria-invalid (faithful useDateRangePicker)", () => {
    render(() => <TestDateRangePickerAria aria-label="Range" isDisabled isRequired isInvalid />);

    const group = screen.getByTestId("group");
    // useDateRangePicker groupProps = { role:'group', aria-disabled, aria-labelledby,
    // aria-describedby, onKeyDown, onKeyUp } — required/invalid live on the fields.
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("aria-disabled", "true");
    expect(group).not.toHaveAttribute("aria-required");
    expect(group).not.toHaveAttribute("aria-invalid");
  });

  it("publishes a selected-range description on the group when the state has a value", () => {
    render(() => (
      <TestDateRangePickerAria
        aria-label="Range"
        stateFormatValue={() => ({ start: "February 3", end: "February 14, 2025" })}
      />
    ));

    const group = screen.getByTestId("group");
    const describedBy = group.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    // The hidden description node holds the localized "selectedRangeDescription".
    const desc = document.getElementById(describedBy!.split(" ")[0]);
    expect(desc?.textContent).toBe("Selected Range: February 3 to February 14, 2025");
  });

  it("opens the popover on Alt+ArrowDown over the group (faithful useDatePickerGroup)", () => {
    const onOpen = vi.fn();
    render(() => <TestDateRangePickerAria aria-label="Range" onOpen={onOpen} />);

    fireEvent.keyDown(screen.getByTestId("group"), { key: "ArrowDown", altKey: true });

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
