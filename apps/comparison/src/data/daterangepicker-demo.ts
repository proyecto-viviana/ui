import {
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  type DateValue,
  type RangeValue,
} from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const dateRangePickerSizeOptions = ["S", "M", "L", "XL"] as const;
export const dateRangePickerVisibleMonthsOptions = ["1", "2"] as const;
export const dateRangePickerFirstDayOfWeekOptions = [
  "",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
export const dateRangePickerPageBehaviorOptions = ["", "single", "visible"] as const;
export const dateRangePickerGranularityOptions = ["day", "hour", "minute", "second"] as const;
export const dateRangePickerHourCycleOptions = ["", "12", "24"] as const;
export const dateRangePickerLocaleOptions = ["", "fr-FR", "hi-IN-u-ca-indian", "ar-AE"] as const;
export const dateRangePickerCalendarSystemOptions = ["", "custom454"] as const;
export const dateRangePickerValidationBehaviorOptions = ["", "native", "aria"] as const;

export type DateRangePickerDemoSize = (typeof dateRangePickerSizeOptions)[number];
export type DateRangePickerVisibleMonths = (typeof dateRangePickerVisibleMonthsOptions)[number];
export type DateRangePickerFirstDayOfWeek = (typeof dateRangePickerFirstDayOfWeekOptions)[number];
export type DateRangePickerPageBehavior = (typeof dateRangePickerPageBehaviorOptions)[number];
export type DateRangePickerGranularity = (typeof dateRangePickerGranularityOptions)[number];
export type DateRangePickerHourCycle = (typeof dateRangePickerHourCycleOptions)[number];
export type DateRangePickerLocale = (typeof dateRangePickerLocaleOptions)[number];
export type DateRangePickerCalendarSystem = (typeof dateRangePickerCalendarSystemOptions)[number];
export type DateRangePickerValidationBehavior =
  (typeof dateRangePickerValidationBehaviorOptions)[number];

export interface DateRangePickerDemoProps {
  label: string;
  size: DateRangePickerDemoSize;
  startValue: string;
  endValue: string;
  maxVisibleMonths: DateRangePickerVisibleMonths;
  firstDayOfWeek: DateRangePickerFirstDayOfWeek;
  pageBehavior: DateRangePickerPageBehavior;
  granularity: DateRangePickerGranularity;
  hourCycle: DateRangePickerHourCycle;
  hideTimeZone: boolean;
  locale: DateRangePickerLocale;
  calendarSystem: DateRangePickerCalendarSystem;
  startName: string;
  endName: string;
  form: string;
  validationBehavior: DateRangePickerValidationBehavior;
  description: string;
  errorMessage: string;
  constrainRange: boolean;
  unavailableDates: boolean;
  allowsNonContiguousRanges: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const dateRangePickerDemoDefaults: DateRangePickerDemoProps = {
  label: "Trip dates",
  size: "M",
  startValue: "",
  endValue: "",
  maxVisibleMonths: "1",
  firstDayOfWeek: "",
  pageBehavior: "",
  granularity: "day",
  hourCycle: "",
  hideTimeZone: false,
  locale: "",
  calendarSystem: "",
  startName: "",
  endName: "",
  form: "",
  validationBehavior: "",
  description: "Choose the start and end dates.",
  errorMessage: "Select a valid date range.",
  constrainRange: false,
  unavailableDates: false,
  allowsNonContiguousRanges: false,
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
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

export function dateRangePickerDateFromString(value: string): DateValue | null {
  if (!value) {
    return null;
  }

  try {
    if (value.includes("[")) {
      return parseZonedDateTime(value);
    }

    if (value.includes("T")) {
      return parseDateTime(value);
    }

    return parseDate(value);
  } catch {
    return null;
  }
}

export function dateRangePickerValueFromDemo(
  props: Pick<DateRangePickerDemoProps, "startValue" | "endValue">,
): RangeValue<DateValue> | null {
  const start = dateRangePickerDateFromString(props.startValue);
  const end = dateRangePickerDateFromString(props.endValue);

  return start && end ? { start, end } : null;
}

export function serializeDateRangePickerValue(value: RangeValue<DateValue> | null): string {
  return value ? `${String(value.start)}/${String(value.end)}` : "";
}

export function dateRangePickerMinValue(granularity: DateRangePickerGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-03") : parseDateTime("2025-02-03T00:00:00");
}

export function dateRangePickerMaxValue(granularity: DateRangePickerGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-20") : parseDateTime("2025-02-20T23:59:59");
}

export function isDateRangePickerDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export function normalizeDateRangePickerDemoProps(
  props: Partial<DateRangePickerDemoProps>,
): DateRangePickerDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label
        ? props.label
        : dateRangePickerDemoDefaults.label,
    size: isOneOf(props.size, dateRangePickerSizeOptions)
      ? props.size
      : dateRangePickerDemoDefaults.size,
    startValue:
      typeof props.startValue === "string"
        ? props.startValue
        : dateRangePickerDemoDefaults.startValue,
    endValue:
      typeof props.endValue === "string" ? props.endValue : dateRangePickerDemoDefaults.endValue,
    maxVisibleMonths: isOneOf(props.maxVisibleMonths, dateRangePickerVisibleMonthsOptions)
      ? props.maxVisibleMonths
      : dateRangePickerDemoDefaults.maxVisibleMonths,
    firstDayOfWeek: isOneOf(props.firstDayOfWeek, dateRangePickerFirstDayOfWeekOptions)
      ? props.firstDayOfWeek
      : dateRangePickerDemoDefaults.firstDayOfWeek,
    pageBehavior: isOneOf(props.pageBehavior, dateRangePickerPageBehaviorOptions)
      ? props.pageBehavior
      : dateRangePickerDemoDefaults.pageBehavior,
    granularity: isOneOf(props.granularity, dateRangePickerGranularityOptions)
      ? props.granularity
      : dateRangePickerDemoDefaults.granularity,
    hourCycle: isOneOf(props.hourCycle, dateRangePickerHourCycleOptions)
      ? props.hourCycle
      : dateRangePickerDemoDefaults.hourCycle,
    hideTimeZone: props.hideTimeZone === true,
    locale: isOneOf(props.locale, dateRangePickerLocaleOptions)
      ? props.locale
      : dateRangePickerDemoDefaults.locale,
    calendarSystem: isOneOf(props.calendarSystem, dateRangePickerCalendarSystemOptions)
      ? props.calendarSystem
      : dateRangePickerDemoDefaults.calendarSystem,
    startName:
      typeof props.startName === "string" ? props.startName : dateRangePickerDemoDefaults.startName,
    endName:
      typeof props.endName === "string" ? props.endName : dateRangePickerDemoDefaults.endName,
    form: typeof props.form === "string" ? props.form : dateRangePickerDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, dateRangePickerValidationBehaviorOptions)
      ? props.validationBehavior
      : dateRangePickerDemoDefaults.validationBehavior,
    description:
      typeof props.description === "string"
        ? props.description
        : dateRangePickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : dateRangePickerDemoDefaults.errorMessage,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    allowsNonContiguousRanges: props.allowsNonContiguousRanges === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function dateRangePickerDemoPropsFromSearch(search: string): DateRangePickerDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const maxVisibleMonths = params.get("maxVisibleMonths");
  const firstDayOfWeek = params.get("firstDayOfWeek");
  const pageBehavior = params.get("pageBehavior");
  const granularity = params.get("granularity");
  const hourCycle = params.get("hourCycle");
  const locale = params.get("locale");
  const calendarSystem = params.get("calendarSystem");
  const validationBehavior = params.get("validationBehavior");

  return normalizeDateRangePickerDemoProps({
    label: params.get("label") || dateRangePickerDemoDefaults.label,
    size: isOneOf(size, dateRangePickerSizeOptions) ? size : dateRangePickerDemoDefaults.size,
    startValue: params.get("startValue") ?? dateRangePickerDemoDefaults.startValue,
    endValue: params.get("endValue") ?? dateRangePickerDemoDefaults.endValue,
    maxVisibleMonths: isOneOf(maxVisibleMonths, dateRangePickerVisibleMonthsOptions)
      ? maxVisibleMonths
      : dateRangePickerDemoDefaults.maxVisibleMonths,
    firstDayOfWeek: isOneOf(firstDayOfWeek, dateRangePickerFirstDayOfWeekOptions)
      ? firstDayOfWeek
      : dateRangePickerDemoDefaults.firstDayOfWeek,
    pageBehavior: isOneOf(pageBehavior, dateRangePickerPageBehaviorOptions)
      ? pageBehavior
      : dateRangePickerDemoDefaults.pageBehavior,
    granularity: isOneOf(granularity, dateRangePickerGranularityOptions)
      ? granularity
      : dateRangePickerDemoDefaults.granularity,
    hourCycle: isOneOf(hourCycle, dateRangePickerHourCycleOptions)
      ? hourCycle
      : dateRangePickerDemoDefaults.hourCycle,
    hideTimeZone: booleanParam(params.get("hideTimeZone")),
    locale: isOneOf(locale, dateRangePickerLocaleOptions)
      ? locale
      : dateRangePickerDemoDefaults.locale,
    calendarSystem: isOneOf(calendarSystem, dateRangePickerCalendarSystemOptions)
      ? calendarSystem
      : dateRangePickerDemoDefaults.calendarSystem,
    startName: params.get("startName") ?? dateRangePickerDemoDefaults.startName,
    endName: params.get("endName") ?? dateRangePickerDemoDefaults.endName,
    form: params.get("form") ?? dateRangePickerDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, dateRangePickerValidationBehaviorOptions)
      ? validationBehavior
      : dateRangePickerDemoDefaults.validationBehavior,
    description: params.get("description") ?? dateRangePickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? dateRangePickerDemoDefaults.errorMessage,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    allowsNonContiguousRanges: booleanParam(params.get("allowsNonContiguousRanges")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function dateRangePickerDemoPropsFromWindow(): DateRangePickerDemoProps {
  if (typeof window === "undefined") {
    return dateRangePickerDemoDefaults;
  }

  return dateRangePickerDemoPropsFromSearch(window.location.search);
}

export function serializeDateRangePickerDemoProps(props: DateRangePickerDemoProps) {
  return JSON.stringify({
    label: props.label,
    size: props.size,
    startValue: props.startValue,
    endValue: props.endValue,
    maxVisibleMonths: props.maxVisibleMonths,
    firstDayOfWeek: props.firstDayOfWeek,
    pageBehavior: props.pageBehavior,
    granularity: props.granularity,
    hourCycle: props.hourCycle,
    hideTimeZone: props.hideTimeZone,
    locale: props.locale,
    calendarSystem: props.calendarSystem,
    startName: props.startName,
    endName: props.endName,
    form: props.form,
    validationBehavior: props.validationBehavior,
    description: props.description,
    errorMessage: props.errorMessage,
    constrainRange: props.constrainRange,
    unavailableDates: props.unavailableDates,
    allowsNonContiguousRanges: props.allowsNonContiguousRanges,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
