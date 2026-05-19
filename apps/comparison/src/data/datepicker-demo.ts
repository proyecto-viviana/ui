import {
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  type DateValue,
} from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const datePickerSizeOptions = ["S", "M", "L", "XL"] as const;
export const datePickerVisibleMonthsOptions = ["1", "2"] as const;
export const datePickerFirstDayOfWeekOptions = [
  "",
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const;
export const datePickerPageBehaviorOptions = ["", "single", "visible"] as const;
export const datePickerGranularityOptions = ["day", "hour", "minute", "second"] as const;
export const datePickerHourCycleOptions = ["", "12", "24"] as const;
export const datePickerLocaleOptions = ["", "fr-FR", "hi-IN-u-ca-indian", "ar-AE"] as const;
export const datePickerCalendarSystemOptions = ["", "custom454"] as const;
export const datePickerValidationBehaviorOptions = ["", "native", "aria"] as const;

export type DatePickerDemoSize = (typeof datePickerSizeOptions)[number];
export type DatePickerVisibleMonths = (typeof datePickerVisibleMonthsOptions)[number];
export type DatePickerFirstDayOfWeek = (typeof datePickerFirstDayOfWeekOptions)[number];
export type DatePickerPageBehavior = (typeof datePickerPageBehaviorOptions)[number];
export type DatePickerGranularity = (typeof datePickerGranularityOptions)[number];
export type DatePickerHourCycle = (typeof datePickerHourCycleOptions)[number];
export type DatePickerLocale = (typeof datePickerLocaleOptions)[number];
export type DatePickerCalendarSystem = (typeof datePickerCalendarSystemOptions)[number];
export type DatePickerValidationBehavior = (typeof datePickerValidationBehaviorOptions)[number];

export interface DatePickerDemoProps {
  label: string;
  size: DatePickerDemoSize;
  value: string;
  maxVisibleMonths: DatePickerVisibleMonths;
  firstDayOfWeek: DatePickerFirstDayOfWeek;
  pageBehavior: DatePickerPageBehavior;
  granularity: DatePickerGranularity;
  hourCycle: DatePickerHourCycle;
  hideTimeZone: boolean;
  locale: DatePickerLocale;
  calendarSystem: DatePickerCalendarSystem;
  name: string;
  form: string;
  validationBehavior: DatePickerValidationBehavior;
  description: string;
  errorMessage: string;
  constrainRange: boolean;
  unavailableDates: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const datePickerDemoDefaults: DatePickerDemoProps = {
  label: "Due date",
  size: "M",
  value: "",
  maxVisibleMonths: "1",
  firstDayOfWeek: "",
  pageBehavior: "",
  granularity: "day",
  hourCycle: "",
  hideTimeZone: false,
  locale: "",
  calendarSystem: "",
  name: "",
  form: "",
  validationBehavior: "",
  description: "Choose the project due date.",
  errorMessage: "Select a due date.",
  constrainRange: false,
  unavailableDates: false,
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

export function datePickerDateFromString(value: string): DateValue | null {
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

export function datePickerValueFromDemo(
  props: Pick<DatePickerDemoProps, "value">,
): DateValue | null {
  return datePickerDateFromString(props.value);
}

export function serializeDatePickerValue(value: DateValue | null): string {
  return value ? String(value) : "";
}

export function datePickerMinValue(granularity: DatePickerGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-03") : parseDateTime("2025-02-03T00:00:00");
}

export function datePickerMaxValue(granularity: DatePickerGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-20") : parseDateTime("2025-02-20T23:59:59");
}

export function isDatePickerDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export function normalizeDatePickerDemoProps(
  props: Partial<DatePickerDemoProps>,
): DatePickerDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : datePickerDemoDefaults.label,
    size: isOneOf(props.size, datePickerSizeOptions) ? props.size : datePickerDemoDefaults.size,
    value: typeof props.value === "string" ? props.value : datePickerDemoDefaults.value,
    maxVisibleMonths: isOneOf(props.maxVisibleMonths, datePickerVisibleMonthsOptions)
      ? props.maxVisibleMonths
      : datePickerDemoDefaults.maxVisibleMonths,
    firstDayOfWeek: isOneOf(props.firstDayOfWeek, datePickerFirstDayOfWeekOptions)
      ? props.firstDayOfWeek
      : datePickerDemoDefaults.firstDayOfWeek,
    pageBehavior: isOneOf(props.pageBehavior, datePickerPageBehaviorOptions)
      ? props.pageBehavior
      : datePickerDemoDefaults.pageBehavior,
    granularity: isOneOf(props.granularity, datePickerGranularityOptions)
      ? props.granularity
      : datePickerDemoDefaults.granularity,
    hourCycle: isOneOf(props.hourCycle, datePickerHourCycleOptions)
      ? props.hourCycle
      : datePickerDemoDefaults.hourCycle,
    hideTimeZone: props.hideTimeZone === true,
    locale: isOneOf(props.locale, datePickerLocaleOptions)
      ? props.locale
      : datePickerDemoDefaults.locale,
    calendarSystem: isOneOf(props.calendarSystem, datePickerCalendarSystemOptions)
      ? props.calendarSystem
      : datePickerDemoDefaults.calendarSystem,
    name: typeof props.name === "string" ? props.name : datePickerDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : datePickerDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, datePickerValidationBehaviorOptions)
      ? props.validationBehavior
      : datePickerDemoDefaults.validationBehavior,
    description:
      typeof props.description === "string"
        ? props.description
        : datePickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : datePickerDemoDefaults.errorMessage,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function datePickerDemoPropsFromSearch(search: string): DatePickerDemoProps {
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

  return normalizeDatePickerDemoProps({
    label: params.get("label") || datePickerDemoDefaults.label,
    size: isOneOf(size, datePickerSizeOptions) ? size : datePickerDemoDefaults.size,
    value: params.get("value") ?? datePickerDemoDefaults.value,
    maxVisibleMonths: isOneOf(maxVisibleMonths, datePickerVisibleMonthsOptions)
      ? maxVisibleMonths
      : datePickerDemoDefaults.maxVisibleMonths,
    firstDayOfWeek: isOneOf(firstDayOfWeek, datePickerFirstDayOfWeekOptions)
      ? firstDayOfWeek
      : datePickerDemoDefaults.firstDayOfWeek,
    pageBehavior: isOneOf(pageBehavior, datePickerPageBehaviorOptions)
      ? pageBehavior
      : datePickerDemoDefaults.pageBehavior,
    granularity: isOneOf(granularity, datePickerGranularityOptions)
      ? granularity
      : datePickerDemoDefaults.granularity,
    hourCycle: isOneOf(hourCycle, datePickerHourCycleOptions)
      ? hourCycle
      : datePickerDemoDefaults.hourCycle,
    hideTimeZone: booleanParam(params.get("hideTimeZone")),
    locale: isOneOf(locale, datePickerLocaleOptions) ? locale : datePickerDemoDefaults.locale,
    calendarSystem: isOneOf(calendarSystem, datePickerCalendarSystemOptions)
      ? calendarSystem
      : datePickerDemoDefaults.calendarSystem,
    name: params.get("name") ?? datePickerDemoDefaults.name,
    form: params.get("form") ?? datePickerDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, datePickerValidationBehaviorOptions)
      ? validationBehavior
      : datePickerDemoDefaults.validationBehavior,
    description: params.get("description") ?? datePickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? datePickerDemoDefaults.errorMessage,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function datePickerDemoPropsFromWindow(): DatePickerDemoProps {
  if (typeof window === "undefined") {
    return datePickerDemoDefaults;
  }

  return datePickerDemoPropsFromSearch(window.location.search);
}

export function serializeDatePickerDemoProps(props: DatePickerDemoProps) {
  return JSON.stringify({
    label: props.label,
    size: props.size,
    value: props.value,
    maxVisibleMonths: props.maxVisibleMonths,
    firstDayOfWeek: props.firstDayOfWeek,
    pageBehavior: props.pageBehavior,
    granularity: props.granularity,
    hourCycle: props.hourCycle,
    hideTimeZone: props.hideTimeZone,
    locale: props.locale,
    calendarSystem: props.calendarSystem,
    name: props.name,
    form: props.form,
    validationBehavior: props.validationBehavior,
    description: props.description,
    errorMessage: props.errorMessage,
    constrainRange: props.constrainRange,
    unavailableDates: props.unavailableDates,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
