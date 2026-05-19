import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createDateRangePicker } from "../src/datepicker/createDateRangePicker";
import { I18nProvider } from "../src/i18n";

function createMockRangeState(
  overrides: Partial<{
    isDisabled: () => boolean;
    isReadOnly: () => boolean;
  }> = {},
) {
  return {
    isDisabled: () => false,
    isReadOnly: () => false,
    ...overrides,
  };
}

function TestDateRangePickerAria(props: {
  "aria-label"?: string;
  isRequired?: boolean;
  isInvalid?: boolean;
  buttonAriaLabel?: string;
  dialogAriaLabel?: string;
  calendarAriaLabel?: string;
  startFieldAriaLabel?: string;
  endFieldAriaLabel?: string;
  stateIsDisabled?: boolean;
  stateIsReadOnly?: boolean;
  isOpen?: boolean;
  onOpen?: () => void;
}) {
  const aria = createDateRangePicker(
    () => props,
    createMockRangeState({
      isDisabled: () => props.stateIsDisabled ?? false,
      isReadOnly: () => props.stateIsReadOnly ?? false,
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
      <div data-testid="start-input" {...aria.startInputProps} />
      <div data-testid="end-input" {...aria.endInputProps} />
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

  it("supports custom aria labels for button/dialog/calendar/start/end fields", () => {
    render(() => (
      <TestDateRangePickerAria
        aria-label="Range"
        buttonAriaLabel="Choose range"
        dialogAriaLabel="Date range dialog"
        calendarAriaLabel="Range month grid"
        startFieldAriaLabel="From"
        endFieldAriaLabel="To"
      />
    ));

    expect(screen.getByTestId("button")).toHaveAttribute("aria-label", "Choose range");
    expect(screen.getByTestId("dialog")).toHaveAttribute("aria-label", "Date range dialog");
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Range month grid");
    expect(screen.getByTestId("start")).toHaveAttribute("aria-label", "From");
    expect(screen.getByTestId("end")).toHaveAttribute("aria-label", "To");
    expect(screen.getByTestId("start-input")).toHaveAttribute("aria-label", "From");
    expect(screen.getByTestId("end-input")).toHaveAttribute("aria-label", "To");
  });

  it("uses localized start/end defaults for spanish locale", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <TestDateRangePickerAria aria-label="Rango" />
      </I18nProvider>
    ));

    expect(screen.getByTestId("start")).toHaveAttribute("aria-label", "Fecha de inicio");
    expect(screen.getByTestId("end")).toHaveAttribute("aria-label", "Fecha de fin");
  });

  it("applies aria-required and aria-invalid on group", () => {
    render(() => <TestDateRangePickerAria aria-label="Range" isRequired isInvalid />);

    const group = screen.getByTestId("group");
    expect(group).toHaveAttribute("aria-required", "true");
    expect(group).toHaveAttribute("aria-invalid", "true");
  });

  it("opens overlay when pressing Enter on start/end fields", () => {
    const onOpen = vi.fn();
    render(() => <TestDateRangePickerAria aria-label="Range" onOpen={onOpen} />);

    fireEvent.keyDown(screen.getByTestId("start"), { key: "Enter" });
    fireEvent.keyDown(screen.getByTestId("end"), { key: "ArrowDown" });

    expect(onOpen).toHaveBeenCalledTimes(2);
  });
});
