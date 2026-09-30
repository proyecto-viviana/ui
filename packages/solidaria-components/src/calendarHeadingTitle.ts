import { DateFormatter, type CalendarDate, type DateDuration } from "@internationalized/date";

/** Month heading options from react-aria `useCalendarHeading`. */
export interface CalendarHeadingFormatOptions {
  day?: "numeric" | "2-digit";
  month?: "numeric" | "2-digit" | "long" | "short" | "narrow";
  year?: "numeric" | "2-digit";
  era?: "long" | "short" | "narrow";
}

/**
 * Names one visible month. Week and day range headings need `visibleDuration`,
 * which this calendar does not page by, so those stay on the month formatter.
 */
export function calendarHeadingTitle(
  start: CalendarDate,
  offset: DateDuration | undefined,
  format: CalendarHeadingFormatOptions | undefined,
  locale: string,
  timeZone: string,
): string {
  const date = offset ? start.add(offset) : start;
  const formatter = new DateFormatter(locale, {
    day: format?.day,
    month: format?.month || "long",
    year: format?.year || "numeric",
    // Same operator precedence as useCalendarHeading: a truthy era option collapses to "short".
    era:
      format?.era || (date.calendar.identifier === "gregory" && date.era === "BC")
        ? "short"
        : undefined,
    calendar: start.calendar.identifier,
    timeZone,
  });
  const formattable = date.calendar.getFormattableMonth?.(date) ?? date;
  return formatter.format(formattable.toDate(timeZone));
}
