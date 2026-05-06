import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const radioGroupSizeOptions = ["S", "M", "L", "XL"] as const;
export const radioGroupOrientationOptions = ["vertical", "horizontal"] as const;

export type RadioGroupDemoSize = (typeof radioGroupSizeOptions)[number];
export type RadioGroupDemoOrientation = (typeof radioGroupOrientationOptions)[number];

export interface RadioGroupDemoProps {
  label: string;
  selectedValue: string;
  size: RadioGroupDemoSize;
  orientation: RadioGroupDemoOrientation;
  description: string;
  errorMessage: string;
  isEmphasized: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const radioGroupDemoDefaults: RadioGroupDemoProps = {
  label: "Plan",
  selectedValue: "starter",
  size: "M",
  orientation: "vertical",
  description: "Select one plan.",
  errorMessage: "Choose a plan to continue.",
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

export function normalizeRadioGroupDemoProps(
  props: Partial<RadioGroupDemoProps>,
): RadioGroupDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : radioGroupDemoDefaults.label,
    selectedValue:
      typeof props.selectedValue === "string" && props.selectedValue
        ? props.selectedValue
        : radioGroupDemoDefaults.selectedValue,
    size: isOneOf(props.size, radioGroupSizeOptions) ? props.size : radioGroupDemoDefaults.size,
    orientation: isOneOf(props.orientation, radioGroupOrientationOptions)
      ? props.orientation
      : radioGroupDemoDefaults.orientation,
    description:
      typeof props.description === "string"
        ? props.description
        : radioGroupDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : radioGroupDemoDefaults.errorMessage,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function radioGroupDemoPropsFromSearch(search: string): RadioGroupDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const orientation = params.get("orientation");

  return normalizeRadioGroupDemoProps({
    label: params.get("label") || radioGroupDemoDefaults.label,
    selectedValue: params.get("selectedValue") || radioGroupDemoDefaults.selectedValue,
    size: isOneOf(size, radioGroupSizeOptions) ? size : radioGroupDemoDefaults.size,
    orientation: isOneOf(orientation, radioGroupOrientationOptions)
      ? orientation
      : radioGroupDemoDefaults.orientation,
    description: params.get("description") ?? radioGroupDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? radioGroupDemoDefaults.errorMessage,
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function radioGroupDemoPropsFromWindow(): RadioGroupDemoProps {
  if (typeof window === "undefined") {
    return radioGroupDemoDefaults;
  }

  return radioGroupDemoPropsFromSearch(window.location.search);
}

export function serializeRadioGroupDemoProps(props: RadioGroupDemoProps) {
  return JSON.stringify({
    label: props.label,
    selectedValue: props.selectedValue,
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
