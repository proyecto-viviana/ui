import { comparisonControlsEvent } from "./button-demo";

export { comparisonControlsEvent };

export const colorFieldColorSpaceOptions = ["", "rgb", "hsl", "hsb"] as const;
export const colorFieldValueSourceOptions = ["value", "defaultValue"] as const;
export const colorFieldChannelOptions = [
  "",
  "red",
  "green",
  "blue",
  "hue",
  "saturation",
  "brightness",
  "lightness",
  "alpha",
] as const;
export const colorFieldSizeOptions = ["S", "M", "L", "XL"] as const;
export const colorFieldLabelPositionOptions = ["top", "side"] as const;
export const colorFieldLabelAlignOptions = ["start", "end"] as const;
export const colorFieldNecessityIndicatorOptions = ["icon", "label"] as const;
export const colorFieldValidationBehaviorOptions = ["", "native", "aria"] as const;

export type ColorFieldDemoColorSpace = (typeof colorFieldColorSpaceOptions)[number];
export type ColorFieldDemoValueSource = (typeof colorFieldValueSourceOptions)[number];
export type ColorFieldDemoChannel = (typeof colorFieldChannelOptions)[number];
export type ColorFieldDemoSize = (typeof colorFieldSizeOptions)[number];
export type ColorFieldDemoLabelPosition = (typeof colorFieldLabelPositionOptions)[number];
export type ColorFieldDemoLabelAlign = (typeof colorFieldLabelAlignOptions)[number];
export type ColorFieldDemoNecessityIndicator = (typeof colorFieldNecessityIndicatorOptions)[number];
export type ColorFieldDemoValidationBehavior = (typeof colorFieldValidationBehaviorOptions)[number];

export interface ColorFieldDemoProps {
  ariaLabel: string;
  ariaLabelledBy: string;
  ariaDescribedBy: string;
  ariaDetails: string;
  id: string;
  slot: string;
  label: string;
  description: string;
  errorMessage: string;
  placeholder: string;
  valueSource: ColorFieldDemoValueSource;
  value: string;
  defaultValue: string;
  channel: ColorFieldDemoChannel;
  colorSpace: ColorFieldDemoColorSpace;
  name: string;
  form: string;
  isDisabled: boolean;
  isReadOnly: boolean;
  isRequired: boolean;
  isInvalid: boolean;
  validationBehavior: ColorFieldDemoValidationBehavior;
  isWheelDisabled: boolean;
  size: ColorFieldDemoSize;
  labelPosition: ColorFieldDemoLabelPosition;
  labelAlign: ColorFieldDemoLabelAlign;
  necessityIndicator: ColorFieldDemoNecessityIndicator;
}

export const colorFieldDemoDefaults: ColorFieldDemoProps = {
  ariaLabel: "",
  ariaLabelledBy: "",
  ariaDescribedBy: "",
  ariaDetails: "",
  id: "",
  slot: "",
  label: "Color",
  description: "Enter a hex color",
  errorMessage: "Enter a valid color",
  placeholder: "#000000",
  valueSource: "value",
  value: "#336699",
  defaultValue: "#336699",
  channel: "",
  colorSpace: "",
  name: "",
  form: "",
  isDisabled: false,
  isReadOnly: false,
  isRequired: false,
  isInvalid: false,
  validationBehavior: "",
  isWheelDisabled: false,
  size: "M",
  labelPosition: "top",
  labelAlign: "start",
  necessityIndicator: "icon",
};

const channelsByColorSpace: Record<Exclude<ColorFieldDemoColorSpace, "">, readonly string[]> = {
  rgb: ["red", "green", "blue", "alpha"],
  hsl: ["hue", "saturation", "lightness", "alpha"],
  hsb: ["hue", "saturation", "brightness", "alpha"],
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
  colorSpace: ColorFieldDemoColorSpace,
  channel: unknown,
): ColorFieldDemoChannel {
  const candidate = String(channel);
  if (!isOneOf(candidate, colorFieldChannelOptions)) {
    return colorFieldDemoDefaults.channel;
  }

  if (!candidate || !colorSpace) {
    return candidate;
  }

  return channelsByColorSpace[colorSpace].includes(candidate) ? candidate : "";
}

