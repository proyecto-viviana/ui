import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const searchFieldSizeOptions = ["S", "M", "L", "XL"] as const;

export type SearchFieldDemoSize = (typeof searchFieldSizeOptions)[number];

export interface SearchFieldDemoProps {
  label: string;
  value: string;
  placeholder: string;
  size: SearchFieldDemoSize;
  description: string;
  errorMessage: string;
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
  description: "Search by name, status, or owner.",
  errorMessage: "Enter a search term.",
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
    description:
      typeof props.description === "string"
        ? props.description
        : searchFieldDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : searchFieldDemoDefaults.errorMessage,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function searchFieldDemoPropsFromSearch(search: string): SearchFieldDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeSearchFieldDemoProps({
    label: params.get("label") || searchFieldDemoDefaults.label,
    value: params.get("value") ?? searchFieldDemoDefaults.value,
    placeholder: params.get("placeholder") ?? searchFieldDemoDefaults.placeholder,
    size: isOneOf(size, searchFieldSizeOptions) ? size : searchFieldDemoDefaults.size,
    description: params.get("description") ?? searchFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? searchFieldDemoDefaults.errorMessage,
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
    description: props.description,
    errorMessage: props.errorMessage,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
