import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const comboBoxSizeOptions = ["S", "M", "L", "XL"] as const;
export const comboBoxKeyOptions = ["starter", "pro", "enterprise"] as const;
export const comboBoxSelectionSourceOptions = ["selectedKey", "defaultSelectedKey"] as const;
export const comboBoxInputSourceOptions = ["inputValue", "defaultInputValue"] as const;
export const comboBoxLabelPositionOptions = ["top", "side"] as const;
export const comboBoxLabelAlignOptions = ["start", "end"] as const;
export const comboBoxNecessityIndicatorOptions = ["icon", "label"] as const;
export const comboBoxMenuTriggerOptions = ["input", "focus", "manual"] as const;
export const comboBoxDirectionOptions = ["bottom", "top"] as const;
export const comboBoxAlignOptions = ["start", "end"] as const;
export const comboBoxFormValueOptions = ["key", "text"] as const;
export const comboBoxValidationBehaviorOptions = ["native", "aria"] as const;

export type ComboBoxDemoSize = (typeof comboBoxSizeOptions)[number];
export type ComboBoxDemoKey = (typeof comboBoxKeyOptions)[number];
export type ComboBoxDemoSelectionSource = (typeof comboBoxSelectionSourceOptions)[number];
export type ComboBoxDemoInputSource = (typeof comboBoxInputSourceOptions)[number];
export type ComboBoxDemoLabelPosition = (typeof comboBoxLabelPositionOptions)[number];
export type ComboBoxDemoLabelAlign = (typeof comboBoxLabelAlignOptions)[number];
export type ComboBoxDemoNecessityIndicator = (typeof comboBoxNecessityIndicatorOptions)[number];
export type ComboBoxDemoMenuTrigger = (typeof comboBoxMenuTriggerOptions)[number];
export type ComboBoxDemoDirection = (typeof comboBoxDirectionOptions)[number];
export type ComboBoxDemoAlign = (typeof comboBoxAlignOptions)[number];
export type ComboBoxDemoFormValue = (typeof comboBoxFormValueOptions)[number];
export type ComboBoxDemoValidationBehavior = (typeof comboBoxValidationBehaviorOptions)[number];

export interface ComboBoxDemoProps {
  label: string;
  selectedKey: ComboBoxDemoKey;
  selectionSource: ComboBoxDemoSelectionSource;
  inputValue: string;
  inputSource: ComboBoxDemoInputSource;
  placeholder: string;
  size: ComboBoxDemoSize;
  labelPosition: ComboBoxDemoLabelPosition;
  labelAlign: ComboBoxDemoLabelAlign;
  necessityIndicator: ComboBoxDemoNecessityIndicator;
  description: string;
  errorMessage: string;
  name: string;
  form: string;
  formValue: ComboBoxDemoFormValue;
  validationBehavior: ComboBoxDemoValidationBehavior;
  menuTrigger: ComboBoxDemoMenuTrigger;
  direction: ComboBoxDemoDirection;
  align: ComboBoxDemoAlign;
  menuWidth: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  allowsCustomValue: boolean;
  shouldFlip: boolean;
  disableEnterprise: boolean;
  withContextualHelp: boolean;
}

export const comboBoxItems = [
  { id: "starter", label: "Starter" },
  { id: "pro", label: "Pro" },
  { id: "enterprise", label: "Enterprise" },
] as const;