export function normalizeColorFieldDemoProps(
  props: Partial<ColorFieldDemoProps>,
): ColorFieldDemoProps {
  const colorSpace = isOneOf(props.colorSpace, colorFieldColorSpaceOptions)
    ? props.colorSpace
    : colorFieldDemoDefaults.colorSpace;

  return {
    ariaLabel: stringProp(props.ariaLabel, colorFieldDemoDefaults.ariaLabel),
    ariaLabelledBy: stringProp(props.ariaLabelledBy, colorFieldDemoDefaults.ariaLabelledBy),
    ariaDescribedBy: stringProp(props.ariaDescribedBy, colorFieldDemoDefaults.ariaDescribedBy),
    ariaDetails: stringProp(props.ariaDetails, colorFieldDemoDefaults.ariaDetails),
    id: stringProp(props.id, colorFieldDemoDefaults.id),
    slot: stringProp(props.slot, colorFieldDemoDefaults.slot),
    label: stringProp(props.label, colorFieldDemoDefaults.label),
    description: stringProp(props.description, colorFieldDemoDefaults.description),
    errorMessage: stringProp(props.errorMessage, colorFieldDemoDefaults.errorMessage),
    placeholder: stringProp(props.placeholder, colorFieldDemoDefaults.placeholder),
    valueSource: isOneOf(props.valueSource, colorFieldValueSourceOptions)
      ? props.valueSource
      : colorFieldDemoDefaults.valueSource,
    value: stringProp(props.value, colorFieldDemoDefaults.value),
    defaultValue: stringProp(props.defaultValue, colorFieldDemoDefaults.defaultValue),
    channel: normalizeChannel(colorSpace, props.channel),
    colorSpace,
    name: stringProp(props.name, colorFieldDemoDefaults.name),
    form: stringProp(props.form, colorFieldDemoDefaults.form),
    isDisabled: props.isDisabled === true,
    isReadOnly: props.isReadOnly === true,
    isRequired: props.isRequired === true,
    isInvalid: props.isInvalid === true,
    validationBehavior: isOneOf(props.validationBehavior, colorFieldValidationBehaviorOptions)
      ? props.validationBehavior
      : colorFieldDemoDefaults.validationBehavior,
    isWheelDisabled: props.isWheelDisabled === true,
    size: isOneOf(props.size, colorFieldSizeOptions) ? props.size : colorFieldDemoDefaults.size,
    labelPosition: isOneOf(props.labelPosition, colorFieldLabelPositionOptions)
      ? props.labelPosition
      : colorFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(props.labelAlign, colorFieldLabelAlignOptions)
      ? props.labelAlign
      : colorFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(props.necessityIndicator, colorFieldNecessityIndicatorOptions)
      ? props.necessityIndicator
      : colorFieldDemoDefaults.necessityIndicator,
  };
}

