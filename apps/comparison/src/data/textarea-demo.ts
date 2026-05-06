import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const textAreaSizeOptions = ["S", "M", "L", "XL"] as const;

export type TextAreaDemoSize = (typeof textAreaSizeOptions)[number];

export interface TextAreaDemoProps {
  label: string;
  value: string;
  placeholder: string;
  size: TextAreaDemoSize;
  description: string;
  errorMessage: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const textAreaDemoDefaults: TextAreaDemoProps = {
  label: "Notes",
  value: "Quarterly planning notes\nFollow up with design.",
  placeholder: "Write notes",
  size: "M",
  description: "Use a short multiline project note.",
  errorMessage: "Notes are required.",
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

export function normalizeTextAreaDemoProps(props: Partial<TextAreaDemoProps>): TextAreaDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : textAreaDemoDefaults.label,
    value: typeof props.value === "string" ? props.value : textAreaDemoDefaults.value,
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : textAreaDemoDefaults.placeholder,
    size: isOneOf(props.size, textAreaSizeOptions) ? props.size : textAreaDemoDefaults.size,
    description:
      typeof props.description === "string" ? props.description : textAreaDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : textAreaDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function textAreaDemoPropsFromSearch(search: string): TextAreaDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeTextAreaDemoProps({
    label: params.get("label") || textAreaDemoDefaults.label,
    value: params.get("value") ?? textAreaDemoDefaults.value,
    placeholder: params.get("placeholder") ?? textAreaDemoDefaults.placeholder,
    size: isOneOf(size, textAreaSizeOptions) ? size : textAreaDemoDefaults.size,
    description: params.get("description") ?? textAreaDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? textAreaDemoDefaults.errorMessage,
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function textAreaDemoPropsFromWindow(): TextAreaDemoProps {
  if (typeof window === "undefined") {
    return textAreaDemoDefaults;
  }

  return textAreaDemoPropsFromSearch(window.location.search);
}

export function serializeTextAreaDemoProps(props: TextAreaDemoProps) {
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
