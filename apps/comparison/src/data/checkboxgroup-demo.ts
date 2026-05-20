import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const checkboxGroupSizeOptions = ["S", "M", "L", "XL"] as const;
export const checkboxGroupOrientationOptions = ["vertical", "horizontal"] as const;
export const checkboxGroupValueSourceOptions = ["value", "defaultValue"] as const;
export const checkboxGroupLabelPositionOptions = ["top", "side"] as const;
export const checkboxGroupLabelAlignOptions = ["start", "end"] as const;
export const checkboxGroupNecessityIndicatorOptions = ["icon", "label"] as const;
export const checkboxGroupValidationBehaviorOptions = ["", "native", "aria"] as const;

export type CheckboxGroupDemoSize = (typeof checkboxGroupSizeOptions)[number];
export type CheckboxGroupDemoOrientation = (typeof checkboxGroupOrientationOptions)[number];
export type CheckboxGroupDemoValueSource = (typeof checkboxGroupValueSourceOptions)[number];
export type CheckboxGroupDemoLabelPosition = (typeof checkboxGroupLabelPositionOptions)[number];
export type CheckboxGroupDemoLabelAlign = (typeof checkboxGroupLabelAlignOptions)[number];
export type CheckboxGroupDemoNecessityIndicator =
  (typeof checkboxGroupNecessityIndicatorOptions)[number];
export type CheckboxGroupDemoValidationBehavior =
  (typeof checkboxGroupValidationBehaviorOptions)[number];

export interface CheckboxGroupDemoProps {
  label: string;
  valueSource: CheckboxGroupDemoValueSource;
  selectedValues: string;
  defaultValue: string;
  size: CheckboxGroupDemoSize;
  orientation: CheckboxGroupDemoOrientation;
  labelPosition: CheckboxGroupDemoLabelPosition;
  labelAlign: CheckboxGroupDemoLabelAlign;
  necessityIndicator: CheckboxGroupDemoNecessityIndicator;
  name: string;
  form: string;
  validationBehavior: CheckboxGroupDemoValidationBehavior;
  description: string;
  errorMessage: string;
  withContextualHelp: boolean;
  isEmphasized: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
}

export const checkboxGroupDemoDefaults: CheckboxGroupDemoProps = {
  label: "Notifications",
  valueSource: "value",
  selectedValues: "email",
  defaultValue: "email",
  size: "M",
  orientation: "vertical",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  name: "",
  form: "",
  validationBehavior: "",
  description: "Select notification channels.",
  errorMessage: "Select at least one channel.",
  withContextualHelp: false,
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
    valueSource: isOneOf(props.valueSource, checkboxGroupValueSourceOptions)
      ? props.valueSource
      : checkboxGroupDemoDefaults.valueSource,
    selectedValues:
      typeof props.selectedValues === "string" && props.selectedValues
        ? props.selectedValues
        : checkboxGroupDemoDefaults.selectedValues,
    defaultValue:
      typeof props.defaultValue === "string" && props.defaultValue
        ? props.defaultValue
        : checkboxGroupDemoDefaults.defaultValue,
    size: isOneOf(props.size, checkboxGroupSizeOptions)
      ? props.size
      : checkboxGroupDemoDefaults.size,
    orientation: isOneOf(props.orientation, checkboxGroupOrientationOptions)
      ? props.orientation
      : checkboxGroupDemoDefaults.orientation,
    labelPosition: isOneOf(props.labelPosition, checkboxGroupLabelPositionOptions)
      ? props.labelPosition
      : checkboxGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, checkboxGroupLabelAlignOptions)
      ? props.labelAlign
      : checkboxGroupDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, checkboxGroupNecessityIndicatorOptions)
      ? props.necessityIndicator
      : checkboxGroupDemoDefaults.necessityIndicator,
    name: typeof props.name === "string" ? props.name : checkboxGroupDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : checkboxGroupDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, checkboxGroupValidationBehaviorOptions)
      ? props.validationBehavior
      : checkboxGroupDemoDefaults.validationBehavior,
    description:
      typeof props.description === "string"
        ? props.description
        : checkboxGroupDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : checkboxGroupDemoDefaults.errorMessage,
    withContextualHelp: props.withContextualHelp === true,
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
  const valueSource = params.get("valueSource");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const validationBehavior = params.get("validationBehavior");

  return normalizeCheckboxGroupDemoProps({
    label: params.get("label") || checkboxGroupDemoDefaults.label,
    valueSource: isOneOf(valueSource, checkboxGroupValueSourceOptions)
      ? valueSource
      : checkboxGroupDemoDefaults.valueSource,
    selectedValues: params.get("selectedValues") || checkboxGroupDemoDefaults.selectedValues,
    defaultValue: params.get("defaultValue") || checkboxGroupDemoDefaults.defaultValue,
    size: isOneOf(size, checkboxGroupSizeOptions) ? size : checkboxGroupDemoDefaults.size,
    orientation: isOneOf(orientation, checkboxGroupOrientationOptions)
      ? orientation
      : checkboxGroupDemoDefaults.orientation,
    labelPosition: isOneOf(labelPosition, checkboxGroupLabelPositionOptions)
      ? labelPosition
      : checkboxGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, checkboxGroupLabelAlignOptions)
      ? labelAlign
      : checkboxGroupDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, checkboxGroupNecessityIndicatorOptions)
      ? necessityIndicator
      : checkboxGroupDemoDefaults.necessityIndicator,
    name: params.get("name") ?? checkboxGroupDemoDefaults.name,
    form: params.get("form") ?? checkboxGroupDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, checkboxGroupValidationBehaviorOptions)
      ? validationBehavior
      : checkboxGroupDemoDefaults.validationBehavior,
    description: params.get("description") ?? checkboxGroupDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? checkboxGroupDemoDefaults.errorMessage,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
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
    valueSource: props.valueSource,
    selectedValues: props.selectedValues,
    defaultValue: props.defaultValue,
    size: props.size,
    orientation: props.orientation,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    name: props.name,
    form: props.form,
    validationBehavior: props.validationBehavior,
    description: props.description,
    errorMessage: props.errorMessage,
    withContextualHelp: props.withContextualHelp,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
  });
}

export function initialCheckboxGroupDemoValue(props: CheckboxGroupDemoProps) {
  return selectedValuesArrayFromText(
    props.valueSource === "defaultValue" ? props.defaultValue : props.selectedValues,
    ["email"],
  );
}
