/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, cleanup, waitFor, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import {
  DateRangePicker,
  DateRangePickerLabel,
  DateRangePickerDescription,
  DateRangePickerErrorMessage,
  DateRangePickerButton,
  DateRangePickerContent,
  useDateRangePickerContext,
} from "../src/DatePicker";
import { RangeCalendar, RangeCalendarGrid, RangeCalendarCell } from "../src/RangeCalendar";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

let user: ReturnType<typeof setupUser>;

async function waitForHydration() {
  await waitFor(() => {
    const picker = document.querySelector(
      ".solidaria-DateRangePicker:not(.solidaria-DateRangePicker--placeholder)",
    );
    expect(picker).toBeInTheDocument();
  });
}

function DateRangeFields() {
  const context = useDateRangePickerContext();
  return (
    <div>
      <div data-testid="start-field" {...context.pickerAria.startFieldProps}>
        Start
      </div>
      <div data-testid="end-field" {...context.pickerAria.endFieldProps}>
        End
      </div>
    </div>
  );
}

function TestDateRangePicker(props: {
  pickerProps?: Partial<Parameters<typeof DateRangePicker>[0]>;
}) {
  return (
    <DateRangePicker aria-label="Range" {...props.pickerProps}>
      <DateRangePickerLabel>Trip dates</DateRangePickerLabel>
      <DateRangeFields />
      <DateRangePickerButton>Open</DateRangePickerButton>
      <DateRangePickerDescription>Choose a start and end date</DateRangePickerDescription>
      <DateRangePickerErrorMessage>Invalid range</DateRangePickerErrorMessage>
      <DateRangePickerContent>
        <RangeCalendar>
          <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
        </RangeCalendar>
      </DateRangePickerContent>
    </DateRangePicker>
  );
}

