import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const pickerSizeOptions = ["S", "M", "L", "XL"] as const;
export const pickerKeyOptions = ["starter", "pro", "enterprise"] as const;
export const pickerSelectionSourceOptions = ["value", "defaultValue"] as const;
export const pickerLabelPositionOptions = ["top", "side"] as const;
export const pickerLabelAlignOptions = ["start", "end"] as const;
export const pickerNecessityIndicatorOptions = ["icon", "label"] as const;
export const pickerDirectionOptions = ["bottom", "top"] as const;
export const pickerAlignOptions = ["start", "end"] as const;
export const pickerValidationBehaviorOptions = ["native", "aria"] as const;
export const pickerLoadingStateOptions = ["idle", "loading", "loadingMore"] as const;

export type PickerDemoSize = (typeof pickerSizeOptions)[number];
export type PickerDemoKey = (typeof pickerKeyOptions)[number];
export type PickerDemoSelectionSource = (typeof pickerSelectionSourceOptions)[number];
export type PickerDemoLabelPosition = (typeof pickerLabelPositionOptions)[number];
export type PickerDemoLabelAlign = (typeof pickerLabelAlignOptions)[number];
export type PickerDemoNecessityIndicator = (typeof pickerNecessityIndicatorOptions)[number];
export type PickerDemoDirection = (typeof pickerDirectionOptions)[number];
export type PickerDemoAlign = (typeof pickerAlignOptions)[number];
export type PickerDemoValidationBehavior = (typeof pickerValidationBehaviorOptions)[number];
export type PickerDemoLoadingState = (typeof pickerLoadingStateOptions)[number];

export interface PickerDemoProps {
  label: string;
  selectedKey: PickerDemoKey;
  selectionSource: PickerDemoSelectionSource;
  placeholder: string;
  size: PickerDemoSize;
  labelPosition: PickerDemoLabelPosition;
  labelAlign: PickerDemoLabelAlign;
  necessityIndicator: PickerDemoNecessityIndicator;
  description: string;
  errorMessage: string;
  name: string;
  form: string;
  validationBehavior: PickerDemoValidationBehavior;
  direction: PickerDemoDirection;
  align: PickerDemoAlign;
  menuWidth: string;
  loadingState: PickerDemoLoadingState;
  isQuiet: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  shouldFlip: boolean;
  disableEnterprise: boolean;
  withContextualHelp: boolean;
  withRenderValue: boolean;
}

export const pickerItems = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "enterprise", label: "Enterprise" },
] as const;

