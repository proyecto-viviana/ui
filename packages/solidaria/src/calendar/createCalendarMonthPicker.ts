/**
 * createCalendarMonthPicker hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a month picker
 * within a calendar — a listbox/select that jumps the focused date to a chosen
 * month of the focused year.
 * Based on @react-aria/calendar useCalendarMonthPicker.
 */

import { createMemo } from "solid-js";
import { DateFormatter, type CalendarDate } from "@internationalized/date";
import type { CalendarState, RangeCalendarState } from "@proyecto-viviana/solid-stately";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { useLocale } from "../i18n";

type Key = string | number;

export interface CalendarMonthPickerProps {
  /** The format of the month to display in the picker. @default 'short' */
  format?: "numeric" | "2-digit" | "long" | "short" | "narrow";
}

export interface CalendarMonthPickerItem {
  /** The 1-based month number, used as the item's key. */
  id: number;
  /** The first day of the month. */
  date: CalendarDate;
  /** The localized month name. */
  formatted: string;
}

export interface CalendarMonthPickerAria {
  /** An accessible label for the month picker. */
  "aria-label": string;
  /** The key of the currently focused month (its 1-based number). */
  value: Key;
  /** Handler that moves focus to the selected month. */
  onChange: (key: Key | null) => void;
  /** The list of selectable months in the focused year. */
  items: CalendarMonthPickerItem[];
}

/**
 * Provides the behavior and accessibility implementation for a month picker
 * within a calendar.
 */
export function createCalendarMonthPicker(
  props: MaybeAccessor<CalendarMonthPickerProps>,
  state: CalendarState | RangeCalendarState,
): CalendarMonthPickerAria {
  const getProps = () => access(props);
  const locale = useLocale();

  const formatter = createMemo(
    () =>
      new DateFormatter(locale().locale, {
        month: getProps().format ?? "short",
        calendar: state.focusedDate().calendar.identifier,
        timeZone: state.timeZone,
      }),
  );

  // Build the list of months in the focused year. The number of months can vary
  // by year in some calendar systems (e.g. the Hebrew leap year), so derive it
  // from the focused date rather than assuming twelve.
  const items = createMemo<CalendarMonthPickerItem[]>(() => {
    const focused = state.focusedDate();
    const fmt = formatter();
    const numMonths = focused.calendar.getMonthsInYear(focused);
    const months: CalendarMonthPickerItem[] = [];
    for (let i = 1; i <= numMonths; i++) {
      const date = focused.set({ month: i });
      // Calendars that offset their month numbering (e.g. fiscal calendars)
      // expose getFormattableMonth to map back to the displayable month.
      const displayDate = date.calendar.getFormattableMonth?.(date) ?? date;
      months.push({
        id: i,
        date,
        formatted: fmt.format(displayDate.toDate(state.timeZone)),
      });
    }
    return months;
  });

  const ariaLabel = createMemo(
    () =>
      new Intl.DisplayNames(locale().locale, { type: "dateTimeField" }).of("month") ?? "month",
  );

  return {
    get "aria-label"() {
      return ariaLabel();
    },
    get value() {
      return state.focusedDate().month;
    },
    onChange: (key) => {
      if (key != null) {
        state.setFocusedDate(items()[Number(key) - 1].date);
      }
    },
    get items() {
      return items();
    },
  };
}
