import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const sliderSizeOptions = ["S", "M", "L", "XL"] as const;
export const sliderTrackStyleOptions = ["thin", "thick"] as const;
export const sliderThumbStyleOptions = ["default", "precise"] as const;

export type SliderDemoSize = (typeof sliderSizeOptions)[number];
export type SliderDemoTrackStyle = (typeof sliderTrackStyleOptions)[number];
export type SliderDemoThumbStyle = (typeof sliderThumbStyleOptions)[number];

export interface SliderDemoProps {
  label: string;
  value: number;
  minValue: number;
  maxValue: number;
  step: number;
  size: SliderDemoSize;
  trackStyle: SliderDemoTrackStyle;
  thumbStyle: SliderDemoThumbStyle;
  isEmphasized: boolean;
  isDisabled: boolean;
}

export const sliderDemoDefaults: SliderDemoProps = {
  label: "Volume",
  value: 40,
  minValue: 0,
  maxValue: 100,
  step: 1,
  size: "M",
  trackStyle: "thin",
  thumbStyle: "default",
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
  const step = numberProp(props.step, sliderDemoDefaults.step);

  return {
    label: typeof props.label === "string" && props.label ? props.label : sliderDemoDefaults.label,
    value,
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
    isEmphasized: props.isEmphasized === true,
    isDisabled: props.isDisabled === true,
  };
}

export function sliderDemoPropsFromSearch(search: string): SliderDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const trackStyle = params.get("trackStyle");
  const thumbStyle = params.get("thumbStyle");

  return normalizeSliderDemoProps({
    label: params.get("label") || sliderDemoDefaults.label,
    value: numberParam(params.get("value"), sliderDemoDefaults.value),
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

export function serializeSliderDemoProps(props: SliderDemoProps) {
  return JSON.stringify({
    label: props.label,
    value: props.value,
    minValue: props.minValue,
    maxValue: props.maxValue,
    step: props.step,
    size: props.size,
    trackStyle: props.trackStyle,
    thumbStyle: props.thumbStyle,
    isEmphasized: props.isEmphasized,
    isDisabled: props.isDisabled,
  });
}
