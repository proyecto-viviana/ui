import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const datePickerSizeOptions = ["S", "M", "L", "XL"] as const;

export type DatePickerDemoSize = (typeof datePickerSizeOptions)[number];

export interface DatePickerDemoProps {
  label: string;
  size: DatePickerDemoSize;
  description: string;
  errorMessage: string;
  isDisabled: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const datePickerDemoDefaults: DatePickerDemoProps = {
  label: "Due date",
  size: "M",
  description: "Choose the project due date.",
  errorMessage: "Select a due date.",
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

export function normalizeDatePickerDemoProps(
  props: Partial<DatePickerDemoProps>,
): DatePickerDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : datePickerDemoDefaults.label,
    size: isOneOf(props.size, datePickerSizeOptions) ? props.size : datePickerDemoDefaults.size,
    description:
      typeof props.description === "string"
        ? props.description
        : datePickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : datePickerDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function datePickerDemoPropsFromSearch(search: string): DatePickerDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeDatePickerDemoProps({
    label: params.get("label") || datePickerDemoDefaults.label,
    size: isOneOf(size, datePickerSizeOptions) ? size : datePickerDemoDefaults.size,
    description: params.get("description") ?? datePickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? datePickerDemoDefaults.errorMessage,
    isDisabled: booleanParam(params.get("isDisabled")),
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
    description: props.description,
    errorMessage: props.errorMessage,
    isDisabled: props.isDisabled,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
