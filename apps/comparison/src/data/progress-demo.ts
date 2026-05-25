export const progressBarSizeOptions = ["S", "M", "L", "XL"] as const;
export const progressBarStaticColorOptions = ["", "white", "black", "auto"] as const;
export const progressBarLabelPositionOptions = ["top", "side"] as const;

export const progressCircleSizeOptions = ["S", "M", "L"] as const;
export const progressCircleStaticColorOptions = ["", "white", "black", "auto"] as const;

export type ProgressBarDemoSize = (typeof progressBarSizeOptions)[number];
export type ProgressBarDemoStaticColor = (typeof progressBarStaticColorOptions)[number];
export type ProgressBarDemoLabelPosition = (typeof progressBarLabelPositionOptions)[number];

export type ProgressCircleDemoSize = (typeof progressCircleSizeOptions)[number];
export type ProgressCircleDemoStaticColor = (typeof progressCircleStaticColorOptions)[number];

export interface ProgressBarDemoProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  valueLabel: string;
  size: ProgressBarDemoSize;
  staticColor: ProgressBarDemoStaticColor;
  labelPosition: ProgressBarDemoLabelPosition;
  isIndeterminate: boolean;
}

export interface ProgressCircleDemoProps {
  ariaLabel: string;
  value: number;
  minValue: number;
  maxValue: number;
  size: ProgressCircleDemoSize;
  staticColor: ProgressCircleDemoStaticColor;
  isIndeterminate: boolean;
}

export const progressBarDemoDefaults: ProgressBarDemoProps = {
  label: "Transcoding assets",
  value: 64,
  minValue: 0,
  maxValue: 100,
  valueLabel: "",
  size: "M",
  staticColor: "",
  labelPosition: "top",
  isIndeterminate: false,
};

export const progressCircleDemoDefaults: ProgressCircleDemoProps = {
  ariaLabel: "Syncing files",
  value: 72,
  minValue: 0,
  maxValue: 100,
  size: "M",
  staticColor: "",
  isIndeterminate: false,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function numberParam(value: string | null | undefined, fallback: number) {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberProp(value: unknown, fallback: number) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    return numberParam(value, fallback);
  }

  return fallback;
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

function booleanProp(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return booleanParam(value);
  }

  return fallback;
}

export function normalizeProgressBarDemoProps(
  props: Partial<ProgressBarDemoProps> = {},
): ProgressBarDemoProps {
  return {
    label:
      typeof props.label === "string" && props.label ? props.label : progressBarDemoDefaults.label,
    value: numberProp(props.value, progressBarDemoDefaults.value),
    minValue: numberProp(props.minValue, progressBarDemoDefaults.minValue),
    maxValue: numberProp(props.maxValue, progressBarDemoDefaults.maxValue),
    valueLabel:
      typeof props.valueLabel === "string" ? props.valueLabel : progressBarDemoDefaults.valueLabel,
    size: isOneOf(props.size, progressBarSizeOptions) ? props.size : progressBarDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, progressBarStaticColorOptions)
      ? props.staticColor
      : progressBarDemoDefaults.staticColor,
    labelPosition: isOneOf(props.labelPosition, progressBarLabelPositionOptions)
      ? props.labelPosition
      : progressBarDemoDefaults.labelPosition,
    isIndeterminate: booleanProp(props.isIndeterminate, progressBarDemoDefaults.isIndeterminate),
  };
}

export function normalizeProgressCircleDemoProps(
  props: Partial<ProgressCircleDemoProps> = {},
): ProgressCircleDemoProps {
  return {
    ariaLabel:
      typeof props.ariaLabel === "string" && props.ariaLabel
        ? props.ariaLabel
        : progressCircleDemoDefaults.ariaLabel,
    value: numberProp(props.value, progressCircleDemoDefaults.value),
    minValue: numberProp(props.minValue, progressCircleDemoDefaults.minValue),
    maxValue: numberProp(props.maxValue, progressCircleDemoDefaults.maxValue),
    size: isOneOf(props.size, progressCircleSizeOptions)
      ? props.size
      : progressCircleDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, progressCircleStaticColorOptions)
      ? props.staticColor
      : progressCircleDemoDefaults.staticColor,
    isIndeterminate: booleanProp(props.isIndeterminate, progressCircleDemoDefaults.isIndeterminate),
  };
}

export function progressBarDemoPropsFromSearch(search: string): ProgressBarDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const labelPosition = params.get("labelPosition");

  return normalizeProgressBarDemoProps({
    label: params.get("label") || progressBarDemoDefaults.label,
    value: numberParam(params.get("value"), progressBarDemoDefaults.value),
    minValue: numberParam(params.get("minValue"), progressBarDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), progressBarDemoDefaults.maxValue),
    valueLabel: params.get("valueLabel") ?? progressBarDemoDefaults.valueLabel,
    size: isOneOf(size, progressBarSizeOptions) ? size : progressBarDemoDefaults.size,
    staticColor: isOneOf(staticColor, progressBarStaticColorOptions)
      ? staticColor
      : progressBarDemoDefaults.staticColor,
    labelPosition: isOneOf(labelPosition, progressBarLabelPositionOptions)
      ? labelPosition
      : progressBarDemoDefaults.labelPosition,
    isIndeterminate: params.has("isIndeterminate")
      ? booleanParam(params.get("isIndeterminate"))
      : progressBarDemoDefaults.isIndeterminate,
  });
}

export function progressCircleDemoPropsFromSearch(search: string): ProgressCircleDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const staticColor = params.get("staticColor");

  return normalizeProgressCircleDemoProps({
    ariaLabel: params.get("ariaLabel") || progressCircleDemoDefaults.ariaLabel,
    value: numberParam(params.get("value"), progressCircleDemoDefaults.value),
    minValue: numberParam(params.get("minValue"), progressCircleDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), progressCircleDemoDefaults.maxValue),
    size: isOneOf(size, progressCircleSizeOptions) ? size : progressCircleDemoDefaults.size,
    staticColor: isOneOf(staticColor, progressCircleStaticColorOptions)
      ? staticColor
      : progressCircleDemoDefaults.staticColor,
    isIndeterminate: params.has("isIndeterminate")
      ? booleanParam(params.get("isIndeterminate"))
      : progressCircleDemoDefaults.isIndeterminate,
  });
}

export function progressBarDemoPropsFromWindow(): ProgressBarDemoProps {
  if (typeof window === "undefined") {
    return progressBarDemoDefaults;
  }

  return progressBarDemoPropsFromSearch(window.location.search);
}

export function progressCircleDemoPropsFromWindow(): ProgressCircleDemoProps {
  if (typeof window === "undefined") {
    return progressCircleDemoDefaults;
  }

  return progressCircleDemoPropsFromSearch(window.location.search);
}

export function serializeProgressBarDemoProps(props: ProgressBarDemoProps): string {
  return JSON.stringify(normalizeProgressBarDemoProps(props));
}

export function serializeProgressCircleDemoProps(props: ProgressCircleDemoProps): string {
  return JSON.stringify(normalizeProgressCircleDemoProps(props));
}
