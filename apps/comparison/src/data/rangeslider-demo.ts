import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const rangeSliderSizeOptions = ["S", "M", "L", "XL"] as const;
export const rangeSliderTrackStyleOptions = ["thin", "thick"] as const;
export const rangeSliderThumbStyleOptions = ["default", "precise"] as const;
export const rangeSliderValueSourceOptions = ["defaultValue", "value"] as const;
export const rangeSliderLabelPositionOptions = ["top", "side"] as const;
export const rangeSliderLabelAlignOptions = ["start", "end"] as const;
export const rangeSliderFormatOptions = ["decimal", "percent", "currency", "unit"] as const;

export type RangeSliderDemoSize = (typeof rangeSliderSizeOptions)[number];
export type RangeSliderDemoTrackStyle = (typeof rangeSliderTrackStyleOptions)[number];
export type RangeSliderDemoThumbStyle = (typeof rangeSliderThumbStyleOptions)[number];
export type RangeSliderDemoValueSource = (typeof rangeSliderValueSourceOptions)[number];
export type RangeSliderDemoLabelPosition = (typeof rangeSliderLabelPositionOptions)[number];
export type RangeSliderDemoLabelAlign = (typeof rangeSliderLabelAlignOptions)[number];
export type RangeSliderDemoFormatOptions = (typeof rangeSliderFormatOptions)[number];

export interface RangeSliderDemoRange {
  start: number;
  end: number;
}

export interface RangeSliderDemoProps {
  label: string;
  valueSource: RangeSliderDemoValueSource;
  startValue: number;
  endValue: number;
  defaultStartValue: number;
  defaultEndValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  size: RangeSliderDemoSize;
  trackStyle: RangeSliderDemoTrackStyle;
  thumbStyle: RangeSliderDemoThumbStyle;
  labelPosition: RangeSliderDemoLabelPosition;
  labelAlign: RangeSliderDemoLabelAlign;
  formatOptions: RangeSliderDemoFormatOptions;
  startName: string;
  endName: string;
  form: string;
  withContextualHelp: boolean;
  isEmphasized: boolean;
  isDisabled: boolean;
}

export const rangeSliderDemoDefaults: RangeSliderDemoProps = {
  label: "Range",
  valueSource: "defaultValue",
  startValue: 30,
  endValue: 60,
  defaultStartValue: 30,
  defaultEndValue: 60,
  minValue: 0,
  maxValue: 100,
  step: 1,
  size: "M",
  trackStyle: "thin",
  thumbStyle: "default",
  labelPosition: "top",
  labelAlign: "start",
  formatOptions: "decimal",
  startName: "",
  endName: "",
  form: "",
  withContextualHelp: false,
  isEmphasized: false,
  isDisabled: false,
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

function numberParam(value: string | null | undefined, fallback: number) {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numberProp(value: unknown, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    return numberParam(value, fallback);
  }

  return fallback;
}

function normalizeRange(start: number, end: number, minValue: number, maxValue: number) {
  const clampedStart = Math.min(maxValue, Math.max(minValue, start));
  const clampedEnd = Math.min(maxValue, Math.max(minValue, end));

  return {
    start: Math.min(clampedStart, clampedEnd),
    end: Math.max(clampedStart, clampedEnd),
  };
}

export function normalizeRangeSliderDemoProps(
  props: Partial<RangeSliderDemoProps> = {},
): RangeSliderDemoProps {
  const minValue = numberProp(props.minValue, rangeSliderDemoDefaults.minValue);
  const rawMaxValue = numberProp(props.maxValue, rangeSliderDemoDefaults.maxValue);
  const rawStep = numberProp(props.step, rangeSliderDemoDefaults.step);
  const step = rawStep > 0 ? rawStep : rangeSliderDemoDefaults.step;
  const maxValue = rawMaxValue > minValue ? rawMaxValue : minValue + step;
  const valueRange = normalizeRange(
    numberProp(props.startValue, rangeSliderDemoDefaults.startValue),
    numberProp(props.endValue, rangeSliderDemoDefaults.endValue),
    minValue,
    maxValue,
  );
  const defaultRange = normalizeRange(
    numberProp(props.defaultStartValue, rangeSliderDemoDefaults.defaultStartValue),
    numberProp(props.defaultEndValue, rangeSliderDemoDefaults.defaultEndValue),
    minValue,
    maxValue,
  );

  return {
    label:
      typeof props.label === "string" && props.label ? props.label : rangeSliderDemoDefaults.label,
    valueSource: isOneOf(props.valueSource, rangeSliderValueSourceOptions)
      ? props.valueSource
      : rangeSliderDemoDefaults.valueSource,
    startValue: valueRange.start,
    endValue: valueRange.end,
    defaultStartValue: defaultRange.start,
    defaultEndValue: defaultRange.end,
    minValue,
    maxValue,
    step,
    size: isOneOf(props.size, rangeSliderSizeOptions) ? props.size : rangeSliderDemoDefaults.size,
    trackStyle: isOneOf(props.trackStyle, rangeSliderTrackStyleOptions)
      ? props.trackStyle
      : rangeSliderDemoDefaults.trackStyle,
    thumbStyle: isOneOf(props.thumbStyle, rangeSliderThumbStyleOptions)
      ? props.thumbStyle
      : rangeSliderDemoDefaults.thumbStyle,
    labelPosition: isOneOf(props.labelPosition, rangeSliderLabelPositionOptions)
      ? props.labelPosition
      : rangeSliderDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, rangeSliderLabelAlignOptions)
      ? props.labelAlign
      : rangeSliderDemoDefaults.labelAlign,
    formatOptions: isOneOf(props.formatOptions, rangeSliderFormatOptions)
      ? props.formatOptions
      : rangeSliderDemoDefaults.formatOptions,
    startName:
      typeof props.startName === "string" ? props.startName : rangeSliderDemoDefaults.startName,
    endName: typeof props.endName === "string" ? props.endName : rangeSliderDemoDefaults.endName,
    form: typeof props.form === "string" ? props.form : rangeSliderDemoDefaults.form,
    withContextualHelp: props.withContextualHelp === true,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
  };
}

