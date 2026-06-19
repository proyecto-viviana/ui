/**
 * CalendarMonthPicker / CalendarYearPicker tests
 *
 * Port of react-aria-components 1.18 CalendarMonthPicker / CalendarYearPicker.
 * Both are headless render-prop components shared by Calendar and RangeCalendar:
 * they expose the months of the focused year / a sliding window of years and a
 * handler that jumps the calendar's focus.
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor, within } from "@solidjs/testing-library";
import { For, type JSX } from "solid-js";
import {
  Calendar,
  CalendarHeading,
  CalendarButton,
  CalendarGrid,
  CalendarCell,
} from "../src/Calendar";
import {
  RangeCalendar,
  RangeCalendarHeading,
  RangeCalendarButton,
  RangeCalendarGrid,
  RangeCalendarCell,
} from "../src/RangeCalendar";
import {
  CalendarMonthPicker,
  CalendarYearPicker,
  type CalendarMonthPickerAria,
  type CalendarYearPickerAria,
} from "../src/CalendarPicker";
import { CalendarDate } from "@internationalized/date";

async function waitForCalendarHydration() {
  await waitFor(() => {
    expect(document.querySelector('[role="grid"]')).toBeInTheDocument();
  });
}

// Render the month picker's accessible props as a flat list of buttons tagged
// with locale-independent data hooks so assertions don't depend on month names.
function renderMonths(picker: CalendarMonthPickerAria): JSX.Element {
  return (
    <div
      data-testid="month-picker"
      aria-label={picker["aria-label"]}
      data-value={String(picker.value)}
    >
      <For each={picker.items}>
        {(item) => (
          <button
            type="button"
            data-month-id={String(item.id)}
            data-pressed={String(item.id === picker.value)}
            onClick={() => picker.onChange(item.id)}
          >
            {item.formatted}
          </button>
        )}
      </For>
    </div>
  );
}

function renderYears(picker: CalendarYearPickerAria): JSX.Element {
  return (
    <div
      data-testid="year-picker"
      aria-label={picker["aria-label"]}
      data-value={String(picker.value)}
    >
      <For each={picker.items}>
        {(item) => (
          <button
            type="button"
            data-year-id={String(item.id)}
            data-year={item.formatted}
            data-pressed={String(item.id === picker.value)}
            onClick={() => picker.onChange(item.id)}
          >
            {item.formatted}
          </button>
        )}
      </For>
    </div>
  );
}

function TestCalendar(props: {
  calendarProps?: Partial<Parameters<typeof Calendar>[0]>;
  yearPickerProps?: Partial<Parameters<typeof CalendarYearPicker>[0]>;
}) {
  return (
    <Calendar aria-label="Test Calendar" {...props.calendarProps}>
      <header>
        <CalendarButton slot="previous">◀</CalendarButton>
        <CalendarMonthPicker format="long">{renderMonths}</CalendarMonthPicker>
        <CalendarYearPicker {...props.yearPickerProps}>{renderYears}</CalendarYearPicker>
        <CalendarHeading />
        <CalendarButton slot="next">▶</CalendarButton>
      </header>
      <CalendarGrid>{(date) => <CalendarCell date={date} />}</CalendarGrid>
    </Calendar>
  );
}

function TestRangeCalendar(props: {
  calendarProps?: Partial<Parameters<typeof RangeCalendar>[0]>;
}) {
  return (
    <RangeCalendar aria-label="Test Range Calendar" {...props.calendarProps}>
      <header>
        <RangeCalendarButton slot="previous">◀</RangeCalendarButton>
        <CalendarMonthPicker format="long">{renderMonths}</CalendarMonthPicker>
        <RangeCalendarHeading />
        <RangeCalendarButton slot="next">▶</RangeCalendarButton>
      </header>
      <RangeCalendarGrid>{(date) => <RangeCalendarCell date={date} />}</RangeCalendarGrid>
    </RangeCalendar>
  );
}

describe("CalendarMonthPicker / CalendarYearPicker", () => {
  afterEach(() => {
    cleanup();
  });

  describe("CalendarMonthPicker", () => {
    it("lists every month of the focused year with the focused month selected", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2025, 2, 15) }} />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("month-picker");
      expect(picker).toHaveAttribute("aria-label", "month");
      expect(picker).toHaveAttribute("data-value", "2");

      const months = within(picker).getAllByRole("button");
      expect(months).toHaveLength(12);
      // `format="long"` + default (en) locale.
      expect(picker.querySelector('[data-month-id="1"]')).toHaveTextContent("January");
      expect(picker.querySelector('[data-month-id="2"]')).toHaveTextContent("February");
      expect(picker.querySelector('[data-month-id="2"]')).toHaveAttribute("data-pressed", "true");
      expect(picker.querySelector('[data-month-id="1"]')).toHaveAttribute("data-pressed", "false");
    });

    it("jumps the calendar's focus to the chosen month", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2025, 2, 15) }} />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("month-picker");
      fireEvent.click(picker.querySelector('[data-month-id="4"]')!);

      await waitFor(() => {
        expect(picker).toHaveAttribute("data-value", "4");
      });
      expect(picker.querySelector('[data-month-id="4"]')).toHaveAttribute("data-pressed", "true");
      expect(picker.querySelector('[data-month-id="2"]')).toHaveAttribute("data-pressed", "false");
    });
  });

  describe("CalendarYearPicker", () => {
    it("renders a centered window of 20 years with the focused year selected", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2025, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      expect(picker).toHaveAttribute("aria-label", "year");

      const years = within(picker).getAllByRole("button");
      expect(years).toHaveLength(20);
      // floor(20/2) before, ceil(20/2)-1 after → 2015..2034, focused index 10.
      expect(picker).toHaveAttribute("data-value", "10");
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2015");
      expect(picker.querySelector('[data-year-id="19"]')).toHaveTextContent("2034");
      expect(picker.querySelector('[data-year-id="10"]')).toHaveAttribute("data-year", "2025");
      expect(picker.querySelector('[data-year-id="10"]')).toHaveAttribute("data-pressed", "true");
    });

    it("jumps the calendar's focus to the chosen year and recenters the window", async () => {
      render(() => (
        <TestCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2025, 6, 15) }} />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      // The first entry is 2015; selecting it should focus 2015 and recenter.
      fireEvent.click(picker.querySelector('[data-year-id="0"]')!);

      await waitFor(() => {
        const selected = picker.querySelector('[data-pressed="true"]');
        expect(selected).toHaveAttribute("data-year", "2015");
      });
      // Recentered window now starts at 2005.
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2005");
    });

    it("clamps the window to the calendar's maxValue", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2025, 6, 15),
            maxValue: new CalendarDate(2025, 12, 31),
          }}
        />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      const years = within(picker).getAllByRole("button");
      expect(years).toHaveLength(20);
      // Window clamps to end at 2025 → 2006..2025, focused index 19.
      expect(picker).toHaveAttribute("data-value", "19");
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2006");
      expect(picker.querySelector('[data-year-id="19"]')).toHaveTextContent("2025");
      expect(picker.querySelector('[data-year-id="19"]')).toHaveAttribute("data-pressed", "true");
    });

    it("clamps the window to the calendar's minValue", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2025, 6, 15),
            minValue: new CalendarDate(2020, 1, 1),
          }}
        />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      const years = within(picker).getAllByRole("button");
      expect(years).toHaveLength(20);
      // Window clamps to start at 2020 → 2020..2039 (minValue year included first).
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2020");
      expect(picker.querySelector('[data-year-id="19"]')).toHaveTextContent("2039");
      expect(picker).toHaveAttribute("data-value", "5");
      expect(picker.querySelector('[data-year-id="5"]')).toHaveAttribute("data-year", "2025");
    });

    it("includes both the minValue and maxValue years when both constrain the window", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{
            defaultFocusedValue: new CalendarDate(2023, 6, 15),
            minValue: new CalendarDate(2020, 1, 1),
            maxValue: new CalendarDate(2026, 12, 31),
          }}
        />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      const years = within(picker).getAllByRole("button");
      // Both bounds inclusive: 2026 - 2020 + 1 = 7 years (the maxValue off-by-one guard).
      expect(years).toHaveLength(7);
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2020");
      expect(picker.querySelector('[data-year-id="6"]')).toHaveTextContent("2026");
      expect(picker).toHaveAttribute("data-value", "3");
    });

    it("honors visibleYears: a single visible year shows only the focused year", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{ defaultFocusedValue: new CalendarDate(2026, 6, 15) }}
          yearPickerProps={{ visibleYears: 1 }}
        />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      const years = within(picker).getAllByRole("button");
      // floor(1/2) = 0 before, ceil(1/2) - 1 = 0 after → only the focused year.
      expect(years).toHaveLength(1);
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2026");
      expect(picker).toHaveAttribute("data-value", "0");
    });

    it("treats a falsy visibleYears as the default 20 (matching upstream)", async () => {
      render(() => (
        <TestCalendar
          calendarProps={{ defaultFocusedValue: new CalendarDate(2026, 6, 15) }}
          yearPickerProps={{ visibleYears: 0 }}
        />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("year-picker");
      const years = within(picker).getAllByRole("button");
      // `visibleYears || 20`: a 0 falls back to the default window, not an empty one.
      expect(years).toHaveLength(20);
      expect(picker.querySelector('[data-year-id="0"]')).toHaveTextContent("2016");
      expect(picker.querySelector('[data-year-id="19"]')).toHaveTextContent("2035");
    });
  });

  describe("within a RangeCalendar", () => {
    it("reads the range calendar's focused date", async () => {
      render(() => (
        <TestRangeCalendar calendarProps={{ defaultFocusedValue: new CalendarDate(2025, 2, 15) }} />
      ));
      await waitForCalendarHydration();

      const picker = screen.getByTestId("month-picker");
      expect(within(picker).getAllByRole("button")).toHaveLength(12);
      expect(picker).toHaveAttribute("data-value", "2");

      fireEvent.click(picker.querySelector('[data-month-id="7"]')!);
      await waitFor(() => {
        expect(picker).toHaveAttribute("data-value", "7");
      });
    });
  });
});
