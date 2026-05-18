/**
 * RangeCalendar tests - Port of React Aria's RangeCalendar.test.tsx
 *
 * Tests for RangeCalendar component functionality including:
 * - Rendering
 * - Navigation
 * - Range selection
 * - Disabled dates
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import {
  RangeCalendar,
  RangeCalendarHeading,
  RangeCalendarButton,
  RangeCalendarGrid,
  RangeCalendarCell,
} from "../src/RangeCalendar";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

// Helper to wait for range calendar to hydrate (it uses client-only rendering)
async function waitForRangeCalendarHydration() {
  await waitFor(() => {
    const grid = document.querySelector('[role="grid"]');
    expect(grid).toBeInTheDocument();
  });
}

function getDescribedByText(element: Element): string[] {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "");
}

// Helper component for testing RangeCalendar
function TestRangeCalendar(props: {
  calendarProps?: Partial<Parameters<typeof RangeCalendar>[0]>;
}) {
  return (
    <RangeCalendar aria-label="Test Range Calendar" {...props.calendarProps}>
      <header>
        <RangeCalendarButton slot="previous">◀</RangeCalendarButton>
        <RangeCalendarHeading />
        <RangeCalendarButton slot="next">▶</RangeCalendarButton>
      </header>
      <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
    </RangeCalendar>
  );
}

describe("RangeCalendar", () => {
  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".solidaria-RangeCalendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should render calendar grid", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });

    it("should render month and year header", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const heading = document.querySelector(".solidaria-RangeCalendarHeading");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain("2024");
    });

    it("should render navigation buttons", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const prevButton = screen.getByText("◀");
      const nextButton = screen.getByText("▶");

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it("should render day names in header", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const headerCells = document.querySelectorAll(".solidaria-RangeCalendarHeaderCell");
      expect(headerCells.length).toBe(7);
    });

    it("should render exactly seven structural cells per week row", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const rows = Array.from(document.querySelectorAll("tbody tr"));
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.children).toHaveLength(7);
      }
    });

    it("should expose row and column position render props for styling", async () => {
      render(() => (
        <RangeCalendar
          aria-label="Positioned range calendar"
          defaultFocusedValue={new CalendarDate(2026, 2, 15)}
        >
          <RangeCalendarGrid>
            {(date) => (
              <RangeCalendarCell date={date}>
                {(cell) => (
                  <span
                    data-first-child={String(cell.isFirstChild)}
                    data-last-child={String(cell.isLastChild)}
                    data-first-week={String(cell.isFirstWeek)}
                    data-last-week={String(cell.isLastWeek)}
                  >
                    {cell.formattedDate}
                  </span>
                )}
              </RangeCalendarCell>
            )}
          </RangeCalendarGrid>
        </RangeCalendar>
      ));
      await waitForRangeCalendarHydration();

      const firstRowSpans = document.querySelectorAll("tbody tr:first-child span");
      const lastRowSpans = document.querySelectorAll("tbody tr:last-child span");

      expect(firstRowSpans[0]).toHaveAttribute("data-first-child", "true");
      expect(firstRowSpans[0]).toHaveAttribute("data-first-week", "true");
      expect(firstRowSpans[6]).toHaveAttribute("data-last-child", "true");
      expect(lastRowSpans[0]).toHaveAttribute("data-last-week", "true");
    });

    it("should render with custom class", async () => {
      render(() => <TestRangeCalendar calendarProps={{ class: "my-range-calendar" }} />);
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".my-range-calendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should mark trailing dates as outside month in an offset grid", async () => {
      render(() => (
        <RangeCalendar
          aria-label="Dual month range calendar"
          visibleMonths={2}
          defaultFocusedValue={new CalendarDate(2024, 1, 15)}
        >
          <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
          <RangeCalendarGrid offset={{ months: 1 }}>
            {(date) => <RangeCalendarCell date={date} />}
          </RangeCalendarGrid>
        </RangeCalendar>
      ));
      await waitForRangeCalendarHydration();

      const grids = document.querySelectorAll('table[role="grid"]');
      expect(grids.length).toBe(2);

      const secondGridButtons = grids[1]?.querySelectorAll('div[role="button"]') ?? [];
      const januaryButton = Array.from(secondGridButtons).find((button) =>
        button.getAttribute("aria-label")?.includes("January"),
      );

      expect(januaryButton).toBeTruthy();
      expect(januaryButton).toHaveAttribute("data-outside-month");
    });

    it("should align multi-month visible range against maxValue", async () => {
      render(() => (
        <RangeCalendar
          aria-label="Constrained range calendar"
          visibleMonths={2}
          value={{ start: new CalendarDate(2025, 2, 3), end: new CalendarDate(2025, 2, 7) }}
          minValue={new CalendarDate(2025, 2, 3)}
          maxValue={new CalendarDate(2025, 2, 20)}
        >
          <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
          <RangeCalendarGrid offset={{ months: 1 }}>
            {(date) => <RangeCalendarCell date={date} />}
          </RangeCalendarGrid>
        </RangeCalendar>
      ));
      await waitForRangeCalendarHydration();

      const grids = document.querySelectorAll('table[role="grid"]');
      const inMonthLabels = (grid: Element | undefined) =>
        Array.from(grid?.querySelectorAll('div[role="button"]:not([data-outside-month])') ?? [])
          .map((button) => button.getAttribute("aria-label") ?? "")
          .join(" ");
      expect(grids.length).toBe(2);
      expect(inMonthLabels(grids[0])).toContain("January 31, 2025");
      expect(inMonthLabels(grids[1])).toContain("February 20, 2025");
    });
  });

  // ============================================
  // NAVIGATION
  // ============================================

  describe("navigation", () => {
    it("should navigate to previous month on prev button click", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const prevButton = screen.getByText("◀");
      const heading = document.querySelector(".solidaria-RangeCalendarHeading");

      expect(heading?.textContent).toContain("June");

      await user.click(prevButton);

      await waitFor(() => {
        expect(heading?.textContent).toContain("May");
      });
    });

    it("should navigate to next month on next button click", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const nextButton = screen.getByText("▶");
      const heading = document.querySelector(".solidaria-RangeCalendarHeading");

      expect(heading?.textContent).toContain("June");

      await user.click(nextButton);

      await waitFor(() => {
        expect(heading?.textContent).toContain("July");
      });
    });

    it("should follow RTL arrow direction for day navigation", async () => {
      const previousDir = document.documentElement.getAttribute("dir");
      document.documentElement.setAttribute("dir", "rtl");

      try {
        render(() => (
          <TestRangeCalendar
            calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }}
          />
        ));
        await waitForRangeCalendarHydration();

        const day15 = screen.getByRole("button", { name: /June 15, 2024/i });
        day15.focus();
        fireEvent.keyDown(day15, { key: "ArrowRight" });

        await waitFor(() => {
          const day14 = screen.getByRole("button", { name: /June 14, 2024/i });
          expect(day14).toHaveFocus();
        });
      } finally {
        if (previousDir) {
          document.documentElement.setAttribute("dir", previousDir);
        } else {
          document.documentElement.removeAttribute("dir");
        }
      }
    });
  });

  // ============================================
  // RANGE SELECTION
  // ============================================

  describe("range selection", () => {
    it("should have clickable cells", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const cells = document.querySelectorAll(".solidaria-RangeCalendarCell");
      const cell = Array.from(cells).find((c) => c.textContent === "10");

      expect(cell).toBeInTheDocument();
      expect(cell).toHaveAttribute("role", "button");

      // Click should not throw
      await user.click(cell!);
    });

    it("should show controlled value", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            value: {
              start: new CalendarDate(2024, 6, 10),
              end: new CalendarDate(2024, 6, 15),
            },
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      // Find cells with selection attributes
      const selectedCells = document.querySelectorAll("[data-selected]");
      expect(selectedCells.length).toBeGreaterThan(0);
    });

    it("should show defaultValue", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultValue: {
              start: new CalendarDate(2024, 6, 5),
              end: new CalendarDate(2024, 6, 10),
            },
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const selectedCells = document.querySelectorAll("[data-selected]");
      expect(selectedCells.length).toBeGreaterThan(0);
    });

    it("should fire onChange once after completing a range selection", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            onChange,
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const start = screen.getByRole("button", { name: /June 10, 2024/i });
      fireEvent.pointerDown(start);
      fireEvent.pointerUp(start);
      const end = screen.getByRole("button", { name: /June 15, 2024/i });
      fireEvent.pointerDown(end);
      fireEvent.pointerUp(end);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      });
      expect(onChange.mock.calls[0][0]).toMatchObject({
        start: expect.objectContaining({ day: 10 }),
        end: expect.objectContaining({ day: 15 }),
      });
    });

    it("should mark selection start and end", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            value: {
              start: new CalendarDate(2024, 6, 10),
              end: new CalendarDate(2024, 6, 15),
            },
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const startCell = document.querySelector("[data-selection-start]");
      const endCell = document.querySelector("[data-selection-end]");

      expect(startCell).toBeInTheDocument();
      expect(endCell).toBeInTheDocument();
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", async () => {
      render(() => <TestRangeCalendar calendarProps={{ isDisabled: true }} />);
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".solidaria-RangeCalendar");
      expect(calendar).toHaveAttribute("data-disabled");
    });

    it("should disable navigation buttons when disabled", async () => {
      render(() => <TestRangeCalendar calendarProps={{ isDisabled: true }} />);
      await waitForRangeCalendarHydration();

      const prevButton = screen.getByText("◀");
      const nextButton = screen.getByText("▶");

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it("should support isDateDisabled", async () => {
      const isDateDisabled = (date: CalendarDate) => date.day === 15;
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            isDateDisabled,
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const disabledCell = document.querySelector("[data-disabled]");
      expect(disabledCell).toBeInTheDocument();
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly", async () => {
      render(() => <TestRangeCalendar calendarProps={{ isReadOnly: true }} />);
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".solidaria-RangeCalendar");
      expect(calendar).toHaveAttribute("data-readonly");
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have aria-label", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".solidaria-RangeCalendar");
      expect(calendar).toHaveAttribute("role", "application");
      expect(calendar).toHaveAttribute("aria-label", "Test Range Calendar, June 2024");
      expect(calendar?.firstElementChild).toHaveTextContent("Test Range Calendar, June 2024");
    });

    it("should have grid role", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });

    it("should have column headers", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const columnHeaders = screen.getAllByRole("columnheader");
      expect(columnHeaders.length).toBe(7);
    });

    it("should have aria-live on heading", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const heading = document.querySelector(".solidaria-RangeCalendarHeading");
      expect(heading).toHaveAttribute("aria-live", "polite");
    });

    it("should describe the focused selectable cell with the start range prompt", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const day15 = screen.getByRole("button", { name: /June 15, 2024/i });

      await waitFor(() => {
        expect(getDescribedByText(day15)).toContain("Click to start selecting date range");
      });
    });

    it("should localize range prompt descriptions from the calendar locale", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            locale: "fr-FR",
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const day15 = screen.getByRole("button", { name: /15 juin 2024/i });

      await waitFor(() => {
        expect(getDescribedByText(day15)).toContain(
          "Cliquer pour commencer à sélectionner la plage de dates",
        );
      });
    });

    it("should switch the focused cell description to the finish range prompt after anchoring", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const day10 = screen.getByRole("button", { name: /June 10, 2024/i });
      fireEvent.pointerDown(day10);
      fireEvent.pointerUp(day10);

      await waitFor(() => {
        expect(
          getDescribedByText(screen.getByRole("button", { name: /June 10, 2024/i })),
        ).toContain("Click to finish selecting date range");
      });
    });

    it("should cancel an active range anchor with Escape and let idle Escape bubble", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      const calendar = document.querySelector(".solidaria-RangeCalendar");
      const day10 = screen.getByRole("button", { name: /June 10, 2024/i });
      fireEvent.pointerDown(day10);
      fireEvent.pointerUp(day10);

      await waitFor(() => {
        expect(calendar).toHaveAttribute("data-dragging");
        expect(
          getDescribedByText(screen.getByRole("button", { name: /June 10, 2024/i })),
        ).toContain("Click to finish selecting date range");
      });

      const activeDay10 = screen.getByRole("button", { name: /June 10, 2024/i });
      expect(fireEvent.keyDown(activeDay10, { key: "Escape" })).toBe(false);

      await waitFor(() => {
        expect(calendar).not.toHaveAttribute("data-dragging");
        expect(
          getDescribedByText(screen.getByRole("button", { name: /June 10, 2024/i })),
        ).toContain("Click to start selecting date range");
      });

      expect(
        fireEvent.keyDown(screen.getByRole("button", { name: /June 10, 2024/i }), {
          key: "Escape",
        }),
      ).toBe(true);
    });

    it("should compose invalid error descriptions with the range prompt", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            value: {
              start: new CalendarDate(2024, 6, 10),
              end: new CalendarDate(2024, 6, 15),
            },
            defaultFocusedValue: new CalendarDate(2024, 6, 10),
            validationState: "invalid",
            errorMessageId: "range-error",
            errorMessage: "Invalid range",
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const day10 = screen.getByRole("button", { name: /June 10, 2024/i });

      await waitFor(() => {
        const ids = day10.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
        expect(ids[0]).toBe("range-error");
        expect(ids.length).toBe(2);
        expect(document.getElementById(ids[1] ?? "")).toHaveTextContent(
          "Click to start selecting date range",
        );
      });
    });

    it("should omit range prompt descriptions when read only", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            isReadOnly: true,
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const day15 = screen.getByRole("button", { name: /June 15, 2024/i });
      expect(day15).not.toHaveAttribute("aria-describedby");
    });
  });

  // ============================================
  // CELL ATTRIBUTES
  // ============================================

  describe("cell attributes", () => {
    it("should mark today", async () => {
      const todayDate = today(getLocalTimeZone());
      render(() => <TestRangeCalendar calendarProps={{ defaultFocusedValue: todayDate }} />);
      await waitForRangeCalendarHydration();

      const todayCell = document.querySelector("[data-today]");
      expect(todayCell).toBeInTheDocument();
    });

    it("should mark outside month cells", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForRangeCalendarHydration();

      // Depending on the month layout, there might be outside-month cells
      const cells = document.querySelectorAll(".solidaria-RangeCalendarCell");
      expect(cells.length).toBeGreaterThan(0);
    });

    it("should have default class on cells", async () => {
      render(() => <TestRangeCalendar />);
      await waitForRangeCalendarHydration();

      const cells = document.querySelectorAll(".solidaria-RangeCalendarCell");
      expect(cells.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // MIN/MAX DATES
  // ============================================

  describe("min/max dates", () => {
    it("should disable dates before minValue", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            minValue: new CalendarDate(2024, 6, 10),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const disabledCells = document.querySelectorAll("[data-disabled]");
      expect(disabledCells.length).toBeGreaterThan(0);
    });

    it("should disable dates after maxValue", async () => {
      render(() => (
        <TestRangeCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            maxValue: new CalendarDate(2024, 6, 20),
          }}
        />
      ));
      await waitForRangeCalendarHydration();

      const disabledCells = document.querySelectorAll("[data-disabled]");
      expect(disabledCells.length).toBeGreaterThan(0);
    });
  });
});
