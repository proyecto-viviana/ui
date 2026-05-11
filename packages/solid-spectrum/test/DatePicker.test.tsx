import { describe, it, expect, afterEach } from "vitest";
import { render, screen, waitFor, cleanup } from "@solidjs/testing-library";
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

  it("popover frame width tracks field group width via ResizeObserver", async () => {
    render(() => <DatePicker label="Event" />);
    await waitForHydration();

    const button = screen.getByRole("button");
    await user.click(button);

    const dialog = await waitFor(() => screen.getByRole("dialog"));

    // Trigger ResizeObserver with a mock width
    const instances = (
      globalThis as unknown as {
        ResizeObserver: typeof ResizeObserver & {
          getInstances(): Array<{
            trigger(entries: Array<{ contentRect: { width: number } }>): void;
          }>;
        };
      }
    ).ResizeObserver.getInstances();
    for (const inst of instances) {
      inst.trigger([{ contentRect: { width: 350 } } as unknown as ResizeObserverEntry]);
    }

    const frame = dialog.firstElementChild as HTMLElement;
    await waitFor(() => {
      expect(frame.style.width).toBe("350px");
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
