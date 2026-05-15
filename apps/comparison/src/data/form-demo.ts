import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const formSizeOptions = ["S", "M", "L", "XL"] as const;
export const formLabelPositionOptions = ["top", "side"] as const;
export const formLabelAlignOptions = ["start", "end"] as const;
export const formNecessityIndicatorOptions = ["icon", "label"] as const;
export const formValidationBehaviorOptions = ["native", "aria"] as const;

export type FormDemoSize = (typeof formSizeOptions)[number];
export type FormDemoLabelPosition = (typeof formLabelPositionOptions)[number];
export type FormDemoLabelAlign = (typeof formLabelAlignOptions)[number];
export type FormDemoNecessityIndicator = (typeof formNecessityIndicatorOptions)[number];
export type FormDemoValidationBehavior = (typeof formValidationBehaviorOptions)[number];

export interface FormDemoProps {
  label: string;
  value: string;
  actionLabel: string;
  size: FormDemoSize;
  labelPosition: FormDemoLabelPosition;
  labelAlign: FormDemoLabelAlign;
  necessityIndicator: FormDemoNecessityIndicator;
  validationBehavior: FormDemoValidationBehavior;
  isRequired: boolean;
  isDisabled: boolean;
  isEmphasized: boolean;
}

export const formDemoDefaults: FormDemoProps = {
  label: "Project name",
  value: "Quarterly report",
  actionLabel: "Submit",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
  validationBehavior: "native",
  isRequired: false,
  isDisabled: false,
  isEmphasized: false,
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

export function normalizeFormDemoProps(props: Partial<FormDemoProps> = {}): FormDemoProps {
  return {
    label: typeof props.label === "string" && props.label ? props.label : formDemoDefaults.label,
    value: typeof props.value === "string" ? props.value : formDemoDefaults.value,
    actionLabel:
      typeof props.actionLabel === "string" && props.actionLabel
        ? props.actionLabel
        : formDemoDefaults.actionLabel,
    size: isOneOf(props.size, formSizeOptions) ? props.size : formDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, formLabelPositionOptions)
      ? props.labelPosition
      : formDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, formLabelAlignOptions)
      ? props.labelAlign
      : formDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, formNecessityIndicatorOptions)
      ? props.necessityIndicator
      : formDemoDefaults.necessityIndicator,
    validationBehavior: isOneOf(props.validationBehavior, formValidationBehaviorOptions)
      ? props.validationBehavior
      : formDemoDefaults.validationBehavior,
    isRequired: props.isRequired === true,
    isDisabled: props.isDisabled === true,
    isEmphasized: props.isEmphasized === true,
  };
}

export function formDemoPropsFromSearch(search: string): FormDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");
  const validationBehavior = params.get("validationBehavior");

  return normalizeFormDemoProps({
    label: params.get("label") || formDemoDefaults.label,
    value: params.get("value") ?? formDemoDefaults.value,
    actionLabel: params.get("actionLabel") || formDemoDefaults.actionLabel,
    size: isOneOf(size, formSizeOptions) ? size : formDemoDefaults.size,
    labelPosition: isOneOf(labelPosition, formLabelPositionOptions)
      ? labelPosition
      : formDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, formLabelAlignOptions)
      ? labelAlign
      : formDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, formNecessityIndicatorOptions)
      ? necessityIndicator
      : formDemoDefaults.necessityIndicator,
    validationBehavior: isOneOf(validationBehavior, formValidationBehaviorOptions)
      ? validationBehavior
      : formDemoDefaults.validationBehavior,
    isRequired: booleanParam(params.get("isRequired")),
    isDisabled: booleanParam(params.get("isDisabled")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
  });
}

export function formDemoPropsFromWindow(): FormDemoProps {
  if (typeof window === "undefined") {
    return formDemoDefaults;
  }

  return formDemoPropsFromSearch(window.location.search);
}

export function serializeFormDemoProps(props: FormDemoProps): string {
  return JSON.stringify(normalizeFormDemoProps(props));
}
