import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const dateRangePickerSizeOptions = ["S", "M", "L", "XL"] as const;
export const dateRangePickerVisibleMonthsOptions = ["1", "2"] as const;

export type DateRangePickerDemoSize = (typeof dateRangePickerSizeOptions)[number];
export type DateRangePickerVisibleMonths = (typeof dateRangePickerVisibleMonthsOptions)[number];

export interface DateRangePickerDemoProps {
  label: string;
  size: DateRangePickerDemoSize;
  maxVisibleMonths: DateRangePickerVisibleMonths;
  description: string;
  errorMessage: string;
  isDisabled: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const dateRangePickerDemoDefaults: DateRangePickerDemoProps = {
  label: "Trip dates",
  size: "M",
  maxVisibleMonths: "1",
  description: "Choose the start and end dates.",
  errorMessage: "Select a valid date range.",
  isDisabled: false,
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
    maxVisibleMonths: isOneOf(props.maxVisibleMonths, dateRangePickerVisibleMonthsOptions)
      ? props.maxVisibleMonths
      : dateRangePickerDemoDefaults.maxVisibleMonths,
    description:
      typeof props.description === "string"
        ? props.description
        : dateRangePickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : dateRangePickerDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function dateRangePickerDemoPropsFromSearch(search: string): DateRangePickerDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const maxVisibleMonths = params.get("maxVisibleMonths");

  return normalizeDateRangePickerDemoProps({
    label: params.get("label") || dateRangePickerDemoDefaults.label,
    size: isOneOf(size, dateRangePickerSizeOptions) ? size : dateRangePickerDemoDefaults.size,
    maxVisibleMonths: isOneOf(maxVisibleMonths, dateRangePickerVisibleMonthsOptions)
      ? maxVisibleMonths
      : dateRangePickerDemoDefaults.maxVisibleMonths,
    description: params.get("description") ?? dateRangePickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? dateRangePickerDemoDefaults.errorMessage,
    isDisabled: booleanParam(params.get("isDisabled")),
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
    maxVisibleMonths: props.maxVisibleMonths,
    description: props.description,
    errorMessage: props.errorMessage,
    isDisabled: props.isDisabled,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
