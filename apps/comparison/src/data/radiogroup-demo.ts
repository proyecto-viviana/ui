import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const radioGroupSizeOptions = ["S", "M", "L", "XL"] as const;
export const radioGroupOrientationOptions = ["vertical", "horizontal"] as const;
export const radioGroupLabelPositionOptions = ["top", "side"] as const;
export const radioGroupLabelAlignOptions = ["start", "end"] as const;
export const radioGroupNecessityIndicatorOptions = ["icon", "label"] as const;
export const radioGroupValidationBehaviorOptions = ["", "native", "aria"] as const;

export type RadioGroupDemoSize = (typeof radioGroupSizeOptions)[number];
export type RadioGroupDemoOrientation = (typeof radioGroupOrientationOptions)[number];
export type RadioGroupDemoLabelPosition = (typeof radioGroupLabelPositionOptions)[number];
export type RadioGroupDemoLabelAlign = (typeof radioGroupLabelAlignOptions)[number];
export type RadioGroupDemoNecessityIndicator = (typeof radioGroupNecessityIndicatorOptions)[number];
export type RadioGroupDemoValidationBehavior = (typeof radioGroupValidationBehaviorOptions)[number];

export interface RadioGroupDemoProps {
  label: string;
  selectedValue: string;
  size: RadioGroupDemoSize;
  orientation: RadioGroupDemoOrientation;
  labelPosition: RadioGroupDemoLabelPosition;
  labelAlign: RadioGroupDemoLabelAlign;
  necessityIndicator: RadioGroupDemoNecessityIndicator;
  name: string;
  form: string;
  validationBehavior: RadioGroupDemoValidationBehavior;
  description: string;
  errorMessage: string;
  withContextualHelp: boolean;
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
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  name: "",
  form: "",
  validationBehavior: "",
  description: "Select one plan.",
  errorMessage: "Choose a plan to continue.",
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
    labelPosition: isOneOf(props.labelPosition, radioGroupLabelPositionOptions)
      ? props.labelPosition
      : radioGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, radioGroupLabelAlignOptions)
      ? props.labelAlign
      : radioGroupDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, radioGroupNecessityIndicatorOptions)
      ? props.necessityIndicator
      : radioGroupDemoDefaults.necessityIndicator,
    name: typeof props.name === "string" ? props.name : radioGroupDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : radioGroupDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, radioGroupValidationBehaviorOptions)
      ? props.validationBehavior
      : radioGroupDemoDefaults.validationBehavior,
    description:
      typeof props.description === "string"
        ? props.description
        : radioGroupDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : radioGroupDemoDefaults.errorMessage,
    withContextualHelp: props.withContextualHelp === true,
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
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const validationBehavior = params.get("validationBehavior");

  return normalizeRadioGroupDemoProps({
    label: params.get("label") || radioGroupDemoDefaults.label,
    selectedValue: params.get("selectedValue") || radioGroupDemoDefaults.selectedValue,
    size: isOneOf(size, radioGroupSizeOptions) ? size : radioGroupDemoDefaults.size,
    orientation: isOneOf(orientation, radioGroupOrientationOptions)
      ? orientation
      : radioGroupDemoDefaults.orientation,
    labelPosition: isOneOf(labelPosition, radioGroupLabelPositionOptions)
      ? labelPosition
      : radioGroupDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, radioGroupLabelAlignOptions)
      ? labelAlign
      : radioGroupDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, radioGroupNecessityIndicatorOptions)
      ? necessityIndicator
      : radioGroupDemoDefaults.necessityIndicator,
    name: params.get("name") ?? radioGroupDemoDefaults.name,
    form: params.get("form") ?? radioGroupDemoDefaults.form,
    validationBehavior: isOneOf(validationBehavior, radioGroupValidationBehaviorOptions)
      ? validationBehavior
      : radioGroupDemoDefaults.validationBehavior,
    description: params.get("description") ?? radioGroupDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? radioGroupDemoDefaults.errorMessage,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
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
