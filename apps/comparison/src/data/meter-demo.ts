export const meterVariantOptions = ["informative", "positive", "notice", "negative"] as const;
export const meterSizeOptions = ["S", "M", "L", "XL"] as const;
export const meterStaticColorOptions = ["", "white", "black", "auto"] as const;
export const meterLabelPositionOptions = ["top", "side"] as const;

export type MeterDemoVariant = (typeof meterVariantOptions)[number];
export type MeterDemoSize = (typeof meterSizeOptions)[number];
export type MeterDemoStaticColor = (typeof meterStaticColorOptions)[number];
export type MeterDemoLabelPosition = (typeof meterLabelPositionOptions)[number];

export interface MeterDemoProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  valueLabel: string;
  variant: MeterDemoVariant;
  size: MeterDemoSize;
  staticColor: MeterDemoStaticColor;
  labelPosition: MeterDemoLabelPosition;
}

export const meterDemoDefaults: MeterDemoProps = {
  label: "Storage",
  value: 72,
  minValue: 0,
  maxValue: 100,
  valueLabel: "",
  variant: "informative",
  size: "M",
  staticColor: "",
  labelPosition: "top",
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

export function normalizeMeterDemoProps(props: Partial<MeterDemoProps> = {}): MeterDemoProps {
  return {
    label: typeof props.label === "string" && props.label ? props.label : meterDemoDefaults.label,
    value: numberProp(props.value, meterDemoDefaults.value),
    minValue: numberProp(props.minValue, meterDemoDefaults.minValue),
    maxValue: numberProp(props.maxValue, meterDemoDefaults.maxValue),
    valueLabel:
      typeof props.valueLabel === "string" ? props.valueLabel : meterDemoDefaults.valueLabel,
    variant: isOneOf(props.variant, meterVariantOptions)
      ? props.variant
      : meterDemoDefaults.variant,
    size: isOneOf(props.size, meterSizeOptions) ? props.size : meterDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, meterStaticColorOptions)
      ? props.staticColor
      : meterDemoDefaults.staticColor,
    labelPosition: isOneOf(props.labelPosition, meterLabelPositionOptions)
      ? props.labelPosition
      : meterDemoDefaults.labelPosition,
  };
}

export function meterDemoPropsFromSearch(search: string): MeterDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const size = params.get("size");
  const staticColor = params.get("staticColor");
  const labelPosition = params.get("labelPosition");

  return normalizeMeterDemoProps({
    label: params.get("label") || meterDemoDefaults.label,
    value: numberParam(params.get("value"), meterDemoDefaults.value),
    minValue: numberParam(params.get("minValue"), meterDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), meterDemoDefaults.maxValue),
    valueLabel: params.get("valueLabel") ?? meterDemoDefaults.valueLabel,
    variant: isOneOf(variant, meterVariantOptions) ? variant : meterDemoDefaults.variant,
    size: isOneOf(size, meterSizeOptions) ? size : meterDemoDefaults.size,
    staticColor: isOneOf(staticColor, meterStaticColorOptions)
      ? staticColor
      : meterDemoDefaults.staticColor,
    labelPosition: isOneOf(labelPosition, meterLabelPositionOptions)
      ? labelPosition
      : meterDemoDefaults.labelPosition,
  });
}

export function meterDemoPropsFromWindow(): MeterDemoProps {
  if (typeof window === "undefined") {
    return meterDemoDefaults;
  }

  return meterDemoPropsFromSearch(window.location.search);
}

export function serializeMeterDemoProps(props: MeterDemoProps): string {
  return JSON.stringify(normalizeMeterDemoProps(props));
}
