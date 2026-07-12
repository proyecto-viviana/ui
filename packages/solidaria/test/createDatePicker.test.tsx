import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createDatePicker } from "../src/datepicker/createDatePicker";
import { I18nProvider } from "../src/i18n";

function createMockFieldState(
  overrides: Partial<{
    isDisabled: () => boolean;
    isReadOnly: () => boolean;
    isRequired: () => boolean;
    isInvalid: () => boolean;
  }> = {},
) {
  const base = {
    isDisabled: () => false,
    isReadOnly: () => false,
    isRequired: () => false,
    isInvalid: () => false,
    ...overrides,
  };
  // createDatePicker reads the value model (value/formatValue for the selected-date
  // description) and displayValidation (via createField); a bare mock without these
  // throws at render. Mirror the real DateFieldState surface the hook touches.
  return {
    ...base,
    value: () => null,
    defaultValue: undefined,
    setValue: () => {},
    formatValue: () => "",
    displayValidation: () => ({
      isInvalid: base.isInvalid(),
      validationErrors: [] as string[],
      validationDetails: {},
    }),
  };
}

function createMockOverlayState() {
  return {
    isOpen: false,
    open: () => {},
    close: () => {},
    toggle: () => {},
  };
}

function TestDatePickerAria(props: {
  "aria-label"?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  buttonAriaLabel?: string;
  dialogAriaLabel?: string;
  calendarAriaLabel?: string;
  stateIsRequired?: boolean;
  stateIsInvalid?: boolean;
}) {
  const aria = createDatePicker(
    () => props,
    createMockFieldState({
      isRequired: () => props.stateIsRequired ?? false,
      isInvalid: () => props.stateIsInvalid ?? false,
    }) as any,
    createMockOverlayState(),
  );

  return (
    <>
      <div data-testid="group" {...aria.groupProps} />
      <div data-testid="field" {...aria.fieldProps} />
      <button data-testid="button" {...aria.buttonProps} />
      <div data-testid="dialog" {...aria.dialogProps} />
      <div data-testid="calendar" {...aria.calendarProps} />
    </>
  );
}

describe("createDatePicker", () => {
  afterEach(() => {
    cleanup();
  });

  it("supports custom aria labels for button and calendar; dialog is labelledby-only", () => {
    render(() => (
      <TestDatePickerAria
        aria-label="Date"
        buttonAriaLabel="Choose date"
        calendarAriaLabel="Month grid"
      />
    ));

    expect(screen.getByTestId("button")).toHaveAttribute("aria-label", "Choose date");
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Month grid");
    // Faithful RAC dialogProps = { id, aria-labelledby } only — no aria-label.
    const dialog = screen.getByTestId("dialog");
    expect(dialog).not.toHaveAttribute("aria-label");
    expect(dialog).toHaveAttribute("aria-labelledby");
  });

  it("falls back dialog label onto the calendar when no calendar label is provided", () => {
    render(() => <TestDatePickerAria aria-label="Date" dialogAriaLabel="Picker dialog" />);

    // The dialog itself never takes an aria-label; the dialogAriaLabel escape hatch
    // only seeds the calendar's aria-label fallback.
    expect(screen.getByTestId("dialog")).not.toHaveAttribute("aria-label");
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Picker dialog");
  });

  it("uses localized default labels for spanish locale", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <TestDatePickerAria aria-label="Fecha" />
      </I18nProvider>
    ));

    // Button label = @react-aria/datepicker "calendar" string (Calendario in es-ES),
    // mirroring useDatePicker's `stringFormatter.format('calendar')`.
    expect(screen.getByTestId("button")).toHaveAttribute("aria-label", "Calendario");
    expect(screen.getByTestId("dialog")).not.toHaveAttribute("aria-label");
    expect(screen.getByTestId("calendar")).toHaveAttribute("aria-label", "Calendario");
  });

  it("groupProps carries aria-disabled but not aria-required/aria-invalid (faithful useDatePicker)", () => {
    render(() => <TestDatePickerAria aria-label="Date" isDisabled isRequired isInvalid />);

    const group = screen.getByTestId("group");
    // useDatePicker groupProps = { role:'group', aria-disabled, aria-labelledby,
    // aria-describedby, onKeyDown, onKeyUp } — required/invalid live on the segments,
    // never on the group shell.
    expect(group).toHaveAttribute("role", "group");
    expect(group).toHaveAttribute("aria-disabled", "true");
    expect(group).not.toHaveAttribute("aria-required");
    expect(group).not.toHaveAttribute("aria-invalid");
  });
});
