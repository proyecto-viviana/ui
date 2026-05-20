import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Calendar, CalendarContext } from "../src/Calendar";
import { Provider } from "../src/provider";
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

    expect(
      screen.getByRole("application", { name: "Appointment date, February 2025" }),
    ).toBeInTheDocument();
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

  it("inherits Provider locale for month formatting and locale default week start", async () => {
    render(() => (
      <Provider locale="fr-FR">
        <Calendar
          aria-label="Appointment date"
          defaultFocusedValue={new CalendarDate(2025, 2, 15)}
        />
      </Provider>
    ));
    await waitForCalendar();

    expect(screen.getByText("février 2025")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /samedi 15 février 2025/i })).toBeInTheDocument();
    const headers = Array.from(document.querySelectorAll("th")).map((cell) => cell.textContent);
    expect(headers).toEqual(["L", "M", "M", "J", "V", "S", "D"]);
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
    const error = screen.getByText("Choose an available date.");
    expect(error).toBeInTheDocument();
    const selectedDate = screen.getByRole("button", { name: /February 3, 2025/i });
    expect(selectedDate).toHaveAttribute("aria-invalid", "true");
    expect(selectedDate.getAttribute("aria-describedby")).toBe(error.id);
    expect(screen.getByRole("application").getAttribute("aria-describedby") ?? "").not.toContain(
      error.id,
    );
  });

  it("pages by visible months by default and by one month when pageBehavior is single", async () => {
    render(() => (
      <Calendar
        aria-label="Appointment date"
        defaultFocusedValue={new CalendarDate(2025, 2, 3)}
        visibleMonths={2}
      />
    ));
    await waitForCalendar();

    expect(screen.getByText("February 2025")).toBeInTheDocument();
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("April 2025")).toBeInTheDocument();
    expect(screen.getByText("May 2025")).toBeInTheDocument();

    cleanup();

    render(() => (
      <Calendar
        aria-label="Appointment date"
        defaultFocusedValue={new CalendarDate(2025, 2, 3)}
        visibleMonths={2}
        pageBehavior="single"
      />
    ));
    await waitForCalendar();

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("March 2025")).toBeInTheDocument();
    expect(screen.getByText("April 2025")).toBeInTheDocument();
  });

  it("merges CalendarContext props, refs, and unsafe styles", async () => {
    const contextRef = { current: null as HTMLDivElement | null };
    let localRef: HTMLDivElement | undefined;

    render(() => (
      <CalendarContext.Provider
        value={{
          isDisabled: true,
          firstDayOfWeek: "mon",
          ref: contextRef,
          UNSAFE_style: { margin: "3px" },
        }}
      >
        <Calendar
          aria-label="Appointment date"
          value={new CalendarDate(2025, 2, 3)}
          ref={(element) => {
            localRef = element;
          }}
          UNSAFE_style={{ width: "224px" }}
        />
      </CalendarContext.Provider>
    ));
    await waitForCalendar();

    const root = screen.getByRole("application", { name: /Appointment date/i });
    expect(contextRef.current).toBe(root);
    expect(localRef).toBe(root);
    expect(root).toHaveStyle({ margin: "3px", width: "224px" });
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

  it("exposes keyboard focus-visible state and unavailable strike markup", async () => {
    render(() => (
      <Calendar
        aria-label="Appointment date"
        defaultFocusedValue={new CalendarDate(2025, 2, 9)}
        isDateUnavailable={(date) => date.day === 10}
      />
    ));
    await waitForCalendar();

    await user.keyboard("{Tab}");
    const focusedDate = screen.getByRole("button", { name: /February 9, 2025/i });
    focusedDate.focus();
    await waitFor(() => expect(focusedDate).toHaveAttribute("data-focus-visible"));

    const unavailableDate = screen.getByRole("button", { name: /February 10, 2025/i });
    const presentationMarks = unavailableDate.querySelectorAll('[role="presentation"]');
    expect(unavailableDate).toHaveAttribute("aria-disabled", "true");
    expect(presentationMarks).toHaveLength(2);
  });

  it("syncs controlled focusedValue changes to the visible range", async () => {
    const [focusedValue, setFocusedValue] = createSignal(new CalendarDate(2025, 2, 15));

    render(() => (
      <>
        <button type="button" onClick={() => setFocusedValue(new CalendarDate(2025, 5, 15))}>
          Focus May
        </button>
        <Calendar
          aria-label="Appointment date"
          focusedValue={focusedValue()}
          onFocusChange={setFocusedValue}
          visibleMonths={2}
          selectionAlignment="end"
        />
      </>
    ));
    await waitForCalendar();

    expect(screen.getByText("January 2025")).toBeInTheDocument();
    expect(screen.getByText("February 2025")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Focus May" }));

    expect(screen.getByText("May 2025")).toBeInTheDocument();
    expect(screen.getByText("June 2025")).toBeInTheDocument();
  });
});