export function rangeSliderDemoPropsFromSearch(search: string): RangeSliderDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const trackStyle = params.get("trackStyle");
  const thumbStyle = params.get("thumbStyle");
  const valueSource = params.get("valueSource");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const formatOptions = params.get("formatOptions");

  return normalizeRangeSliderDemoProps({
    label: params.get("label") || rangeSliderDemoDefaults.label,
    valueSource: isOneOf(valueSource, rangeSliderValueSourceOptions)
      ? valueSource
      : rangeSliderDemoDefaults.valueSource,
    startValue: numberParam(params.get("startValue"), rangeSliderDemoDefaults.startValue),
    endValue: numberParam(params.get("endValue"), rangeSliderDemoDefaults.endValue),
    defaultStartValue: numberParam(
      params.get("defaultStartValue"),
      rangeSliderDemoDefaults.defaultStartValue,
    ),
    defaultEndValue: numberParam(
      params.get("defaultEndValue"),
      rangeSliderDemoDefaults.defaultEndValue,
    ),
    minValue: numberParam(params.get("minValue"), rangeSliderDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), rangeSliderDemoDefaults.maxValue),
    step: numberParam(params.get("step"), rangeSliderDemoDefaults.step),
    size: isOneOf(size, rangeSliderSizeOptions) ? size : rangeSliderDemoDefaults.size,
    trackStyle: isOneOf(trackStyle, rangeSliderTrackStyleOptions)
      ? trackStyle
      : rangeSliderDemoDefaults.trackStyle,
    thumbStyle: isOneOf(thumbStyle, rangeSliderThumbStyleOptions)
      ? thumbStyle
      : rangeSliderDemoDefaults.thumbStyle,
    labelPosition: isOneOf(labelPosition, rangeSliderLabelPositionOptions)
      ? labelPosition
      : rangeSliderDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, rangeSliderLabelAlignOptions)
      ? labelAlign
      : rangeSliderDemoDefaults.labelAlign,
    formatOptions: isOneOf(formatOptions, rangeSliderFormatOptions)
      ? formatOptions
      : rangeSliderDemoDefaults.formatOptions,
    startName: params.get("startName") ?? rangeSliderDemoDefaults.startName,
    endName: params.get("endName") ?? rangeSliderDemoDefaults.endName,
    form: params.get("form") ?? rangeSliderDemoDefaults.form,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function rangeSliderDemoPropsFromWindow(): RangeSliderDemoProps {
  if (typeof window === "undefined") {
    return rangeSliderDemoDefaults;
  }

  return rangeSliderDemoPropsFromSearch(window.location.search);
}

export function initialRangeSliderDemoValue(props: RangeSliderDemoProps): RangeSliderDemoRange {
  if (props.valueSource === "defaultValue") {
    return {
      start: props.defaultStartValue,
      end: props.defaultEndValue,
    };
  }

  return {
    start: props.startValue,
    end: props.endValue,
  };
}

export function serializeRangeSliderDemoProps(props: RangeSliderDemoProps) {
  return JSON.stringify(normalizeRangeSliderDemoProps(props));
}

export function rangeSliderFormatOptionsForPreset(
  preset: RangeSliderDemoFormatOptions,
): Intl.NumberFormatOptions {
  switch (preset) {
    case "currency":
      return { style: "currency", currency: "USD", maximumFractionDigits: 0 };
    case "unit":
      return { style: "unit", unit: "kilometer", maximumFractionDigits: 0 };
    case "decimal":
      return { style: "decimal" };
    case "percent":
      return { style: "percent" };
  }
}
