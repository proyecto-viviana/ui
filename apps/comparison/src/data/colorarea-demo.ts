import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorAreaColorSpaceOptions = ["", "rgb", "hsl", "hsb"] as const;
export const colorAreaValueSourceOptions = ["value", "defaultValue"] as const;
export const colorAreaChannelOptions = [
  "red",
  "green",
  "blue",
  "hue",
  "saturation",
  "brightness",
  "lightness",
] as const;

export type ColorAreaDemoColorSpace = (typeof colorAreaColorSpaceOptions)[number];
export type ColorAreaDemoValueSource = (typeof colorAreaValueSourceOptions)[number];
export type ColorAreaDemoChannel = (typeof colorAreaChannelOptions)[number];

export interface ColorAreaDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  valueSource: ColorAreaDemoValueSource;
  value: string;
  defaultValue: string;
  colorSpace: ColorAreaDemoColorSpace;
  xChannel: ColorAreaDemoChannel;
  yChannel: ColorAreaDemoChannel;
  xName: string;
  yName: string;
  form: string;
  isDisabled: boolean;
}

export const colorAreaDemoDefaults: ColorAreaDemoProps = {
  ariaLabel: "Color",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  valueSource: "value",
  value: "#9B80FF",
  defaultValue: "#9B80FF",
  colorSpace: "",
  xChannel: "red",
  yChannel: "green",
  xName: "",
  yName: "",
  form: "",
  isDisabled: false,
};

const channelsByColorSpace: Record<
  Exclude<ColorAreaDemoColorSpace, "">,
  readonly ColorAreaDemoChannel[]
> = {
  rgb: ["red", "green", "blue"],
  hsl: ["hue", "saturation", "lightness"],
  hsb: ["hue", "saturation", "brightness"],
};

const defaultChannelsByColorSpace: Record<
  ColorAreaDemoColorSpace,
  readonly [ColorAreaDemoChannel, ColorAreaDemoChannel]
> = {
  "": ["red", "green"],
  rgb: ["red", "green"],
  hsl: ["saturation", "lightness"],
  hsb: ["saturation", "brightness"],
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

function normalizeChannelPair(
  colorSpace: ColorAreaDemoColorSpace,
  xChannel: unknown,
  yChannel: unknown,
): readonly [ColorAreaDemoChannel, ColorAreaDemoChannel] {
  const defaults = defaultChannelsByColorSpace[colorSpace];
  const allowed = colorSpace ? channelsByColorSpace[colorSpace] : colorAreaChannelOptions;
  const x = isOneOf(String(xChannel), allowed) ? (xChannel as ColorAreaDemoChannel) : defaults[0];
  const y = isOneOf(String(yChannel), allowed) ? (yChannel as ColorAreaDemoChannel) : defaults[1];

  if (x !== y) {
    return [x, y];
  }

  const fallbackY = allowed.find((channel) => channel !== x) ?? defaults[1];
  return [x, fallbackY];
}

export function normalizeColorAreaDemoProps(
  props: Partial<ColorAreaDemoProps>,
): ColorAreaDemoProps {
  const colorSpace = isOneOf(props.colorSpace, colorAreaColorSpaceOptions)
    ? props.colorSpace
    : colorAreaDemoDefaults.colorSpace;
  const [xChannel, yChannel] = normalizeChannelPair(colorSpace, props.xChannel, props.yChannel);

  return {
    ariaLabel: stringProp(props.ariaLabel, colorAreaDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorAreaDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(props.ariaDescribedBy, colorAreaDemoDefaults.ariaDescribedBy),
    ariaDetails: stringProp(props.ariaDetails, colorAreaDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorAreaDemoDefaults.id),
    slot: stringProp(props.slot, colorAreaDemoDefaults.slot),
    valueSource: isOneOf(props.valueSource, colorAreaValueSourceOptions)
      ? props.valueSource
      : colorAreaDemoDefaults.valueSource,
    value: stringProp(props.value, colorAreaDemoDefaults.value) || colorAreaDemoDefaults.value,
    defaultValue:
      stringProp(props.defaultValue, colorAreaDemoDefaults.defaultValue) ||
      colorAreaDemoDefaults.defaultValue,
    colorSpace,
    xChannel,
    yChannel,
    xName: stringProp(props.xName, colorAreaDemoDefaults.xName),
    yName: stringProp(props.yName, colorAreaDemoDefaults.yName),
    form: stringProp(props.form, colorAreaDemoDefaults.form),
    isDisabled: props.isDisabled === true,
  };
}

export function colorAreaDemoPropsFromSearch(search: string): ColorAreaDemoProps {
  const params = new URLSearchParams(search);
  const colorSpace = params.get("colorSpace");
  const valueSource = params.get("valueSource");
  const normalizedColorSpace = isOneOf(colorSpace, colorAreaColorSpaceOptions)
    ? colorSpace
    : colorAreaDemoDefaults.colorSpace;
  const [xChannel, yChannel] = normalizeChannelPair(
    normalizedColorSpace,
    params.get("xChannel"),
    params.get("yChannel"),
  );

  return normalizeColorAreaDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorAreaDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorAreaDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorAreaDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorAreaDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorAreaDemoDefaults.id,
    slot: params.get("slot") ?? colorAreaDemoDefaults.slot,
    valueSource: isOneOf(valueSource, colorAreaValueSourceOptions)
      ? valueSource
      : colorAreaDemoDefaults.valueSource,
    value: params.get("value") ?? colorAreaDemoDefaults.value,
    defaultValue: params.get("defaultValue") ?? colorAreaDemoDefaults.defaultValue,
    colorSpace: normalizedColorSpace,
    xChannel,
    yChannel,
    xName: params.get("xName") ?? colorAreaDemoDefaults.xName,
    yName: params.get("yName") ?? colorAreaDemoDefaults.yName,
    form: params.get("form") ?? colorAreaDemoDefaults.form,
    isDisabled: booleanParam(params.get("isDisabled")),
  });
}

export function colorAreaDemoPropsFromWindow(): ColorAreaDemoProps {
  if (typeof window === "undefined") {
    return colorAreaDemoDefaults;
  }
  return colorAreaDemoPropsFromSearch(window.location.search);
}

export function initialColorAreaDemoValue(props: ColorAreaDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function serializeColorAreaDemoProps(props: ColorAreaDemoProps) {
  return JSON.stringify({
    ariaLabel: props.ariaLabel,
    ariaLabelledBy: props.ariaLabelledBy,
    ariaDescribedBy: props.ariaDescribedBy,
    ariaDetails: props.ariaDetails,
    id: props.id,
    slot: props.slot,
    valueSource: props.valueSource,
    value: props.value,
    defaultValue: props.defaultValue,
    colorSpace: props.colorSpace,
    xChannel: props.xChannel,
    yChannel: props.yChannel,
    xName: props.xName,
    yName: props.yName,
    form: props.form,
    isDisabled: props.isDisabled,
  });
}
