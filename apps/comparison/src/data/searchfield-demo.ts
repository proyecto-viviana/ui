import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const searchFieldSizeOptions = ["S", "M", "L", "XL"] as const;
export const searchFieldLabelPositionOptions = ["top", "side"] as const;
export const searchFieldLabelAlignOptions = ["start", "end"] as const;
export const searchFieldNecessityIndicatorOptions = ["icon", "label"] as const;
export const searchFieldValidationBehaviorOptions = ["native", "aria"] as const;
export const searchFieldTypeOptions = [
  "search",
  "text",
  "url",
  "tel",
  "email",
  "password",
] as const;

export type SearchFieldDemoSize = (typeof searchFieldSizeOptions)[number];
export type SearchFieldDemoLabelPosition = (typeof searchFieldLabelPositionOptions)[number];
export type SearchFieldDemoLabelAlign = (typeof searchFieldLabelAlignOptions)[number];
export type SearchFieldDemoNecessityIndicator =
  (typeof searchFieldNecessityIndicatorOptions)[number];
export type SearchFieldDemoValidationBehavior =
  (typeof searchFieldValidationBehaviorOptions)[number];
export type SearchFieldDemoType = (typeof searchFieldTypeOptions)[number];

export interface SearchFieldDemoProps {
  label: string;
  value: string;
  placeholder: string;
  size: SearchFieldDemoSize;
  labelPosition: SearchFieldDemoLabelPosition;
  labelAlign: SearchFieldDemoLabelAlign;
  necessityIndicator: SearchFieldDemoNecessityIndicator;
  name: string;
  form: string;
  validationBehavior: SearchFieldDemoValidationBehavior;
  type: SearchFieldDemoType;
  description: string;
  errorMessage: string;
  withContextualHelp: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const searchFieldDemoDefaults: SearchFieldDemoProps = {
  label: "Search",
  value: "status",
  placeholder: "Search projects",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  name: "projectSearch",
  form: "projectSearchForm",
  validationBehavior: "native",
  type: "search",
  description: "Search by name, status, or owner.",
  errorMessage: "Enter a search term.",
  withContextualHelp: false,
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

export function normalizeSearchFieldDemoProps(
  props: Partial<SearchFieldDemoProps>,
): SearchFieldDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : searchFieldDemoDefaults.label,
    value: typeof props.value === "string" ? props.value : searchFieldDemoDefaults.value,
    placeholder:
      typeof props.placeholder === "string"
        ? props.placeholder
        : searchFieldDemoDefaults.placeholder,
    size: isOneOf(props.size, searchFieldSizeOptions) ? props.size : searchFieldDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, searchFieldLabelPositionOptions)
      ? props.labelPosition
      : searchFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, searchFieldLabelAlignOptions)
      ? props.labelAlign
      : searchFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, searchFieldNecessityIndicatorOptions)
      ? props.necessityIndicator
      : searchFieldDemoDefaults.necessityIndicator,
    name: typeof props.name === "string" ? props.name : searchFieldDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : searchFieldDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, searchFieldValidationBehaviorOptions)
      ? props.validationBehavior
      : searchFieldDemoDefaults.validationBehavior,
    type: isOneOf(props.type, searchFieldTypeOptions) ? props.type : searchFieldDemoDefaults.type,
    description:
      typeof props.description === "string"
        ? props.description
        : searchFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : searchFieldDemoDefaults.errorMessage,
    withContextualHelp: props.withContextualHelp === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function searchFieldDemoPropsFromSearch(search: string): SearchFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const validationBehavior = params.get("validationBehavior");
  const type = params.get("type");

  return normalizeSearchFieldDemoProps({
    label: params.get("label") || searchFieldDemoDefaults.label,
    value: params.get("value") ?? searchFieldDemoDefaults.value,
    placeholder: params.get("placeholder") ?? searchFieldDemoDefaults.placeholder,
    size: isOneOf(size, searchFieldSizeOptions) ? size : searchFieldDemoDefaults.size,
    labelPosition: isOneOf(labelPosition, searchFieldLabelPositionOptions)
      ? labelPosition
      : searchFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, searchFieldLabelAlignOptions)
      ? labelAlign
      : searchFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, searchFieldNecessityIndicatorOptions)
      ? necessityIndicator
      : searchFieldDemoDefaults.necessityIndicator,
    name: params.get("name") ?? searchFieldDemoDefaults.name,
    form: params.get("form") ?? searchFieldDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, searchFieldValidationBehaviorOptions)
      ? validationBehavior
      : searchFieldDemoDefaults.validationBehavior,
    type: isOneOf(type, searchFieldTypeOptions) ? type : searchFieldDemoDefaults.type,
    description: params.get("description") ?? searchFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? searchFieldDemoDefaults.errorMessage,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function searchFieldDemoPropsFromWindow(): SearchFieldDemoProps {
  if (typeof window === "undefined") {
    return searchFieldDemoDefaults;
  }

  return searchFieldDemoPropsFromSearch(window.location.search);
}

export function serializeSearchFieldDemoProps(props: SearchFieldDemoProps) {
  return JSON.stringify({
    label: props.label,
    value: props.value,
    placeholder: props.placeholder,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    name: props.name,
    form: props.form,
    validationBehavior: props.validationBehavior,
    type: props.type,
    description: props.description,
    errorMessage: props.errorMessage,
    withContextualHelp: props.withContextualHelp,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
