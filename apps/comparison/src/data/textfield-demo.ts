import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const textFieldSizeOptions = ["S", "M", "L", "XL"] as const;

export type TextFieldDemoSize = (typeof textFieldSizeOptions)[number];

export interface TextFieldDemoProps {
  label: string;
  value: string;
  placeholder: string;
  size: TextFieldDemoSize;
  description: string;
  errorMessage: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const textFieldDemoDefaults: TextFieldDemoProps = {
  label: "Name",
  value: "Quarterly report",
  placeholder: "Project name",
  size: "M",
  description: "Use a descriptive project label.",
  errorMessage: "Name is required.",
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

export function normalizeTextFieldDemoProps(
  props: Partial<TextFieldDemoProps>,
): TextFieldDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : textFieldDemoDefaults.label,
    value: typeof props.value === "string" ? props.value : textFieldDemoDefaults.value,
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : textFieldDemoDefaults.placeholder,
    size: isOneOf(props.size, textFieldSizeOptions) ? props.size : textFieldDemoDefaults.size,
    description:
      typeof props.description === "string" ? props.description : textFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : textFieldDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function textFieldDemoPropsFromSearch(search: string): TextFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeTextFieldDemoProps({
    label: params.get("label") || textFieldDemoDefaults.label,
    value: params.get("value") ?? textFieldDemoDefaults.value,
    placeholder: params.get("placeholder") ?? textFieldDemoDefaults.placeholder,
    size: isOneOf(size, textFieldSizeOptions) ? size : textFieldDemoDefaults.size,
    description: params.get("description") ?? textFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? textFieldDemoDefaults.errorMessage,
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function textFieldDemoPropsFromWindow(): TextFieldDemoProps {
  if (typeof window === "undefined") {
    return textFieldDemoDefaults;
  }

  return textFieldDemoPropsFromSearch(window.location.search);
}

export function serializeTextFieldDemoProps(props: TextFieldDemoProps) {
  return JSON.stringify({
    label: props.label,
    value: props.value,
    placeholder: props.placeholder,
    size: props.size,
    description: props.description,
    errorMessage: props.errorMessage,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
