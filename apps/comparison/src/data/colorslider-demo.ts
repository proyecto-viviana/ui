import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorSliderColorSpaceOptions = ["", "rgb", "hsl", "hsb"] as const;
export const colorSliderValueSourceOptions = ["value", "defaultValue"] as const;
export const colorSliderChannelOptions = [
  "red",
  "green",
  "blue",
  "hue",
  "saturation",
  "brightness",
  "lightness",
  "alpha",
] as const;
export const colorSliderOrientationOptions = ["horizontal", "vertical"] as const;

export type ColorSliderDemoColorSpace = (typeof colorSliderColorSpaceOptions)[number];
export type ColorSliderDemoValueSource = (typeof colorSliderValueSourceOptions)[number];
export type ColorSliderDemoChannel = (typeof colorSliderChannelOptions)[number];
export type ColorSliderDemoOrientation = (typeof colorSliderOrientationOptions)[number];

export interface ColorSliderDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  label: string;
  valueSource: ColorSliderDemoValueSource;
  value: string;
  defaultValue: string;
  channel: ColorSliderDemoChannel;
  colorSpace: ColorSliderDemoColorSpace;
  name: string;
  form: string;
  orientation: ColorSliderDemoOrientation;
  isDisabled: boolean;
}

export const colorSliderDemoDefaults: ColorSliderDemoProps = {
  ariaLabel: "",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  label: "",
  valueSource: "value",
  value: "hsl(50, 100%, 50%)",
  defaultValue: "hsl(50, 100%, 50%)",
  channel: "hue",
  colorSpace: "",
  name: "",
  form: "",
  orientation: "horizontal",
  isDisabled: false,
};

const channelsByColorSpace: Record<
  Exclude<ColorSliderDemoColorSpace, "">,
  readonly ColorSliderDemoChannel[]
> = {
  rgb: ["red", "green", "blue", "alpha"],
  hsl: ["hue", "saturation", "lightness", "alpha"],
  hsb: ["hue", "saturation", "brightness", "alpha"],
};

const defaultChannelByColorSpace: Record<ColorSliderDemoColorSpace, ColorSliderDemoChannel> = {
  "": "hue",
  rgb: "red",
  hsl: "hue",
  hsb: "hue",
};

const fallbackColorSpaceByChannel: Record<
  ColorSliderDemoChannel,
  Exclude<ColorSliderDemoColorSpace, ""> | ""
> = {
  red: "rgb",
  green: "rgb",
  blue: "rgb",
  hue: "",
  saturation: "",
  brightness: "hsb",
  lightness: "hsl",
  alpha: "",
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

function stringProp(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function normalizeChannel(
  colorSpace: ColorSliderDemoColorSpace,
  channel: unknown,
): ColorSliderDemoChannel {
  const candidate = String(channel);
  if (!isOneOf(candidate, colorSliderChannelOptions)) {
    return defaultChannelByColorSpace[colorSpace];
  }

  if (!colorSpace) {
    return candidate;
  }

  return channelsByColorSpace[colorSpace].includes(candidate)
    ? candidate
    : defaultChannelByColorSpace[colorSpace];
}

export function normalizeColorSliderDemoProps(
  props: Partial<ColorSliderDemoProps>,
): ColorSliderDemoProps {
  const colorSpace = isOneOf(props.colorSpace, colorSliderColorSpaceOptions)
    ? props.colorSpace
    : colorSliderDemoDefaults.colorSpace;

  return {
    ariaLabel: stringProp(props.ariaLabel, colorSliderDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorSliderDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(props.ariaDescribedBy, colorSliderDemoDefaults.ariaDescribedBy),
    ariaDetails: stringProp(props.ariaDetails, colorSliderDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorSliderDemoDefaults.id),
    slot: stringProp(props.slot, colorSliderDemoDefaults.slot),
    label: stringProp(props.label, colorSliderDemoDefaults.label),
    valueSource: isOneOf(props.valueSource, colorSliderValueSourceOptions)
      ? props.valueSource
      : colorSliderDemoDefaults.valueSource,
    value: stringProp(props.value, colorSliderDemoDefaults.value) || colorSliderDemoDefaults.value,
    defaultValue:
      stringProp(props.defaultValue, colorSliderDemoDefaults.defaultValue) ||
      colorSliderDemoDefaults.defaultValue,
    channel: normalizeChannel(colorSpace, props.channel),
    colorSpace,
    name: stringProp(props.name, colorSliderDemoDefaults.name),
    form: stringProp(props.form, colorSliderDemoDefaults.form),
    orientation: isOneOf(props.orientation, colorSliderOrientationOptions)
      ? props.orientation
      : colorSliderDemoDefaults.orientation,
    isDisabled: props.isDisabled === true,
  };
}

export function colorSliderDemoPropsFromSearch(search: string): ColorSliderDemoProps {
  const params = new URLSearchParams(search);
  const colorSpace = params.get("colorSpace");
  const valueSource = params.get("valueSource");
  const orientation = params.get("orientation");
  const normalizedColorSpace = isOneOf(colorSpace, colorSliderColorSpaceOptions)
    ? colorSpace
    : colorSliderDemoDefaults.colorSpace;

  return normalizeColorSliderDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorSliderDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorSliderDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorSliderDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorSliderDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorSliderDemoDefaults.id,
    slot: params.get("slot") ?? colorSliderDemoDefaults.slot,
    label: params.get("label") ?? colorSliderDemoDefaults.label,
    valueSource: isOneOf(valueSource, colorSliderValueSourceOptions)
      ? valueSource
      : colorSliderDemoDefaults.valueSource,
    value: params.get("value") ?? colorSliderDemoDefaults.value,
    defaultValue: params.get("defaultValue") ?? colorSliderDemoDefaults.defaultValue,
    channel: normalizeChannel(normalizedColorSpace, params.get("channel")),
    colorSpace: normalizedColorSpace,
    name: params.get("name") ?? colorSliderDemoDefaults.name,
    form: params.get("form") ?? colorSliderDemoDefaults.form,
    orientation: isOneOf(orientation, colorSliderOrientationOptions)
      ? orientation
      : colorSliderDemoDefaults.orientation,
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function colorSliderDemoPropsFromWindow(): ColorSliderDemoProps {
  if (typeof window === "undefined") {
    return colorSliderDemoDefaults;
  }
  return colorSliderDemoPropsFromSearch(window.location.search);
}

export function initialColorSliderDemoValue(props: ColorSliderDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function colorSliderEffectiveColorSpace(
  props: Pick<ColorSliderDemoProps, "channel" | "colorSpace">,
) {
  return props.colorSpace || fallbackColorSpaceByChannel[props.channel];
}

export function serializeColorSliderDemoProps(props: ColorSliderDemoProps) {
  return JSON.stringify({
    ariaLabel: props.ariaLabel,
    ariaLabelledBy: props.ariaLabelledBy,
    ariaDescribedBy: props.ariaDescribedBy,
    ariaDetails: props.ariaDetails,
    id: props.id,
    slot: props.slot,
    label: props.label,
    valueSource: props.valueSource,
    value: props.value,
    defaultValue: props.defaultValue,
    channel: props.channel,
    colorSpace: props.colorSpace,
    name: props.name,
    form: props.form,
    orientation: props.orientation,
    isDisabled: props.isDisabled,
  });
}
