import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const comboBoxSizeOptions = ["S", "M", "L", "XL"] as const;
export const comboBoxKeyOptions = ["starter", "pro", "enterprise"] as const;

export type ComboBoxDemoSize = (typeof comboBoxSizeOptions)[number];
export type ComboBoxDemoKey = (typeof comboBoxKeyOptions)[number];

export interface ComboBoxDemoProps {
  label: string;
  selectedKey: ComboBoxDemoKey;
  inputValue: string;
  placeholder: string;
  size: ComboBoxDemoSize;
  description: string;
  errorMessage: string;
  isDisabled: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const comboBoxItems = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "enterprise", label: "Enterprise" },
] as const;

export const comboBoxDemoDefaults: ComboBoxDemoProps = {
  label: "Plan",
  selectedKey: "pro",
  inputValue: "Pro",
  placeholder: "Search plans",
  size: "M",
  description: "Choose the billing plan.",
  errorMessage: "Select a plan.",
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

export function comboBoxLabelForKey(key: string | null | undefined) {
  return comboBoxItems.find((item) => item.id === key)?.label ?? comboBoxDemoDefaults.inputValue;
}

export function normalizeComboBoxDemoProps(props: Partial<ComboBoxDemoProps>): ComboBoxDemoProps {
  const selectedKey = isOneOf(props.selectedKey, comboBoxKeyOptions)
    ? props.selectedKey
    : comboBoxDemoDefaults.selectedKey;

  return {
    label:
      typeof props.label === "string" && props.label ? props.label : comboBoxDemoDefaults.label,
    selectedKey,
    inputValue:
      typeof props.inputValue === "string" ? props.inputValue : comboBoxLabelForKey(selectedKey),
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : comboBoxDemoDefaults.placeholder,
    size: isOneOf(props.size, comboBoxSizeOptions) ? props.size : comboBoxDemoDefaults.size,
    description:
      typeof props.description === "string" ? props.description : comboBoxDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : comboBoxDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function comboBoxDemoPropsFromSearch(search: string): ComboBoxDemoProps {
  const params = new URLSearchParams(search);
  const selectedKey = params.get("selectedKey");
  const size = params.get("size");
  const normalizedSelectedKey = isOneOf(selectedKey, comboBoxKeyOptions)
    ? selectedKey
    : comboBoxDemoDefaults.selectedKey;

  return normalizeComboBoxDemoProps({
    label: params.get("label") || comboBoxDemoDefaults.label,
    selectedKey: normalizedSelectedKey,
    inputValue: params.get("inputValue") ?? comboBoxLabelForKey(normalizedSelectedKey),
    placeholder: params.get("placeholder") ?? comboBoxDemoDefaults.placeholder,
    size: isOneOf(size, comboBoxSizeOptions) ? size : comboBoxDemoDefaults.size,
    description: params.get("description") ?? comboBoxDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? comboBoxDemoDefaults.errorMessage,
    isDisabled: booleanParam(params.get("isDisabled")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function comboBoxDemoPropsFromWindow(): ComboBoxDemoProps {
  if (typeof window === "undefined") {
    return comboBoxDemoDefaults;
  }

  return comboBoxDemoPropsFromSearch(window.location.search);
}

export function serializeComboBoxDemoProps(props: ComboBoxDemoProps) {
  return JSON.stringify({
    label: props.label,
    selectedKey: props.selectedKey,
    inputValue: props.inputValue,
    placeholder: props.placeholder,
    size: props.size,
    description: props.description,
    errorMessage: props.errorMessage,
    isDisabled: props.isDisabled,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