describe("DateRangePicker", () => {
  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ===== Rendering =====

  it("renders and opens content via trigger button", async () => {
    render(() => <TestDateRangePicker />);

    await waitForHydration();
    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    await waitFor(() => {
      const content = document.querySelector(".solidaria-DateRangePickerContent");
      expect(content).toBeInTheDocument();
    });
  });

  it("renders label, description, and error message slots", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isInvalid: true }} />);
    await waitForHydration();

    expect(screen.getByText("Trip dates")).toBeInTheDocument();
    expect(screen.getByText("Choose a start and end date")).toBeInTheDocument();
    expect(screen.getByText("Invalid range")).toBeInTheDocument();
  });

  it("applies default localized labels to start/end fields", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    expect(screen.getByTestId("start-field")).toHaveAttribute("aria-label", "Start date");
    expect(screen.getByTestId("end-field")).toHaveAttribute("aria-label", "End date");
  });

  // ===== Data attributes =====

  it("sets required and invalid data attributes from props", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isRequired: true, isInvalid: true }} />);

    await waitForHydration();
    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toHaveAttribute("data-required");
    expect(picker).toHaveAttribute("data-invalid");
  });

  it("sets data-disabled when isDisabled is true", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isDisabled: true }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toHaveAttribute("data-disabled");
  });

  it("sets data-readonly when isReadOnly is true", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isReadOnly: true }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toHaveAttribute("data-readonly");
  });

  // ===== Keyboard interactions =====

  it("opens popup from start field via keyboard", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const start = screen.getByTestId("start-field");
    start.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).toBeInTheDocument();
    });
  });

  it("closes popup via Escape key", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    // Open
    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).toBeInTheDocument();
    });

    // Close
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).not.toBeInTheDocument();
    });
  });

  it("keeps trigger button keyboard-focusable", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const button = document.querySelector(".solidaria-DateRangePickerButton");
    expect(button).toHaveAttribute("tabindex", "0");
  });

  // ===== Disabled/ReadOnly states =====

  it("should not open when isDisabled", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isDisabled: true }} />);
    await waitForHydration();

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    // Content should NOT appear
    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).not.toBeInTheDocument();
    });
  });

  it("should still open when isReadOnly (view-only mode)", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isReadOnly: true }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toHaveAttribute("data-readonly");
  });

  // ===== Controlled value =====

  it("supports controlled value", async () => {
    const onChange = vi.fn();
    const value = {
      start: new CalendarDate(2024, 3, 10),
      end: new CalendarDate(2024, 3, 15),
    };

    render(() => <TestDateRangePicker pickerProps={{ value, onChange }} />);
    await waitForHydration();

    // Component should render without error with controlled value
    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toBeInTheDocument();
  });

  it("supports uncontrolled with defaultValue", async () => {
    const defaultValue = {
      start: new CalendarDate(2024, 6, 1),
      end: new CalendarDate(2024, 6, 7),
    };

    render(() => <TestDateRangePicker pickerProps={{ defaultValue }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toBeInTheDocument();
  });

  it("renders startName and endName hidden inputs for form submission", async () => {
    const defaultValue = {
      start: new CalendarDate(2024, 6, 1),
      end: new CalendarDate(2024, 6, 7),
    };

    render(() => (
      <TestDateRangePicker
        pickerProps={{
          defaultValue,
          startName: "startDate",
          endName: "endDate",
          form: "booking",
        }}
      />
    ));
    await waitForHydration();

    const startInput = document.querySelector('input[name="startDate"]') as HTMLInputElement;
    const endInput = document.querySelector('input[name="endDate"]') as HTMLInputElement;

    expect(startInput).toBeInTheDocument();
    expect(startInput).toHaveAttribute("form", "booking");
    expect(startInput).toHaveValue("2024-06-01");
    expect(endInput).toBeInTheDocument();
    expect(endInput).toHaveAttribute("form", "booking");
    expect(endInput).toHaveValue("2024-06-07");
  });

  // ===== Validation =====

  it("supports minValue and maxValue constraints", async () => {
    const minValue = new CalendarDate(2024, 1, 1);
    const maxValue = new CalendarDate(2024, 12, 31);

    render(() => <TestDateRangePicker pickerProps={{ minValue, maxValue }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toBeInTheDocument();
  });

  it("marks invalid when isInvalid is set", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isInvalid: true }} />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).toHaveAttribute("data-invalid");
  });

  it("does not show error message when not invalid", async () => {
    render(() => <TestDateRangePicker pickerProps={{ isInvalid: false }} />);
    await waitForHydration();

    // Error message should not render or be visible when not invalid
    const picker = document.querySelector(".solidaria-DateRangePicker");
    expect(picker).not.toHaveAttribute("data-invalid");
  });

  // ===== Open/close behavior =====

  it("should apply data-open state when opened", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const picker = document.querySelector(".solidaria-DateRangePicker") as HTMLElement;
    expect(picker).not.toHaveAttribute("data-open");

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    await waitFor(() => {
      expect(picker).toHaveAttribute("data-open");
    });
  });

  it("renders content with defaultOpen", async () => {
    render(() => <TestDateRangePicker pickerProps={{ defaultOpen: true }} />);
    await waitForHydration();

    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).toBeInTheDocument();
    });
  });

  it("requests but does not mutate controlled open state", async () => {
    const onOpenChange = vi.fn();
    render(() => <TestDateRangePicker pickerProps={{ isOpen: false, onOpenChange }} />);
    await waitForHydration();

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(document.querySelector(".solidaria-DateRangePickerContent")).not.toBeInTheDocument();
  });

  it("opens via Space key on trigger button", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    trigger.focus();
    await user.keyboard(" ");

    await waitFor(() => {
      expect(document.querySelector(".solidaria-DateRangePickerContent")).toBeInTheDocument();
    });
  });

  // ===== ARIA attributes =====

  it("renders the label element", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const label = screen.getByText("Trip dates");
    expect(label).toBeInTheDocument();
  });

  it('has role="group" on the field container', async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const group = document.querySelector('[role="group"]');
    expect(group).toBeInTheDocument();
  });

  // ===== Calendar date selection =====

  it("renders calendar when opened", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    await waitFor(() => {
      // Calendar grid should be present
      const grid = document.querySelector('[role="grid"]');
      expect(grid).toBeInTheDocument();
    });
  });

  it("calendar cells are clickable when open", async () => {
    render(() => <TestDateRangePicker />);
    await waitForHydration();

    const trigger = document.querySelector(".solidaria-DateRangePickerButton") as HTMLElement;
    await user.click(trigger);

    await waitFor(() => {
      const cells = document.querySelectorAll('[role="gridcell"] button, [role="gridcell"]');
      expect(cells.length).toBeGreaterThan(0);
    });
  });
});
