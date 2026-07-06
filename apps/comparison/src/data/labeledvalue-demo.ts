import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const labeledValueSizeOptions = ["S", "M", "L", "XL"] as const;
export const labeledValueLabelPositionOptions = ["top", "side"] as const;
export const labeledValueLabelAlignOptions = ["start", "end"] as const;
export const labeledValueValueTypeOptions = ["string", "number", "list"] as const;

export type LabeledValueDemoSize = (typeof labeledValueSizeOptions)[number];
export type LabeledValueDemoLabelPosition = (typeof labeledValueLabelPositionOptions)[number];
export type LabeledValueDemoLabelAlign = (typeof labeledValueLabelAlignOptions)[number];
export type LabeledValueDemoValueType = (typeof labeledValueValueTypeOptions)[number];

export interface LabeledValueDemoProps {
  label: string;
  /** The string value used when `valueType` is "string". */
  value: string;
  /** Selects which value shape is passed to LabeledValue (proves the formatting branches). */
  valueType: LabeledValueDemoValueType;
  size: LabeledValueDemoSize;
  labelPosition: LabeledValueDemoLabelPosition;
  labelAlign: LabeledValueDemoLabelAlign;
}

export const labeledValueDemoDefaults: LabeledValueDemoProps = {
  label: "Project name",
  value: "Quarterly report",
  valueType: "string",
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
};

/**
 * The fixed number/list payloads for the non-string value types. Both stacks resolve the value
 * through this helper so React and Solid format the SAME input — a formatter divergence then
 * shows up as a pixel/text mismatch rather than an input mismatch.
 */
export const labeledValueDemoNumber = 1234567.89;
export const labeledValueDemoList = ["Adobe", "Apple", "Google"] as const;

export function resolveLabeledValueDemoValue(
  props: LabeledValueDemoProps,
): string | number | string[] {
  switch (props.valueType) {
    case "number":
      return labeledValueDemoNumber;
    case "list":
      return [...labeledValueDemoList];
    default:
      return props.value;
  }
}

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

/**
 * Loose input to the normalizer: every field arrives as a raw string (URL
 * params, CustomEvent detail) or is absent. The `isOneOf` / `typeof` guards
 * below narrow each one to its strict union, so the parameter type must NOT be
 * the strict `Partial<LabeledValueDemoProps>` — that would reject the very
 * arbitrary strings this function exists to sanitize.
 */
export type LabeledValueDemoInput = {
  [K in keyof LabeledValueDemoProps]?: string | null;
};

export function normalizeLabeledValueDemoProps(
  props: LabeledValueDemoInput,
): LabeledValueDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : labeledValueDemoDefaults.label,
    value: typeof props.value === "string" ? props.value : labeledValueDemoDefaults.value,
    valueType: isOneOf(props.valueType, labeledValueValueTypeOptions)
      ? props.valueType
      : labeledValueDemoDefaults.valueType,
    size: isOneOf(props.size, labeledValueSizeOptions) ? props.size : labeledValueDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, labeledValueLabelPositionOptions)
      ? props.labelPosition
      : labeledValueDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, labeledValueLabelAlignOptions)
      ? props.labelAlign
      : labeledValueDemoDefaults.labelAlign,
  };
}

export function labeledValueDemoPropsFromSearch(search: string): LabeledValueDemoProps {
  const params = new URLSearchParams(search);

  return normalizeLabeledValueDemoProps({
    label: params.get("label") || labeledValueDemoDefaults.label,
    value: params.get("value") ?? labeledValueDemoDefaults.value,
    valueType: params.get("valueType") ?? labeledValueDemoDefaults.valueType,
    size: params.get("size") ?? labeledValueDemoDefaults.size,
    labelPosition: params.get("labelPosition") ?? labeledValueDemoDefaults.labelPosition,
    labelAlign: params.get("labelAlign") ?? labeledValueDemoDefaults.labelAlign,
  });
}

export function labeledValueDemoPropsFromWindow(): LabeledValueDemoProps {
  if (typeof window === "undefined") {
    return labeledValueDemoDefaults;
  }

  return labeledValueDemoPropsFromSearch(window.location.search);
}

export function serializeLabeledValueDemoProps(props: LabeledValueDemoProps) {
  return JSON.stringify({
    label: props.label,
    value: props.value,
    valueType: props.valueType,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
  });
}
