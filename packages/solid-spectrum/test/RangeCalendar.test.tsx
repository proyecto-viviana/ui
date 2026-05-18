import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { RangeCalendar, RangeCalendarContext } from "../src";
import { Provider } from "../src/provider";
import { CalendarDateClass as CalendarDate } from "@proyecto-viviana/solid-stately";

async function waitForRangeCalendar() {
  await waitFor(() => {
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(0);
  });
}

describe("RangeCalendar (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the public RangeCalendar export with a selected controlled range", async () => {
    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        value={{
          start: new CalendarDate(2025, 2, 3),
          end: new CalendarDate(2025, 2, 7),
        }}
      />
    ));
    await waitForRangeCalendar();

    expect(
      screen.getByRole("application", { name: "Trip dates, February 2025" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /February 3, 2025/i })).toHaveAttribute(
      "data-selection-start",
    );
    expect(screen.getByRole("button", { name: /February 7, 2025/i })).toHaveAttribute(
      "data-selection-end",
    );
  });

  it("keeps every rendered month grid to seven columns", async () => {
    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        defaultFocusedValue={new CalendarDate(2025, 2, 15)}
        visibleMonths={2}
        firstDayOfWeek="mon"
      />
    ));
    await waitForRangeCalendar();

    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent)).toEqual([
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
      "S",
      "M",
      "T",
      "W",
      "T",
      "F",
      "S",
      "S",
    ]);

    const grids = Array.from(document.querySelectorAll('table[role="grid"]'));
    for (const grid of grids) {
      expect(grid).toHaveStyle({ width: "224px", "table-layout": "fixed" });
      for (const row of Array.from(grid.querySelectorAll("tbody tr"))) {
        expect(row.children).toHaveLength(7);
      }
    }
  });

  it("renders invalid error text and describes invalid selected cells", async () => {
    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        value={{
          start: new CalendarDate(2025, 2, 3),
          end: new CalendarDate(2025, 2, 7),
        }}
        isInvalid
        errorMessage="Choose a shorter range."
        visibleMonths={2}
      />
    ));
    await waitForRangeCalendar();

    expect(screen.getAllByRole("grid")).toHaveLength(2);
    expect(screen.getByText("February 2025")).toBeInTheDocument();
    expect(screen.getByText("March 2025")).toBeInTheDocument();

    const error = screen.getByText("Choose a shorter range.");
    const start = screen.getByRole("button", { name: /February 3, 2025/i });
    expect(start).toHaveAttribute("aria-invalid", "true");
    expect(start.getAttribute("aria-describedby") ?? "").toContain(error.id);
  });

  it("inherits Provider locale for month formatting and locale default week start", async () => {
    render(() => (
      <Provider locale="fr-FR">
        <RangeCalendar
          aria-label="Dates du voyage"
          defaultFocusedValue={new CalendarDate(2025, 2, 15)}
        />
      </Provider>
    ));
    await waitForRangeCalendar();

    expect(screen.getByText("février 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /samedi 15 février 2025/i })).toBeInTheDocument();
    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers).toEqual(["L", "M", "M", "J", "V", "S", "D"]);
  });

  it("merges RangeCalendarContext props", async () => {
    render(() => (
      <RangeCalendarContext.Provider value={{ isDisabled: true, firstDayOfWeek: "mon" }}>
        <RangeCalendar
          aria-label="Trip dates"
          value={{
            start: new CalendarDate(2025, 2, 3),
            end: new CalendarDate(2025, 2, 7),
          }}
        />
      </RangeCalendarContext.Provider>
    ));
    await waitForRangeCalendar();

    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers[0]).toBe("M");
  });
});
