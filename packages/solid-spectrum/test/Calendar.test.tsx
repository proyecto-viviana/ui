import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { Calendar, CalendarContext } from "../src/Calendar";
import { CalendarDateClass as CalendarDate } from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

async function waitForCalendar() {
  await waitFor(() => {
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(0);
  });
}

describe("Calendar (solid-spectrum)", () => {
  const user = setupUser();

  afterEach(() => {
    cleanup();
  });

  it("renders the public Calendar subpath with a selected controlled value", async () => {
    render(() => <Calendar aria-label="Appointment date" value={new CalendarDate(2025, 2, 3)} />);
    await waitForCalendar();

    expect(screen.getByRole("group", { name: "Appointment date" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /February 3, 2025/i })).toHaveAttribute(
      "data-selected",
    );
  });

  it("normalizes S2 firstDayOfWeek string props", async () => {
    render(() => (
      <Calendar
        aria-label="Appointment date"
        value={new CalendarDate(2025, 2, 3)}
        firstDayOfWeek="mon"
      />
    ));
    await waitForCalendar();

    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("renders invalid error text and multi-month grids", async () => {
    render(() => (
      <Calendar
        aria-label="Appointment date"
        value={new CalendarDate(2025, 2, 3)}
        isInvalid
        errorMessage="Choose an available date."
        visibleMonths={2}
      />
    ));
    await waitForCalendar();

    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(screen.getByText("February 2025")).toBeInTheDocument();
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    expect(screen.getByText("Choose an available date.")).toBeInTheDocument();
  });

  it("merges CalendarContext props", async () => {
    render(() => (
      <CalendarContext.Provider value={{ isDisabled: true, firstDayOfWeek: "mon" }}>
        <Calendar aria-label="Appointment date" value={new CalendarDate(2025, 2, 3)} />
      </CalendarContext.Provider>
    ));
    await waitForCalendar();

    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers[0]).toBe("M");
  });

  it("keeps unavailable dates immutable", async () => {
    let selected = new CalendarDate(2025, 2, 3);
    render(() => (
      <Calendar
        aria-label="Appointment date"
        value={selected}
        isDateUnavailable={(date) => date.day === 10}
        onChange={(nextValue) => {
          selected = nextValue;
        }}
      />
    ));
    await waitForCalendar();

    await user.click(screen.getByRole("button", { name: /February 10, 2025/i }));
    expect(screen.getByRole("button", { name: /February 10, 2025/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(String(selected)).toBe("2025-02-03");

    await user.click(screen.getByRole("button", { name: /February 12, 2025/i }));
    expect(String(selected)).toBe("2025-02-12");
  });
});
