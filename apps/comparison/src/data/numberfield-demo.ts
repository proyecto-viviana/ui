import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const numberFieldSizeOptions = ["S", "M", "L", "XL"] as const;

export type NumberFieldDemoSize = (typeof numberFieldSizeOptions)[number];

export interface NumberFieldDemoProps {
  label: string;
  value: number;
  placeholder: string;
  size: NumberFieldDemoSize;
  description: string;
  errorMessage: string;
  minValue: number;
  maxValue: number;
  step: number;
  hideStepper: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const numberFieldDemoDefaults: NumberFieldDemoProps = {
  label: "Quantity",
  value: 5,
  placeholder: "0",
  size: "M",
  description: "Enter a quantity.",
  errorMessage: "Quantity is required.",
  minValue: 0,
  maxValue: 20,
  step: 1,
  hideStepper: false,
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

function numberParam(value: string | null | undefined, fallback: number) {
  if (value == null || value.trim() === "") {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberProp(value: unknown, fallback: number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    return numberParam(value, fallback);
  }

  return fallback;
}

export function normalizeNumberFieldDemoProps(
  props: Partial<NumberFieldDemoProps>,
): NumberFieldDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : numberFieldDemoDefaults.label,
    value: numberProp(props.value, numberFieldDemoDefaults.value),
    placeholder:
      typeof props.placeholder === "string"
        ? props.placeholder
        : numberFieldDemoDefaults.placeholder,
    size: isOneOf(props.size, numberFieldSizeOptions) ? props.size : numberFieldDemoDefaults.size,
    description:
      typeof props.description === "string"
        ? props.description
        : numberFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : numberFieldDemoDefaults.errorMessage,
    minValue: numberProp(props.minValue, numberFieldDemoDefaults.minValue),
    maxValue: numberProp(props.maxValue, numberFieldDemoDefaults.maxValue),
    step:
      numberProp(props.step, numberFieldDemoDefaults.step) > 0
        ? numberProp(props.step, numberFieldDemoDefaults.step)
        : numberFieldDemoDefaults.step,
    hideStepper: props.hideStepper === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function numberFieldDemoPropsFromSearch(search: string): NumberFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeNumberFieldDemoProps({
    label: params.get("label") || numberFieldDemoDefaults.label,
    value: numberParam(params.get("value"), numberFieldDemoDefaults.value),
    placeholder: params.get("placeholder") ?? numberFieldDemoDefaults.placeholder,
    size: isOneOf(size, numberFieldSizeOptions) ? size : numberFieldDemoDefaults.size,
    description: params.get("description") ?? numberFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? numberFieldDemoDefaults.errorMessage,
    minValue: numberParam(params.get("minValue"), numberFieldDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), numberFieldDemoDefaults.maxValue),
    step: numberParam(params.get("step"), numberFieldDemoDefaults.step),
    hideStepper: booleanParam(params.get("hideStepper")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function numberFieldDemoPropsFromWindow(): NumberFieldDemoProps {
  if (typeof window === "undefined") {
    return numberFieldDemoDefaults;
  }

  return numberFieldDemoPropsFromSearch(window.location.search);
}

export function serializeNumberFieldDemoProps(props: NumberFieldDemoProps) {
  return JSON.stringify({
    label: props.label,
    value: props.value,
    placeholder: props.placeholder,
    size: props.size,
    description: props.description,
    errorMessage: props.errorMessage,
    minValue: props.minValue,
    maxValue: props.maxValue,
    step: props.step,
    hideStepper: props.hideStepper,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
