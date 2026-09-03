import { afterEach, describe, expect, it } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { RangeCalendar, RangeCalendarContext } from "../src";
import { Provider } from "../src/provider";
import { CalendarDateClass as CalendarDate } from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

async function waitForRangeCalendar() {
  await waitFor(() => {
    expect(screen.getAllByRole("grid").length).toBeGreaterThan(0);
  });
}

describe("RangeCalendar (solid-spectrum)", () => {
  const user = setupUser();

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
    expect(document.querySelector('[data-selection-start][role="button"]')).toHaveAttribute(
      "aria-label",
      expect.stringContaining("February 3, 2025 selected"),
    );
    expect(document.querySelector('[data-selection-end][role="button"]')).toHaveAttribute(
      "aria-label",
      expect.stringContaining("February 7, 2025 selected"),
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
    const contextRef = { current: null as HTMLDivElement | null };
    let localRef: HTMLDivElement | undefined;

    render(() => (
      <RangeCalendarContext.Provider
        value={{
          isDisabled: true,
          firstDayOfWeek: "mon",
          ref: contextRef,
          UNSAFE_style: { margin: "3px" },
        }}
      >
        <RangeCalendar
          aria-label="Trip dates"
          value={{
            start: new CalendarDate(2025, 2, 3),
            end: new CalendarDate(2025, 2, 7),
          }}
          ref={(element) => {
            localRef = element;
          }}
          UNSAFE_style={{ width: "224px" }}
        />
      </RangeCalendarContext.Provider>
    ));
    await waitForRangeCalendar();

    const root = screen.getByRole("application", { name: /Trip dates/i });
    expect(contextRef.current).toBe(root);
    expect(localRef).toBe(root);
    expect(root).toHaveStyle({ margin: "3px", width: "224px" });
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers[0]).toBe("M");
  });

  it("pages by visible months by default and by one month when pageBehavior is single", async () => {
    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        value={{
          start: new CalendarDate(2025, 2, 3),
          end: new CalendarDate(2025, 2, 7),
        }}
        visibleMonths={2}
      />
    ));
    await waitForRangeCalendar();

    expect(screen.getByText("February 2025")).toBeInTheDocument();
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    // Two buttons carry the "Next" label (visible header nav + the trailing
    // VisuallyHidden next-button); the visible one is first in DOM order.
    await user.click(screen.getAllByRole("button", { name: "Next" })[0]);
    expect(screen.getByText("April 2025")).toBeInTheDocument();
    expect(screen.getByText("May 2025")).toBeInTheDocument();

    cleanup();

    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        value={{
          start: new CalendarDate(2025, 2, 3),
          end: new CalendarDate(2025, 2, 7),
        }}
        visibleMonths={2}
        pageBehavior="single"
      />
    ));
    await waitForRangeCalendar();

    // Two buttons carry the "Next" label (visible header nav + the trailing
    // VisuallyHidden next-button); the visible one is first in DOM order.
    await user.click(screen.getAllByRole("button", { name: "Next" })[0]);
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    expect(screen.getByText("April 2025")).toBeInTheDocument();
  });

  it("keeps unavailable dates immutable and renders strike markup", async () => {
    let selected = {
      start: new CalendarDate(2025, 2, 3),
      end: new CalendarDate(2025, 2, 7),
    };

    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        value={selected}
        isDateUnavailable={(date) => date.day === 10}
        onChange={(nextValue) => {
          if (nextValue) {
            selected = nextValue;
          }
        }}
      />
    ));
    await waitForRangeCalendar();

    const unavailableDate = screen.getByRole("button", { name: /February 10, 2025/i });
    await user.click(unavailableDate);

    expect(unavailableDate).toHaveAttribute("aria-disabled", "true");
    expect(unavailableDate.querySelectorAll('[role="presentation"]')).toHaveLength(2);
    expect(String(selected.start)).toBe("2025-02-03");
    expect(String(selected.end)).toBe("2025-02-07");
  });

  it("sizes a one-month RangeCalendar with cell-gap (272px)", async () => {
    render(() => (
      <RangeCalendar aria-label="Trip dates" defaultFocusedValue={new CalendarDate(2025, 2, 4)} />
    ));
    await waitForRangeCalendar();

    const grid = screen.getByRole("grid");
    const calendar = grid.parentElement?.parentElement as HTMLElement;
    expect(calendar.style.width).toBe("272px");
  });

  it("advances keyboard focus after selecting the range start", async () => {
    render(() => (
      <RangeCalendar aria-label="Trip dates" defaultFocusedValue={new CalendarDate(2025, 2, 4)} />
    ));
    await waitForRangeCalendar();

    const start = screen.getByRole("button", { name: /February 4, 2025/ });
    start.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /February 5, 2025/ })).toHaveAttribute(
        "tabindex",
        "0",
      );
    });
    expect(start).toHaveAttribute("data-selection-start");
  });

  it("does not auto-advance focus after a pointer range-start selection", async () => {
    render(() => (
      <RangeCalendar aria-label="Trip dates" defaultFocusedValue={new CalendarDate(2025, 2, 4)} />
    ));
    await waitForRangeCalendar();

    const start = screen.getByRole("button", { name: /February 4, 2025/ });
    await user.click(start);

    expect(start).toHaveAttribute("data-selection-start");
    expect(start).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: /February 5, 2025/ })).toHaveAttribute(
      "tabindex",
      "-1",
    );
  });

  it("appends First/Last available date to min/max cell names", async () => {
    render(() => (
      <RangeCalendar
        aria-label="Trip dates"
        defaultFocusedValue={new CalendarDate(2025, 2, 15)}
        minValue={new CalendarDate(2025, 2, 3)}
        maxValue={new CalendarDate(2025, 2, 20)}
      />
    ));
    await waitForRangeCalendar();

    expect(
      screen.getByRole("button", { name: /February 3, 2025, First available date/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /February 20, 2025, Last available date/ }),
    ).toBeInTheDocument();
  });
});
