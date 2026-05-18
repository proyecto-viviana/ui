/**
 * Calendar tests - Port of React Aria's Calendar.test.tsx
 *
 * Tests for Calendar component functionality including:
 * - Rendering
 * - Navigation
 * - Selection
 * - Disabled dates
 * - Keyboard navigation
 * - ARIA attributes
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import {
  Calendar,
  CalendarHeading,
  CalendarButton,
  CalendarGrid,
  CalendarCell,
} from "../src/Calendar";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// User event instance - created per test
let user: ReturnType<typeof setupUser>;

// Helper to wait for calendar to hydrate (it uses client-only rendering)
async function waitForCalendarHydration() {
  await waitFor(() => {
    const grid = document.querySelector('[role="grid"]');
    expect(grid).toBeInTheDocument();
  });
}

// Helper component for testing Calendar
function TestCalendar(props: { calendarProps?: Partial<Parameters<typeof Calendar>[0]> }) {
  return (
    <Calendar aria-label="Test Calendar" {...props.calendarProps}>
      <header>
        <CalendarButton slot="previous">◀</CalendarButton>
        <CalendarHeading />
        <CalendarButton slot="next">▶</CalendarButton>
      </header>
      <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
    </Calendar>
  );
}

describe("Calendar", () => {
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
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const calendar = document.querySelector(".solidaria-Calendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should render calendar grid", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });

    it("should render month and year header", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      // The heading should contain the month and year
      const heading = document.querySelector(".solidaria-CalendarHeading");
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toContain("2024");
    });

    it("should render navigation buttons", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const prevButton = screen.getByText("◀");
      const nextButton = screen.getByText("▶");

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it("should render day names in header", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      // Check for day name headers (short form)
      const headerCells = document.querySelectorAll(".solidaria-CalendarHeaderCell");
      expect(headerCells.length).toBe(7);
    });

    it("should render with custom class", async () => {
      render(() => <TestCalendar calendarProps={{ class: "my-calendar" }} />);
      await waitForCalendarHydration();

      const calendar = document.querySelector(".my-calendar");
      expect(calendar).toBeInTheDocument();
    });

    it("should mark trailing dates as outside month in an offset grid", async () => {
      render(() => (
        <Calendar
          aria-label="Dual month calendar"
          visibleMonths={2}
          defaultFocusedValue={new CalendarDate(2024, 1, 15)}
        >
          <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
          <CalendarGrid offset={{ months: 1 }}>
            {(date) => <CalendarCell date={date} />}
          </CalendarGrid>
        </Calendar>
      ));
      await waitForCalendarHydration();

      const grids = document.querySelectorAll('table[role="grid"]');
      expect(grids.length).toBe(2);

      const secondGridButtons = grids[1]?.querySelectorAll('div[role="button"]') ?? [];
      const januaryButton = Array.from(secondGridButtons).find((button) =>
        button.getAttribute("aria-label")?.includes("January"),
      );

      expect(januaryButton).toBeTruthy();
      expect(januaryButton).toHaveAttribute("data-outside-month");
    });
  });

  // ============================================
  // NAVIGATION
  // ============================================

  describe("navigation", () => {
    it("should navigate to previous month on prev button click", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const prevButton = screen.getByText("◀");
      const heading = document.querySelector(".solidaria-CalendarHeading");

      // Initially should show June 2024
      expect(heading?.textContent).toContain("June");

      await user.click(prevButton);

      // After clicking prev, should show May 2024
      await waitFor(() => {
        expect(heading?.textContent).toContain("May");
      });
    });

    it("should navigate to next month on next button click", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const nextButton = screen.getByText("▶");
      const heading = document.querySelector(".solidaria-CalendarHeading");

      // Initially should show June 2024
      expect(heading?.textContent).toContain("June");

      await user.click(nextButton);

      // After clicking next, should show July 2024
      await waitFor(() => {
        expect(heading?.textContent).toContain("July");
      });
    });

    // Note: These keyboard navigation tests are skipped because the grid keyboard
    // handler uses addEventListener in onMount which doesn't work reliably in jsdom.
    // The keyboard navigation is tested via e2e tests instead.
    it.skip("should navigate with keyboard arrow keys", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      // Keyboard navigation is on the grid, not individual cells
      const grid = screen.getByRole("grid");
      grid.focus();

      // Press ArrowRight to move to day 16
      fireEvent.keyDown(grid, { key: "ArrowRight" });

      await waitFor(() => {
        const day16 = screen.getByText("16");
        expect(day16).toHaveAttribute("data-focused");
      });
    });

    it.skip("should navigate to previous row with Arrow Up", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const grid = screen.getByRole("grid");
      grid.focus();

      fireEvent.keyDown(grid, { key: "ArrowUp" });

      await waitFor(() => {
        const day8 = screen.getByText("8");
        expect(day8).toHaveAttribute("data-focused");
      });
    });

    it.skip("should navigate to next row with Arrow Down", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const grid = screen.getByRole("grid");
      grid.focus();

      fireEvent.keyDown(grid, { key: "ArrowDown" });

      await waitFor(() => {
        const day22 = screen.getByText("22");
        expect(day22).toHaveAttribute("data-focused");
      });
    });

    it("should follow RTL arrow direction for day navigation", async () => {
      const previousDir = document.documentElement.getAttribute("dir");
      document.documentElement.setAttribute("dir", "rtl");

      try {
        render(() => (
          <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
        ));
        await waitForCalendarHydration();

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
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should select date on click", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const day15 = screen.getByText("15");
      await user.click(day15);

      await waitFor(() => {
        expect(day15).toHaveAttribute("data-selected");
      });
    });

    it("should fire onChange when date is selected", async () => {
      const onChange = vi.fn();
      render(() => <TestCalendar calendarProps={{ onChange }} />);
      await waitForCalendarHydration();

      const day15 = screen.getByText("15");
      await user.click(day15);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledTimes(1);
      });
      // The argument should be a CalendarDate
      expect(onChange.mock.calls[0][0]).toHaveProperty("day", 15);
    });

    it("should support controlled value", async () => {
      render(() => <TestCalendar calendarProps={{ value: new CalendarDate(2024, 6, 20) }} />);
      await waitForCalendarHydration();

      const day20 = screen.getByText("20");
      expect(day20).toHaveAttribute("data-selected");
    });

    it("should support defaultValue", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultValue: new CalendarDate(2024, 6, 10) }} />
      ));
      await waitForCalendarHydration();

      const day10 = screen.getByText("10");
      expect(day10).toHaveAttribute("data-selected");
    });

    it("should select on Enter key", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const day15 = screen.getByText("15");
      day15.focus();

      fireEvent.keyDown(day15, { key: "Enter" });

      await waitFor(() => {
        expect(day15).toHaveAttribute("data-selected");
      });
    });

    it("should select on Space key", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const day15 = screen.getByText("15");
      day15.focus();

      fireEvent.keyDown(day15, { key: " " });

      await waitFor(() => {
        expect(day15).toHaveAttribute("data-selected");
      });
    });
  });

  // ============================================
  // DISABLED DATES
  // ============================================

  describe("disabled dates", () => {
    it("should disable dates outside min/max range", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            minValue: new CalendarDate(2024, 6, 10),
            maxValue: new CalendarDate(2024, 6, 20),
          }}
        />
      ));
      await waitForCalendarHydration();

      // Day 9 is before minValue (10)
      const day9 = screen.getByText("9");
      // Day 21 is after maxValue (20)
      const day21 = screen.getByText("21");

      expect(day9).toHaveAttribute("data-disabled");
      expect(day21).toHaveAttribute("data-disabled");
    });

    it("should support isDateDisabled function", async () => {
      const isDateDisabled = (date: any) => date.day === 13;

      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            isDateDisabled,
          }}
        />
      ));
      await waitForCalendarHydration();

      const day13 = screen.getByText("13");
      expect(day13).toHaveAttribute("data-disabled");
    });

    it("should not select disabled dates on click", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            minValue: new CalendarDate(2024, 6, 10),
            onChange,
          }}
        />
      ));
      await waitForCalendarHydration();

      // Day 9 is before minValue (10), so it's disabled
      const day9 = screen.getByText("9");
      await user.click(day9);

      expect(onChange).not.toHaveBeenCalled();
      expect(day9).not.toHaveAttribute("data-selected");
    });

    it("should support isDateUnavailable function", async () => {
      const isDateUnavailable = (date: any) => date.day === 17;

      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2024, 6, 15),
            isDateUnavailable,
          }}
        />
      ));
      await waitForCalendarHydration();

      const day17 = screen.getByText("17");
      expect(day17).toHaveAttribute("data-unavailable");
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled on Calendar", async () => {
      render(() => <TestCalendar calendarProps={{ isDisabled: true }} />);
      await waitForCalendarHydration();

      const calendar = document.querySelector(".solidaria-Calendar");
      expect(calendar).toHaveAttribute("data-disabled");
    });

    it("should disable navigation buttons when calendar is disabled", async () => {
      render(() => <TestCalendar calendarProps={{ isDisabled: true }} />);
      await waitForCalendarHydration();

      const prevButton = screen.getByText("◀");
      const nextButton = screen.getByText("▶");

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });
  });

  // ============================================
  // READ ONLY STATE
  // ============================================

  describe("read only state", () => {
    it("should support isReadOnly on Calendar", async () => {
      render(() => <TestCalendar calendarProps={{ isReadOnly: true }} />);
      await waitForCalendarHydration();

      const calendar = document.querySelector(".solidaria-Calendar");
      expect(calendar).toHaveAttribute("data-readonly");
    });
  });

  // ============================================
  // TODAY INDICATOR
  // ============================================

  describe("today indicator", () => {
    it("should mark today with data-today", async () => {
      const todayDate = today(getLocalTimeZone());

      render(() => <TestCalendar calendarProps={{ defaultFocusedValue: todayDate }} />);
      await waitForCalendarHydration();

      const todayCells = document.querySelectorAll("[data-today]");
      expect(todayCells.length).toBe(1);
      expect(todayCells[0]).toHaveTextContent(todayDate.day.toString());
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have grid role on calendar grid", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const grid = screen.getByRole("grid");
      expect(grid).toBeInTheDocument();
    });

    it("should have aria-label", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2024, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const calendar = document.querySelector(".solidaria-Calendar");
      expect(calendar).toHaveAttribute("role", "application");
      expect(calendar).toHaveAttribute("aria-label", "Test Calendar, June 2024");
      expect(calendar?.firstElementChild).toHaveTextContent("Test Calendar, June 2024");
    });

    it("should include selected state in selected cell labels", async () => {
      render(() => <TestCalendar calendarProps={{ value: new CalendarDate(2024, 6, 15) }} />);
      await waitForCalendarHydration();

      const selectedDate = document.querySelector("[data-selected]");
      expect(selectedDate).toHaveAttribute("aria-label", expect.stringContaining("selected"));
    });

    it("should mark invalid selected cells and link them to the error message id", async () => {
      render(() => (
        <Calendar
          aria-label="Test Calendar"
          value={new CalendarDate(2024, 6, 15)}
          validationState="invalid"
          errorMessageId="calendar-error"
        >
          <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
          <p id="calendar-error">Choose an available date.</p>
        </Calendar>
      ));
      await waitForCalendarHydration();

      const selectedDate = document.querySelector("[data-selected]");
      expect(selectedDate).toHaveAttribute("aria-invalid", "true");
      expect(selectedDate).toHaveAttribute("aria-describedby", "calendar-error");
      expect(selectedDate?.closest("td")).toHaveAttribute("aria-invalid", "true");
    });

    it("should have gridcell role on cells", async () => {
      render(() => <TestCalendar />);
      await waitForCalendarHydration();

      const gridcells = screen.getAllByRole("gridcell");
      expect(gridcells.length).toBeGreaterThan(0);
    });
  });
});
