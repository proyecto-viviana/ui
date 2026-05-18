import { parseDate, type DateValue } from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const calendarFirstDayOfWeekOptions = ["sun", "mon", "sat"] as const;
export const calendarVisibleMonthsOptions = ["1", "2"] as const;

export type CalendarDemoFirstDayOfWeek = (typeof calendarFirstDayOfWeekOptions)[number];
export type CalendarDemoVisibleMonths = (typeof calendarVisibleMonthsOptions)[number];

export interface CalendarDemoProps {
  value: string;
  firstDayOfWeek: CalendarDemoFirstDayOfWeek;
  visibleMonths: CalendarDemoVisibleMonths;
  constrainRange: boolean;
  unavailableDates: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  errorMessage: string;
}

export const calendarDemoDefaults: CalendarDemoProps = {
  value: "2025-02-03",
  firstDayOfWeek: "sun",
  visibleMonths: "1",
  constrainRange: false,
  unavailableDates: false,
  isDisabled: false,
  isReadOnly: false,
  isInvalid: false,
  errorMessage: "Choose an available date.",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function calendarDateFromString(value: string): DateValue {
  try {
    return parseDate(value);
  } catch {
    return parseDate(calendarDemoDefaults.value);
  }
}

export const calendarMinValue = parseDate("2025-02-03");
export const calendarMaxValue = parseDate("2025-02-20");

export function isCalendarDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export function normalizeCalendarDemoProps(props: Partial<CalendarDemoProps>): CalendarDemoProps {
  return {
    value:
      typeof props.value === "string" && props.value ? props.value : calendarDemoDefaults.value,
    firstDayOfWeek: isOneOf(props.firstDayOfWeek, calendarFirstDayOfWeekOptions)
      ? props.firstDayOfWeek
      : calendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(props.visibleMonths, calendarVisibleMonthsOptions)
      ? props.visibleMonths
      : calendarDemoDefaults.visibleMonths,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isInvalid: props.isInvalid === true,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : calendarDemoDefaults.errorMessage,
  };
}

export function calendarDemoPropsFromSearch(search: string): CalendarDemoProps {
  const params = new URLSearchParams(search);
  const firstDayOfWeek = params.get("firstDayOfWeek");
  const visibleMonths = params.get("visibleMonths");

  return normalizeCalendarDemoProps({
    value: params.get("value") || calendarDemoDefaults.value,
    firstDayOfWeek: isOneOf(firstDayOfWeek, calendarFirstDayOfWeekOptions)
      ? firstDayOfWeek
      : calendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(visibleMonths, calendarVisibleMonthsOptions)
      ? visibleMonths
      : calendarDemoDefaults.visibleMonths,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isInvalid: booleanParam(params.get("isInvalid")),
    errorMessage: params.get("errorMessage") ?? calendarDemoDefaults.errorMessage,
  });
}

export function calendarDemoPropsFromWindow(): CalendarDemoProps {
  if (typeof window === "undefined") {
    return calendarDemoDefaults;
  }

  return calendarDemoPropsFromSearch(window.location.search);
}

export function serializeCalendarDemoProps(props: CalendarDemoProps) {
  return JSON.stringify({
    value: props.value,
    firstDayOfWeek: props.firstDayOfWeek,
    visibleMonths: props.visibleMonths,
    constrainRange: props.constrainRange,
    unavailableDates: props.unavailableDates,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isInvalid: props.isInvalid,
    errorMessage: props.errorMessage,
  });
}
