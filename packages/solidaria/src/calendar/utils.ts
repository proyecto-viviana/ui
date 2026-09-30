/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/calendar/utils.ts

import {
  type CalendarDate,
  DateFormatter,
  endOfMonth,
  isSameDay,
  startOfMonth,
} from "@internationalized/date";
import { createEffect, onCleanup, untrack, type Accessor } from "solid-js";
import type { CalendarState, RangeCalendarState } from "@proyecto-viviana/solid-stately";
import { announce } from "../live-announcer";
import { formatCalendarLabel } from "./intl";

export interface CalendarHookData {
  errorMessageId?: string;
  selectedDateDescription?: string;
  /** The calendar's accessible label, shared with each grid (mirrors @react-aria/calendar hookData.ariaLabel). */
  ariaLabel?: string;
  /** The id of an element labelling the calendar, shared with each grid (mirrors hookData.ariaLabelledBy). */
  ariaLabelledBy?: string;
}

const hookData = new WeakMap<CalendarState | RangeCalendarState, CalendarHookData>();

export function setCalendarHookData(
  state: CalendarState | RangeCalendarState,
  data: CalendarHookData,
): void {
  hookData.set(state, data);
}

export function getCalendarHookData(
  state: CalendarState | RangeCalendarState,
): CalendarHookData | undefined {
  return hookData.get(state);
}

export function getEraFormat(date: CalendarDate | undefined): "short" | undefined {
  return date?.calendar.identifier === "gregory" && date.era === "BC" ? "short" : undefined;
}

export function formatVisibleRangeDescription(
  startDate: CalendarDate,
  endDate: CalendarDate,
  timeZone: string,
  locale: string,
): string {
  const era = getEraFormat(startDate) || getEraFormat(endDate);
  const monthFormatter = new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  } as Intl.DateTimeFormatOptions);
  const dateFormatter = new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  } as Intl.DateTimeFormatOptions);

  if (isSameDay(startDate, startOfMonth(startDate))) {
    const startMonth = startDate.calendar.getFormattableMonth?.(startDate) ?? startDate;
    const endMonth = endDate.calendar.getFormattableMonth?.(endDate) ?? endDate;

    if (isSameDay(endDate, endOfMonth(startDate))) {
      return monthFormatter.format(startMonth.toDate(timeZone));
    }

    if (isSameDay(endDate, endOfMonth(endDate))) {
      return formatLabelRange(monthFormatter, startMonth, endMonth, timeZone, locale);
    }
  }

  return formatLabelRange(dateFormatter, startDate, endDate, timeZone, locale);
}

/**
 * Visual title for the visible window. The calendar and grid names stay on
 * the catalog path; this one uses the native month or date range.
 */
export function formatVisibleRangeTitle(
  startDate: CalendarDate,
  endDate: CalendarDate,
  timeZone: string,
  locale: string,
): string {
  const era = getEraFormat(startDate) || getEraFormat(endDate);
  const monthFormatter = new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  } as Intl.DateTimeFormatOptions);
  const dateFormatter = new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    day: "numeric",
    era,
    calendar: startDate.calendar.identifier,
    timeZone,
  } as Intl.DateTimeFormatOptions);

  if (isSameDay(startDate, startOfMonth(startDate))) {
    const startMonth = startDate.calendar.getFormattableMonth?.(startDate) ?? startDate;
    const endMonth = endDate.calendar.getFormattableMonth?.(endDate) ?? endDate;

    if (isSameDay(endDate, endOfMonth(startDate))) {
      return monthFormatter.format(startMonth.toDate(timeZone));
    }

    if (isSameDay(endDate, endOfMonth(endDate))) {
      return monthFormatter.formatRange(startMonth.toDate(timeZone), endMonth.toDate(timeZone));
    }
  }

  return dateFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
}

