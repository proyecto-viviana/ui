import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const sliderSizeOptions = ["S", "M", "L", "XL"] as const;
export const sliderTrackStyleOptions = ["thin", "thick"] as const;
export const sliderThumbStyleOptions = ["default", "precise"] as const;
export const sliderValueSourceOptions = ["value", "defaultValue"] as const;
export const sliderLabelPositionOptions = ["top", "side"] as const;
export const sliderLabelAlignOptions = ["start", "end"] as const;

export type SliderDemoSize = (typeof sliderSizeOptions)[number];
export type SliderDemoTrackStyle = (typeof sliderTrackStyleOptions)[number];
export type SliderDemoThumbStyle = (typeof sliderThumbStyleOptions)[number];
export type SliderDemoValueSource = (typeof sliderValueSourceOptions)[number];
export type SliderDemoLabelPosition = (typeof sliderLabelPositionOptions)[number];
export type SliderDemoLabelAlign = (typeof sliderLabelAlignOptions)[number];

export interface SliderDemoProps {
  label: string;
  valueSource: SliderDemoValueSource;
  value: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  step: number;
  size: SliderDemoSize;
  trackStyle: SliderDemoTrackStyle;
  thumbStyle: SliderDemoThumbStyle;
  fillOffset: number;
  labelPosition: SliderDemoLabelPosition;
  labelAlign: SliderDemoLabelAlign;
  name: string;
  form: string;
  withContextualHelp: boolean;
  isEmphasized: boolean;
  isDisabled: boolean;
}

export const sliderDemoDefaults: SliderDemoProps = {
  label: "Volume",
  valueSource: "value",
  value: 40,
  defaultValue: 40,
  minValue: 0,
  maxValue: 100,
  step: 1,
  size: "M",
  trackStyle: "thin",
  thumbStyle: "default",
  fillOffset: 0,
  labelPosition: "top",
  labelAlign: "start",
  name: "",
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

export function normalizeSliderDemoProps(props: Partial<SliderDemoProps>): SliderDemoProps {
  const minValue = numberProp(props.minValue, sliderDemoDefaults.minValue);
  const maxValue = numberProp(props.maxValue, sliderDemoDefaults.maxValue);
  const fallbackValue = Math.min(maxValue, Math.max(minValue, sliderDemoDefaults.value));
  const value = Math.min(maxValue, Math.max(minValue, numberProp(props.value, fallbackValue)));
  const defaultValue = Math.min(
    maxValue,
    Math.max(minValue, numberProp(props.defaultValue, fallbackValue)),
  );
  const fillOffset = Math.min(
    maxValue,
    Math.max(minValue, numberProp(props.fillOffset, sliderDemoDefaults.fillOffset)),
  );
  const step = numberProp(props.step, sliderDemoDefaults.step);

  return {
    label: typeof props.label === "string" && props.label ? props.label : sliderDemoDefaults.label,
    valueSource: isOneOf(props.valueSource, sliderValueSourceOptions)
      ? props.valueSource
      : sliderDemoDefaults.valueSource,
    value,
    defaultValue,
    minValue,
    maxValue,
    step: step > 0 ? step : sliderDemoDefaults.step,
    size: isOneOf(props.size, sliderSizeOptions) ? props.size : sliderDemoDefaults.size,
    trackStyle: isOneOf(props.trackStyle, sliderTrackStyleOptions)
      ? props.trackStyle
      : sliderDemoDefaults.trackStyle,
    thumbStyle: isOneOf(props.thumbStyle, sliderThumbStyleOptions)
      ? props.thumbStyle
      : sliderDemoDefaults.thumbStyle,
    fillOffset,
    labelPosition: isOneOf(props.labelPosition, sliderLabelPositionOptions)
      ? props.labelPosition
      : sliderDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, sliderLabelAlignOptions)
      ? props.labelAlign
      : sliderDemoDefaults.labelAlign,
    name: typeof props.name === "string" ? props.name : sliderDemoDefaults.name,
    form: typeof props.form === "string" ? props.form : sliderDemoDefaults.form,
    withContextualHelp: props.withContextualHelp === true,
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
  };
}

export function sliderDemoPropsFromSearch(search: string): SliderDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const trackStyle = params.get("trackStyle");
  const thumbStyle = params.get("thumbStyle");
  const valueSource = params.get("valueSource");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");

  return normalizeSliderDemoProps({
    label: params.get("label") || sliderDemoDefaults.label,
    valueSource: isOneOf(valueSource, sliderValueSourceOptions)
      ? valueSource
      : sliderDemoDefaults.valueSource,
    value: numberParam(params.get("value"), sliderDemoDefaults.value),
    defaultValue: numberParam(params.get("defaultValue"), sliderDemoDefaults.defaultValue),
    minValue: numberParam(params.get("minValue"), sliderDemoDefaults.minValue),
    maxValue: numberParam(params.get("maxValue"), sliderDemoDefaults.maxValue),
    step: numberParam(params.get("step"), sliderDemoDefaults.step),
    size: isOneOf(size, sliderSizeOptions) ? size : sliderDemoDefaults.size,
    trackStyle: isOneOf(trackStyle, sliderTrackStyleOptions)
      ? trackStyle
      : sliderDemoDefaults.trackStyle,
    thumbStyle: isOneOf(thumbStyle, sliderThumbStyleOptions)
      ? thumbStyle
      : sliderDemoDefaults.thumbStyle,
    fillOffset: numberParam(params.get("fillOffset"), sliderDemoDefaults.fillOffset),
    labelPosition: isOneOf(labelPosition, sliderLabelPositionOptions)
      ? labelPosition
      : sliderDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, sliderLabelAlignOptions)
      ? labelAlign
      : sliderDemoDefaults.labelAlign,
    name: params.get("name") ?? sliderDemoDefaults.name,
    form: params.get("form") ?? sliderDemoDefaults.form,
    withContextualHelp: booleanParam(params.get("withContextualHelp")),
    isEmphasized: booleanParam(params.get("isEmphasized")),
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function sliderDemoPropsFromWindow(): SliderDemoProps {
  if (typeof window === "undefined") {
    return sliderDemoDefaults;
  }
  return sliderDemoPropsFromSearch(window.location.search);
}

export function initialSliderDemoValue(props: SliderDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function serializeSliderDemoProps(props: SliderDemoProps) {
  return JSON.stringify({
    label: props.label,
    valueSource: props.valueSource,
    value: props.value,
    defaultValue: props.defaultValue,
    minValue: props.minValue,
    maxValue: props.maxValue,
    step: props.step,
    size: props.size,
    trackStyle: props.trackStyle,
    thumbStyle: props.thumbStyle,
    fillOffset: props.fillOffset,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    name: props.name,
    form: props.form,
    withContextualHelp: props.withContextualHelp,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
  });
}