export const pickerDemoDefaults: PickerDemoProps = {
  label: "Plan",
  selectedKey: "pro",
  selectionSource: "value",
  placeholder: "Select plan",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  description: "Choose the billing plan.",
  errorMessage: "Select a plan.",
  name: "plan",
  form: "",
  validationBehavior: "native",
  direction: "bottom",
  align: "start",
  menuWidth: "",
  loadingState: "idle",
  isQuiet: false,
  isDisabled: false,
  isRequired: false,
  isInvalid: false,
  shouldFlip: true,
  disableEnterprise: false,
  withContextualHelp: false,
  withRenderValue: false,
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

function optionParam<T extends readonly string[]>(
  params: URLSearchParams,
  name: string,
  options: T,
  fallback: T[number],
): T[number] {
  const value = params.get(name);
  return isOneOf(value, options) ? value : fallback;
}

function selectionSourceParam(value: string | null | undefined): PickerDemoSelectionSource {
  if (value === "selectedKey") {
    return "value";
  }

  if (value === "defaultSelectedKey") {
    return "defaultValue";
  }

  return isOneOf(value, pickerSelectionSourceOptions) ? value : pickerDemoDefaults.selectionSource;
}

export function normalizePickerDemoProps(props: Partial<PickerDemoProps>): PickerDemoProps {
  return {
    label: typeof props.label === "string" && props.label ? props.label : pickerDemoDefaults.label,
    selectedKey: isOneOf(props.selectedKey, pickerKeyOptions)
      ? props.selectedKey
      : pickerDemoDefaults.selectedKey,
    selectionSource: selectionSourceParam(props.selectionSource),
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : pickerDemoDefaults.placeholder,
    size: isOneOf(props.size, pickerSizeOptions) ? props.size : pickerDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, pickerLabelPositionOptions)
      ? props.labelPosition
      : pickerDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, pickerLabelAlignOptions)
      ? props.labelAlign
      : pickerDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, pickerNecessityIndicatorOptions)
      ? props.necessityIndicator
      : pickerDemoDefaults.necessityIndicator,
    description:
      typeof props.description === "string" ? props.description : pickerDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string" ? props.errorMessage : pickerDemoDefaults.errorMessage,
    name: typeof props.name === "string" ? props.name : pickerDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : pickerDemoDefaults.form,
    validationBehavior: isOneOf(props.validationBehavior, pickerValidationBehaviorOptions)
      ? props.validationBehavior
      : pickerDemoDefaults.validationBehavior,
    direction: isOneOf(props.direction, pickerDirectionOptions)
      ? props.direction
      : pickerDemoDefaults.direction,
    align: isOneOf(props.align, pickerAlignOptions) ? props.align : pickerDemoDefaults.align,
    menuWidth: typeof props.menuWidth === "string" ? props.menuWidth : pickerDemoDefaults.menuWidth,
    loadingState: isOneOf(props.loadingState, pickerLoadingStateOptions)
      ? props.loadingState
      : pickerDemoDefaults.loadingState,
    isQuiet: props.isQuiet === true,
    isDisabled: props.isDisabled === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
    shouldFlip: props.shouldFlip !== false,
    disableEnterprise: props.disableEnterprise === true,
    withContextualHelp: props.withContextualHelp === true,
    withRenderValue: props.withRenderValue === true,
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
    selectionSource: selectionSourceParam(params.get("selectionSource")),
    placeholder: params.get("placeholder") ?? pickerDemoDefaults.placeholder,
    size: isOneOf(size, pickerSizeOptions) ? size : pickerDemoDefaults.size,
    labelPosition: optionParam(
      params,
      "labelPosition",
      pickerLabelPositionOptions,
      pickerDemoDefaults.labelPosition,
    ),
    labelAlign: optionParam(
      params,
      "labelAlign",
      pickerLabelAlignOptions,
      pickerDemoDefaults.labelAlign,
    ),
    necessityIndicator: optionParam(
      params,
      "necessityIndicator",
      pickerNecessityIndicatorOptions,
      pickerDemoDefaults.necessityIndicator,
    ),
    description: params.get("description") ?? pickerDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? pickerDemoDefaults.errorMessage,
    name: params.get("name") ?? pickerDemoDefaults.name,
    form: params.get("form") ?? pickerDemoDefaults.form,
    validationBehavior: optionParam(
      params,
      "validationBehavior",
      pickerValidationBehaviorOptions,
      pickerDemoDefaults.validationBehavior,
    ),
    direction: optionParam(
      params,
      "direction",
      pickerDirectionOptions,
      pickerDemoDefaults.direction,
    ),
    align: optionParam(params, "align", pickerAlignOptions, pickerDemoDefaults.align),
    menuWidth: params.get("menuWidth") ?? pickerDemoDefaults.menuWidth,
    loadingState: optionParam(
      params,
      "loadingState",
      pickerLoadingStateOptions,
      pickerDemoDefaults.loadingState,
    ),
    isQuiet: booleanParam(params.get("isQuiet")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
    shouldFlip: params.has("shouldFlip") ? booleanParam(params.get("shouldFlip")) : true,
    disableEnterprise: booleanParam(params.get("disableEnterprise")),
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
    withRenderValue: booleanParam(params.get("withRenderValue")),
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
    selectionSource: props.selectionSource,
    placeholder: props.placeholder,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    description: props.description,
    errorMessage: props.errorMessage,
    name: props.name,
    form: props.form,
    validationBehavior: props.validationBehavior,
    direction: props.direction,
    align: props.align,
    menuWidth: props.menuWidth,
    loadingState: props.loadingState,
    isQuiet: props.isQuiet,
    isDisabled: props.isDisabled,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
    shouldFlip: props.shouldFlip,
    disableEnterprise: props.disableEnterprise,
    withContextualHelp: props.withContextualHelp,
    withRenderValue: props.withRenderValue,
  });
}