export function formatSelectedDateDescription(state: CalendarState | RangeCalendarState): string {
  const locale = state.locale();
  const timeZone = state.timeZone;
  let start: CalendarDate | undefined;
  let end: CalendarDate | undefined;

  if ("highlightedRange" in state) {
    const range = state.highlightedRange();
    start = range?.start;
    end = range?.end;
  } else {
    const value = state.value() as CalendarDate | CalendarDate[] | null;
    if (Array.isArray(value)) {
      start = value[0];
      end = value.at(-1);
    } else {
      start = value ?? undefined;
      end = value ?? undefined;
    }
  }

  const anchorDate = "anchorDate" in state ? state.anchorDate() : null;
  if (anchorDate || !start || !end) {
    return "";
  }

  const dateFormatter = new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(start) || getEraFormat(end),
    timeZone,
  } as Intl.DateTimeFormatOptions);

  if (isSameDay(start, end)) {
    return formatCalendarLabel(locale, "selectedDateDescription", {
      date: dateFormatter.format(start.toDate(timeZone)),
    });
  }

  if (!("highlightedRange" in state)) {
    const selected = state.value() as CalendarDate | CalendarDate[] | null;
    if (Array.isArray(selected)) {
      const dates = selected.map((date) => dateFormatter.format(date.toDate(timeZone)));
      return formatCalendarLabel(locale, "selectedDateDescription", {
        date: new Intl.ListFormat(locale).format(dates),
      });
    }
  }

  return formatCalendarLabel(locale, "selectedRangeDescription", {
    dateRange: formatLabelRange(dateFormatter, start, end, timeZone, locale),
  });
}

function formatLabelRange(
  dateFormatter: DateFormatter,
  startDate: CalendarDate,
  endDate: CalendarDate,
  timeZone: string,
  locale: string,
): string {
  const formatter = dateFormatter as DateFormatter & {
    formatRangeToParts?: (start: Date, end: Date) => Intl.DateTimeFormatPart[];
  };
  const start = startDate.toDate(timeZone);
  const end = endDate.toDate(timeZone);

  if (!formatter.formatRangeToParts) {
    return formatCalendarLabel(locale, "dateRange", {
      startDate: dateFormatter.format(start),
      endDate: dateFormatter.format(end),
    });
  }

  const parts = formatter.formatRangeToParts(start, end) as Array<
    Intl.DateTimeFormatPart & { source?: "startRange" | "shared" | "endRange" }
  >;
  let separatorIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part?.source === "shared" && part.type === "literal") {
      separatorIndex = i;
    } else if (part?.source === "endRange") {
      break;
    }
  }

  if (separatorIndex < 0) {
    return formatCalendarLabel(locale, "dateRange", {
      startDate: dateFormatter.format(start),
      endDate: dateFormatter.format(end),
    });
  }

  let startValue = "";
  let endValue = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) {
      continue;
    }

    if (i < separatorIndex) {
      startValue += part.value;
    } else if (i > separatorIndex) {
      endValue += part.value;
    }
  }

  return formatCalendarLabel(locale, "dateRange", {
    startDate: startValue,
    endDate: endValue,
  });
}

const visibleRangeAnnouncers = new WeakSet<object>();

/**
 * Announce a visible-range change once per calendar state.
 * CalendarButton re-enters the hook with the same state; a second effect
 * would repeat the page announcement. The first run is skipped, matching
 * useUpdateEffect, and focus is read untracked so focusing the grid does
 * not announce the range it already shows.
 */
export function announceVisibleRangeChange(
  state: CalendarState | RangeCalendarState,
  visibleRangeDescription: Accessor<string>,
): void {
  if (visibleRangeAnnouncers.has(state)) {
    return;
  }
  visibleRangeAnnouncers.add(state);
  onCleanup(() => {
    visibleRangeAnnouncers.delete(state);
  });

  let skipInitial = true;
  createEffect(
    () => visibleRangeDescription(),
    (description) => {
      if (skipInitial) {
        skipInitial = false;
        return;
      }
      if (!untrack(() => state.isFocused())) {
        announce(description);
      }
    },
  );
}

const selectedDateAnnouncers = new WeakSet<object>();

/**
 * Announce a selection change once per calendar state.
 * The first run is skipped, matching useUpdateEffect. An empty description
 * (an in-progress range, or nothing selected) is not announced.
 */
export function announceSelectedDateChange(
  state: CalendarState | RangeCalendarState,
  selectedDateDescription: Accessor<string>,
): void {
  if (selectedDateAnnouncers.has(state)) {
    return;
  }
  selectedDateAnnouncers.add(state);
  onCleanup(() => {
    selectedDateAnnouncers.delete(state);
  });

  let skipInitial = true;
  createEffect(
    () => selectedDateDescription(),
    (description) => {
      if (skipInitial) {
        skipInitial = false;
        return;
      }
      if (description) {
        announce(description, "polite", 4000);
      }
    },
  );
}