export function colorFieldDemoPropsFromSearch(search: string): ColorFieldDemoProps {
  const params = new URLSearchParams(search);
  const colorSpace = params.get("colorSpace");
  const valueSource = params.get("valueSource");
  const channel = params.get("channel");
  const validationBehavior = params.get("validationBehavior");
  const size = params.get("size");
  const labelPosition = params.get("labelPosition");
  const labelAlign = params.get("labelAlign");
  const necessityIndicator = params.get("necessityIndicator");

  return normalizeColorFieldDemoProps({
    ariaLabel: params.get("ariaLabel") ?? colorFieldDemoDefaults.ariaLabel,
    ariaLabelledBy: params.get("ariaLabelledBy") ?? colorFieldDemoDefaults.ariaLabelledBy,
    ariaDescribedBy: params.get("ariaDescribedBy") ?? colorFieldDemoDefaults.ariaDescribedBy,
    ariaDetails: params.get("ariaDetails") ?? colorFieldDemoDefaults.ariaDetails,
    id: params.get("id") ?? colorFieldDemoDefaults.id,
    slot: params.get("slot") ?? colorFieldDemoDefaults.slot,
    label: params.get("label") ?? colorFieldDemoDefaults.label,
    description: params.get("description") ?? colorFieldDemoDefaults.description,
    errorMessage: params.get("errorMessage") ?? colorFieldDemoDefaults.errorMessage,
    placeholder: params.get("placeholder") ?? colorFieldDemoDefaults.placeholder,
    valueSource: isOneOf(valueSource, colorFieldValueSourceOptions)
      ? valueSource
      : colorFieldDemoDefaults.valueSource,
    value: params.get("value") ?? colorFieldDemoDefaults.value,
    defaultValue: params.get("defaultValue") ?? colorFieldDemoDefaults.defaultValue,
    channel: isOneOf(channel, colorFieldChannelOptions) ? channel : colorFieldDemoDefaults.channel,
    colorSpace: isOneOf(colorSpace, colorFieldColorSpaceOptions)
      ? colorSpace
      : colorFieldDemoDefaults.colorSpace,
    name: params.get("name") ?? colorFieldDemoDefaults.name,
    form: params.get("form") ?? colorFieldDemoDefaults.form,
    isDisabled: booleanParam(params.get("isDisabled")),
    isReadOnly: booleanParam(params.get("isReadOnly")),
    isRequired: booleanParam(params.get("isRequired")),
    isInvalid: booleanParam(params.get("isInvalid")),
    validationBehavior: isOneOf(validationBehavior, colorFieldValidationBehaviorOptions)
      ? validationBehavior
      : colorFieldDemoDefaults.validationBehavior,
    isWheelDisabled: booleanParam(params.get("isWheelDisabled")),
    size: isOneOf(size, colorFieldSizeOptions) ? size : colorFieldDemoDefaults.size,
    labelPosition: isOneOf(labelPosition, colorFieldLabelPositionOptions)
      ? labelPosition
      : colorFieldDemoDefaults.labelPosition,
    labelAlign: isOneOf(labelAlign, colorFieldLabelAlignOptions)
      ? labelAlign
      : colorFieldDemoDefaults.labelAlign,
    necessityIndicator: isOneOf(necessityIndicator, colorFieldNecessityIndicatorOptions)
      ? necessityIndicator
      : colorFieldDemoDefaults.necessityIndicator,
  });
}

export function colorFieldDemoPropsFromWindow(): ColorFieldDemoProps {
  if (typeof window === "undefined") {
    return colorFieldDemoDefaults;
  }
  return colorFieldDemoPropsFromSearch(window.location.search);
}

export function initialColorFieldDemoValue(props: ColorFieldDemoProps) {
  return props.valueSource === "defaultValue" ? props.defaultValue : props.value;
}

export function serializeColorFieldDemoProps(props: ColorFieldDemoProps) {
  return JSON.stringify({
    ariaLabel: props.ariaLabel,
    ariaLabelledBy: props.ariaLabelledBy,
    ariaDescribedBy: props.ariaDescribedBy,
    ariaDetails: props.ariaDetails,
    id: props.id,
    slot: props.slot,
    label: props.label,
    description: props.description,
    errorMessage: props.errorMessage,
    placeholder: props.placeholder,
    valueSource: props.valueSource,
    value: props.value,
    defaultValue: props.defaultValue,
    channel: props.channel,
    colorSpace: props.colorSpace,
    name: props.name,
    form: props.form,
    isDisabled: props.isDisabled,
    isReadOnly: props.isReadOnly,
    isRequired: props.isRequired,
    isInvalid: props.isInvalid,
    validationBehavior: props.validationBehavior,
    isWheelDisabled: props.isWheelDisabled,
    size: props.size,
    labelPosition: props.labelPosition,
    labelAlign: props.labelAlign,
    necessityIndicator: props.necessityIndicator,
  });
}