export const comboBoxDemoDefaults: ComboBoxDemoProps = {
  label: "Plan",
  selectedKey: "pro",
  selectionSource: "selectedKey",
  inputValue: "Pro",
  inputSource: "inputValue",
  placeholder: "Search plans",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  description: "Choose the billing plan.",
  errorMessage: "Select a plan.",
  name: "plan",
  form: "",
  formValue: "key",
  validationBehavior: "native",
  menuTrigger: "input",
  direction: "bottom",
  align: "start",
  menuWidth: "",
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
  allowsCustomValue: false,
  shouldFlip: true,
  disableEnterprise: false,
  withContextualHelp: false,
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
    selectionSource: isOneOf(props.selectionSource, comboBoxSelectionSourceOptions)
      ? props.selectionSource
      : comboBoxDemoDefaults.selectionSource,
    inputValue:
      typeof props.inputValue === "string" ? props.inputValue : comboBoxLabelForKey(selectedKey),
    inputSource: isOneOf(props.inputSource, comboBoxInputSourceOptions)
      ? props.inputSource
      : comboBoxDemoDefaults.inputSource,
    placeholder:
      typeof props.placeholder === "string" ? props.placeholder : comboBoxDemoDefaults.placeholder,
    size: isOneOf(props.size, comboBoxSizeOptions) ? props.size : comboBoxDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, comboBoxLabelPositionOptions)
      ? props.labelPosition
      : comboBoxDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, comboBoxLabelAlignOptions)
      ? props.labelAlign
      : comboBoxDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, comboBoxNecessityIndicatorOptions)
      ? props.necessityIndicator
      : comboBoxDemoDefaults.necessityIndicator,
    description:
      typeof props.description === "string" ? props.description : comboBoxDemoDefaults.description,
    errorMessage:
      typeof props.errorMessage === "string"
        ? props.errorMessage
        : comboBoxDemoDefaults.errorMessage,
    name: typeof props.name === "string" ? props.name : comboBoxDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : comboBoxDemoDefaults.form,
    formValue: isOneOf(props.formValue, comboBoxFormValueOptions)
      ? props.formValue
      : comboBoxDemoDefaults.formValue,
    validationBehavior: isOneOf(props.validationBehavior, comboBoxValidationBehaviorOptions)
      ? props.validationBehavior
      : comboBoxDemoDefaults.validationBehavior,
    menuTrigger: isOneOf(props.menuTrigger, comboBoxMenuTriggerOptions)
      ? props.menuTrigger
      : comboBoxDemoDefaults.menuTrigger,
    direction: isOneOf(props.direction, comboBoxDirectionOptions)
      ? props.direction
      : comboBoxDemoDefaults.direction,
    align: isOneOf(props.align, comboBoxAlignOptions) ? props.align : comboBoxDemoDefaults.align,
    menuWidth:
      typeof props.menuWidth === "string" ? props.menuWidth : comboBoxDemoDefaults.menuWidth,
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
    allowsCustomValue: props.allowsCustomValue === true,
    shouldFlip: props.shouldFlip !== false,
    disableEnterprise: props.disableEnterprise === true,
    withContextualHelp: props.withContextualHelp === true,
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
    selectionSource: optionParam(
      params,
      "selectionSource",
      comboBoxSelectionSourceOptions,
      comboBoxDemoDefaults.selectionSource,
    ),
    inputValue: params.get("inputValue") ?? comboBoxLabelForKey(normalizedSelectedKey),
    inputSource: optionParam(
      params,
      "inputSource",
      comboBoxInputSourceOptions,
      comboBoxDemoDefaults.inputSource,
    ),
    placeholder: params.get("placeholder") ?? comboBoxDemoDefaults.placeholder,
    size: isOneOf(size, comboBoxSizeOptions) ? size : comboBoxDemoDefaults.size,
    labelPosition: optionParam(
      params,
      "labelPosition",
      comboBoxLabelPositionOptions,
      comboBoxDemoDefaults.labelPosition,
    ),
    labelAlign: optionParam(
      params,
      "labelAlign",
      comboBoxLabelAlignOptions,
      comboBoxDemoDefaults.labelAlign,
    ),
    necessityIndicator: optionParam(
      params,
      "necessityIndicator",
      comboBoxNecessityIndicatorOptions,
      comboBoxDemoDefaults.necessityIndicator,
    ),
    description: params.get("description") ?? comboBoxDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? comboBoxDemoDefaults.errorMessage,
    name: params.get("name") ?? comboBoxDemoDefaults.name,
    form: params.get("form") ?? comboBoxDemoDefaults.form,
    formValue: optionParam(
      params,
      "formValue",
      comboBoxFormValueOptions,
      comboBoxDemoDefaults.formValue,
    ),
    validationBehavior: optionParam(
      params,
      "validationBehavior",
      comboBoxValidationBehaviorOptions,
      comboBoxDemoDefaults.validationBehavior,
    ),
    menuTrigger: optionParam(
      params,
      "menuTrigger",
      comboBoxMenuTriggerOptions,
      comboBoxDemoDefaults.menuTrigger,
    ),
    direction: optionParam(
      params,
      "direction",
      comboBoxDirectionOptions,
      comboBoxDemoDefaults.direction,
    ),
    align: optionParam(params, "align", comboBoxAlignOptions, comboBoxDemoDefaults.align),
    menuWidth: params.get("menuWidth") ?? comboBoxDemoDefaults.menuWidth,
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
    allowsCustomValue: booleanParam(params.get("allowsCustomValue")),
    shouldFlip: params.has("shouldFlip")
      ? booleanParam(params.get("shouldFlip"))
      : comboBoxDemoDefaults.shouldFlip,
    disableEnterprise: booleanParam(params.get("disableEnterprise")),
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
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
    selectionSource: props.selectionSource,
    inputValue: props.inputValue,
    inputSource: props.inputSource,
    placeholder: props.placeholder,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
    description: props.description,
    errorMessage: props.errorMessage,
    name: props.name,
    form: props.form,
    formValue: props.formValue,
    validationBehavior: props.validationBehavior,
    menuTrigger: props.menuTrigger,
    direction: props.direction,
    align: props.align,
    menuWidth: props.menuWidth,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
    allowsCustomValue: props.allowsCustomValue,
    shouldFlip: props.shouldFlip,
    disableEnterprise: props.disableEnterprise,
    withContextualHelp: props.withContextualHelp,
  });
}
