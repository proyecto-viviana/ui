import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const checkboxSizeOptions = ["S", "M", "L", "XL"] as const;

export type CheckboxDemoSize = (typeof checkboxSizeOptions)[number];

export interface CheckboxDemoProps {
  children: string;
  size: CheckboxDemoSize;
  isSelected: boolean;
  isIndeterminate: boolean;
  isEmphasized: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isInvalid: boolean;
}

export const checkboxDemoDefaults: CheckboxDemoProps = {
  children: "Enable alerts",
  size: "M",
  isSelected: false,
  isIndeterminate: false,
  isEmphasized: false,
  isDisabled: false,
  isReadOnly: false,
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

export function normalizeCheckboxDemoProps(props: Partial<CheckboxDemoProps>): CheckboxDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children
        ? props.children
        : checkboxDemoDefaults.children,
    size: isOneOf(props.size, checkboxSizeOptions) ? props.size : checkboxDemoDefaults.size,
    isSelected: props.isSelected === true,
    isIndeterminate: props.isIndeterminate === true,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isInvalid: props.isInvalid === true,
  };
}

export function checkboxDemoPropsFromSearch(search: string): CheckboxDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");

  return normalizeCheckboxDemoProps({
    children: params.get("children") || checkboxDemoDefaults.children,
    size: isOneOf(size, checkboxSizeOptions) ? size : checkboxDemoDefaults.size,
    isSelected: booleanParam(params.get("isSelected")),
    isIndeterminate: booleanParam(params.get("isIndeterminate")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function checkboxDemoPropsFromWindow(): CheckboxDemoProps {
  if (typeof window === "undefined") {
    return checkboxDemoDefaults;
  }

  return checkboxDemoPropsFromSearch(window.location.search);
}

export function serializeCheckboxDemoProps(props: CheckboxDemoProps) {
  return JSON.stringify({
    children: props.children,
    size: props.size,
    isSelected: props.isSelected,
    isIndeterminate: props.isIndeterminate,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isInvalid: props.isInvalid,
  });
}
