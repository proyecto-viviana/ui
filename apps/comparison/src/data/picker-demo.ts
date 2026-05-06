import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const pickerSizeOptions = ["S", "M", "L", "XL"] as const;
export const pickerKeyOptions = ["starter", "pro", "enterprise"] as const;

export type PickerDemoSize = (typeof pickerSizeOptions)[number];
export type PickerDemoKey = (typeof pickerKeyOptions)[number];

export interface PickerDemoProps {
  label: string;
  selectedKey: PickerDemoKey;
  placeholder: string;
  size: PickerDemoSize;
  description: string;
  errorMessage: string;
  isQuiet: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const pickerItems = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "enterprise", label: "Enterprise" },
] as const;

export const pickerDemoDefaults: PickerDemoProps = {
  label: "Plan",
  selectedKey: "pro",
  placeholder: "Select plan",
  size: "M",
  description: "Choose the billing plan.",
  errorMessage: "Select a plan.",
  isQuiet: false,
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

export function normalizePickerDemoProps(props: Partial<PickerDemoProps>): PickerDemoProps {
  return {
    label: typeof props.label === "string" && props.label ? props.label : pickerDemoDefaults.label,
    selectedKey: isOneOf(props.selectedKey, pickerKeyOptions)
      ? props.selectedKey
      : pickerDemoDefaults.selectedKey,
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : pickerDemoDefaults.placeholder,
    size: isOneOf(props.size, pickerSizeOptions) ? props.size : pickerDemoDefaults.size,
    description:
      typeof props.description === "string" ? props.description : pickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string" ? props.errorMessage : pickerDemoDefaults.errorMessage,
    isQuiet: props.isQuiet === true,
    isDisabled: props.isDisabled === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function pickerDemoPropsFromSearch(search: string): PickerDemoProps {
  const params = new URLSearchParams(search);
  const selectedKey = params.get("selectedKey");
  const size = params.get("size");

  return normalizePickerDemoProps({
    label: params.get("label") || pickerDemoDefaults.label,
    selectedKey: isOneOf(selectedKey, pickerKeyOptions)
      ? selectedKey
      : pickerDemoDefaults.selectedKey,
    placeholder: params.get("placeholder") ?? pickerDemoDefaults.placeholder,
    size: isOneOf(size, pickerSizeOptions) ? size : pickerDemoDefaults.size,
    description: params.get("description") ?? pickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? pickerDemoDefaults.errorMessage,
    isQuiet: booleanParam(params.get("isQuiet")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function pickerDemoPropsFromWindow(): PickerDemoProps {
  if (typeof window === "undefined") {
    return pickerDemoDefaults;
  }

  return pickerDemoPropsFromSearch(window.location.search);
}

export function serializePickerDemoProps(props: PickerDemoProps) {
  return JSON.stringify({
    label: props.label,
    selectedKey: props.selectedKey,
    placeholder: props.placeholder,
    size: props.size,
    description: props.description,
    errorMessage: props.errorMessage,
    isQuiet: props.isQuiet,
    isDisabled: props.isDisabled,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
