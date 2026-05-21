import { parseDate, type DateValue, type RangeValue } from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";
import {
  calendarLocaleOptions,
  calendarSystemOptions,
  type CalendarDemoCalendarSystem,
  type CalendarDemoLocale,
} from "./calendar-demo";

export { comparisonControlsEvent };

export const rangeCalendarFirstDayOfWeekOptions = [
  "",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
export const rangeCalendarVisibleMonthsOptions = ["", "1", "2"] as const;
export const rangeCalendarPageBehaviorOptions = ["", "single", "visible"] as const;
export const rangeCalendarSelectionAlignmentOptions = ["", "start", "center", "end"] as const;
export const rangeCalendarLocaleOptions = calendarLocaleOptions;
export const rangeCalendarSystemOptions = calendarSystemOptions;

export type RangeCalendarDemoFirstDayOfWeek = (typeof rangeCalendarFirstDayOfWeekOptions)[number];
export type RangeCalendarDemoVisibleMonths = (typeof rangeCalendarVisibleMonthsOptions)[number];
export type RangeCalendarDemoPageBehavior = (typeof rangeCalendarPageBehaviorOptions)[number];
export type RangeCalendarDemoSelectionAlignment =
  (typeof rangeCalendarSelectionAlignmentOptions)[number];
export type RangeCalendarDemoLocale = CalendarDemoLocale;
export type RangeCalendarDemoCalendarSystem = CalendarDemoCalendarSystem;

export interface RangeCalendarDemoProps {
  startValue: string;
  endValue: string;
  focusedValue: string;
  locale: RangeCalendarDemoLocale;
  firstDayOfWeek: RangeCalendarDemoFirstDayOfWeek;
  visibleMonths: RangeCalendarDemoVisibleMonths;
  pageBehavior: RangeCalendarDemoPageBehavior;
  selectionAlignment: RangeCalendarDemoSelectionAlignment;
  calendarSystem: RangeCalendarDemoCalendarSystem;
  constrainRange: boolean;
  unavailableDates: boolean;
  allowsNonContiguousRanges: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
  errorMessage: string;
}

export const rangeCalendarDemoDefaults: RangeCalendarDemoProps = {
  startValue: "2025-02-03",
  endValue: "2025-02-07",
  focusedValue: "",
  locale: "",
  firstDayOfWeek: "",
  visibleMonths: "",
  pageBehavior: "",
  selectionAlignment: "",
  calendarSystem: "",
  constrainRange: false,
  unavailableDates: false,
  allowsNonContiguousRanges: false,
  isDisabled: false,
  isReadOnly: false,
  isInvalid: false,
  errorMessage: "Choose a valid date range.",
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

export function rangeCalendarDateFromString(value: string): DateValue | null {
  if (!value) {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

export function rangeCalendarValueFromDemo(
  props: Pick<RangeCalendarDemoProps, "startValue" | "endValue">,
): RangeValue<DateValue> | null {
  const start = rangeCalendarDateFromString(props.startValue);
  const end = rangeCalendarDateFromString(props.endValue);

  return start && end ? { start, end } : null;
}

export function rangeCalendarVisibleMonthsFromString(
  value: RangeCalendarDemoVisibleMonths,
): number | undefined {
  return value ? Number(value) : undefined;
}

export const rangeCalendarMinValue = parseDate("2025-02-03");
export const rangeCalendarMaxValue = parseDate("2025-02-20");

export function isRangeCalendarDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export function serializeRangeCalendarValue(value: RangeValue<DateValue> | null): string {
  return value ? `${String(value.start)}/${String(value.end)}` : "";
}

export function normalizeRangeCalendarDemoProps(
  props: Partial<RangeCalendarDemoProps>,
): RangeCalendarDemoProps {
  return {
    startValue:
      typeof props.startValue === "string" && props.startValue
        ? props.startValue
        : rangeCalendarDemoDefaults.startValue,
    endValue:
      typeof props.endValue === "string" && props.endValue
        ? props.endValue
        : rangeCalendarDemoDefaults.endValue,
    focusedValue:
      typeof props.focusedValue === "string" && props.focusedValue
        ? props.focusedValue
        : rangeCalendarDemoDefaults.focusedValue,
    locale: isOneOf(props.locale, rangeCalendarLocaleOptions)
      ? props.locale
      : rangeCalendarDemoDefaults.locale,
    firstDayOfWeek: isOneOf(props.firstDayOfWeek, rangeCalendarFirstDayOfWeekOptions)
      ? props.firstDayOfWeek
      : rangeCalendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(props.visibleMonths, rangeCalendarVisibleMonthsOptions)
      ? props.visibleMonths
      : rangeCalendarDemoDefaults.visibleMonths,
    pageBehavior: isOneOf(props.pageBehavior, rangeCalendarPageBehaviorOptions)
      ? props.pageBehavior
      : rangeCalendarDemoDefaults.pageBehavior,
    selectionAlignment: isOneOf(props.selectionAlignment, rangeCalendarSelectionAlignmentOptions)
      ? props.selectionAlignment
      : rangeCalendarDemoDefaults.selectionAlignment,
    calendarSystem: isOneOf(props.calendarSystem, rangeCalendarSystemOptions)
      ? props.calendarSystem
      : rangeCalendarDemoDefaults.calendarSystem,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    allowsNonContiguousRanges: props.allowsNonContiguousRanges === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isInvalid: props.isInvalid === true,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : rangeCalendarDemoDefaults.errorMessage,
  };
}

export function rangeCalendarDemoPropsFromSearch(search: string): RangeCalendarDemoProps {
  const params = new URLSearchParams(search);
  const firstDayOfWeek = params.get("firstDayOfWeek");
  const visibleMonths = params.get("visibleMonths");
  const pageBehavior = params.get("pageBehavior");
  const selectionAlignment = params.get("selectionAlignment");
  const locale = params.get("locale");
  const calendarSystem = params.get("calendarSystem");

  return normalizeRangeCalendarDemoProps({
    startValue: params.get("startValue") || rangeCalendarDemoDefaults.startValue,
    endValue: params.get("endValue") || rangeCalendarDemoDefaults.endValue,
    focusedValue: params.get("focusedValue") || rangeCalendarDemoDefaults.focusedValue,
    locale: isOneOf(locale, rangeCalendarLocaleOptions) ? locale : rangeCalendarDemoDefaults.locale,
    firstDayOfWeek: isOneOf(firstDayOfWeek, rangeCalendarFirstDayOfWeekOptions)
      ? firstDayOfWeek
      : rangeCalendarDemoDefaults.firstDayOfWeek,
    visibleMonths: isOneOf(visibleMonths, rangeCalendarVisibleMonthsOptions)
      ? visibleMonths
      : rangeCalendarDemoDefaults.visibleMonths,
    pageBehavior: isOneOf(pageBehavior, rangeCalendarPageBehaviorOptions)
      ? pageBehavior
      : rangeCalendarDemoDefaults.pageBehavior,
    selectionAlignment: isOneOf(selectionAlignment, rangeCalendarSelectionAlignmentOptions)
      ? selectionAlignment
      : rangeCalendarDemoDefaults.selectionAlignment,
    calendarSystem: isOneOf(calendarSystem, rangeCalendarSystemOptions)
      ? calendarSystem
      : rangeCalendarDemoDefaults.calendarSystem,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    allowsNonContiguousRanges: booleanParam(params.get("allowsNonContiguousRanges")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isInvalid: booleanParam(params.get("isInvalid")),
    errorMessage: params.get("errorMessage") ?? rangeCalendarDemoDefaults.errorMessage,
  });
}

export function rangeCalendarDemoPropsFromWindow(): RangeCalendarDemoProps {
  if (typeof window === "undefined") {
    return rangeCalendarDemoDefaults;
  }

  return rangeCalendarDemoPropsFromSearch(window.location.search);
}

export function serializeRangeCalendarDemoProps(props: RangeCalendarDemoProps) {
  return JSON.stringify({
    startValue: props.startValue,
    endValue: props.endValue,
    focusedValue: props.focusedValue,
    locale: props.locale,
    firstDayOfWeek: props.firstDayOfWeek,
    visibleMonths: props.visibleMonths,
    pageBehavior: props.pageBehavior,
    selectionAlignment: props.selectionAlignment,
    calendarSystem: props.calendarSystem,
    constrainRange: props.constrainRange,
    unavailableDates: props.unavailableDates,
    allowsNonContiguousRanges: props.allowsNonContiguousRanges,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isInvalid: props.isInvalid,
    errorMessage: props.errorMessage,
  });
}
