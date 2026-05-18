import {
  type CalendarDate,
  DateFormatter,
  endOfMonth,
  isSameDay,
  startOfMonth,
} from "@internationalized/date";
import type { CalendarState, RangeCalendarState } from "@proyecto-viviana/solid-stately";

export interface CalendarHookData {
  errorMessageId?: string;
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
      return formatRange(monthFormatter, startMonth, endMonth, timeZone);
    }
  }

  return formatRange(dateFormatter, startDate, endDate, timeZone);
}

function formatRange(
  dateFormatter: DateFormatter,
  startDate: CalendarDate,
  endDate: CalendarDate,
  timeZone: string,
): string {
  const formatter = dateFormatter as DateFormatter & {
    formatRangeToParts?: (start: Date, end: Date) => Intl.DateTimeFormatPart[];
  };
  const start = startDate.toDate(timeZone);
  const end = endDate.toDate(timeZone);

  if (!formatter.formatRangeToParts) {
    return `${dateFormatter.format(start)} to ${dateFormatter.format(end)}`;
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
    return `${dateFormatter.format(start)} to ${dateFormatter.format(end)}`;
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

  return `${startValue} to ${endValue}`;
}
