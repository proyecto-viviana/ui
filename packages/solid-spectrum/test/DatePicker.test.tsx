import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { DatePicker } from "../src/calendar/DatePicker";
import {
  CalendarDateClass as CalendarDate,
  CalendarDateTimeClass as CalendarDateTime,
} from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

async function waitForHydration() {
  await waitFor(() => {
    expect(screen.getAllByRole("spinbutton").length).toBeGreaterThan(0);
  });
}

const user = setupUser();

describe("DatePicker (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
  });

  it("links visible label to picker group semantics", async () => {
    render(() => <DatePicker label="Event date" description="Select an event day" />);
    await waitForHydration();

    const group = screen.getByRole("group", { name: "Event date" });
    const description = screen.getByText("Select an event day");
    const describedby = group.getAttribute("aria-describedby") ?? "";

    expect(group).toBeInTheDocument();
    expect(description.id).toBeTruthy();
    expect(describedby.split(" ")).toContain(description.id);
  });

  it("links error message when invalid", async () => {
    render(() => <DatePicker label="Birth date" isInvalid errorMessage="Date is required" />);
    await waitForHydration();

    const group = screen.getByRole("group", { name: "Birth date" });
    const error = screen.getByText("Date is required");
    const describedby = group.getAttribute("aria-describedby") ?? "";

    expect(error.id).toBeTruthy();
    expect(describedby.split(" ")).toContain(error.id);
  });

  it("shows required indicator when isRequired is set", async () => {
    render(() => <DatePicker label="Appointment" isRequired />);
    await waitForHydration();

    const group = screen.getByRole("group", { name: "Appointment" });
    expect(group).toHaveAttribute("aria-required", "true");
  });

  it("renders contextual help next to the visible label", async () => {
    render(() => (
      <DatePicker label="Appointment" contextualHelp={<button type="button">Date help</button>} />
    ));
    await waitForHydration();

    const contextualHelp = document.querySelector('[data-slot="contextualHelp"]') as HTMLElement;
    expect(contextualHelp).toBeInTheDocument();
    expect(contextualHelp).toContainElement(screen.getByRole("button", { name: "Date help" }));
  });

  it("forwards shouldForceLeadingZeros to visible date segments", async () => {
    render(() => (
      <DatePicker
        aria-label="Date"
        defaultValue={new CalendarDate(2025, 2, 3)}
        shouldForceLeadingZeros
      />
    ));
    await waitForHydration();

    const segmentTexts = screen.getAllByRole("spinbutton").map((segment) => segment.textContent);
    expect(segmentTexts).toContain("02");
    expect(segmentTexts).toContain("03");
  });

  it("forwards custom button aria-label", async () => {
    render(() => <DatePicker aria-label="Date picker" buttonAriaLabel="Choose date" />);
    await waitForHydration();

    expect(screen.getByRole("button", { name: "Choose date" })).toBeInTheDocument();
  });

  it("renders TimeField inside popover when granularity includes time", async () => {
    render(() => <DatePicker label="Event" granularity="minute" />);
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });
  });

  it("renders TimeField inside popover when defaultValue is a CalendarDateTime", async () => {
    render(() => (
      <DatePicker label="Event" defaultValue={new CalendarDateTime(2024, 6, 15, 10, 30)} />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });
  });

  it("forwards shouldForceLeadingZeros to the popup TimeField", async () => {
    render(() => (
      <DatePicker
        label="Event"
        defaultValue={new CalendarDateTime(2025, 2, 3, 8, 5)}
        granularity="minute"
        hourCycle={24}
        shouldForceLeadingZeros
      />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });

    const hourSegments = screen.getAllByRole("spinbutton", { name: /hour/i });
    const minuteSegments = screen.getAllByRole("spinbutton", { name: /minute/i });
    expect(hourSegments[hourSegments.length - 1]).toHaveTextContent("08");
    expect(minuteSegments[minuteSegments.length - 1]).toHaveTextContent("05");
  });

  it("wires popup TimeField changes back to the DatePicker value", async () => {
    let latest = new CalendarDateTime(2024, 6, 15, 10, 30);

    function ControlledDatePicker() {
      const [value, setValue] = createSignal(latest);

      return (
        <DatePicker
          label="Event"
          value={value()}
          granularity="minute"
          hourCycle={24}
          onChange={(nextValue) => {
            if (nextValue) {
              latest = nextValue as typeof latest;
              setValue(() => nextValue as typeof latest);
            }
          }}
        />
      );
    }

    render(() => <ControlledDatePicker />);
    await waitForHydration();

    await user.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Time")).toBeInTheDocument();
    });

    const hourSegments = screen.getAllByRole("spinbutton", { name: /hour/i }) as HTMLElement[];
    const popupHourSegment = hourSegments[hourSegments.length - 1];
    popupHourSegment.focus();
    await user.keyboard("{ArrowUp}");

    await waitFor(() => {
      expect(String(latest)).toContain("T11:30");
    });
  });

  it("routes calendar state props into the popup calendar", async () => {
    render(() => (
      <DatePicker
        label="Event"
        defaultValue={new CalendarDate(2025, 2, 14)}
        maxVisibleMonths={2}
        firstDayOfWeek="mon"
        minValue={new CalendarDate(2025, 2, 3)}
        maxValue={new CalendarDate(2025, 2, 20)}
        isDateUnavailable={(date) => date.day === 10}
      />
    ));
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(screen.getAllByRole("grid")).toHaveLength(2);
    });

    const [firstGrid] = screen.getAllByRole("grid");
    const weekdayLabels = Array.from(firstGrid.querySelectorAll("thead th")).map(
      (cell) => cell.textContent?.trim() ?? "",
    );
    expect(weekdayLabels).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(screen.getByRole("button", { name: /Sunday, February 2, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Monday, February 10, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: /Friday, February 21, 2025/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  it("renders fixed medium calendar popover geometry by default", async () => {
    render(() => <DatePicker label="Event" defaultValue={new CalendarDate(2025, 2, 14)} />);
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    const dialog = await waitFor(() => screen.getByRole("dialog"));
    const frame = dialog.firstElementChild as HTMLElement;

    expect(frame.style.minWidth).toBe("240px");
    await waitFor(() => {
      expect(screen.getAllByRole("grid")).toHaveLength(1);
    });
  });

  it("field group click focuses the last non-placeholder segment", async () => {
    render(() => <DatePicker label="Event" defaultValue={new CalendarDate(2024, 6, 15)} />);
    await waitForHydration();

    const root = screen.getByRole("group", { name: "Event" });
    const fieldGroup = Array.from(root.children).find((child) =>
      child.querySelector("button"),
    ) as HTMLElement;

    expect(fieldGroup).toBeTruthy();

    await user.click(fieldGroup);

    const segments = fieldGroup.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    const lastSegment = segments[segments.length - 1];
    expect(document.activeElement).toBe(lastSegment);
  });
});
