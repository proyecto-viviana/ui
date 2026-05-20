import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const checkboxSizeOptions = ["S", "M", "L", "XL"] as const;
export const checkboxSelectionSourceOptions = ["isSelected", "defaultSelected"] as const;
export const checkboxValidationBehaviorOptions = ["", "native", "aria"] as const;

export type CheckboxDemoSize = (typeof checkboxSizeOptions)[number];
export type CheckboxDemoSelectionSource = (typeof checkboxSelectionSourceOptions)[number];
export type CheckboxDemoValidationBehavior = (typeof checkboxValidationBehaviorOptions)[number];

export interface CheckboxDemoProps {
  children: string;
  size: CheckboxDemoSize;
  selectionSource: CheckboxDemoSelectionSource;
  isSelected: boolean;
  defaultSelected: boolean;
  isIndeterminate: boolean;
  isEmphasized: boolean;
  name: string;
  value: string;
  form: string;
  validationBehavior: CheckboxDemoValidationBehavior;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const checkboxDemoDefaults: CheckboxDemoProps = {
  children: "Enable alerts",
  size: "M",
  selectionSource: "isSelected",
  isSelected: false,
  defaultSelected: false,
  isIndeterminate: false,
  isEmphasized: false,
  name: "",
  value: "",
  form: "",
  validationBehavior: "",
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

export function normalizeCheckboxDemoProps(props: Partial<CheckboxDemoProps>): CheckboxDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children
        ? props.children
        : checkboxDemoDefaults.children,
    size: isOneOf(props.size, checkboxSizeOptions) ? props.size : checkboxDemoDefaults.size,
    selectionSource: isOneOf(props.selectionSource, checkboxSelectionSourceOptions)
      ? props.selectionSource
      : checkboxDemoDefaults.selectionSource,
    isSelected: props.isSelected === true,
    defaultSelected: props.defaultSelected === true,
    isIndeterminate: props.isIndeterminate === true,
    isEmphasized: props.isEmphasized === true,
    name: typeof props.name === "string" ? props.name : checkboxDemoDefaults.name,
    value: typeof props.value === "string" ? props.value : checkboxDemoDefaults.value,
    form: typeof props.form === "string" ? props.form : checkboxDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, checkboxValidationBehaviorOptions)
      ? props.validationBehavior
      : checkboxDemoDefaults.validationBehavior,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
  };
}

export function checkboxDemoPropsFromSearch(search: string): CheckboxDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const selectionSource = params.get("selectionSource");
  const validationBehavior = params.get("validationBehavior");

  return normalizeCheckboxDemoProps({
    children: params.get("children") || checkboxDemoDefaults.children,
    size: isOneOf(size, checkboxSizeOptions) ? size : checkboxDemoDefaults.size,
    selectionSource: isOneOf(selectionSource, checkboxSelectionSourceOptions)
      ? selectionSource
      : checkboxDemoDefaults.selectionSource,
    isSelected: booleanParam(params.get("isSelected")),
    defaultSelected: booleanParam(params.get("defaultSelected")),
    isIndeterminate: booleanParam(params.get("isIndeterminate")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    name: params.get("name") ?? checkboxDemoDefaults.name,
    value: params.get("value") ?? checkboxDemoDefaults.value,
    form: params.get("form") ?? checkboxDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, checkboxValidationBehaviorOptions)
      ? validationBehavior
      : checkboxDemoDefaults.validationBehavior,
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
  });
}

export function checkboxDemoPropsFromWindow(): CheckboxDemoProps {
  if (typeof window === "undefined") {
    return checkboxDemoDefaults;
  }

  return checkboxDemoPropsFromSearch(window.location.search);
}

export function initialCheckboxDemoSelected(props: CheckboxDemoProps) {
  return props.selectionSource === "defaultSelected" ? props.defaultSelected : props.isSelected;
}

export function serializeCheckboxDemoProps(props: CheckboxDemoProps) {
  return JSON.stringify({
    children: props.children,
    size: props.size,
    selectionSource: props.selectionSource,
    isSelected: props.isSelected,
    defaultSelected: props.defaultSelected,
    isIndeterminate: props.isIndeterminate,
    isEmphasized: props.isEmphasized,
    name: props.name,
    value: props.value,
    form: props.form,
    validationBehavior: props.validationBehavior,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}
