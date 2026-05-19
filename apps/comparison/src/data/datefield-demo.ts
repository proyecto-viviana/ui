import {
  parseDate,
  parseDateTime,
  parseZonedDateTime,
  type DateValue,
} from "@proyecto-viviana/solid-stately";
import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const dateFieldSizeOptions = ["S", "M", "L", "XL"] as const;
export const dateFieldLabelPositionOptions = ["top", "side"] as const;
export const dateFieldLabelAlignOptions = ["start", "end"] as const;
export const dateFieldNecessityIndicatorOptions = ["icon", "label"] as const;
export const dateFieldGranularityOptions = ["day", "hour", "minute", "second"] as const;
export const dateFieldHourCycleOptions = ["", "12", "24"] as const;
export const dateFieldLocaleOptions = ["", "fr-FR", "hi-IN-u-ca-indian", "ar-AE"] as const;

export type DateFieldDemoSize = (typeof dateFieldSizeOptions)[number];
export type DateFieldLabelPosition = (typeof dateFieldLabelPositionOptions)[number];
export type DateFieldLabelAlign = (typeof dateFieldLabelAlignOptions)[number];
export type DateFieldNecessityIndicator = (typeof dateFieldNecessityIndicatorOptions)[number];
export type DateFieldGranularity = (typeof dateFieldGranularityOptions)[number];
export type DateFieldHourCycle = (typeof dateFieldHourCycleOptions)[number];
export type DateFieldLocale = (typeof dateFieldLocaleOptions)[number];

export interface DateFieldDemoProps {
  label: string;
  size: DateFieldDemoSize;
  labelPosition: DateFieldLabelPosition;
  labelAlign: DateFieldLabelAlign;
  necessityIndicator: DateFieldNecessityIndicator;
  value: string;
  granularity: DateFieldGranularity;
  hourCycle: DateFieldHourCycle;
  hideTimeZone: boolean;
  locale: DateFieldLocale;
  name: string;
  description: string;
  errorMessage: string;
  constrainRange: boolean;
  unavailableDates: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const dateFieldDemoDefaults: DateFieldDemoProps = {
  label: "Appointment date",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  value: "2025-02-03",
  granularity: "day",
  hourCycle: "",
  hideTimeZone: false,
  locale: "",
  name: "",
  description: "Enter the appointment date.",
  errorMessage: "Enter a valid appointment date.",
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

export function dateFieldDateFromString(value: string): DateValue | null {
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

export function dateFieldValueFromDemo(props: Pick<DateFieldDemoProps, "value">): DateValue | null {
  return dateFieldDateFromString(props.value);
}

export function serializeDateFieldValue(value: DateValue | null): string {
  return value ? String(value) : "";
}

export function dateFieldMinValue(granularity: DateFieldGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-03") : parseDateTime("2025-02-03T00:00:00");
}

export function dateFieldMaxValue(granularity: DateFieldGranularity): DateValue {
  return granularity === "day" ? parseDate("2025-02-20") : parseDateTime("2025-02-20T23:59:59");
}

export function isDateFieldDateUnavailable(date: DateValue): boolean {
  return date.day === 10 || date.day === 11;
}

export function normalizeDateFieldDemoProps(
  props: Partial<DateFieldDemoProps>,
): DateFieldDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : dateFieldDemoDefaults.label,
    size: isOneOf(props.size, dateFieldSizeOptions) ? props.size : dateFieldDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, dateFieldLabelPositionOptions)
      ? props.labelPosition
      : dateFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, dateFieldLabelAlignOptions)
      ? props.labelAlign
      : dateFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, dateFieldNecessityIndicatorOptions)
      ? props.necessityIndicator
      : dateFieldDemoDefaults.necessityIndicator,
    value: typeof props.value === "string" ? props.value : dateFieldDemoDefaults.value,
    granularity: isOneOf(props.granularity, dateFieldGranularityOptions)
      ? props.granularity
      : dateFieldDemoDefaults.granularity,
    hourCycle: isOneOf(props.hourCycle, dateFieldHourCycleOptions)
      ? props.hourCycle
      : dateFieldDemoDefaults.hourCycle,
    hideTimeZone: props.hideTimeZone === true,
    locale: isOneOf(props.locale, dateFieldLocaleOptions)
      ? props.locale
      : dateFieldDemoDefaults.locale,
    name: typeof props.name === "string" ? props.name : dateFieldDemoDefaults.name,
    description:
      typeof props.description === "string" ? props.description : dateFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : dateFieldDemoDefaults.errorMessage,
    constrainRange: props.constrainRange === true,
    unavailableDates: props.unavailableDates === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function dateFieldDemoPropsFromSearch(search: string): DateFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const granularity = params.get("granularity");
  const hourCycle = params.get("hourCycle");
  const locale = params.get("locale");

  return normalizeDateFieldDemoProps({
    label: params.get("label") || dateFieldDemoDefaults.label,
    size: isOneOf(size, dateFieldSizeOptions) ? size : dateFieldDemoDefaults.size,
    labelPosition: isOneOf(labelPosition, dateFieldLabelPositionOptions)
      ? labelPosition
      : dateFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, dateFieldLabelAlignOptions)
      ? labelAlign
      : dateFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, dateFieldNecessityIndicatorOptions)
      ? necessityIndicator
      : dateFieldDemoDefaults.necessityIndicator,
    value: params.get("value") ?? dateFieldDemoDefaults.value,
    granularity: isOneOf(granularity, dateFieldGranularityOptions)
      ? granularity
      : dateFieldDemoDefaults.granularity,
    hourCycle: isOneOf(hourCycle, dateFieldHourCycleOptions)
      ? hourCycle
      : dateFieldDemoDefaults.hourCycle,
    hideTimeZone: booleanParam(params.get("hideTimeZone")),
    locale: isOneOf(locale, dateFieldLocaleOptions) ? locale : dateFieldDemoDefaults.locale,
    name: params.get("name") ?? dateFieldDemoDefaults.name,
    description: params.get("description") ?? dateFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? dateFieldDemoDefaults.errorMessage,
    constrainRange: booleanParam(params.get("constrainRange")),
    unavailableDates: booleanParam(params.get("unavailableDates")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function dateFieldDemoPropsFromWindow(): DateFieldDemoProps {
  if (typeof window === "undefined") {
    return dateFieldDemoDefaults;
  }

  return dateFieldDemoPropsFromSearch(window.location.search);
}

export function serializeDateFieldDemoProps(props: DateFieldDemoProps) {
  return JSON.stringify({
    label: props.label,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    value: props.value,
    granularity: props.granularity,
    hourCycle: props.hourCycle,
    hideTimeZone: props.hideTimeZone,
    locale: props.locale,
    name: props.name,
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
