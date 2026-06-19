/**
 * createCalendarYearPicker hook for Solidaria
 *
 * Provides the behavior and accessibility implementation for a year picker
 * within a calendar — a listbox/select that jumps the focused date to a chosen
 * year within a sliding window centered on the focused year.
 * Based on @react-aria/calendar useCalendarYearPicker.
 */

import { createMemo } from "solid-js";
import {
  DateFormatter,
  isSameYear,
  toCalendarDate,
  type CalendarDate,
} from "@internationalized/date";
import type { CalendarState, RangeCalendarState } from "@proyecto-viviana/solid-stately";
import { access, type MaybeAccessor } from "../utils/reactivity";
import { useLocale } from "../i18n";

type Key = string | number;

export interface CalendarYearPickerFormatOptions {
  /** The format of the year. @default 'numeric' */
  year?: "numeric" | "2-digit";
  /** The format of the era. */
  era?: "long" | "short" | "narrow";
}

export interface CalendarYearPickerProps {
  /** The number of years to display in the picker. @default 20 */
  visibleYears?: number;
  /** The format of the year/era to display. */
  format?: CalendarYearPickerFormatOptions;
}

export interface CalendarYearPickerItem {
  /** The index of the year within the visible window, used as the item's key. */
  id: number;
  /** The first day of the year. */
  date: CalendarDate;
  /** The localized year name. */
  formatted: string;
}

export interface CalendarYearPickerAria {
  /** An accessible label for the year picker. */
  "aria-label": string;
  /** The key of the currently focused year (its index in the visible window). */
  value: Key;
  /** Handler that moves focus to the selected year. */
  onChange: (key: Key | null) => void;
  /** The list of selectable years in the visible window. */
  items: CalendarYearPickerItem[];
}

/**
 * Provides the behavior and accessibility implementation for a year picker
 * within a calendar.
 */
export function createCalendarYearPicker(
  props: MaybeAccessor<CalendarYearPickerProps>,
  state: CalendarState | RangeCalendarState,
): CalendarYearPickerAria {
  const getProps = () => access(props);
  const locale = useLocale();

  const formatter = createMemo(() => {
    const focused = state.focusedDate();
    const format = getProps().format;
    return new DateFormatter(locale().locale, {
      year: format?.year ?? "numeric",
      era:
        format?.era ??
        (focused.calendar.identifier === "gregory" && focused.era === "BC" ? "short" : undefined),
      calendar: focused.calendar.identifier,
      timeZone: state.timeZone,
    });
  });

  // Compute a window of years centered on the focused year, then clamp it to the
  // calendar's min/max so the picker never offers an out-of-range year.
  const data = createMemo(() => {
    const focused = state.focusedDate();
    const fmt = formatter();
    // Falsy coercion (not `??`) mirrors upstream `props.visibleYears || 20`, so a
    // `0`/`NaN` visibleYears falls back to the default 20 rather than producing an
    // empty window.
    const visibleYears = getProps().visibleYears || 20;
    let minDate = focused.subtract({ years: Math.floor(visibleYears / 2) });
    let maxDate = focused.add({ years: Math.ceil(visibleYears / 2) - 1 });

    const stateMax = state.maxValue();
    const stateMin = state.minValue();
    if (stateMax && maxDate.compare(stateMax) > 0) {
      maxDate = toCalendarDate(stateMax);
      minDate = maxDate.subtract({ years: visibleYears - 1 });
    }
    if (stateMin && minDate.compare(stateMin) < 0) {
      minDate = toCalendarDate(stateMin);
      maxDate = minDate.add({ years: visibleYears - 1 });
      if (stateMax && maxDate.compare(stateMax) > 0) {
        maxDate = toCalendarDate(stateMax);
      }
    }

    const years: CalendarYearPickerItem[] = [];
    let value: number = 0;
    let date = minDate;
    while (date.compare(maxDate) <= 0) {
      if (isSameYear(date, focused)) {
        value = years.length;
      }
      years.push({
        id: years.length,
        date,
        formatted: fmt.format(date.toDate(state.timeZone)),
      });
      date = date.add({ years: 1 });
    }
    return { items: years, value };
  });

  const ariaLabel = createMemo(
    () => new Intl.DisplayNames(locale().locale, { type: "dateTimeField" }).of("year") ?? "year",
  );

  return {
    get "aria-label"() {
      return ariaLabel();
    },
    get value() {
      return data().value;
    },
    onChange: (key) => {
      if (key != null) {
        state.setFocusedDate(data().items[Number(key)].date);
      }
    },
    get items() {
      return data().items;
    },
  };
}
