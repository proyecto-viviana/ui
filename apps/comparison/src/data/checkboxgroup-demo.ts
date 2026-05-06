import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const checkboxGroupSizeOptions = ["S", "M", "L", "XL"] as const;
export const checkboxGroupOrientationOptions = ["vertical", "horizontal"] as const;

export type CheckboxGroupDemoSize = (typeof checkboxGroupSizeOptions)[number];
export type CheckboxGroupDemoOrientation = (typeof checkboxGroupOrientationOptions)[number];

export interface CheckboxGroupDemoProps {
  label: string;
  selectedValues: string;
  size: CheckboxGroupDemoSize;
  orientation: CheckboxGroupDemoOrientation;
  description: string;
  errorMessage: string;
  isEmphasized: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const checkboxGroupDemoDefaults: CheckboxGroupDemoProps = {
  label: "Notifications",
  selectedValues: "email",
  size: "M",
  orientation: "vertical",
  description: "Select notification channels.",
  errorMessage: "Select at least one channel.",
  isEmphasized: false,
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

export function selectedValuesArrayFromText(value: string, fallback: string[] = ["email"]) {
  const selected = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return selected.length ? selected : fallback;
}

export function normalizeCheckboxGroupDemoProps(
  props: Partial<CheckboxGroupDemoProps>,
): CheckboxGroupDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label
        ? props.label
        : checkboxGroupDemoDefaults.label,
    selectedValues:
      typeof props.selectedValues === "string" && props.selectedValues
        ? props.selectedValues
        : checkboxGroupDemoDefaults.selectedValues,
    size: isOneOf(props.size, checkboxGroupSizeOptions)
      ? props.size
      : checkboxGroupDemoDefaults.size,
    orientation: isOneOf(props.orientation, checkboxGroupOrientationOptions)
      ? props.orientation
      : checkboxGroupDemoDefaults.orientation,
    description:
      typeof props.description === "string"
        ? props.description
        : checkboxGroupDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : checkboxGroupDemoDefaults.errorMessage,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function checkboxGroupDemoPropsFromSearch(search: string): CheckboxGroupDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const orientation = params.get("orientation");

  return normalizeCheckboxGroupDemoProps({
    label: params.get("label") || checkboxGroupDemoDefaults.label,
    selectedValues: params.get("selectedValues") || checkboxGroupDemoDefaults.selectedValues,
    size: isOneOf(size, checkboxGroupSizeOptions) ? size : checkboxGroupDemoDefaults.size,
    orientation: isOneOf(orientation, checkboxGroupOrientationOptions)
      ? orientation
      : checkboxGroupDemoDefaults.orientation,
    description: params.get("description") ?? checkboxGroupDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? checkboxGroupDemoDefaults.errorMessage,
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function checkboxGroupDemoPropsFromWindow(): CheckboxGroupDemoProps {
  if (typeof window === "undefined") {
    return checkboxGroupDemoDefaults;
  }

  return checkboxGroupDemoPropsFromSearch(window.location.search);
}

export function serializeCheckboxGroupDemoProps(props: CheckboxGroupDemoProps) {
  return JSON.stringify({
    label: props.label,
    selectedValues: props.selectedValues,
    size: props.size,
    orientation: props.orientation,
    description: props.description,
    errorMessage: props.errorMessage,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
